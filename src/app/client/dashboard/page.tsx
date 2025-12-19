'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  FileText,
  Settings,
  LogOut,
  Utensils,
  TrendingUp,
  Zap,
  DollarSign
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FormResponse {
  id: string;
  form_type: string;
  responses: any;
  created_at: string;
  status: string;
  ai_generated: boolean;
}

interface DietPlan {
  id: string;
  status: string;
  created_at: string;
  approved_at: string;
  diet_plan: any;
  ai_cost?: number;
  generation_method: string;
  ai_model_used?: string;
  user_profiles: {
    full_name: string;
    email: string;
  };
}

interface PublishedDiet {
  id: string;
  diet_plan: any;
  access_token: string;
  published_at: string;
  client_name: string;
}

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [publishedDiets, setPublishedDiets] = useState<PublishedDiet[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchUserData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/client/auth');
      return;
    }
    
    setUser(session.user);
  };

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      // Fetch form responses
      const { data: responses } = await supabase
        .from('form_responses')
        .select('*')
        .eq('client_email', session.user.email)
        .order('created_at', { ascending: false });

      // Fetch diet plans with user profiles
      const { data: plans } = await supabase
        .from('diet_plans')
        .select(`
          *,
          user_profiles!inner(full_name, email)
        `)
        .eq('user_profiles.email', session.user.email)
        .order('created_at', { ascending: false });

      // Fetch published diets
      const { data: published } = await supabase
        .from('published_diets')
        .select('*')
        .eq('client_email', session.user.email)
        .eq('is_active', true)
        .order('published_at', { ascending: false });

      setFormResponses(responses || []);
      setDietPlans(plans || []);
      setPublishedDiets(published || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/client/auth');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'published':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Clock className="h-4 w-4" />;
      case 'under_review':
        return <AlertCircle className="h-4 w-4" />;
      case 'approved':
      case 'published':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalAICost = dietPlans.reduce((sum, plan) => sum + (plan.ai_cost || 0), 0);
  const aiGeneratedCount = dietPlans.filter(p => p.generation_method === 'ai').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Welcome back!</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Assessments</h3>
              <p className="text-2xl font-bold text-blue-600">{formResponses.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {dietPlans.filter(p => p.status === 'pending_review' || p.status === 'under_review').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Approved</h3>
              <p className="text-2xl font-bold text-green-600">
                {dietPlans.filter(p => p.status === 'approved' || p.status === 'published').length}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">AI Generated</h3>
              <p className="text-2xl font-bold text-purple-600">{aiGeneratedCount}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-6 text-center">
              <Utensils className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Active Diets</h3>
              <p className="text-2xl font-bold text-emerald-600">{publishedDiets.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Card */}
        {aiGeneratedCount > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-2 flex items-center">
                    <Zap className="h-6 w-6 mr-2" />
                    AI-Powered Nutrition Journey
                  </h2>
                  <p className="text-purple-100 mb-4">
                    Your diet plans are powered by advanced AI technology, reviewed by Dr. Jackie for optimal results.
                  </p>
                  <div className="flex items-center gap-6 text-purple-100">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>{aiGeneratedCount} AI Plans Generated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Total AI Cost: ${totalAICost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <Zap className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="active-diets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active-diets">Active Diet Plans</TabsTrigger>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="assessments">My Assessments</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Active Diet Plans */}
          <TabsContent value="active-diets">
            <Card>
              <CardHeader>
                <CardTitle>Your Active Diet Plans</CardTitle>
                <p className="text-gray-600">Access your approved and published nutrition plans - unlimited access!</p>
              </CardHeader>
              <CardContent>
                {publishedDiets.length === 0 ? (
                  <div className="text-center py-12">
                    <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Diet Plans</h3>
                    <p className="text-gray-600 mb-4">You don't have any published diet plans yet.</p>
                    <Button asChild>
                      <a href="/forms/nutritionusa">Complete New Assessment</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {publishedDiets.map((diet) => (
                      <div key={diet.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              30-Day Personalized Nutrition Plan
                              <Badge className="bg-emerald-100 text-emerald-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </h4>
                            <p className="text-gray-600 mt-1">
                              Published on {new Date(diet.published_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-emerald-600 font-medium mt-1">
                              ✨ Unlimited Access - Never Expires
                            </p>
                            {diet.diet_plan?.overview && (
                              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Daily Calories:</span>
                                  <span className="font-medium ml-2">{diet.diet_plan.overview.totalCalories}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Duration:</span>
                                  <span className="font-medium ml-2">{diet.diet_plan.overview.duration}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Plan Type:</span>
                                  <span className="font-medium ml-2 flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    AI-Generated
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Reviewed By:</span>
                                  <span className="font-medium ml-2">Dr. Jackie</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="ml-6">
                            <Button asChild>
                              <a 
                                href={`/client/diet-view/${diet.access_token}`}
                                className="flex items-center space-x-2"
                              >
                                <Eye className="h-4 w-4" />
                                <span>View Diet Plan</span>
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Review */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Review</CardTitle>
                <p className="text-gray-600">Diet plans waiting for Dr. Jackie's review and approval</p>
              </CardHeader>
              <CardContent>
                {dietPlans.filter(p => p.status === 'pending_review' || p.status === 'under_review').length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="text-gray-600">No diet plans pending review.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dietPlans
                      .filter(p => p.status === 'pending_review' || p.status === 'under_review')
                      .map((plan) => (
                        <div key={plan.id} className="border rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                Diet Plan #{plan.id.slice(-8)}
                                {plan.generation_method === 'ai' && (
                                  <Badge className="bg-purple-100 text-purple-800">
                                    <Zap className="h-3 w-3 mr-1" />
                                    AI Generated
                                  </Badge>
                                )}
                              </h4>
                              <p className="text-gray-600 mt-1">
                                Created on {new Date(plan.created_at).toLocaleDateString()}
                              </p>
                              <div className="mt-2 flex items-center space-x-4">
                                <Badge className={getStatusColor(plan.status)}>
                                  {getStatusIcon(plan.status)}
                                  <span className="ml-1 capitalize">{plan.status.replace('_', ' ')}</span>
                                </Badge>
                                {plan.ai_model_used && (
                                  <Badge variant="outline">
                                    {plan.ai_model_used} • ${(plan.ai_cost || 0).toFixed(4)}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-2">
                                {plan.status === 'pending_review' 
                                  ? '🤖 Your AI-generated diet plan is in the review queue. Dr. Jackie will review it soon.'
                                  : '👩‍⚕️ Dr. Jackie is currently reviewing your diet plan and may make personalized adjustments.'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments */}
          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle>My Assessments</CardTitle>
                <p className="text-gray-600">Your completed nutrition and fitness assessments</p>
              </CardHeader>
              <CardContent>
                {formResponses.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Yet</h3>
                    <p className="text-gray-600 mb-4">Complete your first nutrition assessment to get started.</p>
                    <Button asChild>
                      <a href="/forms/nutritionusa">Start Assessment</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formResponses.map((response) => (
                      <div key={response.id} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              {response.form_type.replace('_', ' ').toUpperCase()} Assessment
                              {response.ai_generated && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Zap className="h-3 w-3 mr-1" />
                                  AI Processed
                                </Badge>
                              )}
                            </h4>
                            <p className="text-gray-600 mt-1">
                              Submitted on {new Date(response.created_at).toLocaleDateString()}
                            </p>
                            <div className="mt-2">
                              <Badge className={getStatusColor(response.status)}>
                                {getStatusIcon(response.status)}
                                <span className="ml-1 capitalize">{response.status.replace('_', ' ')}</span>
                              </Badge>
                            </div>
                          </div>
                          <div className="ml-6">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Complete History</CardTitle>
                <p className="text-gray-600">All your diet plans and assessments</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...dietPlans, ...formResponses]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              {'form_type' in item ? 'Assessment' : 'Diet Plan'}
                              {(('generation_method' in item && item.generation_method === 'ai') || 
                                ('ai_generated' in item && item.ai_generated)) && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Zap className="h-3 w-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                            <Badge className={getStatusColor(item.status)}>
                              <span className="capitalize">{item.status.replace('_', ' ')}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

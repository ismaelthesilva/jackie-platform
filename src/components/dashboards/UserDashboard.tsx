'use client';

// User Dashboard Component for DashboardRouter
// View personal diet plans and nutrition programs

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  Download,
  Clock,
  CheckCircle,
  Mail,
  LogOut,
  FileText,
  Heart,
  Target,
  ChefHat,
  Send,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { supabase, DietPlanRecord } from '../../lib/supabase';

const UserDashboard: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();
  const [dietPlans, setDietPlans] = useState<DietPlanRecord[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DietPlanRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserDietPlans();
    }
  }, [user]);

  const loadUserDietPlans = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Handle specific database errors
        if (error.code === '42P01') {
          console.warn('diet_plans table does not exist yet');
          setDietPlans([]);
          return;
        }
        throw error;
      }

      setDietPlans(data || []);
    } catch (error) {
      console.error('Error loading diet plans:', error);
      setDietPlans([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleLogout = async () => {
    await signOut();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="mr-1 h-3 w-3" />Under Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'sent':
        return <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200"><Send className="mr-1 h-3 w-3" />Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back!</h1>
              <p className="text-gray-600">
                {userProfile?.full_name || user?.email}
              </p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Welcome Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Nutrition Journey</h2>
                <p className="text-gray-600">
                  Track your personalized diet plans and nutrition goals with Dr. Jackie
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diet Plans Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plans List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChefHat className="mr-2 h-5 w-5" />
                  Your Diet Plans
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your plans...</p>
                  </div>
                ) : dietPlans.length === 0 ? (
                  <div className="p-6 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Diet Plans Yet</h3>
                    <p className="text-gray-600 mb-4">
                      You haven't received any personalized diet plans yet.
                    </p>
                    <Button asChild>
                      <Link href="/forms/professional-consultation">
                        <Target className="mr-2 h-4 w-4" />
                        Request Consultation
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {dietPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedPlan?.id === plan.id ? 'bg-emerald-50 border-r-4 border-emerald-500' : ''
                        }`}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900">
                              Diet Plan #{plan.id.slice(-6)}
                            </h3>
                            {getStatusBadge(plan.status)}
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(plan.created_at)}
                          </div>
                          
                          {plan.review_notes && (
                            <p className="text-sm text-gray-600 truncate">
                              Note: {plan.review_notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Plan Details */}
          <div className="lg:col-span-2">
            {selectedPlan ? (
              <div className="space-y-6">
                {/* Plan Status */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>Diet Plan Details</CardTitle>
                      {getStatusBadge(selectedPlan.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Created:</p>
                          <p className="text-gray-600">{formatDate(selectedPlan.created_at)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Last Updated:</p>
                          <p className="text-gray-600">{formatDate(selectedPlan.updated_at)}</p>
                        </div>
                      </div>

                      {selectedPlan.review_notes && (
                        <div>
                          <p className="font-medium text-gray-700 mb-2">Dr. Jackie's Notes:</p>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-blue-900 text-sm">{selectedPlan.review_notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Personalized Diet Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPlan.status === 'draft' ? (
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          Your diet plan is currently being reviewed by Dr. Jackie. 
                          You'll receive an email notification once it's approved and ready for download.
                        </AlertDescription>
                      </Alert>
                    ) : selectedPlan.status === 'approved' ? (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Great news! Your diet plan has been approved and will be sent to your email soon.
                        </AlertDescription>
                      </Alert>
                    ) : selectedPlan.status === 'sent' ? (
                      <div className="space-y-4">
                        <Alert>
                          <Mail className="h-4 w-4" />
                          <AlertDescription>
                            Your personalized diet plan has been sent to your email address: {user?.email}
                          </AlertDescription>
                        </Alert>
                        
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Plan Delivered!</h3>
                            <p className="text-gray-600 mb-4">
                              Check your email for your complete nutrition guide
                            </p>
                            <div className="flex space-x-3 justify-center">
                              <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </Button>
                              <Button asChild>
                                <Link href="/forms/professional-consultation">
                                  <Target className="mr-2 h-4 w-4" />
                                  Request New Plan
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" asChild className="justify-start">
                        <Link href="/forms/professional-consultation">
                          <Target className="mr-2 h-4 w-4" />
                          Request New Consultation
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="justify-start">
                        <Link href="/contact">
                          <Mail className="mr-2 h-4 w-4" />
                          Contact Dr. Jackie
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Diet Plan</h3>
                  <p className="text-gray-600">Choose a plan from the list to view its details and status</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

// User Dashboard for Jackie Platform Clients
// View personal diet plans and nutrition programs

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  ChefHat
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, DietPlanRecord } from '../../lib/supabase';
import Auth from '../../components/Auth';

const UserDashboard: React.FC = () => {
  const { user, userProfile, loading: authLoading, signOut } = useAuth();
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
        console.error('Error loading diet plans:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return;
      }

      setDietPlans(data || []);
      
      // Auto-select the most recent plan
      if (data && data.length > 0) {
        setSelectedPlan(data[0]);
      }
    } catch (error) {
      console.error('Error loading diet plans:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'sent':
        return <Mail className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Your diet plan is being reviewed by Dr. Jackie. You\'ll receive a notification once it\'s approved.';
      case 'approved':
        return 'Your diet plan has been approved by Dr. Jackie and is ready for use!';
      case 'sent':
        return 'Your personalized diet plan has been delivered and is ready to start.';
      default:
        return 'Diet plan status unknown.';
    }
  };

  // Show auth screen if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth mode="login" redirectTo="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Jackie Dashboard</h1>
              <p className="text-gray-600">Your personalized nutrition journey</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-medium text-gray-900">{userProfile?.full_name}</p>
              </div>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Card */}
        <Card className="mb-8 bg-gradient-to-r from-emerald-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Welcome to Your Nutrition Journey!</h2>
                <p className="text-emerald-100 mb-4">
                  Dr. Jackie has designed a personalized diet plan just for you. Follow your plan and achieve your health goals!
                </p>
                <div className="flex items-center gap-6 text-emerald-100">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    <span>Personalized Plans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    <span>Professional Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    <span>Delicious Recipes</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Diet Plans List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  My Diet Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your plans...</p>
                  </div>
                ) : dietPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No diet plans yet</p>
                    <p className="text-sm text-gray-500">
                      Complete the nutrition form to get your personalized diet plan from Dr. Jackie.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dietPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPlan?.id === plan.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">
                            Diet Plan #{plan.id.slice(0, 8)}
                          </h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(plan.status)}`}>
                            {getStatusIcon(plan.status)}
                            {plan.status.toUpperCase()}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                        {plan.sent_at && (
                          <p className="text-xs text-green-600 mt-1">
                            Ready since: {new Date(plan.sent_at).toLocaleDateString()}
                          </p>
                        )}
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
                
                {/* Status Alert */}
                <Alert className={`border-2 ${
                  selectedPlan.status === 'draft' ? 'border-yellow-200 bg-yellow-50' :
                  selectedPlan.status === 'approved' ? 'border-green-200 bg-green-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedPlan.status)}
                    <AlertDescription className="font-medium">
                      {getStatusMessage(selectedPlan.status)}
                    </AlertDescription>
                  </div>
                </Alert>

                {/* Plan Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Diet Plan Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Plan Created</h4>
                        <p className="text-gray-600">{new Date(selectedPlan.created_at).toLocaleDateString()}</p>
                      </div>
                      
                      {selectedPlan.sent_at && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Available Since</h4>
                          <p className="text-gray-600">{new Date(selectedPlan.sent_at).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Review Notes */}
                    {selectedPlan.review_notes && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Dr. Jackie's Notes</h4>
                        <p className="text-gray-700">{selectedPlan.review_notes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      {selectedPlan.status === 'sent' && (
                        <>
                          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            <Download className="h-4 w-4 mr-2" />
                            Download Diet Plan PDF
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <FileText className="h-4 w-4 mr-2" />
                            View Online
                          </Button>
                        </>
                      )}
                      
                      {selectedPlan.status === 'approved' && (
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <Mail className="h-4 w-4 mr-2" />
                          Request Delivery
                        </Button>
                      )}
                      
                      {selectedPlan.status === 'draft' && (
                        <div className="w-full text-center py-4">
                          <div className="animate-pulse">
                            <div className="h-8 bg-yellow-200 rounded mb-2"></div>
                            <p className="text-yellow-700 text-sm">Plan under review by Dr. Jackie...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="h-16 flex-col">
                        <FileText className="h-6 w-6 mb-2" />
                        Request New Plan
                      </Button>
                      <Button variant="outline" className="h-16 flex-col">
                        <Mail className="h-6 w-6 mb-2" />
                        Contact Dr. Jackie
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500 py-12">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Diet Plan Selected</h3>
                    <p className="text-gray-600">
                      {dietPlans.length > 0 
                        ? 'Select a diet plan from the left to view details'
                        : 'Complete the nutrition form to get your first personalized diet plan from Dr. Jackie'
                      }
                    </p>
                  </div>
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

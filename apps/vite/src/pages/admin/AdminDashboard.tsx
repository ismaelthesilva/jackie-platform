// Admin Dashboard for Dr. Jackie
// Comprehensive diet plan management with Supabase integration

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Send, 
  Download,
  Eye,
  LogOut,
  BarChart3,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, DietPlanRecord } from '../../lib/supabase';
import Auth from '../../components/Auth';

interface DietPlanStats {
  total: number;
  drafts: number;
  approved: number;
  sent: number;
}

const AdminDashboard: React.FC = () => {
  const { user, userProfile, loading: authLoading, isAdmin, signOut } = useAuth();
  const [dietPlans, setDietPlans] = useState<DietPlanRecord[]>([]);
  const [stats, setStats] = useState<DietPlanStats>({ total: 0, drafts: 0, approved: 0, sent: 0 });
  const [selectedPlan, setSelectedPlan] = useState<DietPlanRecord | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'draft' | 'approved' | 'sent'>('draft');

  useEffect(() => {
    if (user && isAdmin) {
      loadDietPlans();
    }
  }, [user, isAdmin, filter]);

  const loadDietPlans = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('diet_plans')
        .select(`
          *,
          user_profiles!diet_plans_user_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading diet plans:', error);
        return;
      }

      setDietPlans(data || []);
      
      // Calculate stats
      const allPlans = await supabase.from('diet_plans').select('status');
      if (allPlans.data) {
        const planStats = allPlans.data.reduce((acc: DietPlanStats, plan: any) => {
          acc.total++;
          if (plan.status === 'draft') acc.drafts++;
          if (plan.status === 'approved') acc.approved++;
          if (plan.status === 'sent') acc.sent++;
          return acc;
        }, { total: 0, drafts: 0, approved: 0, sent: 0 });
        
        setStats(planStats);
      }
    } catch (error) {
      console.error('Error loading diet plans:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const handleApprovePlan = async (planId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('diet_plans')
        .update({
          status: 'approved',
          reviewed_by: userProfile?.id,
          review_notes: reviewNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);

      if (error) {
        console.error('Error approving plan:', error);
        alert('Error approving plan. Please try again.');
        return;
      }

      await loadDietPlans();
      setSelectedPlan(null);
      setReviewNotes('');
      alert('Diet plan approved successfully!');
    } catch (error) {
      console.error('Error approving plan:', error);
      alert('Error approving plan. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendToClient = async (plan: DietPlanRecord) => {
    setActionLoading(true);
    try {
      // Update plan status to 'sent'
      const { error } = await supabase
        .from('diet_plans')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', plan.id);

      if (error) {
        console.error('Error sending plan:', error);
        alert('Error sending plan. Please try again.');
        return;
      }

      // TODO: Send email notification to client
      // This would integrate with your existing ClientNotificationService
      
      await loadDietPlans();
      alert(`Diet plan sent successfully to client!`);
    } catch (error) {
      console.error('Error sending plan:', error);
      alert('Error sending plan. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this diet plan?')) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('diet_plans')
        .delete()
        .eq('id', planId);

      if (error) {
        console.error('Error deleting plan:', error);
        alert('Error deleting plan. Please try again.');
        return;
      }

      await loadDietPlans();
      setSelectedPlan(null);
      alert('Diet plan deleted successfully.');
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Error deleting plan. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Show auth screen if not authenticated or not admin
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
    return <Auth mode="login" redirectTo="/admin/dashboard" />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              You don't have permission to access the admin dashboard.
            </p>
            <Button onClick={signOut} className="w-full">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dr. Jackie Admin Dashboard</h1>
              <p className="text-gray-600">Manage diet plans and client nutrition programs</p>
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
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Plans</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.drafts}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Approved</p>
                  <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Sent to Clients</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.sent}</p>
                </div>
                <Send className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'draft', 'approved', 'sent'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status)}
              className={filter === status ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {status === 'all' ? 'All Plans' : 
               status === 'draft' ? 'Pending Review' :
               status === 'approved' ? 'Approved' : 'Sent'}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Diet Plans List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Diet Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading diet plans...</p>
                  </div>
                ) : dietPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No diet plans found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {(plan as any).user_profiles?.full_name || 'Unknown Client'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {(plan as any).user_profiles?.email}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Created: {new Date(plan.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                plan.status === 'draft' ? 'destructive' :
                                plan.status === 'approved' ? 'default' : 'secondary'
                              }
                            >
                              {plan.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Plan Details & Actions */}
          <div>
            {selectedPlan ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Plan Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Client Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Client Information</h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p><strong>Name:</strong> {(selectedPlan as any).user_profiles?.full_name}</p>
                      <p><strong>Email:</strong> {(selectedPlan as any).user_profiles?.email}</p>
                      <p><strong>Status:</strong> 
                        <Badge className="ml-2" variant={
                          selectedPlan.status === 'draft' ? 'destructive' :
                          selectedPlan.status === 'approved' ? 'default' : 'secondary'
                        }>
                          {selectedPlan.status.toUpperCase()}
                        </Badge>
                      </p>
                    </div>
                  </div>

                  {/* Review Notes */}
                  {selectedPlan.status === 'draft' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Notes
                      </label>
                      <Textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add your review notes..."
                        className="min-h-[100px]"
                      />
                    </div>
                  )}

                  {/* Existing Review Notes */}
                  {selectedPlan.review_notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Previous Review Notes</h4>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        {selectedPlan.review_notes}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {selectedPlan.status === 'draft' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprovePlan(selectedPlan.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={actionLoading}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleRejectPlan(selectedPlan.id)}
                          disabled={actionLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    )}

                    {selectedPlan.status === 'approved' && (
                      <Button
                        onClick={() => handleSendToClient(selectedPlan)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={actionLoading}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send to Client
                      </Button>
                    )}

                    {selectedPlan.status === 'sent' && selectedPlan.sent_at && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Plan sent to client on {new Date(selectedPlan.sent_at).toLocaleDateString()}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a diet plan to view details</p>
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

export default AdminDashboard;

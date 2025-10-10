'use client';

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
import { useAuth } from '../../../context/AuthContext';
import { supabase, DietPlanRecord } from '../../../lib/supabase';
import Auth from '../../../components/Auth';

interface DietPlanStats {
  total: number;
  drafts: number;
  approved: number;
  sent: number;
}

export default function AdminDashboardPage() {
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
          user_profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setDietPlans(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const drafts = data?.filter(plan => plan.status === 'draft').length || 0;
      const approved = data?.filter(plan => plan.status === 'approved').length || 0;
      const sent = data?.filter(plan => plan.status === 'sent').length || 0;
      
      setStats({ total, drafts, approved, sent });
    } catch (error) {
      console.error('Error loading diet plans:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const handleStatusUpdate = async (planId: string, newStatus: 'approved' | 'sent', notes?: string) => {
    try {
      setActionLoading(true);
      
      const updateData: any = { status: newStatus };
      if (notes) updateData.review_notes = notes;
      
      const { error } = await supabase
        .from('diet_plans')
        .update(updateData)
        .eq('id', planId);

      if (error) throw error;
      
      await loadDietPlans();
      setSelectedPlan(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error updating plan status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
              <p className="text-gray-600">Please sign in to access the admin dashboard</p>
            </div>
            <Auth />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Draft</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'sent':
        return <Badge variant="default" className="bg-blue-600"><Send className="mr-1 h-3 w-3" />Sent</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage diet plans and client consultations</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-semibold text-gray-900">{userProfile?.full_name || 'Dr. Jackie'}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Plans</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.drafts}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sent</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.sent}</p>
                </div>
                <Send className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-6">
          {(['all', 'draft', 'approved', 'sent'] as const).map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? 'default' : 'outline'}
              onClick={() => setFilter(filterOption)}
              className="capitalize"
            >
              {filterOption === 'all' ? 'All Plans' : `${filterOption} Plans`}
            </Button>
          ))}
        </div>

        {/* Diet Plans List */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading diet plans...</p>
              </CardContent>
            </Card>
          ) : dietPlans.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No diet plans found</h3>
                <p className="text-gray-600">
                  {filter === 'all' ? 'No diet plans have been created yet.' : `No ${filter} diet plans found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            dietPlans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg mb-2">
                        {(plan.user_profiles as any)?.full_name || 'Unknown Client'}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mb-2">
                        {(plan.user_profiles as any)?.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(plan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(plan.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Generated Diet Plan:</h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {(plan as any).diet_plan_content || 'No content available'}
                        </pre>
                      </div>
                    </div>

                    {plan.review_notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Review Notes:</h4>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm text-blue-900">{plan.review_notes}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPlan(selectedPlan?.id === plan.id ? null : plan)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {selectedPlan?.id === plan.id ? 'Hide Details' : 'Review'}
                      </Button>
                      
                      {plan.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(plan.id, 'approved')}
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      )}
                      
                      {plan.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(plan.id, 'sent')}
                          disabled={actionLoading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Mark as Sent
                        </Button>
                      )}
                    </div>

                    {selectedPlan?.id === plan.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Add Review Notes:</h4>
                        <Textarea
                          placeholder="Add notes about this diet plan..."
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          className="mb-3"
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(plan.id, 'approved', reviewNotes)}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve with Notes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPlan(null);
                              setReviewNotes('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

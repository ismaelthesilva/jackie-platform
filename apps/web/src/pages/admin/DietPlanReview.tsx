// Diet Plan Review Admin Interface
// For Dr. Jackie to review, edit, and approve diet plans

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Download, 
  Send,
  Clock,
  User,
  Target,
  Calendar
} from 'lucide-react';
import DietPlanStorage, { DietPlanSummary } from '../../services/DietPlanStorage';
import { DietPlan } from '../../services/DietPlanGenerator';
import PDFGenerator from '../../services/PDFGenerator';
import ClientNotificationService from '../../services/ClientNotificationService';

const DietPlanReview: React.FC = () => {
  const [plans, setPlans] = useState<DietPlanSummary[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'approved' | 'sent'>('draft');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const storage = new DietPlanStorage();
  const notificationService = new ClientNotificationService();

  useEffect(() => {
    loadPlans();
  }, [filter]);

  const loadPlans = () => {
    setLoading(true);
    try {
      let plansList: DietPlanSummary[];
      
      switch (filter) {
        case 'draft':
          plansList = storage.getPendingPlans();
          break;
        case 'approved':
          plansList = storage.getApprovedPlans();
          break;
        default:
          plansList = storage.getAllPlanSummaries();
          if (filter !== 'all') {
            plansList = plansList.filter(plan => plan.status === filter);
          }
      }
      
      setPlans(plansList);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    const plan = storage.getPlan(planId);
    if (plan) {
      setSelectedPlan(plan);
      setReviewNotes(plan.reviewNotes || '');
      setIsEditing(false);
    }
  };

  const handleApprovePlan = () => {
    if (!selectedPlan) return;
    
    const success = storage.approvePlan(selectedPlan.id, 'Dr. Jackie', reviewNotes);
    if (success) {
      setSelectedPlan({ ...selectedPlan, status: 'approved', reviewNotes });
      loadPlans();
      alert('Diet plan approved successfully! You can now send it to the client.');
    }
  };

  const handleRejectPlan = () => {
    if (!selectedPlan) return;
    
    if (confirm('Are you sure you want to delete this diet plan?')) {
      const success = storage.deletePlan(selectedPlan.id);
      if (success) {
        setSelectedPlan(null);
        loadPlans();
        alert('Diet plan deleted.');
      }
    }
  };

  const handleSendPlan = async () => {
    if (!selectedPlan) return;
    
    setSending(true);
    try {
      // Generate client access link
      const accessLink = `${window.location.origin}/client/diet-portal/${selectedPlan.id}`;
      
      // Send notification to client
      const notificationSuccess = await notificationService.sendDietReadyNotification({
        clientName: selectedPlan.clientProfile.name,
        clientEmail: selectedPlan.clientProfile.email,
        planId: selectedPlan.id,
        dietPlan: selectedPlan,
        accessLink: accessLink
      });

      if (notificationSuccess) {
        // Mark as sent
        storage.markAsSent(selectedPlan.id);
        setSelectedPlan({ ...selectedPlan, status: 'sent' });
        loadPlans();
        alert(`Diet plan sent successfully to ${selectedPlan.clientProfile.name}! 📧`);
      } else {
        alert('Error sending notification. Please check the email settings and try again.');
      }
    } catch (error) {
      console.error('Error sending plan to client:', error);
      alert('Error sending plan. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedPlan) return;
    
    try {
      const pdfGenerator = new PDFGenerator();
      pdfGenerator.downloadPDF(selectedPlan);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Diet Plan Review</h1>
          <p className="text-gray-600">Review and approve client diet plans</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Diet Plans
                </CardTitle>
                <div className="flex gap-2">
                  {(['all', 'draft', 'approved', 'sent'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={filter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(status)}
                      className="capitalize"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : plans.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No plans found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPlan?.id === plan.id 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{plan.clientName}</h3>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {plan.goal}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(plan.createdAt).toLocaleDateString()}
                          </div>
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
                {/* Client Info */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {selectedPlan.clientProfile.name}
                        </CardTitle>
                        <CardDescription>
                          Goal: {selectedPlan.clientProfile.mainGoal}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleDownloadPDF}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {isEditing ? 'View' : 'Edit'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Age:</span> {selectedPlan.clientProfile.age}
                      </div>
                      <div>
                        <span className="font-medium">Height:</span> {selectedPlan.clientProfile.height}cm
                      </div>
                      <div>
                        <span className="font-medium">Weight:</span> {selectedPlan.clientProfile.weight}kg
                      </div>
                      <div>
                        <span className="font-medium">Activity:</span> {selectedPlan.clientProfile.activityLevel}
                      </div>
                    </div>
                    {selectedPlan.clientProfile.intolerances && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                        <span className="font-medium text-red-800">Food Intolerances:</span>
                        <p className="text-red-700">{selectedPlan.clientProfile.intolerances}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Weekly Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Meal Plan Preview</CardTitle>
                    <CardDescription>First 7 days of the 30-day plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Day</th>
                            <th className="text-left p-2">Breakfast</th>
                            <th className="text-left p-2">Lunch</th>
                            <th className="text-left p-2">Dinner</th>
                            <th className="text-left p-2">Calories</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPlan.plan.slice(0, 7).map((day) => (
                            <tr key={day.day} className="border-b">
                              <td className="p-2 font-medium">Day {day.day}</td>
                              <td className="p-2">{day.meals.breakfast.name}</td>
                              <td className="p-2">{day.meals.lunch.name}</td>
                              <td className="p-2">{day.meals.dinner.name}</td>
                              <td className="p-2">{day.totalCalories}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Review Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Review Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add your review notes here..."
                      className="min-h-[100px]"
                    />
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                {selectedPlan.status === 'draft' && (
                  <div className="flex gap-3">
                    <Button onClick={handleApprovePlan} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Plan
                    </Button>
                    <Button variant="destructive" onClick={handleRejectPlan}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Plan
                    </Button>
                  </div>
                )}

                {selectedPlan.status === 'approved' && (
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleSendPlan} 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={sending}
                    >
                      {sending ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send to Client
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleDownloadPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                )}

                {selectedPlan.status === 'sent' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">
                      ✅ Plan sent to client on {selectedPlan.sentAt ? new Date(selectedPlan.sentAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Eye className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Select a diet plan to review</p>
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

export default DietPlanReview;

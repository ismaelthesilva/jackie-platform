'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AIGeneratedDiet {
  overview: {
    duration: string;
    totalCalories: number;
    macros: { protein: number; carbs: number; fats: number };
    goals: string[];
    clientSummary: string;
  };
  weeks: Week[];
  recommendations: {
    supplements: string[];
    tips: string[];
    warnings: string[];
  };
}

interface Week {
  weekNumber: number;
  theme: string;
  days: Day[];
}

interface Day {
  day: number;
  meals: Meal[];
  totalCalories: number;
  waterIntake: string;
  exercise?: string;
}

interface Meal {
  type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  calories: number;
  macros: { protein: number; carbs: number; fats: number };
  timing: string;
  tips?: string[];
}

interface Ingredient {
  item: string;
  quantity: string;
}

interface DietPlan {
  id: string;
  user_id: string;
  form_data: any;
  diet_plan: AIGeneratedDiet;
  status: string;
  generation_method: string;
  ai_model_used: string;
  ai_generation_time: string;
  ai_cost: number;
  created_at: string;
  user_profiles: {
    full_name: string;
    email: string;
  };
}

export default function AIReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(1);
  const [adminNotes, setAdminNotes] = useState('');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchDietPlan(params.id as string);
    }
  }, [params.id]);

  const fetchDietPlan = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('diet_plans')
        .select(`
          *,
          user_profiles (
            full_name,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setDietPlan(data);
      setAdminNotes(data.admin_notes || '');
    } catch (error) {
      console.error('Error fetching diet plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveDietPlan = async () => {
    if (!dietPlan) return;
    
    setApproving(true);
    try {
      // Generate access token for client
      const accessToken = `diet_${dietPlan.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90); // 90 days access

      // Update diet plan status
      const { error: updateError } = await supabase
        .from('diet_plans')
        .update({
          status: 'approved',
          admin_notes: adminNotes,
          approved_at: new Date().toISOString(),
          approved_by: 'Dr. Jackie'
        })
        .eq('id', dietPlan.id);

      if (updateError) throw updateError;

      // Create published diet entry
      const { error: publishError } = await supabase
        .from('published_diets')
        .insert({
          diet_plan_id: dietPlan.id,
          user_id: dietPlan.user_id,
          access_token: accessToken,
          expires_at: expiresAt.toISOString(),
          client_name: dietPlan.user_profiles.full_name,
          client_email: dietPlan.user_profiles.email
        });

      if (publishError) throw publishError;

      // Send notification to client
      await sendClientNotification(dietPlan, accessToken);

      alert('Diet plan approved and published successfully! Client has been notified.');
      router.push('/admin');
    } catch (error) {
      console.error('Error approving diet plan:', error);
      alert('Error approving diet plan. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  const sendClientNotification = async (plan: DietPlan, accessToken: string) => {
    const dietUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/diet-view?token=${accessToken}`;
    
    // Import emailjs for client notification
    const emailjs = (await import('@emailjs/browser')).default;
    
    const emailBody = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #059669; text-align: center; border-bottom: 2px solid #059669; padding-bottom: 15px;">
          🎉 Your Personalized Diet Plan is Ready!
        </h2>
        
        <div style="background: #f0fdf4; padding: 25px; border-radius: 10px; margin: 25px 0;">
          <p style="font-size: 18px; margin-bottom: 15px;"><strong>Dear ${plan.user_profiles.full_name},</strong></p>
          
          <p>Great news! Dr. Jackie has personally reviewed and approved your AI-generated diet plan. Your complete 30-day personalized nutrition program is now ready for you to access.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dietUrl}" 
             style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
            🍽️ Access Your Diet Plan
          </a>
        </div>
        
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Your Plan Includes:</h3>
          <ul style="margin-bottom: 0;">
            <li>Complete 30-day meal plan with daily menus</li>
            <li>Detailed shopping lists for each week</li>
            <li>Step-by-step preparation instructions</li>
            <li>Nutritional breakdown for every meal</li>
            <li>Professional tips and recommendations</li>
            <li>Progress tracking guidelines</li>
          </ul>
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #92400e; margin-top: 0;">Important Notes:</h3>
          <p>• Your diet plan access is valid for 90 days</p>
          <p>• Bookmark the link for easy access</p>
          <p>• Contact us if you have any questions during your journey</p>
          <p style="margin-bottom: 0;">• Dr. Jackie is available for follow-up consultations</p>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb; margin-top: 30px;">
          <p style="margin: 0; color: #059669; font-weight: bold;">Dr. Jackie's Nutrition Team</p>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Your Success is Our Priority</p>
        </div>
      </div>
    `;

    await emailjs.send(
      'service_28v1fvr',
      'template_48ud7sn',
      {
        to_email: plan.user_profiles.email,
        client_name: plan.user_profiles.full_name,
        client_email: 'noreply@jackienutrition.com',
        email_body: emailBody
      },
      'ezbPPmM_lDMistyGT'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading diet plan...</p>
        </div>
      </div>
    );
  }

  if (!dietPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Diet Plan Not Found</h1>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  const aiDiet = dietPlan.diet_plan as AIGeneratedDiet;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                AI Diet Plan Review
              </h1>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>🤖 Generated by AI</span>
                <span>💰 Cost: ${dietPlan.ai_cost?.toFixed(4) || '0.0000'}</span>
                <span>⏱️ {new Date(dietPlan.ai_generation_time).toLocaleString()}</span>
                <span>🏷️ Model: {dietPlan.ai_model_used}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={approveDietPlan}
                disabled={approving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {approving ? 'Approving...' : '✅ Approve & Publish'}
              </button>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p><strong>Name:</strong> {dietPlan.user_profiles.full_name}</p>
              <p><strong>Email:</strong> {dietPlan.user_profiles.email}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  dietPlan.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                  dietPlan.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {dietPlan.status.replace('_', ' ').toUpperCase()}
                </span>
              </p>
            </div>
            <div>
              <p><strong>Generation Method:</strong> {dietPlan.generation_method.toUpperCase()}</p>
              <p><strong>Created:</strong> {new Date(dietPlan.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Diet Overview */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Diet Plan Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Duration</h3>
              <p className="text-2xl font-bold text-blue-600">{aiDiet.overview.duration}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Daily Calories</h3>
              <p className="text-2xl font-bold text-green-600">{aiDiet.overview.totalCalories}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Macros (P/C/F)</h3>
              <p className="text-lg font-bold text-purple-600">
                {aiDiet.overview.macros.protein}g / {aiDiet.overview.macros.carbs}g / {aiDiet.overview.macros.fats}g
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Client Summary</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{aiDiet.overview.clientSummary}</p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Goals</h3>
            <div className="flex flex-wrap gap-2">
              {aiDiet.overview.goals.map((goal, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {goal}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Week Selector */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">30-Day Meal Plan</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {aiDiet.weeks.map((week) => (
              <button
                key={week.weekNumber}
                onClick={() => setActiveWeek(week.weekNumber)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeWeek === week.weekNumber
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Week {week.weekNumber}
              </button>
            ))}
          </div>

          {/* Active Week Display */}
          {aiDiet.weeks.find(w => w.weekNumber === activeWeek) && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Week {activeWeek}: {aiDiet.weeks.find(w => w.weekNumber === activeWeek)?.theme}
              </h3>
              
              <div className="grid gap-4">
                {aiDiet.weeks.find(w => w.weekNumber === activeWeek)?.days.map((day) => (
                  <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-900">Day {day.day}</h4>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{day.totalCalories} calories</span>
                        <span className="mx-2">•</span>
                        <span>{day.waterIntake} water</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {day.meals.map((meal, mealIndex) => (
                        <div key={mealIndex} className="bg-gray-50 p-3 rounded">
                          <h5 className="font-medium text-gray-900 capitalize mb-1">
                            {meal.type.replace('_', ' ')}
                          </h5>
                          <p className="text-sm font-semibold text-green-600 mb-1">{meal.name}</p>
                          <p className="text-xs text-gray-600 mb-2">{meal.calories} cal • {meal.timing}</p>
                          <div className="text-xs text-gray-500">
                            <p>Ingredients: {meal.ingredients.map(i => i.item).join(', ')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">AI Recommendations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">💊 Supplements</h3>
              <ul className="space-y-1">
                {aiDiet.recommendations.supplements.map((supplement, index) => (
                  <li key={index} className="text-sm text-gray-700">• {supplement}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">💡 Tips</h3>
              <ul className="space-y-1">
                {aiDiet.recommendations.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-700">• {tip}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">⚠️ Warnings</h3>
              <ul className="space-y-1">
                {aiDiet.recommendations.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-red-600">• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Notes</h2>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            placeholder="Add any notes, modifications, or recommendations for this client..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push('/admin')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Back to Dashboard
          </button>
          <button
            onClick={approveDietPlan}
            disabled={approving}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-lg"
          >
            {approving ? 'Approving...' : '✅ Approve & Publish Diet Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

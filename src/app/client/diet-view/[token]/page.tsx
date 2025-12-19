'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Target, ChefHat, Download, Share2, Zap } from 'lucide-react';

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
  calories: number;
}

interface PublishedDiet {
  id: string;
  client_name: string;
  diet_plan: AIGeneratedDiet;
  access_token: string;
  published_at: string;
  is_active: boolean;
}

export default function ClientDietView() {
  const params = useParams();
  const [dietPlan, setDietPlan] = useState<PublishedDiet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);

  useEffect(() => {
    if (params.token) {
      fetchDietPlan(params.token as string);
    }
  }, [params.token]);

  const fetchDietPlan = async (token: string) => {
    try {
      const { data, error } = await supabase
        .from('published_diets')
        .select('*')
        .eq('access_token', token)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Diet plan not found or access link is invalid');
        } else {
          setError('Error loading your diet plan');
        }
        return;
      }

      setDietPlan(data);
    } catch (err) {
      console.error('Error fetching diet plan:', err);
      setError('Error loading your diet plan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized diet plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild>
              <a href="/client/auth">Go to Client Portal</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dietPlan) return null;

  const currentWeek = dietPlan.diet_plan.weeks.find(w => w.weekNumber === selectedWeek);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                Your Personalized Diet Plan
                <Badge className="bg-purple-100 text-purple-800">
                  <Zap className="h-4 w-4 mr-1" />
                  AI-Generated
                </Badge>
              </h1>
              <p className="text-gray-600 mt-1">Welcome back, {dietPlan.client_name}!</p>
              <p className="text-sm text-emerald-600 font-medium">✨ Unlimited Access - Never Expires</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Daily Calories</h3>
              <p className="text-2xl font-bold text-emerald-600">{dietPlan.diet_plan.overview.totalCalories}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Duration</h3>
              <p className="text-2xl font-bold text-blue-600">{dietPlan.diet_plan.overview.duration}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <ChefHat className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Meals/Day</h3>
              <p className="text-2xl font-bold text-purple-600">5-6</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">AI Powered</h3>
              <p className="text-sm font-bold text-orange-600">Dr. Jackie Reviewed</p>
            </CardContent>
          </Card>
        </div>

        {/* Goals */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Goals & Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Goals:</h4>
              <div className="flex flex-wrap gap-2">
                {dietPlan.diet_plan.overview.goals.map((goal, index) => (
                  <Badge key={index} variant="secondary">{goal}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Personalized Summary:</h4>
              <p className="text-gray-700">{dietPlan.diet_plan.overview.clientSummary}</p>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Plan */}
        <Card>
          <CardHeader>
            <CardTitle>30-Day Meal Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
              <TabsList className="grid w-full grid-cols-4">
                {dietPlan.diet_plan.weeks.map((week) => (
                  <TabsTrigger key={week.weekNumber} value={week.weekNumber.toString()}>
                    Week {week.weekNumber}
                  </TabsTrigger>
                ))}
              </TabsList>

              {dietPlan.diet_plan.weeks.map((week) => (
                <TabsContent key={week.weekNumber} value={week.weekNumber.toString()}>
                  <div className="space-y-6">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <h3 className="text-xl font-semibold text-emerald-800">Week {week.weekNumber}</h3>
                      <p className="text-emerald-600">{week.theme}</p>
                    </div>

                    {/* Days */}
                    <div className="grid gap-6">
                      {week.days.map((day) => (
                        <Card key={day.day}>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>Day {day.day}</span>
                              <Badge>{day.totalCalories} cal</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {/* Meals */}
                            <div className="grid gap-4">
                              {day.meals.map((meal, mealIndex) => (
                                <div key={mealIndex} className="border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold capitalize">{meal.type.replace('_', ' ')}</h4>
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline">{meal.timing}</Badge>
                                      <Badge>{meal.calories} cal</Badge>
                                    </div>
                                  </div>
                                  
                                  <h5 className="text-lg font-medium text-emerald-700 mb-2">{meal.name}</h5>
                                  
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <h6 className="font-medium mb-2">Ingredients:</h6>
                                      <ul className="text-sm space-y-1">
                                        {meal.ingredients.map((ingredient, ingIndex) => (
                                          <li key={ingIndex} className="flex justify-between">
                                            <span>{ingredient.item}</span>
                                            <span className="text-gray-500">{ingredient.quantity} ({ingredient.calories} cal)</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    
                                    <div>
                                      <h6 className="font-medium mb-2">Instructions:</h6>
                                      <p className="text-sm text-gray-700">{meal.instructions}</p>
                                      
                                      {meal.tips && meal.tips.length > 0 && (
                                        <div className="mt-2">
                                          <h6 className="font-medium mb-1">Tips:</h6>
                                          <ul className="text-xs text-emerald-600">
                                            {meal.tips.map((tip, tipIndex) => (
                                              <li key={tipIndex}>• {tip}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Macros */}
                                  <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-xs">
                                    <div className="text-center">
                                      <span className="text-red-600 font-medium">Protein</span>
                                      <p className="font-bold">{meal.macros.protein}g</p>
                                    </div>
                                    <div className="text-center">
                                      <span className="text-yellow-600 font-medium">Carbs</span>
                                      <p className="font-bold">{meal.macros.carbs}g</p>
                                    </div>
                                    <div className="text-center">
                                      <span className="text-purple-600 font-medium">Fats</span>
                                      <p className="font-bold">{meal.macros.fats}g</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Daily extras */}
                            <div className="mt-4 pt-4 border-t grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">💧 Water Intake:</span> {day.waterIntake}
                              </div>
                              <div>
                                <span className="font-medium">🏃‍♀️ Exercise:</span> {day.exercise || 'Rest day'}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>💊 Supplements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dietPlan.diet_plan.recommendations.supplements.map((supplement, index) => (
                  <li key={index} className="text-sm">• {supplement}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💡 Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dietPlan.diet_plan.recommendations.tips.map((tip, index) => (
                  <li key={index} className="text-sm">• {tip}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚠️ Important Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dietPlan.diet_plan.recommendations.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-orange-600">• {warning}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">🎉 Your Journey Starts Now!</h3>
              <p className="text-emerald-100 mb-4">
                This personalized 30-day diet plan was created specifically for you using advanced AI technology
                and reviewed by Dr. Jackie to ensure optimal results.
              </p>
              <div className="flex items-center justify-center gap-6 text-emerald-100">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span>AI-Generated</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>Dr. Jackie Reviewed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <span>Unlimited Access</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-emerald-200">
                Published on {new Date(dietPlan.published_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

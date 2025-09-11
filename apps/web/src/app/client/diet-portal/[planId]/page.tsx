'use client'

// Beautiful Client Diet Plan Portal
// Where clients can view their personalized diet plans

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Download,
  Clock,
  TrendingUp,
  Droplets,
  AlertCircle,
  Target,
  Heart,
  CheckCircle,
  ChefHat
} from 'lucide-react';
import DietPlanStorage from '../../../../services/DietPlanStorage';
import { DietPlan, DayPlan, Meal } from '../../../../services/DietPlanGenerator';
import PDFGenerator from '../../../../services/PDFGenerator';

const DietPortal: React.FC = () => {
  const params = useParams();
  const planId = params?.planId as string;
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [week, setWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null);

  useEffect(() => {
    if (!planId) {
      setError('No plan ID provided');
      setLoading(false);
      return;
    }

    const storage = new DietPlanStorage();
    
    try {
      const plan = storage.getPlan(planId);
      if (plan && plan.status === 'sent') {
        setDietPlan(plan);
        if (plan.plan.length > 0) {
          setSelectedDay(plan.plan[0]);
        }
      } else {
        setError('Diet plan not found or not yet available');
      }
    } catch {
      setError('Error loading diet plan');
    } finally {
      setLoading(false);
    }
  }, [planId]);

  const getDaysForWeek = () => {
    if (!dietPlan) return [];
    const startDay = (week - 1) * 7;
    const endDay = Math.min(startDay + 7, dietPlan.plan.length);
    return dietPlan.plan.slice(startDay, endDay);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Loading your diet plan...</p>
        </div>
      </div>
    );
  }

  if (error || !dietPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-800 mb-2">Diet Plan Not Available</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <Link href="/">
            <Button className="bg-red-600 hover:bg-red-700">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalWeeks = Math.ceil(dietPlan.plan.length / 7);

  const handleDownloadPDF = () => {
    try {
      const pdfGenerator = new PDFGenerator();
      pdfGenerator.downloadPDF(dietPlan);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Your 30-Day Nutrition Plan
              </h1>
              <p className="text-lg text-emerald-600 font-medium mt-1">
                Personalized by Dr. Jackie Souto
              </p>
            </div>
            <Button onClick={handleDownloadPDF} className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Client Info Card */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <Target className="h-5 w-5 mr-2" />
              Your Plan Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {dietPlan.clientProfile.name}
                </div>
                <div className="text-sm text-gray-600">Client</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {dietPlan.clientProfile.mainGoal}
                </div>
                <div className="text-sm text-gray-600">Main Goal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {dietPlan.plan[0]?.totalCalories || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Daily Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">30</div>
                <div className="text-sm text-gray-600">Days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Stats */}
        {selectedDay && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                Day {selectedDay.day} Nutrition Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-emerald-700">
                    {selectedDay.macros.protein}g
                  </div>
                  <div className="text-sm text-emerald-600">Protein</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-blue-700">
                    {selectedDay.macros.carbs}g
                  </div>
                  <div className="text-sm text-blue-600">Carbs</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-yellow-700">
                    {selectedDay.macros.fats}g
                  </div>
                  <div className="text-sm text-yellow-600">Fat</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-purple-700">
                    <Droplets className="h-4 w-4 inline mr-1" />
                    8 glasses
                  </div>
                  <div className="text-sm text-purple-600">Water Goal</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Week Navigation */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                Week {week} of {totalWeeks}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWeek(Math.max(1, week - 1))}
                  disabled={week === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWeek(Math.min(totalWeeks, week + 1))}
                  disabled={week === totalWeeks}
                >
                  Next
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {getDaysForWeek().map((day: DayPlan) => (
                <Card
                  key={day.day}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedDay?.day === day.day
                      ? 'ring-2 ring-emerald-500 bg-emerald-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedDay(day)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="font-bold text-emerald-700 mb-2">
                      Day {day.day}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {day.totalCalories} cal
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Click to view
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Guidelines Section */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              Your Personalized Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dietPlan.guidelines.map((guideline: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{guideline}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Meals */}
        {selectedDay && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Day {selectedDay.day} Meal Plan
            </h2>

            {Object.entries(selectedDay.meals).map(([mealType, meal]) => (
              <MealCard key={mealType} mealType={mealType} meal={meal as Meal} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

// Meal Card Component
interface MealCardProps {
  mealType: string;
  meal: Meal;
}

const MealCard: React.FC<MealCardProps> = ({ mealType, meal }) => {
  const getMealIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '🌞';
      case 'dinner':
        return '🌙';
      default:
        return '🍽️';
    }
  };

  const getMealTime = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast':
        return '7:00 AM - 9:00 AM';
      case 'lunch':
        return '12:00 PM - 2:00 PM';
      case 'dinner':
        return '6:00 PM - 8:00 PM';
      default:
        return 'Anytime';
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center text-lg">
            <span className="text-2xl mr-3">{getMealIcon(mealType)}</span>
            <div>
              <div className="capitalize font-bold text-emerald-800">{mealType}</div>
              <div className="text-sm text-emerald-600 font-normal">
                <Clock className="h-3 w-3 inline mr-1" />
                {getMealTime(mealType)}
              </div>
            </div>
          </span>
          <Badge className="bg-emerald-100 text-emerald-800">
            {meal.calories} cal
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Main Info */}
          <div>
            <h4 className="font-bold text-lg text-gray-900 mb-3">{meal.name}</h4>
            <p className="text-gray-600 mb-4">Prep time: {meal.prepTime}</p>
            
            {/* Macros */}
            <div className="flex gap-4 mb-4">
              <div className="text-center bg-emerald-50 px-3 py-2 rounded-lg">
                <div className="font-bold text-emerald-700">{meal.protein}g</div>
                <div className="text-xs text-emerald-600">Protein</div>
              </div>
              <div className="text-center bg-blue-50 px-3 py-2 rounded-lg">
                <div className="font-bold text-blue-700">{meal.carbs}g</div>
                <div className="text-xs text-blue-600">Carbs</div>
              </div>
              <div className="text-center bg-yellow-50 px-3 py-2 rounded-lg">
                <div className="font-bold text-yellow-700">{meal.fats}g</div>
                <div className="text-xs text-yellow-600">Fat</div>
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {meal.category}
              </Badge>
            </div>
          </div>

          {/* Recipe */}
          <div>
            <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
              <ChefHat className="h-4 w-4 mr-2" />
              Ingredients & Instructions
            </h5>
            
            {meal.ingredients && (
              <div className="mb-4">
                <h6 className="font-medium text-gray-800 mb-2">Ingredients:</h6>
                <ul className="space-y-1">
                  {meal.ingredients.map((ingredient: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-emerald-500 mr-2">•</span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {meal.instructions && (
              <div>
                <h6 className="font-medium text-gray-800 mb-2">Instructions:</h6>
                <p className="text-sm text-gray-600">{meal.instructions}</p>
              </div>
            )}

            {/* Portions */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <h6 className="font-medium text-gray-800 mb-2">Portions:</h6>
              <ul className="space-y-1">
                {meal.portions.map((portion: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {portion}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default DietPortal;

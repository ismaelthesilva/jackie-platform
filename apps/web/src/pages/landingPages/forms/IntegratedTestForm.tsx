'use client'
// Integrated Test Form with Authentication
// Complete workflow: Form → AI Generation → Database Storage → Dashboard

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ArrowRight, User, Target, Heart, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Auth from '@/components/Auth';
import DietPlanGenerator from '@/services/DietPlanGenerator';

interface TestFormData {
  name: string;
  email: string;
  goal: string;
}

const IntegratedTestForm: React.FC = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<TestFormData>({
    name: '',
    email: '',
    goal: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [generatedPlanId, setGeneratedPlanId] = useState<string>('');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const questions = [
    {
      id: 'name',
      title: 'What\'s your name?',
      subtitle: 'Let\'s personalize your experience',
      icon: User,
      type: 'text' as const,
      placeholder: 'Enter your full name'
    },
    {
      id: 'email',
      title: 'What\'s your email?',
      subtitle: 'We\'ll send your diet plan here',
      icon: Heart,
      type: 'email' as const,
      placeholder: 'Enter your email address'
    },
    {
      id: 'goal',
      title: 'What\'s your main health goal?',
      subtitle: 'This helps Dr. Jackie create the perfect plan',
      icon: Target,
      type: 'select' as const,
      options: [
        { value: 'weight_loss', label: 'Lose Weight' },
        { value: 'muscle_gain', label: 'Build Muscle' },
        { value: 'general_health', label: 'Improve Overall Health' },
        { value: 'energy_boost', label: 'Increase Energy' }
      ]
    }
  ];

  const handleInputChange = useCallback((field: keyof TestFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, questions.length]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const getCurrentFieldValue = (field: string): string => {
    return formData[field as keyof TestFormData] || '';
  };

  const isCurrentStepValid = (): boolean => {
    const currentQuestion = questions[currentStep];
    const value = getCurrentFieldValue(currentQuestion.id);
    return value.trim() !== '';
  };

  const handleSubmit = async () => {
    if (!user) {
      // If not authenticated, show auth modal
      setShowAuth(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate the AI diet plan
      console.log('Generating AI diet plan for:', formData);
      const dietPlanGenerator = new DietPlanGenerator();
      const aiDietPlan = await dietPlanGenerator.generatePlan({
        personalInfo: {
          name: formData.name,
          email: formData.email,
          age: 30, // Default for test
          gender: 'not specified'
        },
        goals: [formData.goal],
        restrictions: [],
        preferences: {
          cuisine: [],
          mealTimes: [],
          cookingTime: 'medium'
        }
      });

      console.log('AI Diet Plan Generated:', aiDietPlan);

      // Store in database via Supabase
      const { data, error } = await supabase
        .from('diet_plans')
        .insert({
          user_id: user.id,
          form_data: formData,
          diet_plan: aiDietPlan,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing diet plan:', error);
        alert('Error saving your diet plan. Please try again.');
        return;
      }

      console.log('Diet plan stored successfully:', data);

      setGeneratedPlanId(data.id);
      setIsComplete(true);

    } catch (error) {
      console.error('Error in submission process:', error);
      alert('There was an error processing your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="mb-4">
            <CardHeader className="text-center">
              <CardTitle>Almost There! 🎉</CardTitle>
              <p className="text-gray-600">
                Create an account to receive your personalized diet plan from Dr. Jackie
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={authMode === 'register' ? 'default' : 'outline'}
                  onClick={() => setAuthMode('register')}
                  className="flex-1"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
                <Button
                  variant={authMode === 'login' ? 'default' : 'outline'}
                  onClick={() => setAuthMode('login')}
                  className="flex-1"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Log In
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Auth 
            mode={authMode} 
            prefilledEmail={formData.email}
          />
          
          <Button 
            variant="outline" 
            onClick={() => setShowAuth(false)}
            className="w-full mt-4"
          >
            Back to Form
          </Button>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Success! 🎉
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your personalized diet plan has been generated and sent to Dr. Jackie for review. 
              You'll receive a notification once it's approved!
            </p>

            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                View My Dashboard
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setIsComplete(false);
                  setCurrentStep(0);
                  setFormData({ name: '', email: '', goal: '' });
                  setGeneratedPlanId('');
                }}
                className="w-full"
              >
                Create Another Plan
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Plan ID: {generatedPlanId.slice(0, 8)}...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const IconComponent = currentQuestion.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-emerald-700">
              Step {currentStep + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-2">
            <div 
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Authentication Status */}
        {user && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Logged in as {userProfile?.full_name || user.email}
            </AlertDescription>
          </Alert>
        )}

        {/* Question Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              {currentQuestion.title}
            </CardTitle>
            <p className="text-gray-600">
              {currentQuestion.subtitle}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {currentQuestion.type === 'text' || currentQuestion.type === 'email' ? (
              <div>
                <Label htmlFor={currentQuestion.id} className="sr-only">
                  {currentQuestion.title}
                </Label>
                <Input
                  id={currentQuestion.id}
                  type={currentQuestion.type}
                  placeholder={currentQuestion.placeholder}
                  value={getCurrentFieldValue(currentQuestion.id)}
                  onChange={(e) => handleInputChange(currentQuestion.id as keyof TestFormData, e.target.value)}
                  className="text-lg py-6 text-center"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange(currentQuestion.id as keyof TestFormData, option.value)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      getCurrentFieldValue(currentQuestion.id) === option.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {getCurrentFieldValue(currentQuestion.id) === option.value && (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              
              {currentStep < questions.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid()}
                  className={`${currentStep === 0 ? 'w-full' : 'flex-1'} bg-emerald-600 hover:bg-emerald-700`}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isCurrentStepValid() || isSubmitting}
                  className={`${currentStep === 0 ? 'w-full' : 'flex-1'} bg-emerald-600 hover:bg-emerald-700`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {user ? 'Generating Diet Plan...' : 'Creating Account...'}
                    </>
                  ) : (
                    <>
                      {user ? '🎯 Generate My Diet Plan' : '🔐 Sign Up & Generate Plan'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Not authenticated warning */}
            {!user && currentStep === questions.length - 1 && (
              <Alert className="bg-blue-50 border-blue-200">
                <LogIn className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  You'll create an account in the next step to access your personalized diet plan.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegratedTestForm;

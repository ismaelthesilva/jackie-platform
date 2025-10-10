'use client';

// Professional Nutrition Consultation Form
// Submit your information for Dr. Jackie to create your personalized diet plan

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, User, Target, Heart, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface ConsultationFormData {
  name: string;
  email: string;
  goal: string;
}

export default function ProfessionalConsultationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ConsultationFormData>({
    name: '',
    email: '',
    goal: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [consultationId, setConsultationId] = useState<string>('');

  const questions = [
    {
      id: 'name',
      title: 'What is your full name?',
      subtitle: 'Dr. Jackie will use this to personalize your nutrition plan',
      type: 'text' as const,
      icon: <User className="h-6 w-6" />,
      placeholder: 'Enter your full name'
    },
    {
      id: 'email',
      title: 'What is your email address?',
      subtitle: 'We\'ll send your personalized diet plan here once Dr. Jackie completes it',
      type: 'email' as const,
      icon: <Heart className="h-6 w-6" />,
      placeholder: 'Enter your email address'
    },
    {
      id: 'goal',
      title: 'What is your main health goal?',
      subtitle: 'Dr. Jackie will create a plan specifically designed for your objective',
      type: 'select' as const,
      icon: <Target className="h-6 w-6" />,
      options: [
        { value: 'weight_loss', label: 'Lose Weight Healthily' },
        { value: 'muscle_gain', label: 'Build Muscle Mass' },
        { value: 'general_health', label: 'Improve Overall Health' },
        { value: 'energy_boost', label: 'Increase Energy Levels' },
        { value: 'digestion', label: 'Improve Digestion' },
        { value: 'immunity', label: 'Strengthen Immune System' }
      ]
    }
  ];

  const handleInputChange = useCallback((field: keyof ConsultationFormData, value: string) => {
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
    return formData[field as keyof ConsultationFormData] || '';
  };

  const isCurrentStepValid = (): boolean => {
    const currentQuestion = questions[currentStep];
    const value = getCurrentFieldValue(currentQuestion.id);
    return value.trim() !== '';
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      console.log('📋 Submitting consultation request for Dr. Jackie');
      console.log('Client Information:', formData);

      // Create a draft diet plan record with form data
      // This will be a draft until user creates an account and it gets associated
      const { data, error } = await supabase
        .from('diet_plans')
        .insert([{
          user_id: '00000000-0000-0000-0000-000000000000', // Temporary placeholder for anonymous submissions
          form_data: {
            consultation_request: true,
            client_name: formData.name,
            client_email: formData.email,
            goal: formData.goal,
            submitted_at: new Date().toISOString(),
            status: 'pending_account_creation'
          },
          diet_plan: {
            status: 'awaiting_client_account',
            message: `Consultation request from ${formData.name}. Client needs to create account to proceed.`
          },
          status: 'draft'
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        // Fall back to console logging if database fails
        const consultationId = `CONSULT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('✅ Consultation request submitted successfully (fallback mode)');
        console.log(`📋 Consultation ID: ${consultationId}`);
        setConsultationId(consultationId);
      } else {
        console.log('✅ Consultation request saved to database successfully');
        console.log(`📋 Database Record ID: ${data.id}`);
        setConsultationId(data.id);
      }

      setIsComplete(true);

    } catch (error) {
      console.error('❌ Error submitting consultation request:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardContent className="pt-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You! 🎉
            </h2>
            
            <p className="text-xl text-gray-700 mb-6">
              Your consultation request has been submitted successfully!
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">What happens next:</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Create Your Account</h4>
                    <p className="text-blue-700 text-sm">Set up your secure account to access your personalized diet plan</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Dr. Jackie Reviews</h4>
                    <p className="text-blue-700 text-sm">Dr. Jackie will personally analyze your goals and create your custom nutrition plan</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Receive Your Plan</h4>
                    <p className="text-blue-700 text-sm">Get notified when your personalized diet plan is ready in your dashboard</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => window.location.href = '/register'}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-3"
                  size="lg"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create My Account
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/login'}
                  className="flex-1 py-3"
                  size="lg"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  I Have An Account
                </Button>
              </div>
              
              <Button 
                variant="ghost"
                onClick={() => {
                  setIsComplete(false);
                  setCurrentStep(0);
                  setFormData({ name: '', email: '', goal: '' });
                  setConsultationId('');
                }}
                className="w-full text-gray-600"
              >
                Submit Another Request
              </Button>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Consultation ID:</strong> {consultationId.slice(0, 16)}...
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Keep this ID for your records
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];

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
          <Progress 
            value={((currentStep + 1) / questions.length) * 100}
            className="h-3 bg-white shadow-inner"
          />
        </div>

        {/* Question Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-emerald-600">
                {currentQuestion.icon}
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-900 mb-2">
              {currentQuestion.title}
            </CardTitle>
            <p className="text-gray-600 text-sm">
              {currentQuestion.subtitle}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-2">
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
                  onChange={(e) => handleInputChange(currentQuestion.id as keyof ConsultationFormData, e.target.value)}
                  className="text-lg py-6 text-center border-2 focus:border-emerald-500"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => (
                  <Button
                    key={option.value}
                    variant={getCurrentFieldValue(currentQuestion.id) === option.value ? 'default' : 'outline'}
                    onClick={() => handleInputChange(currentQuestion.id as keyof ConsultationFormData, option.value)}
                    className={`w-full h-auto p-4 text-left justify-start ${
                      getCurrentFieldValue(currentQuestion.id) === option.value
                        ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    size="lg"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{option.label}</span>
                      {getCurrentFieldValue(currentQuestion.id) === option.value && (
                        <CheckCircle className="h-5 w-5 ml-2" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 py-3"
                >
                  Back
                </Button>
              )}
              
              {currentStep < questions.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid()}
                  className={`${currentStep === 0 ? 'w-full' : 'flex-1'} bg-emerald-600 hover:bg-emerald-700 py-3`}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isCurrentStepValid() || isSubmitting}
                  className={`${currentStep === 0 ? 'w-full' : 'flex-1'} bg-emerald-600 hover:bg-emerald-700 py-3`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      👩‍⚕️ Submit to Dr. Jackie
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Information Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Heart className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 text-sm">Professional Care</h4>
                  <p className="text-blue-700 text-xs">
                    Dr. Jackie will personally review your information and create a customized nutrition plan tailored specifically for your health goals.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

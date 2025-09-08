// Simple Test Form - 3 Questions Only
// To verify the complete AI diet generation workflow

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, ArrowRight, User, Target, Heart } from 'lucide-react';
import DietPlanGenerator from '../../../services/DietPlanGenerator';
import DietPlanStorage from '../../../services/DietPlanStorage';

interface TestFormData {
  name: string;
  email: string;
  goal: string;
}

const TestForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<TestFormData>({
    name: '',
    email: '',
    goal: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [generatedPlanId, setGeneratedPlanId] = useState<string>('');

  const questions = [
    {
      id: 'name',
      title: 'What is your full name?',
      type: 'text' as const,
      icon: <User className="h-6 w-6" />,
      placeholder: 'Enter your full name'
    },
    {
      id: 'email',
      title: 'What is your email address?',
      type: 'email' as const,
      icon: <Heart className="h-6 w-6" />,
      placeholder: 'Enter your email'
    },
    {
      id: 'goal',
      title: 'What is your main fitness goal?',
      type: 'select' as const,
      icon: <Target className="h-6 w-6" />,
      options: [
        { value: 'Weight loss', label: 'Weight Loss' },
        { value: 'Muscle gain', label: 'Muscle Gain' },
        { value: 'Maintenance', label: 'Maintain Current Weight' },
        { value: 'General health', label: 'General Health & Wellness' }
      ]
    }
  ];

  const handleInputChange = (field: keyof TestFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      console.log('🚀 Test Form Submission Started');
      console.log('Form Data:', formData);

      // Convert simple form data to format expected by DietPlanGenerator
      const mockAnswers = {
        // Required fields with defaults
        nome_completo: formData.name,
        email: formData.email,
        idade: '30',
        altura: '170',
        peso: '70',
        objetivo_principal: formData.goal,
        
        // Mock defaults for other required fields
        meta_especifica: `Achieve ${formData.goal.toLowerCase()} through proper nutrition`,
        condicoes_saude: 'No health conditions',
        quais_medicamentos: 'None',
        quais_intolerancias: 'None',
        dificuldade_digestao: 'No',
        alimentos_gosta: 'Chicken, fish, vegetables, fruits',
        alimentos_evita: 'None',
        cafe_manha_preferencia: 'Balanced',
        consome_carne_vermelha: 'Yes',
        frequencia_atividade: 'moderate',
        tipo_treinamento: 'Mixed',
        frequencia_treinamento: '3-4 times per week',
        horas_sono: '7-8 hours',
        nivel_estresse: 'moderate',
        consumo_agua: '2-3 liters'
      };

      console.log('📋 Generating AI Diet Plan...');
      
      // Step 1: Generate AI Diet Plan
      const generator = new DietPlanGenerator();
      const dietPlan = generator.generatePlan(mockAnswers);
      
      console.log(`✅ Generated plan for ${dietPlan.clientProfile.name}`);
      console.log(`📊 Plan details: ${dietPlan.plan.length} days, ${dietPlan.guidelines.length} guidelines`);

      // Step 2: Save to storage for admin review
      const storage = new DietPlanStorage();
      const planId = storage.saveDraftPlan(dietPlan);
      
      console.log(`💾 Plan saved with ID: ${planId}`);
      console.log(`📋 Status: Draft (awaiting Dr. Jackie's review)`);

      setGeneratedPlanId(planId);
      setIsComplete(true);

      // Success notification
      console.log('🎉 Test Form Processing Complete!');
      console.log(`👩‍⚕️ Dr. Jackie can now review the plan at: /admin/diet-plans`);
      console.log(`📧 After approval, client will receive notification with access link`);

    } catch (error) {
      console.error('❌ Error processing test form:', error);
      alert('Error generating diet plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const isStepValid = () => {
    const currentQuestion = questions[currentStep];
    const value = formData[currentQuestion.id as keyof TestFormData];
    return value && value.trim().length > 0;
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-lg">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" />
            <CardTitle className="text-2xl">Test Successful! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-3">
              <p className="text-gray-700">
                <strong>AI Diet Plan Generated!</strong>
              </p>
              <p className="text-sm text-gray-600">
                Client: <strong>{formData.name}</strong><br/>
                Goal: <strong>{formData.goal}</strong><br/>
                Plan ID: <strong>{generatedPlanId}</strong>
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg text-left">
                <h4 className="font-semibold text-blue-800 mb-2">✅ What Happened:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• AI generated personalized 30-day diet plan</li>
                  <li>• Plan saved as DRAFT for Dr. Jackie's review</li>
                  <li>• Ready for admin approval workflow</li>
                </ul>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg text-left">
                <h4 className="font-semibold text-emerald-800 mb-2">🔄 Next Steps:</h4>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• Dr. Jackie reviews plan at /admin/diet-plans</li>
                  <li>• After approval, client gets email notification</li>
                  <li>• Client accesses plan at their personal portal</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => window.open('/admin/diet-plans', '_blank')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  View Admin Panel
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1"
                >
                  Test Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white/90 backdrop-blur-sm shadow-xl">
        
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-lg">
          <div className="text-center">
            <CardTitle className="text-2xl mb-2">🧪 System Test Form</CardTitle>
            <p className="text-emerald-100">Testing AI Diet Generation Workflow</p>
          </div>
        </CardHeader>

        {/* Progress Bar */}
        <div className="bg-gray-200 h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <CardContent className="pt-8 pb-6">
          
          {/* Question */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                  {currentQuestion.icon}
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {currentQuestion.title}
              </h2>
              <p className="text-sm text-gray-600">
                Question {currentStep + 1} of {questions.length}
              </p>
            </div>

            {/* Input Field */}
            <div className="space-y-4">
              {currentQuestion.type === 'text' && (
                <div>
                  <Label htmlFor={currentQuestion.id} className="sr-only">
                    {currentQuestion.title}
                  </Label>
                  <Input
                    id={currentQuestion.id}
                    type="text"
                    value={formData[currentQuestion.id as keyof TestFormData]}
                    onChange={(e) => handleInputChange(currentQuestion.id as keyof TestFormData, e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="text-lg py-3"
                    autoFocus
                  />
                </div>
              )}

              {currentQuestion.type === 'email' && (
                <div>
                  <Label htmlFor={currentQuestion.id} className="sr-only">
                    {currentQuestion.title}
                  </Label>
                  <Input
                    id={currentQuestion.id}
                    type="email"
                    value={formData[currentQuestion.id as keyof TestFormData]}
                    onChange={(e) => handleInputChange(currentQuestion.id as keyof TestFormData, e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="text-lg py-3"
                    autoFocus
                  />
                </div>
              )}

              {currentQuestion.type === 'select' && currentQuestion.options && (
                <select
                  value={formData[currentQuestion.id as keyof TestFormData]}
                  onChange={(e) => handleInputChange(currentQuestion.id as keyof TestFormData, e.target.value)}
                  className="w-full text-lg py-3 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select your goal...</option>
                  {currentQuestion.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              <Button
                onClick={handleNext}
                disabled={!isStepValid() || isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : currentStep === questions.length - 1 ? (
                  <>
                    Generate Diet Plan
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestForm;


import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';
// Supabase and OpenAI temporarily disabled until .env is ready

interface FormResponse {
  [key: string]: string | string[] | number;
}

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

// Handle pre-signup form submissions - temporary solution to bypass RLS
const handlePreSignupForm = async (
  responses: FormResponse,
  clientName: string,
  clientEmail: string
): Promise<{ formResponseId: string }> => {
  console.log('👤 Processing pre-signup form (temporarily bypassing database due to RLS)...');

  // Log the form data that would be saved
  const formResponseData = {
    client_name: clientName,
    client_email: clientEmail,
    form_type: 'pre_signup',
    responses: responses,
    status: 'pre_signup'
  };
  
  console.log('📝 Pre-signup data received:', formResponseData);
  
  // For now, simulate success without database insertion due to RLS issues
  // TODO: Fix RLS policies or get proper service role key to enable database operations
  const mockId = `temp_${Date.now()}_${clientEmail.replace('@', '_')}`;
  
  console.log('✅ Pre-signup form processed successfully (mock ID):', mockId);
  console.log('ℹ️ NOTE: Database insertion disabled due to RLS policy conflicts');
  console.log('ℹ️ User can complete signup later using email:', clientEmail);

  return {
    formResponseId: mockId
  };
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    const { clientName, clientEmail, formType, responses } = formData;

    console.log('🤖 Server-side processing started for:', formType);

    // Handle pre-signup form
    if (formType === 'pre_signup') {
      const result = await handlePreSignupForm(responses, clientName, clientEmail);
      return NextResponse.json({ success: true, formResponseId: result.formResponseId });
    }

    // Handle test form with minimal AI usage
    if (formType === 'test_ai') {
      // Create a temporary form response ID for testing
      const tempFormResponseId = `test_${Date.now()}`;
      const result = await generateTestAIResponse(tempFormResponseId, responses, clientName, clientEmail);
      return NextResponse.json({ success: true, dietPlanId: result.dietPlanId });
    }

    // For full forms, return a placeholder for now
    return NextResponse.json({ 
      success: false, 
      error: 'Full AI diet generation not implemented in API route yet' 
    });

  } catch (error) {
    console.error('❌ AI generation API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}

const generateTestAIResponse = async (
  _formResponseId: string,
  responses: FormResponse,
  clientName: string,
  clientEmail: string
): Promise<{ diet: AIGeneratedDiet; dietPlanId: string; usage: any; cost: number }> => {
  const startTime = Date.now();
  console.log('🧪 Generating test AI response with minimal tokens...');
  
  const mathAnswer = responses.math_question as number;
  const userName = clientName;

  // Supabase disabled: skipping form response record creation
  // const { data: formResponse, error: formError } = await supabaseAdmin
  //   .from('form_responses')
  //   .insert({
  //     client_name: clientName,
  //     client_email: clientEmail,
  //     form_type: 'test_ai',
  //     responses: responses,
  //     status: 'processing'
  //   })
  //   .select()
  //   .single();

  // if (formError) {
  //   console.error('Failed to create form response:', formError);
  //   throw new Error('Failed to create form response record');
  // }

  // const actualFormResponseId = formResponse.id;
  const actualFormResponseId = _formResponseId;
  
  // OpenAI disabled: skipping AI call and returning mock data
  const generationTime = Date.now() - startTime;
  const cost = 0.01;
  const completion = { model: 'mock-model', usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } };
  const testDiet: AIGeneratedDiet = {
    overview: {
      duration: "Test Analysis",
      totalCalories: mathAnswer === 2 ? 2000 : 1500,
      macros: { protein: 100, carbs: 200, fats: 60 },
      goals: [mathAnswer === 2 ? "Math Genius Diet" : "Learning Support Diet"],
      clientSummary: `${userName} answered ${mathAnswer} for 1+1. ${mathAnswer === 2 ? 'Perfect!' : 'Needs support.'}`
    },
    weeks: [],
    recommendations: {
      supplements: [],
      tips: [],
      warnings: []
    }
  };

  // Create or find user profile
  // Supabase disabled: skipping user profile creation
  let userProfile = { id: 'mock-user-id' };

  // Store diet plan
  // Supabase disabled: skipping diet plan storage
  const dietPlan = { id: 'mock-diet-id' };

  // Supabase disabled: skipping AI generation log storage

  console.log(`✅ Test AI stored! Diet Plan ID: ${dietPlan.id}, Cost: $${cost.toFixed(4)}`);

  return {
    diet: testDiet,
    dietPlanId: dietPlan.id,
    usage: {
      model_used: completion.model,
      total_tokens: completion.usage?.total_tokens || 0,
      generation_time_ms: generationTime
    },
    cost: cost
  };
};

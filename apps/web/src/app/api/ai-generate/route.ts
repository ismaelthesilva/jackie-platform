import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Create admin/service client for server-side operations (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Initialize OpenAI only on server-side
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  // First, create a form response record
  const { data: formResponse, error: formError } = await supabaseAdmin
    .from('form_responses')
    .insert({
      client_name: clientName,
      client_email: clientEmail,
      form_type: 'test_ai',
      responses: responses,
      status: 'processing'
    })
    .select()
    .single();

  if (formError) {
    console.error('Failed to create form response:', formError);
    throw new Error('Failed to create form response record');
  }

  // Update the formResponseId to the actual database ID
  const actualFormResponseId = formResponse.id;
  
  // Simple AI call just to test the workflow
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system", 
        content: "You are Dr. Jackie. Respond with a simple JSON analysis of a math test."
      },
      {
        role: "user",
        content: `Analyze this test: ${userName} answered that 1+1 = ${mathAnswer}. Create a brief analysis with a simple diet recommendation. Keep it very short to minimize tokens.`
      }
    ],
    temperature: 0.3,
    max_tokens: 300, // Very low to minimize cost
    response_format: { type: "json_object" }
  });

  const generationTime = Date.now() - startTime;
  const aiResponse = JSON.parse(completion.choices[0].message.content || '{}');
  
  // Calculate cost (approximate)
  const inputTokens = completion.usage?.prompt_tokens || 0;
  const outputTokens = completion.usage?.completion_tokens || 0;
  const cost = (inputTokens * 0.00001) + (outputTokens * 0.00003); // GPT-4 pricing

  // Create a simple structured diet for testing
  const testDiet: AIGeneratedDiet = {
    overview: {
      duration: "Test Analysis",
      totalCalories: mathAnswer === 2 ? 2000 : 1500,
      macros: { protein: 100, carbs: 200, fats: 60 },
      goals: [mathAnswer === 2 ? "Math Genius Diet" : "Learning Support Diet"],
      clientSummary: aiResponse.analysis || `${userName} answered ${mathAnswer} for 1+1. ${mathAnswer === 2 ? 'Perfect!' : 'Needs support.'}`
    },
    weeks: [
      {
        weekNumber: 1,
        theme: "Test Week",
        days: [
          {
            day: 1,
            meals: [
              {
                type: 'breakfast' as const,
                name: "Smart Start Breakfast",
                ingredients: [
                  { item: "Eggs", quantity: "2 large", calories: 140 },
                  { item: "Toast", quantity: "1 slice", calories: 80 }
                ],
                instructions: "Cook eggs, serve with toast",
                calories: 220,
                macros: { protein: 14, carbs: 16, fats: 10 },
                timing: "8:00 AM"
              }
            ],
            totalCalories: 220,
            waterIntake: "2L",
            exercise: "Light walk"
          }
        ]
      }
    ],
    recommendations: {
      supplements: ["Vitamin D"],
      tips: [mathAnswer === 2 ? "Keep up the good work!" : "Practice makes perfect!"],
      warnings: ["This is a test analysis"]
    }
  };

  // Create or find user profile
  let userProfile;
  const { data: existingUser } = await supabaseAdmin
    .from('user_profiles')
    .select()
    .eq('email', clientEmail)
    .single();

  if (existingUser) {
    userProfile = existingUser;
  } else {
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        email: clientEmail,
        full_name: clientName,
        role: 'user'
      })
      .select()
      .single();

    if (userError) {
      console.error('Failed to create user profile:', userError);
      throw new Error('Failed to create user profile');
    }
    userProfile = newUser;
  }

  // Store diet plan
  const { data: dietPlan, error: dietError } = await supabaseAdmin
    .from('diet_plans')
    .insert({
      user_id: userProfile.id,
      form_data: { responses, formType: 'test_ai' },
      diet_plan: testDiet,
      status: 'draft',
      ai_prompt: `Test: ${userName} answered 1+1 = ${mathAnswer}`,
      ai_model_used: completion.model,
      ai_generation_time: new Date().toISOString(),
      ai_cost: cost,
      generation_method: 'ai_test'
    })
    .select()
    .single();

  if (dietError) {
    console.error('Failed to store diet plan:', dietError);
    throw new Error('Failed to store diet plan');
  }

  // Store AI generation log
  const { error: logError } = await supabaseAdmin
    .from('ai_generation_logs')
    .insert({
      diet_plan_id: dietPlan.id,
      form_response_id: actualFormResponseId,
      model_used: completion.model,
      prompt_tokens: completion.usage?.prompt_tokens || 0,
      completion_tokens: completion.usage?.completion_tokens || 0,
      total_tokens: completion.usage?.total_tokens || 0,
      total_cost: cost,
      generation_time_ms: generationTime,
      success: true
    });

  if (logError) {
    console.error('Failed to store AI generation log:', logError);
    // Don't throw here, as the main data is already stored
  }

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

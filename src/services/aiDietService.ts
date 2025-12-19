import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

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
  brand?: string;
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateAIDiet = async (
  formResponseId: string,
  formData: FormResponse,
  formType: string
): Promise<{ diet: AIGeneratedDiet; usage: any }> => {
  
  const startTime = Date.now();
  
  try {
    console.log('🤖 Starting AI diet generation for form:', formResponseId);
    
    // Handle test form with minimal AI usage
    if (formType === 'test_ai') {
      return await generateTestAIResponse(formResponseId, formData, startTime);
    }
    
    // Extract client information
    const clientData = extractClientData(formData, formType);
    
    // Calculate nutrition needs
    const nutritionNeeds = calculateNutritionNeeds(clientData);
    
    // Generate AI prompt
    const prompt = generateAIPrompt(clientData, nutritionNeeds, formType);
    
    console.log('📝 Generated prompt for AI, calling OpenAI...');
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are Dr. Jackie, a world-class nutritionist and fitness expert with 15 years of experience. You create personalized, science-based 30-day diet plans that are practical, delicious, and tailored to each client's specific needs, goals, and lifestyle. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const generationTime = Date.now() - startTime;
    
    console.log('✅ AI generation completed in', generationTime, 'ms');
    
    // Parse AI response
    const aiResponse = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Structure the diet according to our template
    const structuredDiet = structureAIDiet(aiResponse, nutritionNeeds, clientData);
    
    return {
      diet: structuredDiet,
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens,
        completion_tokens: completion.usage?.completion_tokens,
        total_tokens: completion.usage?.total_tokens,
        generation_time_ms: generationTime,
        model_used: 'gpt-4-turbo-preview'
      }
    };
    
  } catch (error) {
    console.error('❌ AI diet generation failed:', error);
    throw new Error(`AI diet generation failed: ${(error as Error).message}`);
  }
};

const generateTestAIResponse = async (
  formResponseId: string,
  formData: FormResponse,
  startTime: number
): Promise<{ diet: AIGeneratedDiet; usage: any }> => {
  console.log('🧪 Generating test AI response with minimal tokens...');
  
  const mathAnswer = formData.math_question as number;
  const userName = formData.name as string;
  
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

  return {
    diet: testDiet,
    usage: {
      model_used: completion.model,
      total_tokens: completion.usage?.total_tokens || 0,
      generation_time_ms: generationTime
    }
  };
};

const extractClientData = (formData: FormResponse, formType: string) => {
  const isPortuguese = formType.includes('br');
  
  return {
    name: formData.nome_completo || formData.full_name || 'Client',
    height: parseFloat(formData.altura as string || formData.height as string || '170'),
    weight: parseFloat(formData.peso as string || formData.weight as string || '70'),
    age: calculateAge(formData.data_nascimento || formData.birth_date),
    gender: formData.sexo || formData.gender || 'male',
    goal: formData.objetivo_principal || formData.primary_goal || 'general_health',
    activityLevel: formData.nivel_atividade || formData.activity_level || 'moderate',
    restrictions: formData.restricoes_alimentares || formData.dietary_restrictions || '',
    allergies: formData.alergias || formData.allergies || '',
    medicalConditions: formData.condicoes_medicas || formData.medical_conditions || '',
    currentDiet: formData.dieta_atual || formData.current_diet || '',
    waterIntake: formData.consumo_agua || formData.water_intake || '',
    sleepHours: formData.horas_sono || formData.sleep_hours || '7-8',
    stressLevel: formData.nivel_stress || formData.stress_level || 'moderate',
    budget: formData.orcamento || formData.budget || 'moderate',
    cookingTime: formData.tempo_preparo || formData.cooking_time || 'moderate',
    language: isPortuguese ? 'pt' : 'en'
  };
};

const calculateAge = (birthDate: any): number => {
  if (!birthDate) return 30;
  const birth = new Date(birthDate);
  const today = new Date();
  return today.getFullYear() - birth.getFullYear();
};

const calculateNutritionNeeds = (clientData: any) => {
  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr;
  if (clientData.gender === 'male' || clientData.gender === 'masculino') {
    bmr = 88.362 + (13.397 * clientData.weight) + (4.799 * clientData.height) - (5.677 * clientData.age);
  } else {
    bmr = 447.593 + (9.247 * clientData.weight) + (3.098 * clientData.height) - (4.330 * clientData.age);
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    sedentario: 1.2,
    light: 1.375,
    leve: 1.375,
    moderate: 1.55,
    moderado: 1.55,
    active: 1.725,
    ativo: 1.725,
    very_active: 1.9,
    muito_ativo: 1.9
  };

  const multiplier = activityMultipliers[clientData.activityLevel.toLowerCase() as keyof typeof activityMultipliers] || 1.55;
  let totalCalories = Math.round(bmr * multiplier);

  // Adjust for goals
  if (clientData.goal.includes('weight_loss') || clientData.goal.includes('emagrecimento')) {
    totalCalories -= 300; // Deficit for weight loss
  } else if (clientData.goal.includes('muscle_gain') || clientData.goal.includes('ganho_muscular')) {
    totalCalories += 300; // Surplus for muscle gain
  }

  // Calculate macros based on goal
  let proteinRatio, carbRatio, fatRatio;
  
  if (clientData.goal.includes('muscle_gain') || clientData.goal.includes('ganho_muscular')) {
    proteinRatio = 0.30;
    carbRatio = 0.45;
    fatRatio = 0.25;
  } else if (clientData.goal.includes('weight_loss') || clientData.goal.includes('emagrecimento')) {
    proteinRatio = 0.35;
    carbRatio = 0.30;
    fatRatio = 0.35;
  } else {
    proteinRatio = 0.25;
    carbRatio = 0.45;
    fatRatio = 0.30;
  }

  return {
    bmr: Math.round(bmr),
    totalCalories,
    protein: Math.round((totalCalories * proteinRatio) / 4),
    carbs: Math.round((totalCalories * carbRatio) / 4),
    fats: Math.round((totalCalories * fatRatio) / 9),
    proteinCalories: Math.round(totalCalories * proteinRatio),
    carbCalories: Math.round(totalCalories * carbRatio),
    fatCalories: Math.round(totalCalories * fatRatio)
  };
};

const generateAIPrompt = (clientData: any, nutritionNeeds: any, formType: string): string => {
  const isPortuguese = formType.includes('br');
  
  const promptLanguage = isPortuguese ? 'Portuguese (Brazil)' : 'English (US)';
  const responseLanguage = isPortuguese ? 'em português brasileiro' : 'in English';
  
  return `
Create a comprehensive, personalized 30-day diet plan for this client. Respond ${responseLanguage} and format as valid JSON.

## CLIENT PROFILE:
- Name: ${clientData.name}
- Age: ${clientData.age} years
- Gender: ${clientData.gender}
- Height: ${clientData.height}cm
- Weight: ${clientData.weight}kg
- Primary Goal: ${clientData.goal}
- Activity Level: ${clientData.activityLevel}
- Dietary Restrictions: ${clientData.restrictions || 'None'}
- Allergies: ${clientData.allergies || 'None'}
- Medical Conditions: ${clientData.medicalConditions || 'None'}
- Current Diet: ${clientData.currentDiet || 'Standard'}
- Water Intake: ${clientData.waterIntake || 'Average'}
- Sleep: ${clientData.sleepHours || '7-8'} hours
- Stress Level: ${clientData.stressLevel}
- Budget: ${clientData.budget}
- Cooking Time Available: ${clientData.cookingTime}

## NUTRITIONAL REQUIREMENTS:
- BMR: ${nutritionNeeds.bmr} calories
- Total Daily Calories: ${nutritionNeeds.totalCalories}
- Protein: ${nutritionNeeds.protein}g (${nutritionNeeds.proteinCalories} cal)
- Carbohydrates: ${nutritionNeeds.carbs}g (${nutritionNeeds.carbCalories} cal)
- Fats: ${nutritionNeeds.fats}g (${nutritionNeeds.fatCalories} cal)

## REQUIREMENTS:
1. Create exactly 30 days of meal plans (divide into 4-5 weekly themes)
2. Each day should have 6 meals: breakfast, morning_snack, lunch, afternoon_snack, dinner, evening_snack
3. Each meal should include detailed ingredients with quantities and calories
4. Provide cooking instructions for each meal
5. Include meal timing suggestions
6. Add weekly themes for variety
7. Include supplement recommendations
8. Add daily tips and hydration goals
9. Consider local food availability (${isPortuguese ? 'Brazil' : 'USA'})
10. Make it practical for ${clientData.cookingTime} cooking time
11. Stay within ${clientData.budget} budget range

## JSON RESPONSE FORMAT:
{
  "overview": {
    "duration": "30 days",
    "totalCalories": ${nutritionNeeds.totalCalories},
    "macros": {
      "protein": ${nutritionNeeds.protein},
      "carbs": ${nutritionNeeds.carbs},
      "fats": ${nutritionNeeds.fats}
    },
    "goals": ["Primary goal", "Secondary benefits"],
    "clientSummary": "Brief personalized summary for this client"
  },
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "Getting Started - Building Healthy Habits",
      "days": [
        {
          "day": 1,
          "meals": [
            {
              "type": "breakfast",
              "name": "Nutritious Breakfast Name",
              "ingredients": [
                {"item": "Food item", "quantity": "Amount", "calories": 100, "brand": "Optional brand"}
              ],
              "instructions": "Step by step cooking instructions",
              "calories": 400,
              "macros": {"protein": 25, "carbs": 45, "fats": 12},
              "timing": "7:00 AM",
              "tips": ["Helpful tips for this meal"]
            }
          ],
          "totalCalories": ${nutritionNeeds.totalCalories},
          "waterIntake": "3L",
          "exercise": "Suggested activity"
        }
      ]
    }
  ],
  "recommendations": {
    "supplements": ["Recommended supplements"],
    "tips": ["Daily lifestyle tips"],
    "warnings": ["Important considerations or warnings"]
  }
}

Make this diet plan exceptional, practical, and perfectly tailored to ${clientData.name}'s specific needs and goals. Focus on creating sustainable, delicious meals that will help achieve ${clientData.goal} while considering all dietary restrictions and preferences.
`;
};

const structureAIDiet = (aiResponse: any, nutritionNeeds: any, clientData: any): AIGeneratedDiet => {
  // Ensure the AI response follows our exact structure
  return {
    overview: {
      duration: aiResponse.overview?.duration || "30 days",
      totalCalories: aiResponse.overview?.totalCalories || nutritionNeeds.totalCalories,
      macros: aiResponse.overview?.macros || {
        protein: nutritionNeeds.protein,
        carbs: nutritionNeeds.carbs,
        fats: nutritionNeeds.fats
      },
      goals: aiResponse.overview?.goals || [`Achieve ${clientData.goal}`, "Improve overall health"],
      clientSummary: aiResponse.overview?.clientSummary || `Personalized diet plan for ${clientData.name}`
    },
    weeks: aiResponse.weeks || [],
    recommendations: aiResponse.recommendations || {
      supplements: [],
      tips: [],
      warnings: []
    }
  };
};

// Cost calculation helper
export const calculateAICost = (usage: any): number => {
  // GPT-4 Turbo pricing (as of 2024)
  const inputCostPer1K = 0.01;   // $0.01 per 1K input tokens
  const outputCostPer1K = 0.03;  // $0.03 per 1K output tokens
  
  const inputCost = (usage.prompt_tokens / 1000) * inputCostPer1K;
  const outputCost = (usage.completion_tokens / 1000) * outputCostPer1K;
  
  return Math.round((inputCost + outputCost) * 100) / 100; // Round to 2 decimal places
};

// Store AI diet in database
export const storeAIDietInDatabase = async (
  formResponseId: string,
  userId: string,
  aiDiet: AIGeneratedDiet,
  usage: any,
  prompt: string
) => {
  try {
    const cost = calculateAICost(usage);
    
    // Create diet plan
    const { data: dietPlan, error: dietError } = await supabase
      .from('diet_plans')
      .insert({
        user_id: userId,
        form_data: null, // We'll link via form_response_id
        diet_plan: aiDiet,
        status: 'pending_review',
        generation_method: 'ai',
        ai_prompt: prompt,
        ai_model_used: usage.model_used,
        ai_generation_time: new Date().toISOString(),
        ai_cost: cost
      })
      .select()
      .single();

    if (dietError) throw dietError;

    // Log AI generation
    await supabase
      .from('ai_generation_logs')
      .insert({
        diet_plan_id: dietPlan.id,
        form_response_id: formResponseId,
        model_used: usage.model_used,
        total_tokens: usage.total_tokens,
        total_cost: cost,
        generation_time_ms: usage.generation_time_ms,
        success: true
      });

    console.log(`✅ AI diet stored! ID: ${dietPlan.id}, Cost: $${cost}`);
    
    return {
      dietPlanId: dietPlan.id,
      cost: cost
    };
    
  } catch (error) {
    console.error('❌ Failed to store AI diet:', error);
    
    // Log failed generation
    await supabase
      .from('ai_generation_logs')
      .insert({
        form_response_id: formResponseId,
        model_used: usage?.model_used || 'gpt-4-turbo-preview',
        total_tokens: usage?.total_tokens || 0,
        total_cost: 0,
        generation_time_ms: usage?.generation_time_ms || 0,
        success: false,
        error_message: (error as Error).message
      });
    
    throw error;
  }
};

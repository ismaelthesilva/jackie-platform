'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Save,
  Send,
  Plus,
  Minus,
  Clock,
  Utensils,
  Calculator,
  User,
  CheckCircle
} from 'lucide-react';

interface DietPlan {
  id: string;
  user_id: string;
  form_data: any;
  diet_plan: any;
  status: string;
  created_at: string;
}

interface Meal {
  id: string;
  name: string;
  category: string;
  calories_per_serving: number;
  protein: number;
  carbs: number;
  fats: number;
  serving_size: string;
  instructions?: string;
}

interface DayPlan {
  breakfast: MealSelection[];
  morning_snack: MealSelection[];
  lunch: MealSelection[];
  afternoon_snack: MealSelection[];
  dinner: MealSelection[];
  evening_snack: MealSelection[];
}

interface MealSelection {
  meal: Meal;
  servings: number;
  notes?: string;
}

export default function DietCustomizePage() {
  const params = useParams();
  const router = useRouter();
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [availableMeals, setAvailableMeals] = useState<Meal[]>([]);
  const [customPlan, setCustomPlan] = useState<DayPlan>({
    breakfast: [],
    morning_snack: [],
    lunch: [],
    afternoon_snack: [],
    dinner: [],
    evening_snack: []
  });
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchDietPlan(params.id as string);
      fetchAvailableMeals();
    }
  }, [params.id]);

  const fetchDietPlan = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('user_id', id) // Using form response ID as user_id
        .single();

      if (error) {
        console.error('Error fetching diet plan:', error);
        return;
      }

      setDietPlan(data);
      
      // If there's already a custom plan, load it
      if (data.diet_plan?.custom_plan) {
        setCustomPlan(data.diet_plan.custom_plan);
      } else if (data.diet_plan?.template_used) {
        // Initialize with template data
        const template = data.diet_plan.template_used;
        if (template.template_data?.sample_day) {
          setCustomPlan(template.template_data.sample_day);
        }
      }
      
      if (data.diet_plan?.custom_notes) {
        setCustomNotes(data.diet_plan.custom_notes);
      }
    } catch (error) {
      console.error('Error in fetchDietPlan:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMeals = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_library')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching meals:', error);
        return;
      }

      setAvailableMeals(data || []);
    } catch (error) {
      console.error('Error in fetchAvailableMeals:', error);
    }
  };

  const addMealToSlot = (mealTime: keyof DayPlan, meal: Meal) => {
    setCustomPlan(prev => ({
      ...prev,
      [mealTime]: [...prev[mealTime], { meal, servings: 1 }]
    }));
  };

  const removeMealFromSlot = (mealTime: keyof DayPlan, index: number) => {
    setCustomPlan(prev => ({
      ...prev,
      [mealTime]: prev[mealTime].filter((_, i) => i !== index)
    }));
  };

  const updateServings = (mealTime: keyof DayPlan, index: number, servings: number) => {
    if (servings < 0.25) return;
    
    setCustomPlan(prev => ({
      ...prev,
      [mealTime]: prev[mealTime].map((item, i) => 
        i === index ? { ...item, servings } : item
      )
    }));
  };

  const updateMealNotes = (mealTime: keyof DayPlan, index: number, notes: string) => {
    setCustomPlan(prev => ({
      ...prev,
      [mealTime]: prev[mealTime].map((item, i) => 
        i === index ? { ...item, notes } : item
      )
    }));
  };

  const calculateTotalNutrition = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    Object.values(customPlan).forEach(mealSlot => {
      mealSlot.forEach((selection: MealSelection) => {
        const { meal, servings } = selection;
        totalCalories += meal.calories_per_serving * servings;
        totalProtein += meal.protein * servings;
        totalCarbs += meal.carbs * servings;
        totalFats += meal.fats * servings;
      });
    });

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fats: Math.round(totalFats)
    };
  };

  const saveDietPlan = async () => {
    if (!dietPlan) return;

    setSaving(true);
    try {
      const updatedDietPlan = {
        ...dietPlan.diet_plan,
        custom_plan: customPlan,
        custom_notes: customNotes,
        nutrition_totals: calculateTotalNutrition(),
        status: 'customized',
        last_modified: new Date().toISOString()
      };

      await supabase
        .from('diet_plans')
        .update({
          diet_plan: updatedDietPlan,
          status: 'ready_for_review'
        })
        .eq('id', dietPlan.id);

      alert('Plano alimentar salvo com sucesso!');
    } catch (error) {
      console.error('Error saving diet plan:', error);
      alert('Erro ao salvar plano alimentar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const publishDietPlan = async () => {
    if (!dietPlan) return;

    setSaving(true);
    try {
      const accessToken = generateAccessToken();
      const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

      // Update diet plan status
      await supabase
        .from('diet_plans')
        .update({ status: 'approved' })
        .eq('id', dietPlan.id);

      // Create published diet entry
      const { data: publishedDiet } = await supabase
        .from('published_diets')
        .insert({
          diet_plan_id: dietPlan.id,
          client_name: dietPlan.form_data.nome_completo || dietPlan.form_data.full_name,
          client_email: dietPlan.form_data.email,
          diet_data: {
            custom_plan: customPlan,
            nutrition_totals: calculateTotalNutrition(),
            notes: customNotes,
            template_used: dietPlan.diet_plan.template_used
          },
          access_token: accessToken,
          expires_at: expiresAt
        })
        .select()
        .single();

      // Update form response status
      await supabase
        .from('form_responses')
        .update({ status: 'completed' })
        .eq('id', dietPlan.user_id);

      // Send email notification to client
      await sendDietReadyEmail(
        dietPlan.form_data.email,
        dietPlan.form_data.nome_completo || dietPlan.form_data.full_name,
        accessToken
      );

      alert('Plano alimentar publicado com sucesso! O cliente foi notificado por email.');
      router.push('/admin');
    } catch (error) {
      console.error('Error publishing diet plan:', error);
      alert('Erro ao publicar plano alimentar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const sendDietReadyEmail = async (clientEmail: string, clientName: string, accessToken: string) => {
    try {
      // Import EmailJS here to avoid SSR issues
      const emailjs = (await import('@emailjs/browser')).default;
      
      const dietViewUrl = `${window.location.origin}/client/diet-view?token=${accessToken}`;
      
      const templateParams = {
        to_email: clientEmail,
        to_name: clientName,
        message: `Olá ${clientName}!

Seu plano alimentar personalizado está pronto! 🎉

A Dra. Jackie preparou especialmente para você um programa nutricional completo, baseado nas informações que você forneceu na sua avaliação.

Para acessar seu plano alimentar, clique no link abaixo:
${dietViewUrl}

Seu plano inclui:
✅ Cardápio completo para cada refeição do dia
✅ Informações nutricionais detalhadas
✅ Instruções personalizadas da Dra. Jackie
✅ Cálculos de calorias, proteínas, carboidratos e gorduras

IMPORTANTE:
- Este link é válido por 90 dias
- Guarde este email para consultas futuras
- Para dúvidas ou ajustes, entre em contato diretamente com a Dra. Jackie

Sua jornada para uma vida mais saudável começa agora!

Com carinho,
Dra. Jackie`
      };

      await emailjs.send(
        'service_ot9vx8q',
        'template_m6zdqte',
        templateParams,
        'f3z_9dp2a6CL3F2ml'
      );

      console.log('Diet ready email sent successfully');
    } catch (error) {
      console.error('Error sending diet ready email:', error);
      // Don't throw here - we still want the diet to be published even if email fails
    }
  };

  const generateAccessToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const getMealTimeLabel = (mealTime: keyof DayPlan) => {
    const labels: Record<keyof DayPlan, string> = {
      breakfast: 'Café da Manhã',
      morning_snack: 'Lanche Manhã',
      lunch: 'Almoço',
      afternoon_snack: 'Lanche Tarde',
      dinner: 'Jantar',
      evening_snack: 'Ceia'
    };
    return labels[mealTime];
  };

  const getMealsByCategory = (category: string) => {
    return availableMeals.filter(meal => meal.category === category);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!dietPlan) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600">Plano alimentar não encontrado</h1>
            <Button onClick={() => router.push('/admin')} className="mt-4">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalNutrition = calculateTotalNutrition();
  const targetNutrition = dietPlan.diet_plan?.nutrition_needs;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => router.push('/admin')}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customizar Plano Alimentar</h1>
            <p className="text-gray-600">
              Cliente: {dietPlan.form_data.nome_completo || dietPlan.form_data.full_name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={saveDietPlan}
              disabled={saving}
              variant="outline"
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
            <Button
              onClick={publishDietPlan}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Publicar & Enviar
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Nutrition Summary */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resumo Nutricional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{totalNutrition.calories}</div>
                  <div className="text-sm text-gray-600">Calorias</div>
                  {targetNutrition && (
                    <div className="text-xs text-gray-500">Meta: {targetNutrition.totalCalories}</div>
                  )}
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{totalNutrition.protein}g</div>
                  <div className="text-sm text-gray-600">Proteína</div>
                  {targetNutrition && (
                    <div className="text-xs text-gray-500">Meta: {targetNutrition.recommendedProtein}g</div>
                  )}
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{totalNutrition.carbs}g</div>
                  <div className="text-sm text-gray-600">Carboidratos</div>
                  {targetNutrition && (
                    <div className="text-xs text-gray-500">Meta: {targetNutrition.recommendedCarbs}g</div>
                  )}
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{totalNutrition.fats}g</div>
                  <div className="text-sm text-gray-600">Gorduras</div>
                  {targetNutrition && (
                    <div className="text-xs text-gray-500">Meta: {targetNutrition.recommendedFats}g</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meal Plan */}
        <div className="lg:col-span-3 space-y-6">
          {(Object.keys(customPlan) as Array<keyof DayPlan>).map((mealTime) => (
            <Card key={mealTime}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {getMealTimeLabel(mealTime)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customPlan[mealTime].map((selection, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{selection.meal.name}</div>
                        <div className="text-sm text-gray-600">
                          {Math.round(selection.meal.calories_per_serving * selection.servings)} cal |
                          P: {Math.round(selection.meal.protein * selection.servings)}g |
                          C: {Math.round(selection.meal.carbs * selection.servings)}g |
                          G: {Math.round(selection.meal.fats * selection.servings)}g
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateServings(mealTime, index, selection.servings - 0.25)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="min-w-12 text-center text-sm">
                          {selection.servings}x
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateServings(mealTime, index, selection.servings + 0.25)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeMealFromSlot(mealTime, index)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {customPlan[mealTime].length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      Nenhum alimento selecionado para este horário
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Custom Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Observações e Instruções</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Adicione observações específicas, instruções de preparo, ou recomendações personalizadas..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={6}
              />
            </CardContent>
          </Card>
        </div>

        {/* Available Meals */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Biblioteca de Alimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[800px] overflow-y-auto">
                {['breakfast', 'protein', 'carbs', 'vegetables', 'fats', 'snacks'].map(category => {
                  const meals = getMealsByCategory(category);
                  if (meals.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <h4 className="font-semibold mb-2 capitalize">{category}</h4>
                      <div className="space-y-2">
                        {meals.map(meal => (
                          <div
                            key={meal.id}
                            className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                            onClick={() => {
                              // For now, add to breakfast - we could make this smarter
                              const targetMeal = category === 'protein' ? 'lunch' : 
                                               category === 'snacks' ? 'morning_snack' : 'breakfast';
                              addMealToSlot(targetMeal as keyof DayPlan, meal);
                            }}
                          >
                            <div className="font-medium text-sm">{meal.name}</div>
                            <div className="text-xs text-gray-600">
                              {meal.calories_per_serving} cal | P:{meal.protein}g | C:{meal.carbs}g | G:{meal.fats}g
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

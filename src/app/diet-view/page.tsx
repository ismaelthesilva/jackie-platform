'use client'

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  Utensils,
  Calculator,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface PublishedDiet {
  id: string;
  client_name: string;
  client_email: string;
  diet_data: any;
  access_token: string;
  expires_at: string;
  created_at: string;
}

interface MealSelection {
  meal: {
    name: string;
    calories_per_serving: number;
    protein: number;
    carbs: number;
    fats: number;
    serving_size: string;
    instructions?: string;
  };
  servings: number;
  notes?: string;
}

interface DayPlan {
  breakfast: MealSelection[];
  morning_snack: MealSelection[];
  lunch: MealSelection[];
  afternoon_snack: MealSelection[];
  dinner: MealSelection[];
  evening_snack: MealSelection[];
}

function ClientDietViewContent() {
  const searchParams = useSearchParams();
  const [publishedDiet, setPublishedDiet] = useState<PublishedDiet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      fetchPublishedDiet(token);
    } else {
      setError('Token de acesso não fornecido');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchPublishedDiet = async (token: string) => {
    try {
      const { data, error } = await supabase
        .from('published_diets')
        .select('*')
        .eq('access_token', token)
        .single();

      if (error) {
        console.error('Error fetching published diet:', error);
        setError('Dieta não encontrada ou token inválido');
        return;
      }

      // Check if token has expired
      const expiresAt = new Date(data.expires_at);
      const now = new Date();
      
      if (now > expiresAt) {
        setError('Este link expirou. Entre em contato com a Dra. Jackie para obter um novo acesso.');
        return;
      }

      setPublishedDiet(data);
    } catch (error) {
      console.error('Error in fetchPublishedDiet:', error);
      setError('Erro ao carregar dieta. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const getMealTimeLabel = (mealTime: keyof DayPlan) => {
    const labels: Record<keyof DayPlan, string> = {
      breakfast: 'Café da Manhã',
      morning_snack: 'Lanche da Manhã',
      lunch: 'Almoço',
      afternoon_snack: 'Lanche da Tarde',
      dinner: 'Jantar',
      evening_snack: 'Ceia'
    };
    return labels[mealTime];
  };

  const getMealTimeIcon = (mealTime: keyof DayPlan) => {
    const now = new Date();
    const hour = now.getHours();
    
    const timeRanges = {
      breakfast: hour >= 6 && hour < 10,
      morning_snack: hour >= 10 && hour < 12,
      lunch: hour >= 12 && hour < 15,
      afternoon_snack: hour >= 15 && hour < 18,
      dinner: hour >= 18 && hour < 21,
      evening_snack: hour >= 21 || hour < 6
    };

    return timeRanges[mealTime] ? (
      <Clock className="h-4 w-4 text-emerald-600" />
    ) : (
      <Clock className="h-4 w-4 text-gray-400" />
    );
  };

  const calculateMealNutrition = (meals: MealSelection[]) => {
    return meals.reduce((totals, selection) => {
      const calories = selection.meal.calories_per_serving * selection.servings;
      const protein = selection.meal.protein * selection.servings;
      const carbs = selection.meal.carbs * selection.servings;
      const fats = selection.meal.fats * selection.servings;

      return {
        calories: totals.calories + calories,
        protein: totals.protein + protein,
        carbs: totals.carbs + carbs,
        fats: totals.fats + fats
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seu plano alimentar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-red-600 mb-2">Acesso Negado</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Para suporte, entre em contato com a Dra. Jackie.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!publishedDiet) {
    return null;
  }

  const customPlan: DayPlan = publishedDiet.diet_data.custom_plan;
  const nutritionTotals = publishedDiet.diet_data.nutrition_totals;
  const notes = publishedDiet.diet_data.notes;
  const templateUsed = publishedDiet.diet_data.template_used;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <img 
              src="/jackie-images/logo-placeholder.png" 
              alt="Dra. Jackie" 
              className="h-16 mx-auto mb-4"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Seu Plano Alimentar Personalizado
          </h1>
          <p className="text-gray-600">
            Preparado especialmente para {publishedDiet.client_name}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(publishedDiet.created_at).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Aprovado pela Dra. Jackie
            </div>
          </div>
        </div>

        {/* Nutrition Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <Calculator className="h-5 w-5" />
              Resumo Nutricional Diário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{nutritionTotals.calories}</div>
                <div className="text-sm text-gray-600">Calorias</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{nutritionTotals.protein}g</div>
                <div className="text-sm text-gray-600">Proteína</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{nutritionTotals.carbs}g</div>
                <div className="text-sm text-gray-600">Carboidratos</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{nutritionTotals.fats}g</div>
                <div className="text-sm text-gray-600">Gorduras</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Plan */}
        <div className="space-y-6">
          {(Object.keys(customPlan) as Array<keyof DayPlan>).map((mealTime) => {
            const meals = customPlan[mealTime];
            if (meals.length === 0) return null;

            const mealNutrition = calculateMealNutrition(meals);

            return (
              <Card key={mealTime} className="overflow-hidden">
                <CardHeader className="bg-emerald-50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMealTimeIcon(mealTime)}
                      <span className="text-emerald-700">{getMealTimeLabel(mealTime)}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(mealNutrition.calories)} cal
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {meals.map((selection, index) => (
                      <div key={index} className="p-4 border-b last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">
                              {selection.meal.name}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {selection.servings}x {selection.meal.serving_size}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{Math.round(selection.meal.calories_per_serving * selection.servings)} cal</span>
                              <span>P: {Math.round(selection.meal.protein * selection.servings)}g</span>
                              <span>C: {Math.round(selection.meal.carbs * selection.servings)}g</span>
                              <span>G: {Math.round(selection.meal.fats * selection.servings)}g</span>
                            </div>
                            {selection.meal.instructions && (
                              <div className="mt-2 text-sm text-gray-600 italic">
                                {selection.meal.instructions}
                              </div>
                            )}
                            {selection.notes && (
                              <div className="mt-2 text-sm text-emerald-700 bg-emerald-50 p-2 rounded">
                                <strong>Observação:</strong> {selection.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Personal Notes */}
        {notes && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <FileText className="h-5 w-5" />
                Observações da Dra. Jackie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-700 bg-emerald-50 p-4 rounded-lg">
                {notes}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Template Info */}
        {templateUsed && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Utensils className="h-5 w-5" />
                Plano Base Utilizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{templateUsed.name}</div>
                  <div className="text-sm text-gray-600">{templateUsed.description}</div>
                </div>
                <Badge variant="outline">
                  {templateUsed.goal_type.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p className="mb-2">
            Este plano foi criado especialmente para você pela Dra. Jackie
          </p>
          <p className="mb-2">
            Válido até: {new Date(publishedDiet.expires_at).toLocaleDateString('pt-BR')}
          </p>
          <p>
            Para dúvidas ou ajustes, entre em contato diretamente com a Dra. Jackie
          </p>
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense to handle useSearchParams
export default function DietViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ClientDietViewContent />
    </Suspense>
  );
}

'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { calculateNutritionNeeds } from '@/services/formSubmissionService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Mail, 
  Target, 
  Activity, 
  Calendar, 
  ArrowLeft,
  CheckCircle,
  FileText,
  Utensils,
  Calculator
} from 'lucide-react';

interface FormResponse {
  id: string;
  client_name: string;
  client_email: string;
  form_type: string;
  responses: any;
  status: string;
  created_at: string;
}

interface DietTemplate {
  id: string;
  name: string;
  description: string;
  goal_type: string;
  activity_level: string;
  calorie_range_min: number;
  calorie_range_max: number;
  target_protein: number;
  target_carbs: number;
  target_fats: number;
  template_data: any;
}

interface NutritionNeeds {
  bmr: number;
  totalCalories: number;
  recommendedProtein: number;
  recommendedCarbs: number;
  recommendedFats: number;
}

export default function FormReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [formResponse, setFormResponse] = useState<FormResponse | null>(null);
  const [dietTemplates, setDietTemplates] = useState<DietTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customNotes, setCustomNotes] = useState('');
  const [nutritionNeeds, setNutritionNeeds] = useState<NutritionNeeds | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchFormResponse(params.id as string);
      fetchDietTemplates();
    }
  }, [params.id]);

  useEffect(() => {
    if (formResponse) {
      const needs = calculateNutritionNeeds(formResponse.responses);
      setNutritionNeeds(needs);
    }
  }, [formResponse]);

  const fetchFormResponse = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching form response:', error);
        return;
      }

      setFormResponse(data);
    } catch (error) {
      console.error('Error in fetchFormResponse:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDietTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('diet_templates')
        .select('*')
        .eq('is_active', true)
        .order('goal_type', { ascending: true });

      if (error) {
        console.error('Error fetching diet templates:', error);
        return;
      }

      setDietTemplates(data || []);
    } catch (error) {
      console.error('Error in fetchDietTemplates:', error);
    }
  };

  const getRecommendedTemplates = (): DietTemplate[] => {
    if (!formResponse || !nutritionNeeds) return [];

    const responses = formResponse.responses;
    const goal = (responses.objetivo_principal || responses.primary_goal || '').toLowerCase();
    const activityLevel = (responses.nivel_atividade || responses.activity_level || '').toLowerCase();

    // Map Portuguese/English goals to template goal types
    let goalType = 'maintenance';
    if (goal.includes('emagrecimento') || goal.includes('weight_loss') || goal.includes('perder')) {
      goalType = 'weight_loss';
    } else if (goal.includes('ganho_muscular') || goal.includes('muscle_gain') || goal.includes('ganhar')) {
      goalType = 'muscle_gain';
    }

    // Map activity levels
    let activityMapping = 'moderate';
    if (activityLevel.includes('sedentario') || activityLevel.includes('sedentary')) {
      activityMapping = 'sedentary';
    } else if (activityLevel.includes('leve') || activityLevel.includes('light')) {
      activityMapping = 'light';
    } else if (activityLevel.includes('ativo') || activityLevel.includes('active')) {
      activityMapping = 'active';
    } else if (activityLevel.includes('muito') || activityLevel.includes('very')) {
      activityMapping = 'very_active';
    }

    return dietTemplates.filter(template => {
      const goalMatch = template.goal_type === goalType;
      const activityMatch = template.activity_level === activityMapping;
      const calorieMatch = nutritionNeeds.totalCalories >= template.calorie_range_min && 
                          nutritionNeeds.totalCalories <= template.calorie_range_max;
      
      return goalMatch && (activityMatch || calorieMatch);
    }).slice(0, 3); // Show top 3 recommendations
  };

  const handleCreateDietPlan = async () => {
    if (!selectedTemplate || !formResponse) return;

    setSubmitting(true);
    try {
      // Update form response status
      await supabase
        .from('form_responses')
        .update({ status: 'in_review' })
        .eq('id', formResponse.id);

      // Get selected template
      const template = dietTemplates.find(t => t.id === selectedTemplate);
      if (!template) throw new Error('Template not found');

      // Create or update diet plan
      const { data: existingDiet } = await supabase
        .from('diet_plans')
        .select('id')
        .eq('user_id', formResponse.id) // Using form response ID as temporary user ID
        .single();

      const dietPlanData = {
        form_data: formResponse.responses,
        diet_plan: {
          template_used: template,
          nutrition_needs: nutritionNeeds,
          custom_notes: customNotes,
          status: 'template_selected',
          created_at: new Date().toISOString()
        },
        status: 'pending_review'
      };

      if (existingDiet) {
        // Update existing diet plan
        await supabase
          .from('diet_plans')
          .update(dietPlanData)
          .eq('id', existingDiet.id);
      } else {
        // Create new diet plan
        await supabase
          .from('diet_plans')
          .insert({
            user_id: formResponse.id, // Using form response ID as temporary user ID
            ...dietPlanData
          });
      }

      // Add admin note
      await supabase
        .from('admin_notes')
        .insert({
          diet_plan_id: existingDiet?.id || formResponse.id,
          admin_user_id: null, // Will be updated when we have proper auth
          note_type: 'review',
          content: `Template selecionado: ${template.name}. ${customNotes ? 'Notas: ' + customNotes : ''}`
        });

      alert('Plano alimentar criado com sucesso! Agora você pode customizar os detalhes.');
      router.push(`/admin/diet-customize/${formResponse.id}`);
    } catch (error) {
      console.error('Error creating diet plan:', error);
      alert('Erro ao criar plano alimentar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const getFormTypeLabel = (formType: string) => {
    const labels: Record<string, string> = {
      'fitness_br': 'Avaliação Fitness (BR)',
      'fitness_usa': 'Fitness Assessment (USA)',
      'nutrition_br': 'Avaliação Nutricional (BR)',
      'nutrition_usa': 'Nutrition Assessment (USA)'
    };
    return labels[formType] || formType;
  };

  const renderFormResponses = () => {
    if (!formResponse) return null;

    const responses = formResponse.responses;
    const importantFields = [
      { key: 'idade', label: 'Idade', value: responses.idade || responses.age },
      { key: 'altura', label: 'Altura', value: responses.altura || responses.height, unit: 'cm' },
      { key: 'peso', label: 'Peso', value: responses.peso || responses.weight, unit: 'kg' },
      { key: 'objetivo_principal', label: 'Objetivo Principal', value: responses.objetivo_principal || responses.primary_goal },
      { key: 'nivel_atividade', label: 'Nível de Atividade', value: responses.nivel_atividade || responses.activity_level },
      { key: 'restricoes_alimentares', label: 'Restrições Alimentares', value: responses.restricoes_alimentares || responses.dietary_restrictions },
      { key: 'alergias', label: 'Alergias', value: responses.alergias || responses.allergies },
    ];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {importantFields.map((field) => (
            <div key={field.key} className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-700 mb-1">{field.label}</div>
              <div className="text-lg">
                {field.value || 'Não informado'} {field.unit && field.value ? field.unit : ''}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h4 className="font-semibold mb-3">Outras Respostas</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(responses).map(([key, value]) => {
              if (importantFields.some(f => f.key === key) || 
                  ['nome_completo', 'full_name', 'email'].includes(key)) {
                return null;
              }
              
              let displayValue = value;
              if (Array.isArray(value)) {
                displayValue = value.join(', ');
              }
              
              return (
                <div key={key} className="p-3 border rounded-lg">
                  <div className="font-medium text-sm text-gray-600 capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="mt-1">{String(displayValue)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!formResponse) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600">Avaliação não encontrada</h1>
            <Button onClick={() => router.push('/admin')} className="mt-4">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const recommendedTemplates = getRecommendedTemplates();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
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
            <h1 className="text-3xl font-bold text-gray-900">Revisão de Avaliação</h1>
            <p className="text-gray-600">Analise as respostas do cliente e selecione um plano alimentar</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {getFormTypeLabel(formResponse.form_type)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Information and Form Responses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{formResponse.client_name}</div>
                    <div className="text-sm text-gray-600">Nome</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{formResponse.client_email}</div>
                    <div className="text-sm text-gray-600">Email</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">
                      {new Date(formResponse.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-600">Data de envio</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">
                      {formResponse.responses.objetivo_principal || formResponse.responses.primary_goal}
                    </div>
                    <div className="text-sm text-gray-600">Objetivo principal</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculated Nutrition Needs */}
          {nutritionNeeds && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Necessidades Calculadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">{nutritionNeeds.bmr}</div>
                    <div className="text-sm text-gray-600">TMB</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{nutritionNeeds.totalCalories}</div>
                    <div className="text-sm text-gray-600">Calorias</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{nutritionNeeds.recommendedProtein}g</div>
                    <div className="text-sm text-gray-600">Proteína</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{nutritionNeeds.recommendedCarbs}g</div>
                    <div className="text-sm text-gray-600">Carboidratos</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{nutritionNeeds.recommendedFats}g</div>
                    <div className="text-sm text-gray-600">Gorduras</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Responses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Respostas da Avaliação
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderFormResponses()}
            </CardContent>
          </Card>
        </div>

        {/* Diet Template Selection */}
        <div className="space-y-6">
          {/* Recommended Templates */}
          {recommendedTemplates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Templates Recomendados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate === template.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{template.calorie_range_min}-{template.calorie_range_max} cal</span>
                        <span>P:{template.target_protein}g</span>
                        <span>C:{template.target_carbs}g</span>
                        <span>G:{template.target_fats}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Todos os Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Selecione um template</option>
                {dietTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.calorie_range_min}-{template.calorie_range_max} cal)
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Custom Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notas Personalizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Adicione notas específicas para este cliente..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Action Button */}
          <Button
            onClick={handleCreateDietPlan}
            disabled={!selectedTemplate || submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            size="lg"
          >
            {submitting ? (
              'Criando Plano...'
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Criar Plano Alimentar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

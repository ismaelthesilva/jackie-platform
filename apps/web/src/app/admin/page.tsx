'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Users, 
  Search,
  Calendar,
  ArrowRight,
  User,
  Mail,
  Target
} from 'lucide-react';

interface FormResponse {
  id: string;
  client_name: string;
  client_email: string;
  form_type: string;
  responses: any;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AIDietPlan {
  id: string;
  user_id: string;
  status: string;
  generation_method: string;
  ai_cost: number;
  ai_generation_time: string;
  ai_model_used: string;
  created_at: string;
  user_profiles: {
    full_name: string;
    email: string;
  };
  diet_plan: {
    overview: {
      goals: string[];
      totalCalories: number;
    };
  };
}

interface DashboardStats {
  pendingForms: number;
  inReviewForms: number;
  completedForms: number;
  totalForms: number;
  aiPendingReview: number;
  aiApproved: number;
  totalAI: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<FormResponse[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    pendingForms: 0,
    inReviewForms: 0,
    completedForms: 0,
    totalForms: 0,
    aiPendingReview: 0,
    aiApproved: 0,
    totalAI: 0
  });
  const [aiDietPlans, setAiDietPlans] = useState<AIDietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('pending');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterResponses();
  }, [formResponses, searchTerm, selectedTab]);

  const fetchData = async () => {
    try {
      // Fetch form responses
      const { data: formData, error: formError } = await supabase
        .from('form_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (formError) {
        console.error('Error fetching form responses:', formError);
        return;
      }

      setFormResponses(formData || []);

      // Fetch AI diet plans
      const { data: aiData, error: aiError } = await supabase
        .from('diet_plans')
        .select(`
          *,
          user_profiles (
            full_name,
            email
          )
        `)
        .eq('generation_method', 'ai')
        .order('created_at', { ascending: false });

      if (aiError) {
        console.error('Error fetching AI diet plans:', aiError);
        return;
      }

      setAiDietPlans(aiData || []);
      
      // Calculate stats
      const pending = formData?.filter(f => f.status === 'pending').length || 0;
      const inReview = formData?.filter(f => f.status === 'in_review').length || 0;
      const completed = formData?.filter(f => f.status === 'completed').length || 0;
      
      const aiPendingReview = aiData?.filter(d => d.status === 'pending_review').length || 0;
      const aiApproved = aiData?.filter(d => d.status === 'approved').length || 0;
      
      setStats({
        pendingForms: pending,
        inReviewForms: inReview,
        completedForms: completed,
        totalForms: formData?.length || 0,
        aiPendingReview: aiPendingReview,
        aiApproved: aiApproved,
        totalAI: aiData?.length || 0
      });
    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResponses = () => {
    // Don't filter responses for AI review tab
    if (selectedTab === 'ai_review') {
      setFilteredResponses([]);
      return;
    }

    let filtered = formResponses;

    // Filter by status based on selected tab
    if (selectedTab !== 'all') {
      filtered = filtered.filter(response => {
        if (selectedTab === 'pending') return response.status === 'pending';
        if (selectedTab === 'in_review') return response.status === 'in_review';
        if (selectedTab === 'completed') return response.status === 'completed';
        return true;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(response =>
        response.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.form_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredResponses(filtered);
  };

  const handleReviewForm = (formId: string) => {
    router.push(`/admin/form-review/${formId}`);
  };

  const handleReviewAIDiet = (dietPlanId: string) => {
    router.push(`/admin/ai-review/${dietPlanId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'in_review':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Em Análise</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFormTypeLabel = (formType: string) => {
    const labels: Record<string, string> = {
      'fitness_br': 'Fitness BR',
      'fitness_usa': 'Fitness USA',
      'nutrition_br': 'Nutrição BR',
      'nutrition_usa': 'Nutrition USA'
    };
    return labels[formType] || formType;
  };

  const getGoalFromResponses = (responses: any) => {
    return responses?.objetivo_principal || responses?.primary_goal || 'Não especificado';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
        <p className="text-lg text-gray-600">Gerencie avaliações de clientes e planos alimentares</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Formulários Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingForms}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-700">🤖 AI Pendente</p>
                <p className="text-2xl font-bold text-purple-600">{stats.aiPendingReview}</p>
              </div>
              <div className="h-6 w-6 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                AI
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedForms}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total AI</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.totalAI}</p>
              </div>
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou tipo de formulário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Responses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Avaliações de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="pending">Pendentes ({stats.pendingForms})</TabsTrigger>
              <TabsTrigger value="ai_review" className="bg-purple-50 data-[state=active]:bg-purple-100">
                🤖 AI Review ({stats.aiPendingReview})
              </TabsTrigger>
              <TabsTrigger value="in_review">Em Análise ({stats.inReviewForms})</TabsTrigger>
              <TabsTrigger value="completed">Concluídos ({stats.completedForms})</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              {selectedTab === 'ai_review' ? (
                // AI Diet Plans Review Section
                aiDietPlans.filter(plan => plan.status === 'pending_review').length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhuma dieta AI pendente
                    </h3>
                    <p className="text-gray-600">
                      Todas as dietas geradas por AI foram revisadas!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiDietPlans
                      .filter(plan => plan.status === 'pending_review')
                      .map((dietPlan) => (
                        <Card key={dietPlan.id} className="hover:shadow-md transition-shadow border-purple-200">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                      AI
                                    </div>
                                    <span className="font-semibold text-lg">{dietPlan.user_profiles.full_name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600">{dietPlan.user_profiles.email}</span>
                                  </div>
                                  <Badge className="bg-purple-100 text-purple-800">AI Gerada</Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Modelo:</span> {dietPlan.ai_model_used}
                                  </div>
                                  <div>
                                    <span className="font-medium">Custo:</span> ${dietPlan.ai_cost?.toFixed(4) || '0.0000'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Calorias:</span> {dietPlan.diet_plan?.overview?.totalCalories || 'N/A'}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span className="font-medium">Gerada:</span> {new Date(dietPlan.ai_generation_time).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>

                                {dietPlan.diet_plan?.overview?.goals && (
                                  <div className="mt-3">
                                    <span className="text-sm font-medium text-gray-600">Objetivos: </span>
                                    <div className="inline-flex flex-wrap gap-1 mt-1">
                                      {dietPlan.diet_plan.overview.goals.slice(0, 3).map((goal, index) => (
                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                          {goal}
                                        </span>
                                      ))}
                                      {dietPlan.diet_plan.overview.goals.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                          +{dietPlan.diet_plan.overview.goals.length - 3} mais
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <Button
                                onClick={() => handleReviewAIDiet(dietPlan.id)}
                                className="bg-purple-600 hover:bg-purple-700 ml-4"
                              >
                                🤖 Revisar AI
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )
              ) : (
                // Regular Form Responses Section
                filteredResponses.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhuma avaliação encontrada
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm ? 'Tente ajustar sua busca.' : 'Não há avaliações nesta categoria.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredResponses.map((response) => (
                      <Card key={response.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="font-semibold text-lg">{response.client_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-gray-500" />
                                  <span className="text-gray-600">{response.client_email}</span>
                                </div>
                                {getStatusBadge(response.status)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Tipo:</span> {getFormTypeLabel(response.form_type)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  <span className="font-medium">Objetivo:</span> {getGoalFromResponses(response.responses)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span className="font-medium">Enviado:</span> {new Date(response.created_at).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleReviewForm(response.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 ml-4"
                            >
                              Revisar
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

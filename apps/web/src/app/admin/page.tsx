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

interface DashboardStats {
  pendingForms: number;
  inReviewForms: number;
  completedForms: number;
  totalForms: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<FormResponse[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    pendingForms: 0,
    inReviewForms: 0,
    completedForms: 0,
    totalForms: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('pending');

  useEffect(() => {
    fetchFormResponses();
  }, []);

  useEffect(() => {
    filterResponses();
  }, [formResponses, searchTerm, selectedTab]);

  const fetchFormResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching form responses:', error);
        return;
      }

      setFormResponses(data || []);
      
      // Calculate stats
      const pending = data?.filter(f => f.status === 'pending').length || 0;
      const inReview = data?.filter(f => f.status === 'in_review').length || 0;
      const completed = data?.filter(f => f.status === 'completed').length || 0;
      
      setStats({
        pendingForms: pending,
        inReviewForms: inReview,
        completedForms: completed,
        totalForms: data?.length || 0
      });
    } catch (error) {
      console.error('Error in fetchFormResponses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResponses = () => {
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingForms}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Análise</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inReviewForms}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedForms}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.totalForms}</p>
              </div>
              <Users className="h-8 w-8 text-emerald-600" />
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pendentes ({stats.pendingForms})</TabsTrigger>
              <TabsTrigger value="in_review">Em Análise ({stats.inReviewForms})</TabsTrigger>
              <TabsTrigger value="completed">Concluídos ({stats.completedForms})</TabsTrigger>
              <TabsTrigger value="all">Todos ({stats.totalForms})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              {filteredResponses.length === 0 ? (
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { submitFormToDatabase } from '@/services/formSubmissionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Circle, Loader2, ArrowLeft, ArrowRight, Dumbbell, Target, Heart, User, Activity, Brain, Zap, Trophy, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

// TypeScript interfaces
interface Question {
  id: string;
  type: 'welcome' | 'text' | 'number' | 'email' | 'textarea' | 'yes_no' | 'multiple_choice' | 'multiple_select' | 'checkbox' | 'thank_you';
  title: string;
  description?: string;
  buttonText?: string;
  options?: string[];
  required?: boolean;
  condition?: {
    id: string;
    value: string;
  };
}

interface Answers {
  [key: string]: string | string[] | number;
}

interface EmailTemplateParams {
  to_email: string;
  client_name: string;
  client_email: string;
  email_body: string;
  [key: string]: unknown;
}

export default function FitnessBRPage() {
  console.log('FitnessBR component is rendering...');
  
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [formCompleted, setFormCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [clientEmail, setClientEmail] = useState<string>('');
  const formRef = useRef<HTMLDivElement>(null);

  const questions = useMemo<Question[]>(() => [
    {
      id: 'welcome',
      type: 'welcome',
      title: 'Questionário Profissional para Consultoria Fitness & Fisiculturismo',
      description: 'Adaptável para qualquer nível: do iniciante ao atleta de palco',
      buttonText: 'Começar'
    },
    // BLOCO 1 — INFORMAÇÕES PESSOAIS E BÁSICAS
    {
      id: 'block1_header',
      type: 'welcome',
      title: 'BLOCO 1 — INFORMAÇÕES PESSOAIS E BÁSICAS',
      description: 'Vamos começar com algumas informações básicas sobre você.',
      buttonText: 'Continuar'
    },
    { id: 'nome_completo', type: 'text', title: '1. Nome completo:', required: true },
    { id: 'data_nascimento', type: 'text', title: '2. Data de nascimento:', required: true },
    { id: 'altura', type: 'number', title: '3. Altura (em cm):', required: true },
    { id: 'peso', type: 'number', title: '4. Peso atual (em kg):', required: true },
    { id: 'percentual_gordura', type: 'text', title: '5. Percentual de gordura corporal (se souber):', required: false },
    { id: 'localizacao', type: 'text', title: '6. Localização (cidade e país):', required: true },
    { id: 'profissao', type: 'textarea', title: '7. Profissão e rotina de trabalho (turnos, carga horária, sedentarismo ou atividade):', required: true },
    { id: 'horario_sono', type: 'text', title: '8. Horário habitual de sono:', required: true },
    { 
      id: 'horas_sono', 
      type: 'multiple_choice', 
      title: '9. Quantas horas dorme por noite, em média?',
      options: ['Menos de 5h', '5h', '6h', '7h', '8h', 'Mais de 8h'],
      required: true 
    },
    { 
      id: 'tipo_sono', 
      type: 'multiple_choice', 
      title: '10. Seu sono é:',
      options: ['Leve', 'Médio', 'Profundo'],
      required: true 
    },
    { id: 'acorda_descansado', type: 'yes_no', title: '11. Costuma acordar descansado(a)?', required: true },
    { id: 'energia_dia', type: 'textarea', title: '12. Como descreveria sua energia ao longo do dia?', required: true },
    { id: 'fuma', type: 'yes_no', title: '13. Você fuma?', required: true },
    { id: 'alcool', type: 'yes_no', title: '14. Consome bebidas alcoólicas?', required: true },
    { id: 'alcool_detalhes', type: 'textarea', title: 'Frequência e quantidade:', condition: { id: 'alcool', value: 'Yes' }, required: true },
    { id: 'gestante', type: 'yes_no', title: '15. Está gestante ou tentando engravidar? (se aplicável)', required: false },

    // BLOCO 2 — HISTÓRICO DE SAÚDE
    {
      id: 'block2_header',
      type: 'welcome',
      title: 'BLOCO 2 — HISTÓRICO DE SAÚDE',
      description: 'Vamos conhecer um pouco sobre sua saúde e histórico médico.',
      buttonText: 'Continuar'
    },
    { id: 'doencas', type: 'textarea', title: '16. Possui alguma doença diagnosticada? (ex: hipotireoidismo, SOP, resistência insulínica, etc)', required: false },
    { id: 'lesoes', type: 'textarea', title: '17. Já sofreu alguma lesão? Detalhe local e ano:', required: false },
    { id: 'cirurgias', type: 'textarea', title: '18. Já passou por alguma cirurgia? Qual e quando?', required: false },
    { id: 'medicacao', type: 'textarea', title: '19. Usa alguma medicação contínua? Qual?', required: false },
    { id: 'alergias', type: 'textarea', title: '20. Possui alergias alimentares ou intolerâncias?', required: false },
    { id: 'anticoncepcional', type: 'textarea', title: '21. Faz uso de anticoncepcional? (especifique tipo e forma)', required: false },
    { id: 'exames_sangue', type: 'yes_no', title: '22. Já realizou exames de sangue nos últimos 6 meses?', required: true },
    { id: 'exames_alteracoes', type: 'textarea', title: 'Se sim, possui alterações?', condition: { id: 'exames_sangue', value: 'Yes' }, required: true },

    // BLOCO 3 — HISTÓRICO DE TREINOS E NÍVEL
    {
      id: 'block3_header',
      type: 'welcome',
      title: 'BLOCO 3 — HISTÓRICO DE TREINOS E NÍVEL',
      description: 'Conte-nos sobre sua experiência com treinos.',
      buttonText: 'Continuar'
    },
    { id: 'tempo_treino', type: 'text', title: '23. Há quanto tempo você treina de forma consistente?', required: true },
    { id: 'fases_cutting_bulking', type: 'textarea', title: '24. Já passou por fases de cutting ou bulking? Quantas vezes?', required: false },
    { id: 'acompanhamento', type: 'textarea', title: '25. Já teve acompanhamento profissional? (Treinador ou nutricionista esportivo?)', required: false },
    { 
      id: 'tipo_treino', 
      type: 'multiple_select', 
      title: '26. Você treina atualmente com:',
      options: ['Musculação clássica', 'Funcional', 'Crossfit', 'Cardio livre', 'Outros'],
      required: true 
    },
    { id: 'tipo_treino_outros', type: 'text', title: 'Se outros, especifique:', condition: { id: 'tipo_treino', value: 'Outros' }, required: true },
    { id: 'dias_treino', type: 'text', title: '27. Quantos dias por semana você consegue treinar com qualidade?', required: true },
    { id: 'tempo_treino_dia', type: 'text', title: '28. Quanto tempo disponível por treino?', required: true },
    { 
      id: 'local_treino', 
      type: 'multiple_choice', 
      title: '29. Tem preferência por treinar em casa ou academia?',
      options: ['Casa', 'Academia', 'Ambos'],
      required: true 
    },
    { id: 'restricao_equipamento', type: 'textarea', title: '30. Possui restrição de equipamento?', required: false },

    // BLOCO 4 — OBJETIVOS E FOCO ESTÉTICO
    {
      id: 'block4_header',
      type: 'welcome',
      title: 'BLOCO 4 — OBJETIVOS E FOCO ESTÉTICO',
      description: 'Quais são seus objetivos e metas estéticas?',
      buttonText: 'Continuar'
    },
    { 
      id: 'objetivo_principal', 
      type: 'multiple_choice', 
      title: '31. Qual seu objetivo principal?',
      options: ['Perder gordura', 'Ganhar massa muscular', 'Recomposição corporal', 'Melhorar performance', 'Estética de palco'],
      required: true 
    },
    { id: 'objetivo_secundario', type: 'textarea', title: '32. Qual seu objetivo secundário?', required: false },
    { id: 'competir', type: 'textarea', title: '33. Pretende competir? Se sim, em qual categoria e federação?', required: false },
    { id: 'prazo_objetivo', type: 'text', title: '34. Qual o prazo para alcançar esse objetivo?', required: true },
    { id: 'dieta_restrita', type: 'yes_no', title: '35. Está disposto(a) a fazer dieta restrita se necessário?', required: true },
    { id: 'protocolos_avancados', type: 'yes_no', title: '36. Aceita protocolos de estratégias avançadas (depleção, carga, jejum estratégico, etc)?', required: true },
    { id: 'enfase_corpo', type: 'textarea', title: '37. Possui alguma área do corpo que deseja dar maior ênfase?', required: false },
    { id: 'dificuldade_desenvolver', type: 'textarea', title: '38. Existe alguma parte que sente dificuldade de ativar ou desenvolver?', required: false },
    { id: 'anabolizantes', type: 'textarea', title: '39. Já usou anabolizantes ou ergogênicos? Quais e quando?', required: false },
    { id: 'estrategia_farmacologica', type: 'yes_no', title: '40. Pretende usar alguma estratégia farmacológica sob orientação profissional?', required: false },

    // BLOCO 5 — TREINO: GOSTOS, LIMITAÇÕES E BIOFEEDBACK
    {
      id: 'block5_header',
      type: 'welcome',
      title: 'BLOCO 5 — TREINO: GOSTOS, LIMITAÇÕES E BIOFEEDBACK',
      description: 'Vamos entender suas preferências e limitações de treino.',
      buttonText: 'Continuar'
    },
    { id: 'exercicios_gosta', type: 'textarea', title: '41. Quais exercícios você mais gosta? Por quê?', required: true },
    { id: 'exercicios_detesta', type: 'textarea', title: '42. Quais exercícios você detesta? Por quê?', required: true },
    { id: 'exercicios_lesao', type: 'textarea', title: '43. Tem algum exercício que você não pode fazer por lesão ou desconforto?', required: false },
    { 
      id: 'facilidade_treino', 
      type: 'multiple_choice', 
      title: '44. Você sente mais facilidade com:',
      options: ['Cargas altas', 'Volume alto (mais repetições)', 'Técnicas avançadas (drop-set, rest-pause)'],
      required: true 
    },
    { id: 'dificuldade_grupo', type: 'textarea', title: '45. Sente dificuldade de sentir algum grupo muscular? Qual?', required: false },
    { id: 'grupo_responde_facil', type: 'textarea', title: '46. Qual grupo muscular sente que responde mais fácil?', required: true },
    { id: 'dores_articulares', type: 'textarea', title: '47. Costuma ter dores articulares? Onde e com que frequência?', required: false },
    { 
      id: 'reacao_treino', 
      type: 'multiple_choice', 
      title: '48. Como reage após o treino?',
      options: ['Energizado', 'Exausto', 'Sonolento', 'Irritado ou com fome'],
      required: true 
    },
    { id: 'dificuldade_ficha', type: 'yes_no', title: '49. Tem dificuldade de seguir ficha sozinha(o)?', required: true },
    { 
      id: 'preferencia_treino', 
      type: 'multiple_choice', 
      title: '50. Gosta de treinos com variação constante ou sequência repetida com progressão?',
      options: ['Variação constante', 'Sequência repetida com progressão', 'Ambos'],
      required: true 
    },

    // BLOCO 6 — CARDIO, FLEXIBILIDADE E CONDICIONAMENTO
    {
      id: 'block6_header',
      type: 'welcome',
      title: 'BLOCO 6 — CARDIO, FLEXIBILIDADE E CONDICIONAMENTO',
      description: 'Informações sobre sua capacidade cardiovascular e flexibilidade.',
      buttonText: 'Continuar'
    },
    { id: 'resistencia_aerobica', type: 'textarea', title: '51. Qual sua resistência para atividades aeróbicas?', required: true },
    { id: 'hiit', type: 'textarea', title: '52. Já praticou HIIT? Gosta ou sente mal-estar?', required: true },
    { id: 'cardio_jejum', type: 'yes_no', title: '53. Está disposto(a) a incluir cardio em jejum, se necessário?', required: true },
    { id: 'limitacao_respiratoria', type: 'textarea', title: '54. Tem alguma limitação respiratória ou cardiovascular?', required: false },
    { id: 'mobilidade', type: 'textarea', title: '55. Consegue realizar exercícios de mobilidade e alongamento? Faz atualmente?', required: true },

    // BLOCO 7 — ROTINA, ADERÊNCIA E MENTALIDADE
    {
      id: 'block7_header',
      type: 'welcome',
      title: 'BLOCO 7 — ROTINA, ADERÊNCIA E MENTALIDADE',
      description: 'Vamos entender sua rotina e mentalidade.',
      buttonText: 'Continuar'
    },
    { id: 'dias_treino_facilidade', type: 'textarea', title: '56. Quais dias da semana são mais fáceis para treinar? E quais são os mais difíceis?', required: true },
    { id: 'desafio_constancia', type: 'textarea', title: '57. Qual o maior desafio hoje para manter constância nos treinos?', required: true },
    { id: 'apoio_familia', type: 'yes_no', title: '58. Tem apoio da família ou pessoas próximas para seguir sua rotina fitness?', required: true },
    { id: 'motivo_desistencia', type: 'textarea', title: '59. O que te desanima ou te faz desistir de planos anteriores?', required: true },
    { 
      id: 'comprometimento', 
      type: 'multiple_choice', 
      title: '60. De 0 a 10, qual seu grau de comprometimento atual com seus objetivos?',
      options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      required: true 
    },

    // BLOCO 8 — FOTOS E ACOMPANHAMENTO
    {
      id: 'block8_header',
      type: 'welcome',
      title: 'BLOCO 8 — FOTOS E ACOMPANHAMENTO (opcional)',
      description: 'Como podemos acompanhar sua evolução?',
      buttonText: 'Continuar'
    },
    { id: 'fotos_corporais', type: 'yes_no', title: '61. Está disposto(a) a enviar fotos corporais para evolução?', required: false },
    { id: 'fotos_anteriores', type: 'yes_no', title: '62. Já tem fotos comparativas anteriores?', required: false },
    { 
      id: 'checkins', 
      type: 'multiple_choice', 
      title: '63. Deseja fazer check-ins semanais ou quinzenais?',
      options: ['Semanais', 'Quinzenais', 'Mensais', 'Não desejo check-ins regulares'],
      required: true 
    },
    { id: 'apps_registro', type: 'yes_no', title: '64. Gosta de usar apps para registrar treinos ou alimentação?', required: true },

    // BLOCO 9 — SUPLEMENTAÇÃO E DIETA
    {
      id: 'block9_header',
      type: 'welcome',
      title: 'BLOCO 9 — SUPLEMENTAÇÃO E DIETA (resumo inicial)',
      description: 'Informações sobre sua alimentação e suplementação.',
      buttonText: 'Continuar'
    },
    { id: 'plano_alimentar', type: 'textarea', title: '65. Está com plano alimentar ativo? Feito por quem?', required: false },
    { id: 'suplementos', type: 'textarea', title: '66. Quais suplementos você usa atualmente (marca e dose)?', required: false },
    { id: 'ajuste_dieta', type: 'yes_no', title: '67. Está disposto(a) a ajustar sua dieta conforme o treino periodizado?', required: true },
    { id: 'facilidade_cozinhar', type: 'yes_no', title: '68. Tem facilidade de cozinhar/preparar suas refeições?', required: true },
    { 
      id: 'preferencia_dieta', 
      type: 'multiple_choice', 
      title: '69. Prefere dieta fixa ou com opções e substituições?',
      options: ['Dieta fixa', 'Com opções e substituições'],
      required: true 
    },
    
    // BLOCO 10 — HIDRATAÇÃO
    {
      id: 'block10_header',
      type: 'welcome',
      title: 'BLOCO 10 — HIDRATAÇÃO',
      description: 'Informações sobre seus hábitos de hidratação.',
      buttonText: 'Continuar'
    },
    { id: 'consumo_agua', type: 'text', title: '70. Quanta água você bebe por dia (em litros)?', required: true },
    { id: 'monitora_agua', type: 'yes_no', title: '71. Você monitora sua ingestão de água?', required: true },
    { id: 'sede_dia', type: 'textarea', title: '72. Você sente sede ao longo do dia ou durante os treinos?', required: true },
    { id: 'eletrolitos', type: 'yes_no', title: '73. Você adiciona eletrólitos ou usa suplementos de hidratação?', required: false },
    
    // BLOCO 11 — PAD (Padrão de Ativação e Dor)
    {
      id: 'block11_header',
      type: 'welcome',
      title: 'BLOCO 11 — PAD (Padrão de Ativação e Dor)',
      description: 'Informações sobre sua conexão neuromuscular e padrões de dor.',
      buttonText: 'Continuar'
    },
    { id: 'ativacao_muscular', type: 'textarea', title: '74. Você sente o músculo-alvo trabalhando na maioria dos exercícios? Se não, em quais exercícios tem dificuldade de ativação?', required: true },
    { id: 'dor_muscular', type: 'textarea', title: '75. Você costuma sentir dor muscular após o treino? Quais grupos musculares respondem mais?', required: true },
    { id: 'dor_articular', type: 'textarea', title: '76. Você sente dor nas articulações durante o treino? Se sim, onde e quando?', required: false },
    
    // Email e Conclusão
    {
      id: 'informacao_adicional',
      type: 'textarea',
      title: '77. Existe algo a mais que gostaria de compartilhar comigo, e que não consta neste form?',
      required: false
    },
    {
      id: 'email',
      type: 'email',
      title: 'Por favor, forneça seu e-mail para receber seu plano personalizado',
      required: true
    },
    {
      id: 'thankYou',
      type: 'thank_you',
      title: 'Obrigado por completar o questionário!',
      description: 'Analisaremos suas respostas e enviaremos seu plano personalizado em breve.'
    }
  ], []);

  const shouldDisplayQuestion = useCallback((question: Question): boolean => {
    if (!question.condition) return true;
    const { id, value } = question.condition;
    return answers[id] === value;
  }, [answers]);

  const getNextQuestion = useCallback((currentIndex: number): number => {
    for (let i = currentIndex + 1; i < questions.length; i++) {
      if (shouldDisplayQuestion(questions[i])) {
        return i;
      }
    }
    return questions.length - 1;
  }, [questions, shouldDisplayQuestion]);

  const handleAnswer = useCallback((questionId: string, answer: string | string[] | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    if (questionId === 'email') {
      setClientEmail(String(answer));
    }

    // Find the current question
    const currentQ = questions.find(q => q.id === questionId);
    
    if (!currentQ) return;
    
    // If it's a yes/no question
    if (currentQ.type === 'yes_no') {
      // If answer is 'No', find the next non-conditional question
      if (answer === 'No') {
        const nextIndex = getNextQuestion(currentQuestion);
        setCurrentQuestion(nextIndex);
        if (nextIndex === questions.length - 1) {
          setFormCompleted(true);
        }
        return;
      }
      // If answer is 'Yes', find the next conditional question
      if (answer === 'Yes') {
        const nextIndex = questions.findIndex((q, index) => 
          index > currentQuestion && 
          q.condition && 
          q.condition.id === questionId && 
          q.condition.value === 'Yes'
        );
        if (nextIndex !== -1) {
          setCurrentQuestion(nextIndex);
          return;
        }
      }
    }

    // For all other questions, proceed to next question
    const nextIndex = getNextQuestion(currentQuestion);
    setCurrentQuestion(nextIndex);
    if (nextIndex === questions.length - 1) {
      setFormCompleted(true);
    }
  }, [currentQuestion, getNextQuestion, questions]);

  const submitFormData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    console.log('Starting AI-powered form submission...');

    try {
      // Prepare form data for AI workflow
      const formData = {
        clientName: String(answers.nome_completo || ''),
        clientEmail: clientEmail || '',
        formType: 'fitness_br' as const,
        responses: answers
      };

      console.log('Submitting form to AI workflow...');
      const result = await submitFormToDatabase(formData);

      if (result.success) {
        setEmailSent(true);
        
        // Show success message
        alert(`✅ Sucesso! Sua avaliação foi enviada com sucesso!

A Dra. Jackie irá pessoalmente analisar suas informações e criar seu plano alimentar personalizado para você.

🔑 PRÓXIMO PASSO: Crie sua conta de cliente em jackiesouto.com/login para acessar planos alimentares ilimitados!

Use seu email (${formData.clientEmail}) para criar sua conta e ter acesso ilimitado a todos os seus planos alimentares.

Você receberá uma notificação por email quando sua dieta estiver pronta para acesso.`);
        
        console.log('Form submitted successfully:', result);
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Erro ao enviar avaliação: ${errorMessage}. 
      
Tente novamente ou entre em contato conosco se o problema persistir.`);
    } finally {
      setIsLoading(false);
      console.log('Process completed, loading state reset');
    }
  }, [answers, clientEmail]);

  useEffect(() => {
    if (formCompleted) {
      submitFormData();
    }
  }, [formCompleted, submitFormData]);

  const renderQuestion = (): React.ReactElement => {
    console.log('renderQuestion called, currentQuestion:', currentQuestion);
    console.log('questions.length:', questions.length);
    console.log('questions[0]:', questions[0]);
    
    const currentQ = questions[currentQuestion];
    console.log('currentQ:', currentQ);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, value: string | string[] | number | undefined) => {
      if (e.key === 'Enter' && (value || !currentQ.required)) {
        handleAnswer(currentQ.id, value || '');
      }
    };

    const handleBack = (): void => {
      // Find the previous visible question
      for (let i = currentQuestion - 1; i >= 0; i--) {
        if (shouldDisplayQuestion(questions[i])) {
          setCurrentQuestion(i);
          break;
        }
      }
    };

    if (currentQ.type === 'welcome') {
      return (
        <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Dumbbell className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-3">
              {currentQ.title}
            </CardTitle>
            <CardDescription className="text-lg text-emerald-700 dark:text-emerald-200">
              {currentQ.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg font-semibold"
              onClick={() => setCurrentQuestion(getNextQuestion(currentQuestion))}
            >
              {currentQ.buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (currentQ.type === 'thank_you') {
      return (
        <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200 dark:border-green-800">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-900 dark:text-green-100 mb-3">
              {currentQ.title}
            </CardTitle>
            <CardDescription className="text-lg text-green-700 dark:text-green-200">
              {currentQ.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isLoading && (
              <div className="flex items-center justify-center space-x-2 text-emerald-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-lg">Processando suas respostas...</span>
              </div>
            )}
            {emailSent && (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                <span className="text-lg font-semibold">Enviado com sucesso! Verifique seu email em breve.</span>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-2xl mx-auto" ref={formRef}>
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {currentQ.title}
          </CardTitle>
          {currentQ.description && (
            <CardDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
              {currentQ.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">

        {['text', 'number', 'email'].includes(currentQ.type) && (
          <div className="space-y-6">
            <Input
              type={currentQ.type}
              placeholder="Digite sua resposta..."
              value={String(answers[currentQ.id] || '')}
              onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
              onKeyPress={(e) => handleKeyPress(e, answers[currentQ.id])}
              required={currentQ.required}
              autoFocus
              className="text-lg py-3"
            />
            <div className="flex justify-between items-center">
              {currentQuestion > 0 ? (
                <Button 
                  variant="outline"
                  onClick={handleBack}
                  className="px-6"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              ) : (
                <div></div>
              )}
              <Button 
                onClick={() => handleAnswer(currentQ.id, answers[currentQ.id] || '')}
                disabled={currentQ.required && !answers[currentQ.id]}
                className="px-6 bg-emerald-600 hover:bg-emerald-700"
              >
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentQ.type === 'textarea' && (
          <div className="space-y-6">
            <Textarea
              placeholder="Digite sua resposta..."
              value={String(answers[currentQ.id] || '')}
              onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
              onKeyPress={(e) => handleKeyPress(e, answers[currentQ.id])}
              required={currentQ.required}
              autoFocus
              className="min-h-24 text-base"
              rows={4}
            />
            <div className="flex justify-between items-center">
              {currentQuestion > 0 ? (
                <Button 
                  variant="outline"
                  onClick={handleBack}
                  className="px-6"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              ) : (
                <div></div>
              )}
              <Button 
                onClick={() => handleAnswer(currentQ.id, answers[currentQ.id] || '')}
                disabled={currentQ.required && !answers[currentQ.id]}
                className="px-6 bg-emerald-600 hover:bg-emerald-700"
              >
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentQ.type === 'yes_no' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={answers[currentQ.id] === 'Yes' ? 'default' : 'outline'}
                size="lg"
                className={cn(
                  "h-16 text-lg font-semibold transition-all",
                  answers[currentQ.id] === 'Yes' && "bg-green-600 hover:bg-green-700"
                )}
                onClick={() => handleAnswer(currentQ.id, 'Yes')}
              >
                Sim
              </Button>
              <Button
                variant={answers[currentQ.id] === 'No' ? 'default' : 'outline'}
                size="lg"
                className={cn(
                  "h-16 text-lg font-semibold transition-all",
                  answers[currentQ.id] === 'No' && "bg-red-600 hover:bg-red-700"
                )}
                onClick={() => handleAnswer(currentQ.id, 'No')}
              >
                Não
              </Button>
            </div>
            <div className="flex justify-start">
              {currentQuestion > 0 && (
                <Button 
                  variant="outline"
                  onClick={handleBack}
                  className="px-6"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              )}
            </div>
          </div>
        )}

        {currentQ.type === 'multiple_choice' && (
          <div className="space-y-6">
            <div className="space-y-3">
              {currentQ.options?.map((option) => (
                <Button
                  key={option}
                  variant={answers[currentQ.id] === option ? 'default' : 'outline'}
                  size="lg"
                  className={cn(
                    "w-full h-auto p-4 text-left justify-start text-wrap whitespace-normal text-base font-medium",
                    answers[currentQ.id] === option && "bg-emerald-600 hover:bg-emerald-700"
                  )}
                  onClick={() => handleAnswer(currentQ.id, option)}
                >
                  <div className="flex items-center space-x-3">
                    {answers[currentQ.id] === option ? (
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 flex-shrink-0" />
                    )}
                    <span>{option}</span>
                  </div>
                </Button>
              ))}
            </div>
            <div className="flex justify-start">
              {currentQuestion > 0 && (
                <Button 
                  variant="outline"
                  onClick={handleBack}
                  className="px-6"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              )}
            </div>
          </div>
        )}

        {currentQ.type === 'multiple_select' && (
          <div className="space-y-6">
            <div className="space-y-3">
              {currentQ.options?.map((option) => {
                const isSelected = Array.isArray(answers[currentQ.id]) && (answers[currentQ.id] as string[]).includes(option);
                return (
                  <Button
                    key={option}
                    variant={isSelected ? 'default' : 'outline'}
                    size="lg"
                    className={cn(
                      "w-full h-auto p-4 text-left justify-start text-wrap whitespace-normal text-base font-medium",
                      isSelected && "bg-emerald-600 hover:bg-emerald-700"
                    )}
                    onClick={() => {
                      const currentSelection = (answers[currentQ.id] as string[]) || [];
                      const newSelection = currentSelection.includes(option)
                        ? currentSelection.filter(item => item !== option)
                        : [...currentSelection, option];
                      setAnswers(prev => ({ ...prev, [currentQ.id]: newSelection }));
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {isSelected ? (
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 flex-shrink-0" />
                      )}
                      <span>{option}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              {currentQuestion > 0 ? (
                <Button 
                  variant="outline"
                  onClick={handleBack}
                  className="px-6"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              ) : (
                <div></div>
              )}
              <Button
                onClick={() => handleAnswer(currentQ.id, answers[currentQ.id] || [])}
                disabled={currentQ.required && (!answers[currentQ.id] || (Array.isArray(answers[currentQ.id]) && (answers[currentQ.id] as string[]).length === 0))}
                className="px-6 bg-emerald-600 hover:bg-emerald-700"
              >
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentQ.type === 'checkbox' && (
          <div className="space-y-6">
            <div className="space-y-3">
              {currentQ.options?.map((option) => {
                const isSelected = Array.isArray(answers[currentQ.id]) && (answers[currentQ.id] as string[]).includes(option);
                return (
                  <Button
                    key={option}
                    variant={isSelected ? 'default' : 'outline'}
                    size="lg"
                    className={cn(
                      "w-full h-auto p-4 text-left justify-start text-wrap whitespace-normal text-base font-medium",
                      isSelected && "bg-emerald-600 hover:bg-emerald-700"
                    )}
                    onClick={() => {
                      const currentSelection = (answers[currentQ.id] as string[]) || [];
                      const newSelection = currentSelection.includes(option)
                        ? currentSelection.filter(item => item !== option)
                        : [...currentSelection, option];
                      setAnswers(prev => ({ ...prev, [currentQ.id]: newSelection }));
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {isSelected ? (
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 flex-shrink-0" />
                      )}
                      <span>{option}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              {currentQuestion > 0 ? (
                <Button 
                  variant="outline"
                  onClick={handleBack}
                  className="px-6"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              ) : (
                <div></div>
              )}
              <Button
                onClick={() => handleAnswer(currentQ.id, answers[currentQ.id] || [])}
                className="px-6 bg-emerald-600 hover:bg-emerald-700"
              >
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        </CardContent>
      </Card>
    );
  };

  const renderProgressTimeline = () => {
    if (currentQuestion === 1 || isLoading || emailSent) return null;

    const answeredQuestions = Object.keys(answers).length;
    const totalQuestions = questions.length - 1; // Exclude welcome question
    const timelineProgress = (answeredQuestions / totalQuestions) * 100;

    // Sample timeline data - customize based on your question structure
    const timelineSteps = [
      { id: 1, title: "Informações Pessoais", description: "Dados básicos" },
      { id: 2, title: "Histórico de Saúde", description: "Informações médicas" },
      { id: 3, title: "Objetivos", description: "Metas fitness" },
      { id: 4, title: "Experiência", description: "Histórico de treino" },
      { id: 5, title: "Preferências", description: "Estilo de treino" },
      { id: 6, title: "Estilo de Vida", description: "Hábitos diários" },
      { id: 7, title: "Informações Adicionais", description: "Detalhes finais" },
    ];

    return (
      <Card className="w-full max-w-4xl mx-auto mb-8">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Seu Progresso</h3>
            <p className="text-gray-600">Acompanhe o preenchimento da avaliação fitness</p>
          </div>
          
          <div className="mb-6">
            <Progress value={(answeredQuestions / totalQuestions) * 100} className="h-3" />
          </div>
          
          <div className="relative mb-6">
            <div className="flex justify-between items-center">
              {timelineSteps.map((step, index) => {
                const isCompleted = index < Math.floor(currentQuestion / (totalQuestions / timelineSteps.length));
                const isCurrent = index === Math.floor(currentQuestion / (totalQuestions / timelineSteps.length));
                
                return (
                  <div key={step.id} className="flex flex-col items-center relative">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
                      isCompleted ? "bg-emerald-600 text-white" : 
                      isCurrent ? "bg-emerald-100 text-emerald-600 ring-2 ring-emerald-600" : 
                      "bg-gray-200 text-gray-400"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Dumbbell className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <h4 className={cn(
                        "text-sm font-medium",
                        isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"
                      )}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <span className="block text-2xl font-bold text-emerald-600">{answeredQuestions}</span>
              <span className="text-sm text-gray-600">Respondidas</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="block text-2xl font-bold text-gray-600">{totalQuestions - answeredQuestions}</span>
              <span className="text-sm text-gray-600">Restantes</span>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <span className="block text-2xl font-bold text-green-600">{Math.round((answeredQuestions / totalQuestions) * 100)}%</span>
              <span className="text-sm text-gray-600">Completo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress bar at top */}
        {currentQuestion > 1 && !isLoading && !emailSent && (
          <div className="w-full bg-white rounded-full h-2 shadow-sm">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${((currentQuestion - 1) / (questions.length - 1)) * 100}%`,
              }}
            />
          </div>
        )}
        
        {/* Main question card - centered */}
        <div className="flex justify-center items-center">
          {renderQuestion()}
        </div>
        
        {/* Progress timeline below */}
        {renderProgressTimeline()}
      </div>
    </div>
  );
};



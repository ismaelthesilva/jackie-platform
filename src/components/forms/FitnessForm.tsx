"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Circle,
  ArrowLeft,
  ArrowRight,
  Dumbbell,
  Target,
  Heart,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CloudflareTurnstile from "@/components/CloudflareTurnstile";
import fitnessEN from "@/locales/forms/fitnessusa.json";
import fitnessPT from "@/locales/forms/fitnessbr.json";

interface FitnessFormProps {
  locale: "en" | "pt";
}

// Type definitions
interface QuestionCondition {
  id: string;
  value: string;
}

interface BaseQuestion {
  id: string;
  title: string;
  required?: boolean;
  condition?: QuestionCondition;
  description?: string;
  buttonText?: string;
}

interface WelcomeQuestion extends BaseQuestion {
  type: "welcome";
  buttonText: string;
}

interface TextQuestion extends BaseQuestion {
  type: "text" | "number" | "email" | "textarea";
}

interface YesNoQuestion extends BaseQuestion {
  type: "yes_no";
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice" | "multiple_select" | "checkbox";
  options: string[];
}

interface ThankYouQuestion extends BaseQuestion {
  type: "thank_you";
}

type Question =
  | WelcomeQuestion
  | TextQuestion
  | YesNoQuestion
  | MultipleChoiceQuestion
  | ThankYouQuestion;

interface Answers {
  [key: string]: string | string[] | number;
}

interface EmailParams {
  to_email: string;
  client_name: string;
  client_email: string;
  email_body: string;
  [key: string]: string;
}

export default function FitnessForm({ locale }: FitnessFormProps) {
  // Select translations based on locale
  const t = locale === "pt" ? fitnessPT : fitnessEN;

  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [formCompleted, setFormCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [clientEmail, setClientEmail] = useState<string>("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const formRef = useRef<HTMLDivElement>(null);

  const questions = useMemo<Question[]>(() => {
    const q = t.questions;
    const s = t.sections;
    const o = t.options;

    return [
      {
        id: "welcome",
        type: "welcome",
        title: t.welcome.title,
        description: t.welcome.description,
        buttonText: t.welcome.buttonText,
      },
      {
        id: "section1_header",
        type: "welcome",
        title: s.section1.title,
        description: s.section1.description,
        buttonText: s.section1.buttonText,
      },
      {
        id: "nome_completo",
        type: "text",
        title: q.nome_completo,
        required: true,
      },
      { id: "email", type: "email", title: q.email, required: true },
      {
        id: "data_nascimento",
        type: "text",
        title: q.data_nascimento,
        required: true,
      },
      { id: "altura", type: "number", title: q.altura, required: true },
      { id: "peso", type: "number", title: q.peso, required: true },
      {
        id: "percentual_gordura",
        type: "text",
        title: q.percentual_gordura,
        required: false,
      },
      { id: "localizacao", type: "text", title: q.localizacao, required: true },
      { id: "profissao", type: "textarea", title: q.profissao, required: true },
      {
        id: "horario_sono",
        type: "text",
        title: q.horario_sono,
        required: true,
      },
      {
        id: "horas_sono",
        type: "multiple_choice",
        title: q.horas_sono,
        options: o.horas_sono,
        required: true,
      },
      {
        id: "tipo_sono",
        type: "multiple_choice",
        title: q.tipo_sono,
        options: o.tipo_sono,
        required: true,
      },
      {
        id: "acorda_descansado",
        type: "yes_no",
        title: q.acorda_descansado,
        required: true,
      },
      {
        id: "energia_dia",
        type: "textarea",
        title: q.energia_dia,
        required: true,
      },
      { id: "fuma", type: "yes_no", title: q.fuma, required: true },
      { id: "alcool", type: "yes_no", title: q.alcool, required: true },
      {
        id: "alcool_detalhes",
        type: "textarea",
        title: q.alcool_detalhes,
        condition: { id: "alcool", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      { id: "gestante", type: "yes_no", title: q.gestante, required: false },
      {
        id: "section2_header",
        type: "welcome",
        title: s.section2.title,
        description: s.section2.description,
        buttonText: s.section2.buttonText,
      },
      { id: "doencas", type: "textarea", title: q.doencas, required: false },
      { id: "lesoes", type: "textarea", title: q.lesoes, required: false },
      {
        id: "cirurgias",
        type: "textarea",
        title: q.cirurgias,
        required: false,
      },
      {
        id: "medicacao",
        type: "textarea",
        title: q.medicacao,
        required: false,
      },
      { id: "alergias", type: "textarea", title: q.alergias, required: false },
      {
        id: "anticoncepcional",
        type: "textarea",
        title: q.anticoncepcional,
        required: false,
      },
      {
        id: "exames_sangue",
        type: "yes_no",
        title: q.exames_sangue,
        required: true,
      },
      {
        id: "exames_alteracoes",
        type: "textarea",
        title: q.exames_alteracoes,
        condition: {
          id: "exames_sangue",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "section3_header",
        type: "welcome",
        title: s.section3.title,
        description: s.section3.description,
        buttonText: s.section3.buttonText,
      },
      {
        id: "tempo_treino",
        type: "text",
        title: q.tempo_treino,
        required: true,
      },
      {
        id: "fases_cutting_bulking",
        type: "textarea",
        title: q.fases_cutting_bulking,
        required: false,
      },
      {
        id: "coach_anterior",
        type: "textarea",
        title: q.coach_anterior,
        required: false,
      },
      {
        id: "tipo_treino_atual",
        type: "multiple_choice",
        title: q.tipo_treino_atual,
        options: o.tipo_treino_atual,
        required: true,
      },
      {
        id: "tipo_treino_outros",
        type: "text",
        title: q.tipo_treino_outros,
        condition: {
          id: "tipo_treino_atual",
          value: locale === "pt" ? "Outro" : "Other",
        },
        required: true,
      },
      {
        id: "dias_por_semana",
        type: "multiple_choice",
        title: q.dias_por_semana,
        options: o.dias_por_semana,
        required: true,
      },
      {
        id: "tempo_disponivel_sessao",
        type: "multiple_choice",
        title: q.tempo_disponivel_sessao,
        options: o.tempo_disponivel_sessao,
        required: true,
      },
      {
        id: "local_treino",
        type: "multiple_choice",
        title: q.local_treino,
        options: o.local_treino,
        required: true,
      },
      {
        id: "limitacoes_equipamento",
        type: "textarea",
        title: q.limitacoes_equipamento,
        required: false,
      },
      {
        id: "section4_header",
        type: "welcome",
        title: s.section4.title,
        description: s.section4.description,
        buttonText: s.section4.buttonText,
      },
      {
        id: "objetivo_primario",
        type: "multiple_choice",
        title: q.objetivo_primario,
        options: o.objetivo_primario,
        required: true,
      },
      {
        id: "objetivo_secundario",
        type: "textarea",
        title: q.objetivo_secundario,
        required: false,
      },
      { id: "competir", type: "textarea", title: q.competir, required: false },
      {
        id: "prazo_objetivo",
        type: "text",
        title: q.prazo_objetivo,
        required: true,
      },
      {
        id: "dieta_rigida",
        type: "yes_no",
        title: q.dieta_rigida,
        required: true,
      },
      {
        id: "estrategias_avancadas",
        type: "yes_no",
        title: q.estrategias_avancadas,
        required: true,
      },
      {
        id: "grupos_musculares_enfase",
        type: "textarea",
        title: q.grupos_musculares_enfase,
        required: false,
      },
      {
        id: "grupos_musculares_dificeis",
        type: "textarea",
        title: q.grupos_musculares_dificeis,
        required: false,
      },
      {
        id: "uso_anabolicos",
        type: "textarea",
        title: q.uso_anabolicos,
        required: false,
      },
      {
        id: "estrategia_farmacologica",
        type: "yes_no",
        title: q.estrategia_farmacologica,
        required: false,
      },
      {
        id: "section5_header",
        type: "welcome",
        title: s.section5.title,
        description: s.section5.description,
        buttonText: s.section5.buttonText,
      },
      {
        id: "exercicios_gosta",
        type: "textarea",
        title: q.exercicios_gosta,
        required: true,
      },
      {
        id: "exercicios_nao_gosta",
        type: "textarea",
        title: q.exercicios_nao_gosta,
        required: true,
      },
      {
        id: "exercicios_nao_pode",
        type: "textarea",
        title: q.exercicios_nao_pode,
        required: false,
      },
      {
        id: "melhor_estilo_treino",
        type: "multiple_choice",
        title: q.melhor_estilo_treino,
        options: o.melhor_estilo_treino,
        required: true,
      },
      {
        id: "dificuldade_ativar",
        type: "textarea",
        title: q.dificuldade_ativar,
        required: false,
      },
      {
        id: "grupos_respondem_rapido",
        type: "textarea",
        title: q.grupos_respondem_rapido,
        required: true,
      },
      {
        id: "dor_articular",
        type: "textarea",
        title: q.dor_articular,
        required: false,
      },
      {
        id: "como_se_sente_pos_treino",
        type: "multiple_choice",
        title: q.como_se_sente_pos_treino,
        options: o.como_se_sente_pos_treino,
        required: true,
      },
      {
        id: "dificuldade_seguir_plano",
        type: "yes_no",
        title: q.dificuldade_seguir_plano,
        required: true,
      },
      {
        id: "preferencia_variacao",
        type: "multiple_choice",
        title: q.preferencia_variacao,
        options: o.preferencia_variacao,
        required: true,
      },
      {
        id: "section6_header",
        type: "welcome",
        title: s.section6.title,
        description: s.section6.description,
        buttonText: s.section6.buttonText,
      },
      {
        id: "resistencia_cardiovascular",
        type: "multiple_choice",
        title: q.resistencia_cardiovascular,
        options: o.resistencia_cardiovascular,
        required: true,
      },
      {
        id: "experiencia_hiit",
        type: "multiple_choice",
        title: q.experiencia_hiit,
        options: o.experiencia_hiit,
        required: true,
      },
      {
        id: "cardio_jejum",
        type: "yes_no",
        title: q.cardio_jejum,
        required: true,
      },
      {
        id: "limitacoes_respiratorias",
        type: "textarea",
        title: q.limitacoes_respiratorias,
        required: false,
      },
      {
        id: "mobilidade_alongamento",
        type: "yes_no",
        title: q.mobilidade_alongamento,
        required: true,
      },
      {
        id: "section7_header",
        type: "welcome",
        title: s.section7.title,
        description: s.section7.description,
        buttonText: s.section7.buttonText,
      },
      {
        id: "dias_faceis_dificeis",
        type: "textarea",
        title: q.dias_faceis_dificeis,
        required: true,
      },
      {
        id: "maior_desafio_consistencia",
        type: "textarea",
        title: q.maior_desafio_consistencia,
        required: true,
      },
      {
        id: "apoio_familia",
        type: "yes_no",
        title: q.apoio_familia,
        required: true,
      },
      {
        id: "o_que_desanima",
        type: "textarea",
        title: q.o_que_desanima,
        required: true,
      },
      {
        id: "section8_header",
        type: "welcome",
        title: s.section8.title,
        description: s.section8.description,
        buttonText: s.section8.buttonText,
      },
      {
        id: "enviar_fotos",
        type: "yes_no",
        title: q.enviar_fotos,
        required: true,
      },
      { id: "tem_fotos", type: "yes_no", title: q.tem_fotos, required: true },
      {
        id: "frequencia_checkin",
        type: "multiple_choice",
        title: q.frequencia_checkin,
        options: o.frequencia_checkin,
        required: true,
      },
      { id: "usar_apps", type: "yes_no", title: q.usar_apps, required: true },
      {
        id: "section9_header",
        type: "welcome",
        title: s.section9.title,
        description: s.section9.description,
        buttonText: s.section9.buttonText,
      },
      {
        id: "plano_alimentar_atual",
        type: "textarea",
        title: q.plano_alimentar_atual,
        required: false,
      },
      {
        id: "suplementos_atuais",
        type: "textarea",
        title: q.suplementos_atuais,
        required: false,
      },
      {
        id: "ajustar_dieta",
        type: "yes_no",
        title: q.ajustar_dieta,
        required: true,
      },
      {
        id: "preparar_refeicoes",
        type: "yes_no",
        title: q.preparar_refeicoes,
        required: true,
      },
      {
        id: "preferencia_dieta",
        type: "multiple_choice",
        title: q.preferencia_dieta,
        options: o.preferencia_dieta,
        required: true,
      },
      {
        id: "section10_header",
        type: "welcome",
        title: s.section10.title,
        description: s.section10.description,
        buttonText: s.section10.buttonText,
      },
      {
        id: "agua_por_dia",
        type: "text",
        title: q.agua_por_dia,
        required: true,
      },
      {
        id: "rastreia_agua",
        type: "yes_no",
        title: q.rastreia_agua,
        required: true,
      },
      {
        id: "sede_durante_dia",
        type: "yes_no",
        title: q.sede_durante_dia,
        required: true,
      },
      {
        id: "eletrolitros",
        type: "yes_no",
        title: q.eletrolitros,
        required: true,
      },
      {
        id: "section11_header",
        type: "welcome",
        title: s.section11.title,
        description: s.section11.description,
        buttonText: s.section11.buttonText,
      },
      {
        id: "sentir_musculo_trabalhando",
        type: "textarea",
        title: q.sentir_musculo_trabalhando,
        required: true,
      },
      {
        id: "dor_muscular_pos_treino",
        type: "textarea",
        title: q.dor_muscular_pos_treino,
        required: true,
      },
      {
        id: "dor_articulacoes_treino",
        type: "textarea",
        title: q.dor_articulacoes_treino,
        required: false,
      },
      {
        id: "informacoes_adicionais",
        type: "textarea",
        title: q.informacoes_adicionais,
        required: false,
      },
      {
        id: "thank_you",
        type: "thank_you",
        title: t.thankYou.title,
        description: t.thankYou.description,
        buttonText: "",
      },
    ];
  }, [locale, t]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (!q.condition) return true;
      const condAnswer = answers[q.condition.id];
      return condAnswer === q.condition.value;
    });
  }, [questions, answers]);

  const currentQ = filteredQuestions[currentQuestion];

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (currentQ?.id === "email" && answers.email) {
      setClientEmail(String(answers.email));
    }
  }, [currentQ, answers]);

  useEffect(() => {
    if (formCompleted && !emailSent && turnstileToken) {
      handleSubmit();
    }
  }, [formCompleted, emailSent, turnstileToken]);

  const handleNext = () => {
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setFormCompleted(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setTimeout(handleNext, 200);
  };

  const handleSubmit = async () => {
    if (!turnstileToken) {
      alert(
        t.verification?.turnstileRequired ||
          "Please complete security verification."
      );
      return;
    }

    setIsLoading(true);

    try {
      const formattedAnswers = Object.entries(answers)
        .map(([key, value]) => {
          const question = questions.find((q) => q.id === key);
          const questionTitle = question?.title || key;
          const formattedValue = Array.isArray(value)
            ? value.join(", ")
            : value;
          return `<p><strong>${questionTitle}</strong><br/>${formattedValue}</p>`;
        })
        .join("");

      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h2 style="color: #2563eb;">${
            t.submission?.successTitle || "Fitness Assessment Submitted"
          }</h2>
          <p><strong>${locale === "pt" ? "Cliente" : "Client"}:</strong> ${
        answers.nome_completo
      }</p>
          <p><strong>Email:</strong> ${clientEmail}</p>
          <hr style="margin: 20px 0; border: 1px solid #e5e7eb;">
          ${formattedAnswers}
        </div>
      `;

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_FITNESS!,
        {
          to_email: process.env.NEXT_PUBLIC_JACKIECOACH_EMAIL!,
          client_name: answers.nome_completo,
          client_email: clientEmail,
          email_body: emailBody,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      setEmailSent(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending email:", error);
      alert(
        t.submission?.errorMessage || "Error sending form. Please try again."
      );
      setIsLoading(false);
    }
  };

  const renderQuestion = () => {
    if (!currentQ) return null;

    if (currentQ.type === "welcome") {
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentQ.title}
              </h1>
              <p className="text-lg text-gray-600">{currentQ.description}</p>
            </div>
            <Button
              size="lg"
              onClick={handleNext}
              className="px-8 bg-blue-600 hover:bg-blue-700"
            >
              {currentQ.buttonText || t.buttons?.start || "Start"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (currentQ.type === "thank_you") {
      return (
        <Card className="w-full max-w-3xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              {currentQ.title}
            </CardTitle>
            {currentQ.description && (
              <p className="text-muted-foreground">{currentQ.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!emailSent && !isLoading && (
              <div className="space-y-4">
                <p className="text-center text-muted-foreground">
                  {t.verification?.verifyHuman ||
                    "Please verify you are human to continue"}
                </p>
                <CloudflareTurnstile onSuccess={setTurnstileToken} />
              </div>
            )}
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-lg font-medium">
                  {t.submission?.processing || "Processing..."}
                </p>
              </div>
            )}
            {emailSent && (
              <div className="text-center space-y-4 py-4">
                <p className="text-lg font-semibold text-green-600">
                  {t.submission?.successTitle || "✅ Success!"}
                </p>
                <p className="text-muted-foreground whitespace-pre-line">
                  {t.submission?.successMessage ||
                    "Your assessment has been submitted successfully."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    if (
      currentQ.type === "text" ||
      currentQ.type === "number" ||
      currentQ.type === "email"
    ) {
      return (
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-xl">{currentQ.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type={
                currentQ.type === "email"
                  ? "email"
                  : currentQ.type === "number"
                  ? "number"
                  : "text"
              }
              value={(answers[currentQ.id] as string) || ""}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [currentQ.id]: e.target.value,
                }))
              }
              placeholder={t.placeholders?.text || "Type your answer..."}
              className="text-lg"
              onKeyDown={(e) => {
                if (e.key === "Enter" && answers[currentQ.id]) {
                  handleNext();
                }
              }}
            />
            <div className="flex justify-between items-center">
              {currentQuestion > 0 ? (
                <Button variant="outline" onClick={handleBack} className="px-6">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.buttons?.back || "Back"}
                </Button>
              ) : (
                <div></div>
              )}
              <Button
                onClick={handleNext}
                disabled={currentQ.required && !answers[currentQ.id]}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                {t.buttons?.next || "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentQ.type === "textarea") {
      return (
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-xl">{currentQ.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={(answers[currentQ.id] as string) || ""}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [currentQ.id]: e.target.value,
                }))
              }
              placeholder={
                t.placeholders?.textarea || "Type your detailed answer..."
              }
              rows={5}
              className="text-lg resize-none"
            />
            <div className="flex justify-between items-center">
              {currentQuestion > 0 ? (
                <Button variant="outline" onClick={handleBack} className="px-6">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.buttons?.back || "Back"}
                </Button>
              ) : (
                <div></div>
              )}
              <Button
                onClick={handleNext}
                disabled={currentQ.required && !answers[currentQ.id]}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                {t.buttons?.next || "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentQ.type === "yes_no") {
      const yesValue = locale === "pt" ? "Sim" : "Yes";
      const noValue = locale === "pt" ? "Não" : "No";

      return (
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-xl">{currentQ.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={
                  answers[currentQ.id] === yesValue ? "default" : "outline"
                }
                onClick={() => handleAnswer(currentQ.id, yesValue)}
                className="h-24 text-lg"
              >
                {t.buttons?.yes || "Yes"}
              </Button>
              <Button
                variant={
                  answers[currentQ.id] === noValue ? "default" : "outline"
                }
                onClick={() => handleAnswer(currentQ.id, noValue)}
                className="h-24 text-lg"
              >
                {t.buttons?.no || "No"}
              </Button>
            </div>
            {currentQuestion > 0 && (
              <Button variant="outline" onClick={handleBack} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.buttons?.back || "Back"}
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    if (currentQ.type === "multiple_choice" && currentQ.options) {
      return (
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-xl">{currentQ.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {currentQ.options.map((option) => (
                <Button
                  key={option}
                  variant={
                    answers[currentQ.id] === option ? "default" : "outline"
                  }
                  onClick={() => handleAnswer(currentQ.id, option)}
                  className="w-full justify-start text-left h-auto py-4 px-6 text-base"
                >
                  {option}
                </Button>
              ))}
            </div>
            {currentQuestion > 0 && (
              <Button variant="outline" onClick={handleBack} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.buttons?.back || "Back"}
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    if (currentQ.type === "multiple_select" && currentQ.options) {
      const selectedOptions = (answers[currentQ.id] as string[]) || [];

      return (
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-xl">{currentQ.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {currentQ.options.map((option) => {
                const isChecked = selectedOptions.includes(option);
                return (
                  <Button
                    key={option}
                    variant={isChecked ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto py-4 px-6 text-base"
                    onClick={() => {
                      const newSelection = isChecked
                        ? selectedOptions.filter((o) => o !== option)
                        : [...selectedOptions, option];
                      setAnswers((prev) => ({
                        ...prev,
                        [currentQ.id]: newSelection,
                      }));
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {isChecked ? (
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
                <Button variant="outline" onClick={handleBack} className="px-6">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.buttons?.back || "Back"}
                </Button>
              ) : (
                <div></div>
              )}
              <Button
                onClick={() => handleAnswer(currentQ.id, selectedOptions)}
                disabled={currentQ.required && selectedOptions.length === 0}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                {t.buttons?.next || "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  const renderProgressTimeline = () => {
    if (currentQuestion === 1 || isLoading || emailSent) return null;

    const answeredQuestions = Object.keys(answers).length;
    const visibleQuestions = questions.filter((q) => {
      if (q.type === "welcome" || q.type === "thank_you") return false;
      if (!q.condition) return true;
      return answers[q.condition.id] === q.condition.value;
    });

    const totalQuestions = visibleQuestions.length;
    const timelineProgress = (answeredQuestions / totalQuestions) * 100;

    const timelineSteps = t.timeline || [
      { title: "Personal Info", description: "Basic information" },
      { title: "Health History", description: "Medical background" },
      { title: "Goals", description: "Fitness objectives" },
      { title: "Experience", description: "Training background" },
      { title: "Preferences", description: "Training style" },
      { title: "Lifestyle", description: "Daily habits" },
      { title: "Additional Info", description: "Final details" },
    ];

    return (
      <Card className="w-full max-w-4xl mx-auto mb-8">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t.progress?.title || "Your Progress"}
            </h3>
            <p className="text-gray-600">
              {t.progress?.description ||
                "Track your fitness assessment completion"}
            </p>
          </div>

          <div className="mb-6">
            <Progress
              value={(answeredQuestions / totalQuestions) * 100}
              className="h-3"
            />
          </div>

          <div className="relative mb-6">
            <div className="flex justify-between items-center">
              {timelineSteps.map((step, index) => {
                const isCompleted =
                  index <
                  Math.floor(
                    currentQuestion / (totalQuestions / timelineSteps.length)
                  );
                const isCurrent =
                  index ===
                  Math.floor(
                    currentQuestion / (totalQuestions / timelineSteps.length)
                  );

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center relative"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
                        isCompleted
                          ? "bg-blue-600 text-white"
                          : isCurrent
                          ? "bg-blue-100 text-blue-600 ring-2 ring-blue-600"
                          : "bg-gray-200 text-gray-400"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Dumbbell className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <h4
                        className={cn(
                          "text-sm font-medium",
                          isCompleted || isCurrent
                            ? "text-gray-900"
                            : "text-gray-500"
                        )}
                      >
                        {step.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <span className="block text-2xl font-bold text-blue-600">
                {answeredQuestions}
              </span>
              <span className="text-sm text-gray-600">
                {t.progress?.answered || "Answered"}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="block text-2xl font-bold text-gray-600">
                {totalQuestions - answeredQuestions}
              </span>
              <span className="text-sm text-gray-600">
                {t.progress?.remaining || "Remaining"}
              </span>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <span className="block text-2xl font-bold text-green-600">
                {Math.round((answeredQuestions / totalQuestions) * 100)}%
              </span>
              <span className="text-sm text-gray-600">
                {t.progress?.complete || "Complete"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-center items-center">
          {renderQuestion()}
        </div>
        {renderProgressTimeline()}
      </div>
    </div>
  );
}

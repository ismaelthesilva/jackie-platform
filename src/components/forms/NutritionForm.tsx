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
  Utensils,
  Heart,
  Target,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CloudflareTurnstile from "@/components/CloudflareTurnstile";
import DietPlanGenerator from "@/services/DietPlanGenerator";
import DietPlanStorage from "@/services/DietPlanStorage";
import nutritionEN from "@/locales/forms/nutritionusa.json";
import nutritionPT from "@/locales/forms/nutritionbr.json"; // Will create PT version

interface NutritionFormProps {
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

export default function NutritionForm({ locale }: NutritionFormProps) {
  // Select translations based on locale
  const t = locale === "pt" ? nutritionPT : nutritionEN;

  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [formCompleted, setFormCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [clientEmail, setClientEmail] = useState<string>("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const formRef = useRef<HTMLDivElement>(null);

  const questions = useMemo<Question[]>(
    () => [
      {
        id: "welcome",
        type: "welcome",
        title: t.welcome.title,
        description: t.welcome.description,
        buttonText: t.welcome.buttonText,
      },

      // 1. 1. Basic Information
      {
        id: "section1_header",
        type: "welcome",
        title: t.sections.section1.title,
        description: t.sections.section1.description,
        buttonText: t.buttons.continue,
      },
      {
        id: "nome_completo",
        type: "text",
        title: t.questions.nome_completo,
        required: true,
      },
      {
        id: "email",
        type: "email",
        title: t.questions.email,
        required: true,
      },
      {
        id: "idade",
        type: "number",
        title: t.questions.idade,
        required: true,
      },
      {
        id: "altura",
        type: "number",
        title: t.questions.altura,
        required: true,
      },
      {
        id: "peso",
        type: "number",
        title: t.questions.peso,
        required: true,
      },
      {
        id: "acompanhamento_anterior",
        type: "yes_no",
        title: t.questions.acompanhamento_anterior,
        required: true,
      },
      {
        id: "tempo_acompanhamento",
        type: "text",
        title: t.questions.tempo_acompanhamento,
        condition: {
          id: "acompanhamento_anterior",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "dieta_anterior",
        type: "yes_no",
        title: t.questions.dieta_anterior,
        required: true,
      },
      {
        id: "tempo_seguiu_plano",
        type: "text",
        title: t.questions.tempo_seguiu_plano,
        condition: {
          id: "dieta_anterior",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },

      // 2. 2. Goals and History
      {
        id: "section2_header",
        type: "welcome",
        title: t.sections.section2.title,
        description: t.sections.section2.description,
        buttonText: t.buttons.continue,
      },
      {
        id: "objetivo_principal",
        type: "multiple_choice",
        title: t.questions.objetivo_principal,
        options: t.options.objetivo_principal,
        required: true,
      },
      {
        id: "meta_especifica",
        type: "textarea",
        title: t.questions.meta_especifica,
        required: false,
      },
      {
        id: "competicoes",
        type: "yes_no",
        title: t.questions.competicoes,
        required: true,
      },
      {
        id: "categoria_competicao",
        type: "text",
        title: t.questions.categoria_competicao,
        condition: {
          id: "competicoes",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "data_competicao",
        type: "text",
        title: t.questions.data_competicao,
        condition: {
          id: "competicoes",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },

      // 3. 3. Health and Digestion
      {
        id: "section3_header",
        type: "welcome",
        title: t.sections.section3.title,
        description: t.sections.section3.description,
        buttonText: t.buttons.continue,
      },
      {
        id: "condicoes_saude",
        type: "textarea",
        title: t.questions.condicoes_saude,
        required: false,
      },
      {
        id: "medicamentos",
        type: "yes_no",
        title: t.questions.medicamentos,
        required: true,
      },
      {
        id: "quais_medicamentos",
        type: "textarea",
        title: t.questions.quais_medicamentos,
        condition: {
          id: "medicamentos",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "intolerancias",
        type: "yes_no",
        title: t.questions.intolerancias,
        required: true,
      },
      {
        id: "quais_intolerancias",
        type: "textarea",
        title: t.questions.quais_intolerancias,
        condition: {
          id: "intolerancias",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "dificuldade_digestao",
        type: "yes_no",
        title: t.questions.dificuldade_digestao,
        required: true,
      },
      {
        id: "quais_dificuldade_digestao",
        type: "textarea",
        title: t.questions.quais_dificuldade_digestao,
        condition: {
          id: "dificuldade_digestao",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "inchaço_abdominal",
        type: "yes_no",
        title: t.questions.inchaço_abdominal,
        required: true,
      },
      {
        id: "inchaço_detalhes",
        type: "textarea",
        title: t.questions.inchaço_detalhes,
        condition: {
          id: "inchaço_abdominal",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "azia",
        type: "yes_no",
        title: t.questions.azia,
        required: true,
      },
      {
        id: "azia_detalhes",
        type: "textarea",
        title: t.questions.azia_detalhes,
        condition: { id: "azia", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "gases",
        type: "yes_no",
        title: t.questions.gases,
        required: true,
      },
      {
        id: "gases_detalhes",
        type: "textarea",
        title: t.questions.gases_detalhes,
        condition: { id: "gases", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "desconforto_refeicoes",
        type: "yes_no",
        title: t.questions.desconforto_refeicoes,
        required: true,
      },
      {
        id: "desconforto_detalhes",
        type: "textarea",
        title: t.questions.desconforto_detalhes,
        condition: {
          id: "desconforto_refeicoes",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "sonolencia_refeicoes",
        type: "yes_no",
        title: t.questions.sonolencia_refeicoes,
        required: true,
      },
      {
        id: "sonolencia_detalhes",
        type: "textarea",
        title: t.questions.sonolencia_detalhes,
        condition: {
          id: "sonolencia_refeicoes",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "queda_energia",
        type: "yes_no",
        title: t.questions.queda_energia,
        required: true,
      },
      {
        id: "queda_energia_detalhes",
        type: "textarea",
        title: t.questions.queda_energia_detalhes,
        condition: {
          id: "queda_energia",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "exames_recentes",
        type: "yes_no",
        title: t.questions.exames_recentes,
        required: true,
      },
      {
        id: "exames_resultados",
        type: "textarea",
        title: t.questions.exames_resultados,
        condition: {
          id: "exames_recentes",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },

      // 4. 4. Eating Behavior and Routine
      {
        id: "section4_header",
        type: "welcome",
        title: t.sections.section4.title,
        description: t.sections.section4.description,
        buttonText: t.buttons.continue,
      },
      {
        id: "quantidade_refeicoes",
        type: "text",
        title: t.questions.quantidade_refeicoes,
        required: true,
      },
      {
        id: "refeicoes_frequentes",
        type: "textarea",
        title: t.questions.refeicoes_frequentes,
        required: true,
      },
      {
        id: "horarios_fixos",
        type: "yes_no",
        title: t.questions.horarios_fixos,
        required: true,
      },
      {
        id: "quais_horarios",
        type: "textarea",
        title: t.questions.quais_horarios,
        condition: {
          id: "horarios_fixos",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "pula_refeicoes",
        type: "yes_no",
        title: t.questions.pula_refeicoes,
        required: true,
      },
      {
        id: "quais_pula_refeicoes",
        type: "textarea",
        title: t.questions.quais_pula_refeicoes,
        condition: {
          id: "pula_refeicoes",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "faz_jejum",
        type: "yes_no",
        title: t.questions.faz_jejum,
        required: true,
      },
      {
        id: "detalhes_jejum",
        type: "textarea",
        title: t.questions.detalhes_jejum,
        condition: { id: "faz_jejum", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "horario_fome",
        type: "text",
        title: t.questions.horario_fome,
        required: true,
      },
      {
        id: "fome_emocional",
        type: "yes_no",
        title: t.questions.fome_emocional,
        required: true,
      },
      {
        id: "detalhes_fome_emocional",
        type: "textarea",
        title: t.questions.detalhes_fome_emocional,
        condition: {
          id: "fome_emocional",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "belisca",
        type: "yes_no",
        title: t.questions.belisca,
        required: true,
      },
      {
        id: "detalhes_beliscar",
        type: "textarea",
        title: t.questions.detalhes_beliscar,
        condition: { id: "belisca", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "bebe_refeicoes",
        type: "yes_no",
        title: t.questions.bebe_refeicoes,
        required: true,
      },
      {
        id: "detalhes_bebe_refeicoes",
        type: "textarea",
        title: t.questions.detalhes_bebe_refeicoes,
        condition: {
          id: "bebe_refeicoes",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "bebidas_adocadas",
        type: "yes_no",
        title: t.questions.bebidas_adocadas,
        required: true,
      },
      {
        id: "quais_bebidas_adocadas",
        type: "textarea",
        title: t.questions.quais_bebidas_adocadas,
        condition: {
          id: "bebidas_adocadas",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "frequencia_bebidas_adocadas",
        type: "text",
        title: t.questions.frequencia_bebidas_adocadas,
        condition: {
          id: "bebidas_adocadas",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "quantidade_bebidas_adocadas",
        type: "text",
        title: t.questions.quantidade_bebidas_adocadas,
        condition: {
          id: "bebidas_adocadas",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "bebidas_zero",
        type: "yes_no",
        title: t.questions.bebidas_zero,
        required: true,
      },
      {
        id: "detalhes_bebidas_zero",
        type: "textarea",
        title: t.questions.detalhes_bebidas_zero,
        condition: {
          id: "bebidas_zero",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "cafe",
        type: "yes_no",
        title: t.questions.cafe,
        required: true,
      },
      {
        id: "frequencia_cafe",
        type: "text",
        title: t.questions.frequencia_cafe,
        condition: { id: "cafe", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "quantidade_cafe",
        type: "text",
        title: t.questions.quantidade_cafe,
        condition: { id: "cafe", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "tipo_cafe",
        type: "text",
        title: t.questions.tipo_cafe,
        condition: { id: "cafe", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "estimulantes",
        type: "yes_no",
        title: t.questions.estimulantes,
        required: true,
      },
      {
        id: "detalhes_estimulantes",
        type: "textarea",
        title: t.questions.detalhes_estimulantes,
        condition: {
          id: "estimulantes",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "alcool",
        type: "yes_no",
        title: t.questions.alcool,
        required: true,
      },
      {
        id: "frequencia_alcool",
        type: "text",
        title: t.questions.frequencia_alcool,
        condition: { id: "alcool", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "quantidade_alcool",
        type: "text",
        title: t.questions.quantidade_alcool,
        condition: { id: "alcool", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "tipo_alcool",
        type: "text",
        title: t.questions.tipo_alcool,
        condition: { id: "alcool", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "cigarro",
        type: "yes_no",
        title: t.questions.cigarro,
        required: true,
      },
      {
        id: "detalhes_cigarro",
        type: "text",
        title: t.questions.detalhes_cigarro,
        condition: { id: "cigarro", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "vape",
        type: "yes_no",
        title: t.questions.vape,
        required: true,
      },
      {
        id: "detalhes_vape",
        type: "text",
        title: t.questions.detalhes_vape,
        condition: { id: "vape", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "charuto",
        type: "yes_no",
        title: t.questions.charuto,
        required: true,
      },
      {
        id: "detalhes_charuto",
        type: "text",
        title: t.questions.detalhes_charuto,
        condition: { id: "charuto", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },

      // 5. 5. Food Preferences and Aversions
      {
        id: "section5_header",
        type: "welcome",
        title: t.sections.section5.title,
        description: t.sections.section5.description,
        buttonText: t.buttons.continue,
      },
      {
        id: "alimentos_gosta",
        type: "textarea",
        title: t.questions.alimentos_gosta,
        required: true,
      },
      {
        id: "alimentos_evita",
        type: "textarea",
        title: t.questions.alimentos_evita,
        required: true,
      },
      {
        id: "cafe_manha_preferencia",
        type: "text",
        title: t.questions.cafe_manha_preferencia,
        required: true,
      },
      {
        id: "frutas_vegetais_preferidos",
        type: "textarea",
        title: t.questions.frutas_vegetais_preferidos,
        required: true,
      },
      {
        id: "aversao_texturas",
        type: "textarea",
        title: t.questions.aversao_texturas,
        required: false,
      },
      {
        id: "paladar_alterado",
        type: "yes_no",
        title: t.questions.paladar_alterado,
        required: true,
      },
      {
        id: "detalhes_paladar_alterado",
        type: "text",
        title: t.questions.detalhes_paladar_alterado,
        condition: {
          id: "paladar_alterado",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "nivel_apetite",
        type: "multiple_choice",
        title: t.questions.nivel_apetite,
        options: t.options.nivel_apetite,
        required: true,
      },
      {
        id: "consome_ovo",
        type: "yes_no",
        title: t.questions.consome_ovo,
        required: true,
      },
      {
        id: "consome_peixe",
        type: "yes_no",
        title: t.questions.consome_peixe,
        required: true,
      },
      {
        id: "consome_carne_vermelha",
        type: "yes_no",
        title: t.questions.consome_carne_vermelha,
        required: true,
      },
      {
        id: "consome_tofu",
        type: "yes_no",
        title: t.questions.consome_tofu,
        required: true,
      },
      {
        id: "consome_leite",
        type: "yes_no",
        title: t.questions.consome_leite,
        required: true,
      },
      {
        id: "preferencia_carne",
        type: "yes_no",
        title: t.questions.preferencia_carne,
        required: true,
      },
      {
        id: "tipo_carne_preferido",
        type: "text",
        title: t.questions.tipo_carne_preferido,
        condition: {
          id: "preferencia_carne",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "dificuldade_carne_vermelha",
        type: "yes_no",
        title: t.questions.dificuldade_carne_vermelha,
        required: true,
      },
      {
        id: "gordura_cozinhar",
        type: "text",
        title: t.questions.gordura_cozinhar,
        required: true,
      },
      {
        id: "azeite",
        type: "yes_no",
        title: t.questions.azeite,
        required: true,
      },
      {
        id: "quantidade_azeite",
        type: "text",
        title: t.questions.quantidade_azeite,
        condition: { id: "azeite", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "oleo_coco",
        type: "yes_no",
        title: t.questions.oleo_coco,
        required: true,
      },
      {
        id: "frequencia_oleo_coco",
        type: "text",
        title: t.questions.frequencia_oleo_coco,
        condition: { id: "oleo_coco", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "frituras",
        type: "yes_no",
        title: t.questions.frituras,
        required: true,
      },
      {
        id: "frequencia_frituras",
        type: "text",
        title: t.questions.frequencia_frituras,
        condition: { id: "frituras", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "alimentos_frituras",
        type: "text",
        title: t.questions.alimentos_frituras,
        condition: { id: "frituras", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },

      // 6. 6. Cheat Meals
      {
        id: "section6_header",
        type: "welcome",
        title: t.sections.section6.title,
        description: t.sections.section6.description,
        buttonText: t.buttons.continue,
      },
      {
        id: "refeicoes_livres",
        type: "yes_no",
        title: t.questions.refeicoes_livres,
        required: true,
      },
      {
        id: "frequencia_refeicoes_livres",
        type: "text",
        title: t.questions.frequencia_refeicoes_livres,
        condition: {
          id: "refeicoes_livres",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "dia_refeicao_livre",
        type: "text",
        title: t.questions.dia_refeicao_livre,
        condition: {
          id: "refeicoes_livres",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "preferencia_refeicao_livre",
        type: "textarea",
        title: t.questions.preferencia_refeicao_livre,
        condition: {
          id: "refeicoes_livres",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "preferencia_agendamento",
        type: "multiple_choice",
        title: t.questions.preferencia_agendamento,
        options: t.options.preferencia_agendamento,
        required: true,
      },

      // 7. 7. Macronutrients and Meal Composition
      {
        id: "section7_header",
        type: "welcome",
        title: t.sections.section7.title,
        description: t.sections.section7.description,
        buttonText: t.buttons.continue,
      },
      {
        id: "proteina_refeicoes",
        type: "yes_no",
        title: t.questions.proteina_refeicoes,
        required: true,
      },
      {
        id: "fontes_proteina",
        type: "textarea",
        title: t.questions.fontes_proteina,
        condition: {
          id: "proteina_refeicoes",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "gorduras_boas",
        type: "yes_no",
        title: t.questions.gorduras_boas,
        required: true,
      },
      {
        id: "quais_gorduras_boas",
        type: "textarea",
        title: t.questions.quais_gorduras_boas,
        condition: {
          id: "gorduras_boas",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "carboidratos_frequentes",
        type: "textarea",
        title: t.questions.carboidratos_frequentes,
        required: true,
      },
      {
        id: "dieta_manipulacao_carbo",
        type: "yes_no",
        title: t.questions.dieta_manipulacao_carbo,
        required: true,
      },
      {
        id: "modelo_dieta_carbo",
        type: "text",
        title: t.questions.modelo_dieta_carbo,
        condition: {
          id: "dieta_manipulacao_carbo",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "preferencia_ciclo_carbo",
        type: "multiple_choice",
        title: t.questions.preferencia_ciclo_carbo,
        options: t.options.preferencia_ciclo_carbo,
        required: true,
      },

      // 8. 8. Training and Lifestyle
      {
        id: "section8_header",
        type: "welcome",
        title: t.sections.section8.title,
        description: t.sections.section8.description,
        buttonText: t.buttons.continue,
      },
      {
        id: "pratica_atividade",
        type: "yes_no",
        title: t.questions.pratica_atividade,
        required: true,
      },
      {
        id: "modalidade_atividade",
        type: "text",
        title: t.questions.modalidade_atividade,
        condition: {
          id: "pratica_atividade",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "frequencia_atividade",
        type: "text",
        title: t.questions.frequencia_atividade,
        condition: {
          id: "pratica_atividade",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "horario_atividade",
        type: "text",
        title: t.questions.horario_atividade,
        condition: {
          id: "pratica_atividade",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "tipo_treino",
        type: "text",
        title: t.questions.tipo_treino,
        condition: {
          id: "pratica_atividade",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "nivel_treino",
        type: "multiple_choice",
        title: t.questions.nivel_treino,
        options: t.options.nivel_treino,
        condition: {
          id: "pratica_atividade",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "faz_cardio",
        type: "yes_no",
        title: t.questions.faz_cardio,
        required: true,
      },
      {
        id: "detalhes_cardio",
        type: "text",
        title: t.questions.detalhes_cardio,
        condition: { id: "faz_cardio", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "preferencia_alimentar_treino",
        type: "yes_no",
        title: t.questions.preferencia_alimentar_treino,
        required: true,
      },
      {
        id: "detalhes_alimentar_treino",
        type: "textarea",
        title: t.questions.detalhes_alimentar_treino,
        condition: {
          id: "preferencia_alimentar_treino",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },
      {
        id: "usa_suplementos",
        type: "yes_no",
        title: t.questions.usa_suplementos,
        required: true,
      },
      {
        id: "quais_suplementos",
        type: "textarea",
        title: t.questions.quais_suplementos,
        condition: {
          id: "usa_suplementos",
          value: locale === "pt" ? "Sim" : "Yes",
        },
        required: true,
      },

      // 9. 9. Sleep and Stress
      {
        id: "section9_header",
        type: "welcome",
        title: t.sections.section9.title,
        description: t.sections.section9.description,
        buttonText: t.buttons.continue,
      },
      {
        id: "horas_sono",
        type: "text",
        title: t.questions.horas_sono,
        required: true,
      },
      {
        id: "dificuldade_dormir",
        type: "yes_no",
        title: t.questions.dificuldade_dormir,
        required: true,
      },
      {
        id: "acorda_descansado",
        type: "yes_no",
        title: t.questions.acorda_descansado,
        required: true,
      },
      {
        id: "estresse_elevado",
        type: "yes_no",
        title: t.questions.estresse_elevado,
        required: true,
      },
      {
        id: "estresse_afeta_alimentacao",
        type: "yes_no",
        title: t.questions.estresse_afeta_alimentacao,
        required: true,
      },

      // 10. 10. Final Considerations
      {
        id: "section10_header",
        type: "welcome",
        title: t.sections.section10.title,
        description: t.sections.section10.description,
        buttonText: t.buttons.continue,
      },
      {
        id: "compulsao",
        type: "yes_no",
        title: t.questions.compulsao,
        required: true,
      },
      {
        id: "detalhes_compulsao",
        type: "textarea",
        title: t.questions.detalhes_compulsao,
        condition: { id: "compulsao", value: locale === "pt" ? "Sim" : "Yes" },
        required: true,
      },
      {
        id: "informacao_adicional",
        type: "textarea",
        title: t.questions.informacao_adicional,
        required: false,
      },
      {
        id: "preferencia_plano",
        type: "multiple_choice",
        title: t.questions.preferencia_plano,
        options: t.options.preferencia_plano,
        required: true,
      },
      {
        id: "pesar_medir",
        type: "yes_no",
        title: t.questions.pesar_medir,
        required: true,
      },

      // Thank you page
      {
        id: "thank_you",
        type: "thank_you",
        title: t.welcome.title,
        description: t.welcome.description,
      },
    ],
    [locale, t],
  );
  const shouldDisplayQuestion = useCallback(
    (question: Question): boolean => {
      if (!question.condition) return true;
      const { id, value } = question.condition;
      return answers[id] === value;
    },
    [answers],
  );

  const getNextQuestion = useCallback(
    (currentIndex: number): number => {
      for (let i = currentIndex + 1; i < questions.length; i++) {
        if (shouldDisplayQuestion(questions[i])) {
          return i;
        }
      }
      return questions.length - 1;
    },
    [questions, shouldDisplayQuestion],
  );

  const handleAnswer = useCallback(
    (questionId: string, answer: string | string[] | number) => {
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));

      if (questionId === "email") {
        setClientEmail(answer as string);
      }

      // Find the current question
      const currentQ = questions.find((q) => q.id === questionId);

      // If it's a yes/no question
      if (currentQ?.type === "yes_no") {
        // If answer is 'No', find the next non-conditional question
        if (answer === "No") {
          const nextIndex = getNextQuestion(currentQuestion);
          setCurrentQuestion(nextIndex);
          if (nextIndex === questions.length - 1) {
            setFormCompleted(true);
          }
          return;
        }
        // If answer is 'Yes', find the next conditional question
        if (answer === "Yes") {
          const nextIndex = questions.findIndex(
            (q, index) =>
              index > currentQuestion &&
              q.condition &&
              q.condition.id === questionId &&
              q.condition.value === "Yes",
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
    },
    [currentQuestion, getNextQuestion, questions],
  );

  const submitFormData = useCallback(async (): Promise<void> => {
    if (!turnstileToken) {
      alert("Please complete the verification before submitting.");
      return;
    }

    setIsLoading(true);
    console.log("Starting AI-powered form submission...");

    try {
      // Build email body HTML
      let emailBody = "<h1>Nutrition Assessment USA</h1>";
      emailBody += "<h2>Client Details</h2>";
      emailBody += `<p><strong>Name:</strong> ${
        answers.nome_completo || "N/A"
      }</p>`;
      emailBody += `<p><strong>Age:</strong> ${
        answers.idade || "N/A"
      } years</p>`;
      emailBody += `<p><strong>Height:</strong> ${
        answers.altura || "N/A"
      } cm</p>`;
      emailBody += `<p><strong>Weight:</strong> ${
        answers.peso || "N/A"
      } kg</p>`;
      emailBody += `<p><strong>Main Goal:</strong> ${
        answers.objetivo_principal || "N/A"
      }</p>`;
      emailBody += "<h2>Questionnaire Responses</h2>";

      questions.forEach((question) => {
        if (
          question.type === "welcome" ||
          question.type === "thank_you" ||
          [
            "nome_completo",
            "idade",
            "altura",
            "peso",
            "objetivo_principal",
            "email",
          ].includes(question.id)
        ) {
          return;
        }
        if (!shouldDisplayQuestion(question)) {
          return;
        }
        if (!answers[question.id] && answers[question.id] !== 0) {
          return;
        }
        let answerText = answers[question.id];
        if (Array.isArray(answerText)) {
          answerText = answerText.join(", ");
        }
        emailBody += `<p><strong>${question.title}</strong><br>${answerText}</p>`;
      });

      const templateParams = {
        to_email: "jacksouto7@gmail.com",
        client_name: String(answers.nome_completo || "Client"),
        client_email: clientEmail || "N/A",
        email_body: emailBody,
      };
      console.log("Email params prepared:", templateParams);

      console.log("Sending email via EmailJS...");
      const response = await emailjs.send(
        "service_28v1fvr", // Service ID
        "template_wj6zu2c", // Template ID - same as NutritionBR
        templateParams,
        "ezbPPmM_lDMistyGT", // Public Key
      );
      console.log("EmailJS response:", response);

      setEmailSent(true);
      console.log("Email sent successfully, state updated");
    } catch (error) {
      console.error("Error in form submission:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      alert(`Error submitting assessment: ${errorMessage}. 
      
Please try again or contact us if the problem persists.`);
    } finally {
      setIsLoading(false);
      console.log("Process completed, loading state reset");
    }
  }, [answers, clientEmail]);

  useEffect(() => {
    if (formCompleted) {
      submitFormData();
    }
  }, [formCompleted, submitFormData]);

  const renderQuestion = () => {
    const currentQ = questions[currentQuestion];

    const handleKeyPress = (
      e: React.KeyboardEvent,
      value?: string | string[] | number,
    ) => {
      if (e.key === "Enter" && (value || !currentQ.required)) {
        handleAnswer(currentQ.id, value || "");
      }
    };

    const handleBack = () => {
      // Find the previous visible question
      for (let i = currentQuestion - 1; i >= 0; i--) {
        if (shouldDisplayQuestion(questions[i])) {
          setCurrentQuestion(i);
          break;
        }
      }
    };

    if (currentQ.type === "welcome") {
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentQ.title}
              </h1>
              <p className="text-lg text-gray-600">{currentQ.description}</p>
            </div>
            <Button
              size="lg"
              onClick={() =>
                setCurrentQuestion(getNextQuestion(currentQuestion))
              }
              className="px-8 bg-emerald-600 hover:bg-emerald-700"
            >
              {currentQ.buttonText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (currentQ.type === "thank_you") {
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {currentQ.title}
              </h1>
              <p className="text-lg text-gray-600">{currentQ.description}</p>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center space-x-3 py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                <p className="text-base text-emerald-600 font-medium">
                  Processing your responses...
                </p>
              </div>
            )}

            {emailSent && (
              <div className="space-y-4">
                {/* Success Banner */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-900 mb-1">
                        Success! Your assessment has been submitted
                      </h3>
                      <p className="text-green-800">
                        Dr. Jackie has received your information and will be in
                        touch soon.
                      </p>
                    </div>
                  </div>
                </div>

                {/* What Happens Next */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3">
                    What happens next?
                  </h3>
                  <ul className="space-y-3 text-emerald-800">
                    <li className="flex items-start space-x-3">
                      <span className="text-emerald-600 font-bold mt-0.5">
                        1.
                      </span>
                      <span>
                        Your assessment was sent directly to Dr. Jackie, who
                        will personally review it.
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-emerald-600 font-bold mt-0.5">
                        2.
                      </span>
                      <span>
                        She will create your personalized nutrition plan based
                        on your answers.
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-emerald-600 font-bold mt-0.5">
                        3.
                      </span>
                      <span>
                        Dr. Jackie will respond soon with your plan and next
                        steps.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Email Confirmation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <Heart className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-base font-semibold text-blue-900 mb-1">
                        Thank you for trusting Dr. Jackie's work!
                      </h3>
                      <p className="text-blue-800 text-sm">
                        Your journey to better nutrition starts here. We're
                        excited to help you achieve your goals!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-2xl mx-auto" ref={formRef}>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-900">
            {currentQ.title}
          </CardTitle>
          {currentQ.description && (
            <p className="text-sm text-gray-600 mt-2">{currentQ.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {["text", "number", "email"].includes(currentQ.type) && (
            <div className="space-y-6">
              <Input
                type={currentQ.type as "text" | "number" | "email"}
                placeholder="Type your answer..."
                value={(answers[currentQ.id] as string) || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQ.id]: e.target.value,
                  }))
                }
                onKeyPress={(e) => handleKeyPress(e, answers[currentQ.id])}
                required={currentQ.required}
                autoFocus
                className="text-base p-3"
              />

              {/* Show Turnstile only for email field */}
              {currentQ.type === "email" && answers[currentQ.id] && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Please verify you're human to continue
                  </p>
                  <CloudflareTurnstile
                    onSuccess={setTurnstileToken}
                    onError={() => {
                      setTurnstileToken("");
                      alert("Verification failed. Please try again.");
                    }}
                  />
                </div>
              )}

              <div className="flex justify-between items-center">
                {currentQuestion > 0 ? (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="px-6"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}
                <Button
                  onClick={() =>
                    handleAnswer(currentQ.id, answers[currentQ.id] || "")
                  }
                  disabled={
                    (currentQ.required && !answers[currentQ.id]) ||
                    (currentQ.type === "email" && !turnstileToken)
                  }
                  className="px-6 bg-emerald-600 hover:bg-emerald-700"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentQ.type === "textarea" && (
            <div className="space-y-6">
              <Textarea
                placeholder="Type your answer..."
                value={(answers[currentQ.id] as string) || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQ.id]: e.target.value,
                  }))
                }
                onKeyPress={(e) => handleKeyPress(e, answers[currentQ.id])}
                required={currentQ.required}
                autoFocus
                className="min-h-32 text-base p-3 resize-none"
              />
              <div className="flex justify-between items-center">
                {currentQuestion > 0 ? (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="px-6"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}
                <Button
                  onClick={() =>
                    handleAnswer(currentQ.id, answers[currentQ.id] || "")
                  }
                  disabled={currentQ.required && !answers[currentQ.id]}
                  className="px-6 bg-emerald-600 hover:bg-emerald-700"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentQ.type === "yes_no" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={
                    answers[currentQ.id] === "Yes" ? "default" : "outline"
                  }
                  size="lg"
                  className={cn(
                    "h-16 text-lg font-medium",
                    answers[currentQ.id] === "Yes" &&
                      "bg-emerald-600 hover:bg-emerald-700",
                  )}
                  onClick={() => handleAnswer(currentQ.id, "Yes")}
                >
                  <CheckCircle className="mr-3 h-5 w-5" />
                  Yes
                </Button>
                <Button
                  variant={
                    answers[currentQ.id] === "No" ? "default" : "outline"
                  }
                  size="lg"
                  className={cn(
                    "h-16 text-lg font-medium",
                    answers[currentQ.id] === "No" &&
                      "bg-red-600 hover:bg-red-700",
                  )}
                  onClick={() => handleAnswer(currentQ.id, "No")}
                >
                  <Circle className="mr-3 h-5 w-5" />
                  No
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
                    Back
                  </Button>
                )}
              </div>
            </div>
          )}

          {currentQ.type === "multiple_choice" && "options" in currentQ && (
            <div className="space-y-6">
              <div className="space-y-3">
                {currentQ.options.map((option) => {
                  const isSelected = answers[currentQ.id] === option;
                  return (
                    <Button
                      key={option}
                      variant={isSelected ? "default" : "outline"}
                      size="lg"
                      className={cn(
                        "w-full h-auto p-4 text-left justify-start text-wrap whitespace-normal text-base font-medium",
                        isSelected && "bg-emerald-600 hover:bg-emerald-700",
                      )}
                      onClick={() => handleAnswer(currentQ.id, option)}
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
              <div className="flex justify-start">
                {currentQuestion > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="px-6"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>
            </div>
          )}

          {currentQ.type === "multiple_select" && "options" in currentQ && (
            <div className="space-y-6">
              <div className="space-y-3">
                {currentQ.options.map((option) => {
                  const isSelected = (
                    answers[currentQ.id] as string[]
                  )?.includes(option);
                  return (
                    <Button
                      key={option}
                      variant={isSelected ? "default" : "outline"}
                      size="lg"
                      className={cn(
                        "w-full h-auto p-4 text-left justify-start text-wrap whitespace-normal text-base font-medium",
                        isSelected && "bg-emerald-600 hover:bg-emerald-700",
                      )}
                      onClick={() => {
                        const currentSelection =
                          (answers[currentQ.id] as string[]) || [];
                        const newSelection = currentSelection.includes(option)
                          ? currentSelection.filter((item) => item !== option)
                          : [...currentSelection, option];
                        setAnswers((prev) => ({
                          ...prev,
                          [currentQ.id]: newSelection,
                        }));
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
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}
                <Button
                  onClick={() =>
                    handleAnswer(currentQ.id, answers[currentQ.id] || [])
                  }
                  disabled={
                    currentQ.required &&
                    (!answers[currentQ.id] ||
                      (answers[currentQ.id] as string[]).length === 0)
                  }
                  className="px-6 bg-emerald-600 hover:bg-emerald-700"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentQ.type === "checkbox" && "options" in currentQ && (
            <div className="space-y-6">
              <div className="space-y-3">
                {currentQ.options.map((option) => {
                  const isChecked = (
                    answers[currentQ.id] as string[]
                  )?.includes(option);
                  return (
                    <Button
                      key={option}
                      variant={isChecked ? "default" : "outline"}
                      size="lg"
                      className={cn(
                        "w-full h-auto p-4 text-left justify-start text-wrap whitespace-normal text-base font-medium",
                        isChecked && "bg-emerald-600 hover:bg-emerald-700",
                      )}
                      onClick={() => {
                        const currentSelection =
                          (answers[currentQ.id] as string[]) || [];
                        const newSelection = isChecked
                          ? currentSelection.filter((item) => item !== option)
                          : [...currentSelection, option];
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
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="px-6"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}
                <Button
                  onClick={() =>
                    handleAnswer(currentQ.id, answers[currentQ.id] || [])
                  }
                  disabled={
                    currentQ.required &&
                    (!answers[currentQ.id] ||
                      (answers[currentQ.id] as string[]).length === 0)
                  }
                  className="px-6 bg-emerald-600 hover:bg-emerald-700"
                >
                  Next
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

    // Count only visible questions (those that meet their conditions)
    const visibleQuestions = questions.filter((q) => {
      if (q.type === "welcome" || q.type === "thank_you") return false;
      if (!q.condition) return true;
      return answers[q.condition.id] === q.condition.value;
    });

    const totalQuestions = visibleQuestions.length;
    const timelineProgress = (answeredQuestions / totalQuestions) * 100;

    // Sample timeline data - customize based on your question structure
    const timelineSteps = [
      { id: 1, title: "Personal Info", description: "Basic information" },
      { id: 2, title: "Health History", description: "Medical background" },
      { id: 3, title: "Goals", description: "Fitness objectives" },
      { id: 4, title: "Experience", description: "Training background" },
      { id: 5, title: "Preferences", description: "Training style" },
      { id: 6, title: "Lifestyle", description: "Daily habits" },
      { id: 7, title: "Additional Info", description: "Final details" },
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
                "Track your nutrition assessment completion"}
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
                    currentQuestion / (totalQuestions / timelineSteps.length),
                  );
                const isCurrent =
                  index ===
                  Math.floor(
                    currentQuestion / (totalQuestions / timelineSteps.length),
                  );

                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center relative"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                            ? "bg-emerald-100 text-emerald-600 ring-2 ring-emerald-600"
                            : "bg-gray-200 text-gray-400",
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Utensils className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <h4
                        className={cn(
                          "text-sm font-medium",
                          isCompleted || isCurrent
                            ? "text-gray-900"
                            : "text-gray-500",
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
            <div className="p-3 bg-emerald-50 rounded-lg">
              <span className="block text-2xl font-bold text-emerald-600">
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

  const generateDietPlan = async () => {
    try {
      const generator = new DietPlanGenerator();
      const plan = await generator.generate(answers);

      if (plan) {
        const storage = new DietPlanStorage();
        await storage.save(clientEmail, plan);
        console.log("Diet plan generated and saved!");
      } else {
        console.log("Diet plan generation is not yet implemented");
      }
    } catch (error) {
      console.error("Error generating diet plan:", error);
      // Continue with form submission even if diet plan fails
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main question card - centered */}
        <div className="flex justify-center items-center">
          {renderQuestion()}
        </div>

        {/* Progress timeline below */}
        {renderProgressTimeline()}
      </div>
    </div>
  );
}

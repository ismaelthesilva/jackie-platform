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
import DietPlanGenerator from "../../../services/DietPlanGenerator";
import DietPlanStorage from "../../../services/DietPlanStorage";

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

export default function NutritionBRPage() {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [formCompleted, setFormCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [clientEmail, setClientEmail] = useState<string>("");
  const formRef = useRef<HTMLDivElement>(null);

  const questions = useMemo<Question[]>(
    () => [
      {
        id: "welcome",
        type: "welcome",
        title: "Questionário Nutricional Profissional",
        description: "Versão Inteligente com Lógica Ramificada",
        buttonText: "Começar",
      },

      // 1. Dados Iniciais
      {
        id: "section1_header",
        type: "welcome",
        title: "1. Informações Básicas",
        description:
          "Vamos começar com algumas informações básicas sobre você.",
        buttonText: "Continuar",
      },
      {
        id: "nome_completo",
        type: "text",
        title: "Nome completo:",
        required: true,
      },
      {
        id: "email",
        type: "email",
        title:
          "Por favor, forneça seu e-mail para receber seu plano nutricional personalizado",
        required: true,
      },
      { id: "idade", type: "number", title: "Idade:", required: true },
      { id: "altura", type: "number", title: "Altura (cm):", required: true },
      {
        id: "peso",
        type: "number",
        title: "Peso atual (kg):",
        required: true,
      },
      {
        id: "acompanhamento_anterior",
        type: "yes_no",
        title:
          "Já realizou acompanhamento com nutricionista ou personal trainer?",
        required: true,
      },
      {
        id: "tempo_acompanhamento",
        type: "text",
        title: "Por quanto tempo?",
        condition: { id: "acompanhamento_anterior", value: "Yes" },
        required: true,
      },
      {
        id: "dieta_anterior",
        type: "yes_no",
        title: "Já fez dieta antes?",
        required: true,
      },
      {
        id: "tempo_seguiu_plano",
        type: "text",
        title: "Por quanto tempo conseguiu seguir o plano?",
        condition: { id: "dieta_anterior", value: "Yes" },
        required: true,
      },

      // 2. Objetivo e Histórico
      {
        id: "section2_header",
        type: "welcome",
        title: "2. Objetivos e Histórico",
        description: "Vamos entender seus objetivos e histórico.",
        buttonText: "Continuar",
      },
      {
        id: "objetivo_principal",
        type: "multiple_choice",
        title: "Qual é o seu objetivo principal?",
        options: [
          "Emagrecimento",
          "Ganho de massa muscular",
          "Recomposição corporal",
          "Estética (shape/definição)",
          "Performance atlética",
          "Reeducação alimentar",
        ],
        required: true,
      },
      {
        id: "meta_especifica",
        type: "textarea",
        title:
          "Tem meta de peso, percentual de gordura ou prazo específico para alcançar seu objetivo?",
        required: false,
      },
      {
        id: "competicoes",
        type: "yes_no",
        title:
          "Já participou ou pretende participar de competições (ex: fisiculturismo)?",
        required: true,
      },
      {
        id: "categoria_competicao",
        type: "text",
        title: "Qual categoria?",
        condition: { id: "competicoes", value: "Yes" },
        required: true,
      },
      {
        id: "data_competicao",
        type: "text",
        title: "Quando foi ou será a competição?",
        condition: { id: "competicoes", value: "Yes" },
        required: true,
      },

      // 3. Saúde e Digestão
      {
        id: "section3_header",
        type: "welcome",
        title: "3. Saúde e Digestão",
        description: "Informações sobre sua saúde e sistema digestivo.",
        buttonText: "Continuar",
      },
      {
        id: "condicoes_saude",
        type: "textarea",
        title:
          "Possui alguma condição de saúde? (ex: SOP, hipotireoidismo, disbiose, gastrite, resistência à insulina, etc.)",
        required: false,
      },
      {
        id: "medicamentos",
        type: "yes_no",
        title: "Faz uso de medicamentos ou suplementos?",
        required: true,
      },
      {
        id: "quais_medicamentos",
        type: "textarea",
        title: "Quais? Doses? Horários?",
        condition: { id: "medicamentos", value: "Yes" },
        required: true,
      },
      {
        id: "intolerancias",
        type: "yes_no",
        title: "Possui intolerâncias ou alergias alimentares?",
        required: true,
      },
      {
        id: "quais_intolerancias",
        type: "textarea",
        title: "Quais?",
        condition: { id: "intolerancias", value: "Yes" },
        required: true,
      },
      {
        id: "dificuldade_digestao",
        type: "yes_no",
        title: "Tem dificuldade de digerir algum alimento?",
        required: true,
      },
      {
        id: "quais_dificuldade_digestao",
        type: "textarea",
        title: "Qual(is)?",
        condition: { id: "dificuldade_digestao", value: "Yes" },
        required: true,
      },

      // Sintomas digestivos
      {
        id: "inchaço_abdominal",
        type: "yes_no",
        title: "Costuma apresentar inchaço abdominal?",
        required: true,
      },
      {
        id: "inchaço_detalhes",
        type: "textarea",
        title: "Em que horário e após quais alimentos?",
        condition: { id: "inchaço_abdominal", value: "Yes" },
        required: true,
      },

      {
        id: "azia",
        type: "yes_no",
        title: "Costuma apresentar azia?",
        required: true,
      },
      {
        id: "azia_detalhes",
        type: "textarea",
        title: "Com que frequência e em que situações?",
        condition: { id: "azia", value: "Yes" },
        required: true,
      },

      {
        id: "gases",
        type: "yes_no",
        title: "Costuma apresentar gases/arrotos?",
        required: true,
      },
      {
        id: "gases_detalhes",
        type: "textarea",
        title: "Em que momentos do dia?",
        condition: { id: "gases", value: "Yes" },
        required: true,
      },

      {
        id: "desconforto_refeicoes",
        type: "yes_no",
        title: "Costuma apresentar desconforto após refeições?",
        required: true,
      },
      {
        id: "desconforto_detalhes",
        type: "textarea",
        title: "Com que frequência e após quais tipos de refeições?",
        condition: { id: "desconforto_refeicoes", value: "Yes" },
        required: true,
      },

      {
        id: "sonolencia_refeicoes",
        type: "yes_no",
        title: "Sente sonolência após as refeições?",
        required: true,
      },
      {
        id: "sonolencia_detalhes",
        type: "textarea",
        title: "Em quais refeições e com que frequência?",
        condition: { id: "sonolencia_refeicoes", value: "Yes" },
        required: true,
      },

      {
        id: "queda_energia",
        type: "yes_no",
        title:
          "Sente falta de energia ou queda de rendimento físico/cognitivo após comer?",
        required: true,
      },
      {
        id: "queda_energia_detalhes",
        type: "textarea",
        title: "Após quais refeições ou tipos de alimentos?",
        condition: { id: "queda_energia", value: "Yes" },
        required: true,
      },

      {
        id: "exames_recentes",
        type: "yes_no",
        title: "Já realizou exames laboratoriais recentes?",
        required: true,
      },
      {
        id: "exames_resultados",
        type: "textarea",
        title: "Pode compartilhar os principais resultados?",
        condition: { id: "exames_recentes", value: "Yes" },
        required: true,
      },

      // 4. Comportamento e Rotina Alimentar
      {
        id: "section4_header",
        type: "welcome",
        title: "4. Comportamento e Rotina Alimentar",
        description: "Informações sobre seus hábitos alimentares diários.",
        buttonText: "Continuar",
      },
      {
        id: "quantidade_refeicoes",
        type: "text",
        title: "Quantas refeições costuma fazer por dia?",
        required: true,
      },
      {
        id: "refeicoes_frequentes",
        type: "textarea",
        title: "Quais refeições realiza com mais frequência?",
        required: true,
      },
      {
        id: "horarios_fixos",
        type: "yes_no",
        title: "Tem horários fixos para comer?",
        required: true,
      },
      {
        id: "quais_horarios",
        type: "textarea",
        title: "Quais horários?",
        condition: { id: "horarios_fixos", value: "Yes" },
        required: true,
      },

      {
        id: "pula_refeicoes",
        type: "yes_no",
        title: "Costuma pular refeições?",
        required: true,
      },
      {
        id: "quais_pula_refeicoes",
        type: "textarea",
        title: "Quais refeições costuma pular e por quê?",
        condition: { id: "pula_refeicoes", value: "Yes" },
        required: true,
      },

      {
        id: "faz_jejum",
        type: "yes_no",
        title: "Costuma fazer jejum?",
        required: true,
      },
      {
        id: "detalhes_jejum",
        type: "textarea",
        title: "Qual tipo? Quantas horas? Com que frequência?",
        condition: { id: "faz_jejum", value: "Yes" },
        required: true,
      },

      {
        id: "horario_fome",
        type: "text",
        title: "Em qual horário sente mais fome?",
        required: true,
      },

      {
        id: "belisca",
        type: "yes_no",
        title: "Belisca entre refeições?",
        required: true,
      },
      {
        id: "detalhes_beliscar",
        type: "textarea",
        title: "O quê? Com que frequência?",
        condition: { id: "belisca", value: "Yes" },
        required: true,
      },

      {
        id: "compulsao",
        type: "yes_no",
        title: "Tem episódios de compulsão alimentar?",
        required: true,
      },
      {
        id: "detalhes_compulsao",
        type: "textarea",
        title: "Em quais momentos e com quais alimentos?",
        condition: { id: "compulsao", value: "Yes" },
        required: true,
      },

      {
        id: "fome_emocional",
        type: "yes_no",
        title: "Tem episódios de fome emocional?",
        required: true,
      },
      {
        id: "detalhes_fome_emocional",
        type: "textarea",
        title: "Com que frequência e em que contexto?",
        condition: { id: "fome_emocional", value: "Yes" },
        required: true,
      },

      {
        id: "bebe_refeicoes",
        type: "yes_no",
        title: "Costuma beber líquidos durante as refeições?",
        required: true,
      },
      {
        id: "detalhes_bebe_refeicoes",
        type: "textarea",
        title: "Quais bebidas? Em que quantidade?",
        condition: { id: "bebe_refeicoes", value: "Yes" },
        required: true,
      },

      {
        id: "bebidas_adocadas",
        type: "yes_no",
        title:
          "Costuma consumir bebidas adoçadas como sucos, refrigerantes ou energéticos?",
        required: true,
      },
      {
        id: "quais_bebidas_adocadas",
        type: "textarea",
        title: "Quais bebidas específicas?",
        condition: { id: "bebidas_adocadas", value: "Yes" },
        required: true,
      },
      {
        id: "frequencia_bebidas_adocadas",
        type: "text",
        title: "Com que frequência por semana?",
        condition: { id: "bebidas_adocadas", value: "Yes" },
        required: true,
      },
      {
        id: "quantidade_bebidas_adocadas",
        type: "text",
        title: "Em que quantidade (ml ou latas)?",
        condition: { id: "bebidas_adocadas", value: "Yes" },
        required: true,
      },

      {
        id: "bebidas_zero",
        type: "yes_no",
        title:
          "Costuma consumir bebidas zero (refrigerante zero, chás adoçados com estévia, etc.)?",
        required: true,
      },
      {
        id: "detalhes_bebidas_zero",
        type: "textarea",
        title: "Quais e com que frequência?",
        condition: { id: "bebidas_zero", value: "Yes" },
        required: true,
      },

      {
        id: "cafe",
        type: "yes_no",
        title: "Costuma consumir café?",
        required: true,
      },
      {
        id: "frequencia_cafe",
        type: "text",
        title: "Quantas vezes por dia?",
        condition: { id: "cafe", value: "Yes" },
        required: true,
      },
      {
        id: "quantidade_cafe",
        type: "text",
        title: "Quantidade por vez (ml ou xícaras)?",
        condition: { id: "cafe", value: "Yes" },
        required: true,
      },
      {
        id: "tipo_cafe",
        type: "text",
        title: "Com açúcar, adoçante, leite ou puro?",
        condition: { id: "cafe", value: "Yes" },
        required: true,
      },

      {
        id: "estimulantes",
        type: "yes_no",
        title:
          "Usa outros estimulantes (pré-treinos, termogênicos, energéticos)?",
        required: true,
      },
      {
        id: "detalhes_estimulantes",
        type: "textarea",
        title: "Quais? Em que horário?",
        condition: { id: "estimulantes", value: "Yes" },
        required: true,
      },

      {
        id: "alcool",
        type: "yes_no",
        title: "Consome álcool?",
        required: true,
      },
      {
        id: "frequencia_alcool",
        type: "text",
        title: "Com que frequência?",
        condition: { id: "alcool", value: "Yes" },
        required: true,
      },
      {
        id: "quantidade_alcool",
        type: "text",
        title: "Em que quantidade (taças, latas, copos)?",
        condition: { id: "alcool", value: "Yes" },
        required: true,
      },
      {
        id: "tipo_alcool",
        type: "text",
        title: "Quais marcas e tipos? (vinho, cerveja, gin, destilados, etc.)",
        condition: { id: "alcool", value: "Yes" },
        required: true,
      },

      {
        id: "cigarro",
        type: "yes_no",
        title: "Fuma cigarro?",
        required: true,
      },
      {
        id: "detalhes_cigarro",
        type: "text",
        title: "Há quanto tempo? Quantos por dia?",
        condition: { id: "cigarro", value: "Yes" },
        required: true,
      },

      {
        id: "vape",
        type: "yes_no",
        title: "Usa cigarro eletrônico (vape)?",
        required: true,
      },
      {
        id: "detalhes_vape",
        type: "text",
        title: "Com que frequência? Há quanto tempo?",
        condition: { id: "vape", value: "Yes" },
        required: true,
      },

      {
        id: "charuto",
        type: "yes_no",
        title: "Fuma charuto?",
        required: true,
      },
      {
        id: "detalhes_charuto",
        type: "text",
        title: "Com que frequência? Há quanto tempo?",
        condition: { id: "charuto", value: "Yes" },
        required: true,
      },

      // 5. Preferências e Rejeições Alimentares
      {
        id: "section5_header",
        type: "welcome",
        title: "5. Preferências e Rejeições Alimentares",
        description: "Vamos entender seus gostos e preferências alimentares.",
        buttonText: "Continuar",
      },
      {
        id: "alimentos_gosta",
        type: "textarea",
        title:
          "Quais alimentos você gosta muito e gostaria de manter na dieta?",
        required: true,
      },
      {
        id: "alimentos_evita",
        type: "textarea",
        title:
          "Quais alimentos você evita ou não tolera (por sabor, textura ou ideologia)?",
        required: true,
      },
      {
        id: "cafe_manha_preferencia",
        type: "text",
        title: "Prefere café da manhã doce ou salgado?",
        required: true,
      },
      {
        id: "frutas_vegetais_preferidos",
        type: "textarea",
        title: "Quais frutas e vegetais você prefere?",
        required: true,
      },
      {
        id: "aversao_texturas",
        type: "textarea",
        title:
          "Tem aversão a alguma textura ou sabor (ex: hortelã, coco, coentro, gengibre)?",
        required: false,
      },

      {
        id: "paladar_alterado",
        type: "yes_no",
        title:
          "Costuma sentir o paladar alterado, boca seca ou gosto amargo com frequência?",
        required: true,
      },
      {
        id: "detalhes_paladar_alterado",
        type: "text",
        title: "Em que situações?",
        condition: { id: "paladar_alterado", value: "Yes" },
        required: true,
      },

      {
        id: "nivel_apetite",
        type: "multiple_choice",
        title: "Como você avalia seu apetite:",
        options: ["Baixo", "Normal", "Muito alto"],
        required: true,
      },

      {
        id: "consome_ovo",
        type: "yes_no",
        title: "Consome ovos?",
        required: true,
      },
      {
        id: "consome_peixe",
        type: "yes_no",
        title: "Consome peixe?",
        required: true,
      },
      {
        id: "consome_carne_vermelha",
        type: "yes_no",
        title: "Consome carne vermelha?",
        required: true,
      },
      {
        id: "consome_tofu",
        type: "yes_no",
        title: "Consome tofu ou proteína vegetal?",
        required: true,
      },
      {
        id: "consome_leite",
        type: "yes_no",
        title: "Consome leite e derivados?",
        required: true,
      },

      {
        id: "preferencia_carne",
        type: "yes_no",
        title: "Tem preferência por algum tipo específico de carne?",
        required: true,
      },
      {
        id: "tipo_carne_preferido",
        type: "text",
        title: "Qual?",
        condition: { id: "preferencia_carne", value: "Yes" },
        required: true,
      },

      {
        id: "dificuldade_carne_vermelha",
        type: "yes_no",
        title: "Tem dificuldade para digerir carne vermelha?",
        required: true,
      },

      {
        id: "gordura_cozinhar",
        type: "text",
        title:
          "Qual tipo de gordura costuma usar para cozinhar? (azeite, manteiga, óleo de soja, banha, óleo de coco, etc.)",
        required: true,
      },

      {
        id: "azeite",
        type: "yes_no",
        title: "Usa azeite de oliva regularmente?",
        required: true,
      },
      {
        id: "quantidade_azeite",
        type: "text",
        title: "Em que quantidade aproximada por refeição?",
        condition: { id: "azeite", value: "Yes" },
        required: true,
      },

      {
        id: "oleo_coco",
        type: "yes_no",
        title: "Usa óleo de coco ou produtos com coco?",
        required: true,
      },
      {
        id: "frequencia_oleo_coco",
        type: "text",
        title: "Com que frequência?",
        condition: { id: "oleo_coco", value: "Yes" },
        required: true,
      },

      {
        id: "frituras",
        type: "yes_no",
        title: "Consome frituras?",
        required: true,
      },
      {
        id: "frequencia_frituras",
        type: "text",
        title: "Com que frequência por semana ou por dia?",
        condition: { id: "frituras", value: "Yes" },
        required: true,
      },
      {
        id: "alimentos_frituras",
        type: "text",
        title: "Quais alimentos?",
        condition: { id: "frituras", value: "Yes" },
        required: true,
      },

      // 6. Cheat Meals
      {
        id: "section6_header",
        type: "welcome",
        title: "6. Cheat Meals",
        description:
          "Informações sobre suas preferências para refeições livres.",
        buttonText: "Continuar",
      },
      {
        id: "refeicoes_livres",
        type: "yes_no",
        title: "Você faz refeições livres (cheat meals)?",
        required: true,
      },
      {
        id: "frequencia_refeicoes_livres",
        type: "text",
        title: "Quantas vezes por semana?",
        condition: { id: "refeicoes_livres", value: "Yes" },
        required: true,
      },
      {
        id: "dia_refeicao_livre",
        type: "text",
        title: "Em qual dia você costuma fazer?",
        condition: { id: "refeicoes_livres", value: "Yes" },
        required: true,
      },
      {
        id: "preferencia_refeicao_livre",
        type: "textarea",
        title: "O que você gosta de comer nessas refeições?",
        condition: { id: "refeicoes_livres", value: "Yes" },
        required: true,
      },
      {
        id: "preferencia_agendamento",
        type: "multiple_choice",
        title:
          "Você prefere ter sua refeição livre programada ou decidir na hora?",
        options: ["Programada", "Decidir na hora"],
        required: true,
      },

      // 7. Macronutrients and Meal Composition
      {
        id: "section7_header",
        type: "welcome",
        title: "7. Macronutrientes e Composição das Refeições",
        description:
          "Informações sobre como você organiza seus macronutrientes.",
        buttonText: "Continuar",
      },
      {
        id: "proteina_refeicoes",
        type: "yes_no",
        title: "Você inclui uma fonte de proteína em todas as refeições?",
        required: true,
      },
      {
        id: "fontes_proteina",
        type: "textarea",
        title: "Quais são suas principais fontes?",
        condition: { id: "proteina_refeicoes", value: "Yes" },
        required: true,
      },

      {
        id: "gorduras_boas",
        type: "yes_no",
        title: "Você consome fontes de gorduras saudáveis?",
        required: true,
      },
      {
        id: "quais_gorduras_boas",
        type: "textarea",
        title:
          "Quais (abacate, castanhas, azeite de oliva, gema de ovo, óleo de coco, etc.)",
        condition: { id: "gorduras_boas", value: "Yes" },
        required: true,
      },

      {
        id: "carboidratos_frequentes",
        type: "textarea",
        title:
          "Quais carboidratos você consome com mais frequência? Você prefere integrais ou refinados?",
        required: true,
      },

      {
        id: "dieta_manipulacao_carbo",
        type: "yes_no",
        title:
          "Você já utilizou alguma dieta com manipulação de carboidratos (ex: ciclagem)?",
        required: true,
      },
      {
        id: "modelo_dieta_carbo",
        type: "text",
        title: "Qual modelo?",
        condition: { id: "dieta_manipulacao_carbo", value: "Yes" },
        required: true,
      },

      {
        id: "preferencia_ciclo_carbo",
        type: "multiple_choice",
        title:
          "Você gostaria de incluir ciclagem de carboidratos ou manter um padrão linear?",
        options: ["Ciclagem de carboidratos", "Padrão linear"],
        required: true,
      },

      // 8. Training and Lifestyle
      {
        id: "section8_header",
        type: "welcome",
        title: "8. Treino e Estilo de Vida",
        description: "Informações sobre suas atividades físicas e rotina.",
        buttonText: "Continuar",
      },
      {
        id: "pratica_atividade",
        type: "yes_no",
        title: "Você pratica atividade física?",
        required: true,
      },
      {
        id: "modalidade_atividade",
        type: "text",
        title: "Qual modalidade?",
        condition: { id: "pratica_atividade", value: "Yes" },
        required: true,
      },
      {
        id: "frequencia_atividade",
        type: "text",
        title: "Frequência semanal?",
        condition: { id: "pratica_atividade", value: "Yes" },
        required: true,
      },
      {
        id: "horario_atividade",
        type: "text",
        title: "Horário usual de treino?",
        condition: { id: "pratica_atividade", value: "Yes" },
        required: true,
      },
      {
        id: "tipo_treino",
        type: "text",
        title: "Tipo de treino (ex: musculação, corrida, funcional...)",
        condition: { id: "pratica_atividade", value: "Yes" },
        required: true,
      },
      {
        id: "nivel_treino",
        type: "multiple_choice",
        title: "Nível:",
        options: ["Iniciante", "Intermediário", "Avançado"],
        condition: { id: "pratica_atividade", value: "Yes" },
        required: true,
      },

      {
        id: "faz_cardio",
        type: "yes_no",
        title: "Você faz cardio?",
        required: true,
      },
      {
        id: "detalhes_cardio",
        type: "text",
        title: "Qual tipo e com que frequência?",
        condition: { id: "faz_cardio", value: "Yes" },
        required: true,
      },

      {
        id: "preferencia_alimentar_treino",
        type: "yes_no",
        title: "Você tem preferência alimentar para pré e pós-treino?",
        required: true,
      },
      {
        id: "detalhes_alimentar_treino",
        type: "textarea",
        title: "O que você gosta ou costuma consumir?",
        condition: { id: "preferencia_alimentar_treino", value: "Yes" },
        required: true,
      },

      {
        id: "usa_suplementos",
        type: "yes_no",
        title: "Você usa algum suplemento?",
        required: true,
      },
      {
        id: "quais_suplementos",
        type: "textarea",
        title: "Quais?",
        condition: { id: "usa_suplementos", value: "Yes" },
        required: true,
      },

      // 9. Sleep and Stress
      {
        id: "section9_header",
        type: "welcome",
        title: "9. Sono e Estresse",
        description: "Informações sobre seu sono e níveis de estresse.",
        buttonText: "Continuar",
      },
      {
        id: "horas_sono",
        type: "text",
        title: "Quantas horas você dorme por noite?",
        required: true,
      },
      {
        id: "dificuldade_dormir",
        type: "yes_no",
        title:
          "Você tem dificuldade para pegar no sono ou acorda durante a noite?",
        required: true,
      },
      {
        id: "acorda_descansado",
        type: "yes_no",
        title: "Você acorda descansado(a)?",
        required: true,
      },
      {
        id: "estresse_elevado",
        type: "yes_no",
        title: "Você está em um período de alto estresse?",
        required: true,
      },
      {
        id: "estresse_afeta_alimentacao",
        type: "yes_no",
        title: "O estresse afeta sua alimentação ou sono?",
        required: true,
      },

      // 10. Final Considerations
      {
        id: "section10_header",
        type: "welcome",
        title: "10. Considerações Finais",
        description: "Última seção para informações adicionais.",
        buttonText: "Continuar",
      },
      {
        id: "informacao_adicional",
        type: "textarea",
        title:
          "Existe alguma informação que você considera importante e que não foi abordada?",
        required: false,
      },
      {
        id: "preferencia_plano",
        type: "multiple_choice",
        title:
          "Você prefere um plano com mais liberdade ou com estrutura mais detalhada?",
        options: [
          "Mais liberdade",
          "Estrutura mais detalhada",
          "Equilíbrio entre ambos",
        ],
        required: true,
      },
      {
        id: "pesar_medir",
        type: "yes_no",
        title:
          "Você está disposto(a) a pesar e medir seus alimentos se necessário?",
        required: true,
      },

      // Conclusion
      {
        id: "thankYou",
        type: "thank_you",
        title: "Obrigado por completar o questionário!",
        description:
          "We will analyze your responses and send your personalized nutrition plan soon.",
      },
    ],
    []
  );

  const shouldDisplayQuestion = useCallback(
    (question: Question): boolean => {
      if (!question.condition) return true;
      const { id, value } = question.condition;
      return answers[id] === value;
    },
    [answers]
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
    [questions, shouldDisplayQuestion]
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
              q.condition.value === "Yes"
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
    [currentQuestion, getNextQuestion, questions]
  );

  const submitFormData = useCallback(async (): Promise<void> => {
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
      emailBody += `<p><strong>Altura:</strong> ${
        answers.altura || "N/A"
      } cm</p>`;
      emailBody += `<p><strong>Peso:</strong> ${answers.peso || "N/A"} kg</p>`;
      emailBody += `<p><strong>Objetivo Principal:</strong> ${
        answers.objetivo_principal || "N/A"
      }</p>`;
      emailBody += "<h2>Respostas do Questionário</h2>";

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
        "ezbPPmM_lDMistyGT" // Public Key
      );
      console.log("EmailJS response:", response);

      setEmailSent(true);
      console.log("Email sent successfully, state updated");
    } catch (error) {
      console.error("Error in form submission:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      alert(`Erro ao enviar avaliação: ${errorMessage}. 
      
Por favor, tente novamente ou entre em contato conosco se o problema persistir.`);
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
      value?: string | string[] | number
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
                  Processando suas respostas...
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
                        Sucesso! Sua avaliação foi enviada
                      </h3>
                      <p className="text-green-800">
                        Dra. Jackie recebeu suas informações e entrará em
                        contato em breve.
                      </p>
                    </div>
                  </div>
                </div>

                {/* What Happens Next */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3">
                    O que acontece agora?
                  </h3>
                  <ul className="space-y-3 text-emerald-800">
                    <li className="flex items-start space-x-3">
                      <span className="text-emerald-600 font-bold mt-0.5">
                        1.
                      </span>
                      <span>
                        Sua avaliação foi enviada diretamente para a Dra.
                        Jackie, que irá revisá-la pessoalmente.
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-emerald-600 font-bold mt-0.5">
                        2.
                      </span>
                      <span>
                        Ela criará seu plano nutricional personalizado com base
                        nas suas respostas.
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-emerald-600 font-bold mt-0.5">
                        3.
                      </span>
                      <span>
                        A Dra. Jackie responderá em breve com seu plano e
                        próximos passos.
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
                        Obrigado por confiar no trabalho da Dra. Jackie!
                      </h3>
                      <p className="text-blue-800 text-sm">
                        Sua jornada para uma melhor nutrição começa aqui.
                        Estamos animados para ajudá-lo a alcançar seus
                        objetivos!
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
                placeholder="Digite sua resposta..."
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
                  onClick={() =>
                    handleAnswer(currentQ.id, answers[currentQ.id] || "")
                  }
                  disabled={currentQ.required && !answers[currentQ.id]}
                  className="px-6 bg-emerald-600 hover:bg-emerald-700"
                >
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentQ.type === "textarea" && (
            <div className="space-y-6">
              <Textarea
                placeholder="Digite sua resposta..."
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
                    Voltar
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
                  Próximo
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
                      "bg-emerald-600 hover:bg-emerald-700"
                  )}
                  onClick={() => handleAnswer(currentQ.id, "Yes")}
                >
                  <CheckCircle className="mr-3 h-5 w-5" />
                  Sim
                </Button>
                <Button
                  variant={
                    answers[currentQ.id] === "No" ? "default" : "outline"
                  }
                  size="lg"
                  className={cn(
                    "h-16 text-lg font-medium",
                    answers[currentQ.id] === "No" &&
                      "bg-red-600 hover:bg-red-700"
                  )}
                  onClick={() => handleAnswer(currentQ.id, "No")}
                >
                  <Circle className="mr-3 h-5 w-5" />
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
                        isSelected && "bg-emerald-600 hover:bg-emerald-700"
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
                    Voltar
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
                        isSelected && "bg-emerald-600 hover:bg-emerald-700"
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
                    Voltar
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
                  Próximo
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
                        isChecked && "bg-emerald-600 hover:bg-emerald-700"
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
                    Voltar
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
      {
        id: 1,
        title: "Informações Pessoais",
        description: "Informações básicas",
      },
      { id: 2, title: "Histórico de Saúde", description: "Histórico médico" },
      { id: 3, title: "Objetivos", description: "Objetivos nutricionais" },
      { id: 4, title: "Experiência", description: "Histórico alimentar" },
      { id: 5, title: "Preferências", description: "Estilo alimentar" },
      { id: 6, title: "Estilo de Vida", description: "Hábitos diários" },
      {
        id: 7,
        title: "Informações Adicionais",
        description: "Detalhes finais",
      },
    ];

    return (
      <Card className="w-full max-w-4xl mx-auto mb-8">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Seu Progresso
            </h3>
            <p className="text-gray-600">
              Acompanhe a conclusão da sua avaliação nutricional
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
                          : "bg-gray-200 text-gray-400"
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
            <div className="p-3 bg-emerald-50 rounded-lg">
              <span className="block text-2xl font-bold text-emerald-600">
                {answeredQuestions}
              </span>
              <span className="text-sm text-gray-600">Answered</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="block text-2xl font-bold text-gray-600">
                {totalQuestions - answeredQuestions}
              </span>
              <span className="text-sm text-gray-600">Remaining</span>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <span className="block text-2xl font-bold text-green-600">
                {Math.round((answeredQuestions / totalQuestions) * 100)}%
              </span>
              <span className="text-sm text-gray-600">Complete</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
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

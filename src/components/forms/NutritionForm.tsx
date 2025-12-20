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
import DietPlanGenerator from "../../services/DietPlanGenerator";
import DietPlanStorage from "../../services/DietPlanStorage";
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

      // 1. Initial Data
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
      { id: "idade", type: "number", title: t.questions.idade, required: true },
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
        title:
          "Have you previously worked with a nutritionist or personal trainer?",
        required: true,
      },
      {
        id: "tempo_acompanhamento",
        type: "text",
        title: t.questions.tempo_acompanhamento,
        condition: { id: "acompanhamento_anterior", value: "Yes" },
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
        condition: { id: "dieta_anterior", value: "Yes" },
        required: true,
      },

      // 2. Goal and History
      {
        id: "section2_header",
        type: "welcome",
        title: t.sections.section2.title,
        description: t.sections.section2.description,
        buttonText: "Continue",
      },
      {
        id: "objetivo_principal",
        type: "multiple_choice",
        title: "What is your main goal?",
        options: [
          "Weight loss",
          "Muscle gain",
          "Body recomposition",
          "Aesthetics (shape/definition)",
          "Athletic performance",
          "Dietary reeducation",
        ],
        required: true,
      },
      {
        id: "meta_especifica",
        type: "textarea",
        title:
          "Do you have a specific weight goal, body fat percentage, or deadline to achieve your goal?",
        required: false,
      },
      {
        id: "competicoes",
        type: "yes_no",
        title:
          "Have you participated or plan to participate in competitions (e.g., bodybuilding)?",
        required: true,
      },
      {
        id: "categoria_competicao",
        type: "text",
        title: "Which category?",
        condition: { id: "competicoes", value: "Yes" },
        required: true,
      },
      {
        id: "data_competicao",
        type: "text",
        title: "When was or will be the competition?",
        condition: { id: "competicoes", value: "Yes" },
        required: true,
      },

      // 3. Health and Digestion
      {
        id: "section3_header",
        type: "welcome",
        title: t.sections.section3.title,
        description: t.sections.section3.description,
        buttonText: "Continue",
      },
      {
        id: "condicoes_saude",
        type: "textarea",
        title:
          "Do you have any health conditions? (e.g., PCOS, hypothyroidism, dysbiosis, gastritis, insulin resistance, etc.)",
        required: false,
      },
      {
        id: "medicamentos",
        type: "yes_no",
        title: "Do you take any medications or supplements?",
        required: true,
      },
      {
        id: "quais_medicamentos",
        type: "textarea",
        title: "Which ones? Dosages? Schedules?",
        condition: { id: "medicamentos", value: "Yes" },
        required: true,
      },
      {
        id: "intolerancias",
        type: "yes_no",
        title: "Do you have any food intolerances or allergies?",
        required: true,
      },
      {
        id: "quais_intolerancias",
        type: "textarea",
        title: "Which ones?",
        condition: { id: "intolerancias", value: "Yes" },
        required: true,
      },
      {
        id: "dificuldade_digestao",
        type: "yes_no",
        title: "Do you have difficulty digesting any foods?",
        required: true,
      },
      {
        id: "quais_dificuldade_digestao",
        type: "textarea",
        title: "Which one(s)?",
        condition: { id: "dificuldade_digestao", value: "Yes" },
        required: true,
      },

      // Digestive symptoms
      {
        id: "inchaço_abdominal",
        type: "yes_no",
        title: "Do you often experience abdominal bloating?",
        required: true,
      },
      {
        id: "inchaço_detalhes",
        type: "textarea",
        title: "At what time of day and after which foods?",
        condition: { id: "inchaço_abdominal", value: "Yes" },
        required: true,
      },

      {
        id: "azia",
        type: "yes_no",
        title: "Do you often experience heartburn?",
        required: true,
      },
      {
        id: "azia_detalhes",
        type: "textarea",
        title: "How frequently and in what situations?",
        condition: { id: "azia", value: "Yes" },
        required: true,
      },

      {
        id: "gases",
        type: "yes_no",
        title: "Do you often experience gas/burping?",
        required: true,
      },
      {
        id: "gases_detalhes",
        type: "textarea",
        title: "At what times of the day?",
        condition: { id: "gases", value: "Yes" },
        required: true,
      },

      {
        id: "desconforto_refeicoes",
        type: "yes_no",
        title: "Do you often experience discomfort after meals?",
        required: true,
      },
      {
        id: "desconforto_detalhes",
        type: "textarea",
        title: "How frequently and after what types of meals?",
        condition: { id: "desconforto_refeicoes", value: "Yes" },
        required: true,
      },

      {
        id: "sonolencia_refeicoes",
        type: "yes_no",
        title: "Do you feel drowsy after meals?",
        required: true,
      },
      {
        id: "sonolencia_detalhes",
        type: "textarea",
        title: "Which meals and how often?",
        condition: { id: "sonolencia_refeicoes", value: "Yes" },
        required: true,
      },

      {
        id: "queda_energia",
        type: "yes_no",
        title:
          "Do you feel a lack of energy or decreased physical/cognitive performance after eating?",
        required: true,
      },
      {
        id: "queda_energia_detalhes",
        type: "textarea",
        title: "After which meals or types of food?",
        condition: { id: "queda_energia", value: "Yes" },
        required: true,
      },

      {
        id: "exames_recentes",
        type: "yes_no",
        title: "Have you had recent lab tests?",
        required: true,
      },
      {
        id: "exames_resultados",
        type: "textarea",
        title: "Can you share the main results?",
        condition: { id: "exames_recentes", value: "Yes" },
        required: true,
      },

      // 4. Eating Behavior and Routine
      {
        id: "section4_header",
        type: "welcome",
        title: t.sections.section4.title,
        description: t.sections.section4.description,
        buttonText: "Continue",
      },
      {
        id: "quantidade_refeicoes",
        type: "text",
        title: "How many meals do you typically have per day?",
        required: true,
      },
      {
        id: "refeicoes_frequentes",
        type: "textarea",
        title: "Which meals do you have most frequently?",
        required: true,
      },
      {
        id: "horarios_fixos",
        type: "yes_no",
        title: "Do you have fixed meal times?",
        required: true,
      },
      {
        id: "quais_horarios",
        type: "textarea",
        title: "What times?",
        condition: { id: "horarios_fixos", value: "Yes" },
        required: true,
      },

      {
        id: "pula_refeicoes",
        type: "yes_no",
        title: "Do you often skip meals?",
        required: true,
      },
      {
        id: "quais_pula_refeicoes",
        type: "textarea",
        title: "Which meals do you skip and why?",
        condition: { id: "pula_refeicoes", value: "Yes" },
        required: true,
      },

      {
        id: "faz_jejum",
        type: "yes_no",
        title: "Do you practice fasting?",
        required: true,
      },
      {
        id: "detalhes_jejum",
        type: "textarea",
        title: "What type? How many hours? How often?",
        condition: { id: "faz_jejum", value: "Yes" },
        required: true,
      },

      {
        id: "horario_fome",
        type: "text",
        title: "At what time of day do you feel most hungry?",
        required: true,
      },

      {
        id: "belisca",
        type: "yes_no",
        title: "Do you snack between meals?",
        required: true,
      },
      {
        id: "detalhes_beliscar",
        type: "textarea",
        title: "What? How often?",
        condition: { id: "belisca", value: "Yes" },
        required: true,
      },

      {
        id: "compulsao",
        type: "yes_no",
        title: "Do you experience episodes of binge eating?",
        required: true,
      },
      {
        id: "detalhes_compulsao",
        type: "textarea",
        title: "In what situations and with which foods?",
        condition: { id: "compulsao", value: "Yes" },
        required: true,
      },

      {
        id: "fome_emocional",
        type: "yes_no",
        title: "Do you experience episodes of emotional eating?",
        required: true,
      },
      {
        id: "detalhes_fome_emocional",
        type: "textarea",
        title: "How often and in what context?",
        condition: { id: "fome_emocional", value: "Yes" },
        required: true,
      },

      {
        id: "bebe_refeicoes",
        type: "yes_no",
        title: "Do you typically drink liquids during meals?",
        required: true,
      },
      {
        id: "detalhes_bebe_refeicoes",
        type: "textarea",
        title: "Which beverages? In what quantity?",
        condition: { id: "bebe_refeicoes", value: "Yes" },
        required: true,
      },

      {
        id: "bebidas_adocadas",
        type: "yes_no",
        title:
          "Do you consume sweetened drinks like juices, sodas, or energy drinks?",
        required: true,
      },
      {
        id: "quais_bebidas_adocadas",
        type: "textarea",
        title: "Which specific drinks?",
        condition: { id: "bebidas_adocadas", value: "Yes" },
        required: true,
      },
      {
        id: "frequencia_bebidas_adocadas",
        type: "text",
        title: "How often per week?",
        condition: { id: "bebidas_adocadas", value: "Yes" },
        required: true,
      },
      {
        id: "quantidade_bebidas_adocadas",
        type: "text",
        title: "In what quantity (ml or cans)?",
        condition: { id: "bebidas_adocadas", value: "Yes" },
        required: true,
      },

      {
        id: "bebidas_zero",
        type: "yes_no",
        title:
          "Do you consume zero-calorie drinks (diet soda, teas sweetened with stevia, etc.)?",
        required: true,
      },
      {
        id: "detalhes_bebidas_zero",
        type: "textarea",
        title: "Which ones and how often?",
        condition: { id: "bebidas_zero", value: "Yes" },
        required: true,
      },

      {
        id: "cafe",
        type: "yes_no",
        title: "Do you drink coffee?",
        required: true,
      },
      {
        id: "frequencia_cafe",
        type: "text",
        title: "How many times per day?",
        condition: { id: "cafe", value: "Yes" },
        required: true,
      },
      {
        id: "quantidade_cafe",
        type: "text",
        title: "Quantity each time (ml or cups)?",
        condition: { id: "cafe", value: "Yes" },
        required: true,
      },
      {
        id: "tipo_cafe",
        type: "text",
        title: "With sugar, sweetener, milk, or black?",
        condition: { id: "cafe", value: "Yes" },
        required: true,
      },

      {
        id: "estimulantes",
        type: "yes_no",
        title:
          "Do you use other stimulants (pre-workouts, thermogenics, energy drinks)?",
        required: true,
      },
      {
        id: "detalhes_estimulantes",
        type: "textarea",
        title: "Which ones? At what time?",
        condition: { id: "estimulantes", value: "Yes" },
        required: true,
      },

      {
        id: "alcool",
        type: "yes_no",
        title: "Do you consume alcohol?",
        required: true,
      },
      {
        id: "frequencia_alcool",
        type: "text",
        title: "How often?",
        condition: { id: "alcool", value: "Yes" },
        required: true,
      },
      {
        id: "quantidade_alcool",
        type: "text",
        title: "In what quantity (glasses, cans, cups)?",
        condition: { id: "alcool", value: "Yes" },
        required: true,
      },
      {
        id: "tipo_alcool",
        type: "text",
        title: "Which brands and types? (wine, beer, gin, spirits, etc.)",
        condition: { id: "alcool", value: "Yes" },
        required: true,
      },

      {
        id: "cigarro",
        type: "yes_no",
        title: "Do you smoke cigarettes?",
        required: true,
      },
      {
        id: "detalhes_cigarro",
        type: "text",
        title: "For how long? How many per day?",
        condition: { id: "cigarro", value: "Yes" },
        required: true,
      },

      {
        id: "vape",
        type: "yes_no",
        title: "Do you use e-cigarettes (vape)?",
        required: true,
      },
      {
        id: "detalhes_vape",
        type: "text",
        title: "How often? For how long?",
        condition: { id: "vape", value: "Yes" },
        required: true,
      },

      {
        id: "charuto",
        type: "yes_no",
        title: "Do you smoke cigars?",
        required: true,
      },
      {
        id: "detalhes_charuto",
        type: "text",
        title: "How often? For how long?",
        condition: { id: "charuto", value: "Yes" },
        required: true,
      },

      // 5. Food Preferences and Aversions
      {
        id: "section5_header",
        type: "welcome",
        title: t.sections.section5.title,
        description: t.sections.section5.description,
        buttonText: "Continue",
      },
      {
        id: "alimentos_gosta",
        type: "textarea",
        title:
          "Which foods do you really like and would like to keep in your diet?",
        required: true,
      },
      {
        id: "alimentos_evita",
        type: "textarea",
        title:
          "Which foods do you avoid or don't tolerate (due to taste, texture, or ideology)?",
        required: true,
      },
      {
        id: "cafe_manha_preferencia",
        type: "text",
        title: "Do you prefer sweet or savory breakfast?",
        required: true,
      },
      {
        id: "frutas_vegetais_preferidos",
        type: "textarea",
        title: "Which fruits and vegetables do you prefer?",
        required: true,
      },
      {
        id: "aversao_texturas",
        type: "textarea",
        title:
          "Do you have any aversion to certain textures or flavors (e.g. mint, coconut, cilantro, ginger)?",
        required: false,
      },

      {
        id: "paladar_alterado",
        type: "yes_no",
        title:
          "Do you often experience altered taste, dry mouth, or bitter taste?",
        required: true,
      },
      {
        id: "detalhes_paladar_alterado",
        type: "text",
        title: "In what situations?",
        condition: { id: "paladar_alterado", value: "Yes" },
        required: true,
      },

      {
        id: "nivel_apetite",
        type: "multiple_choice",
        title: "How would you rate your appetite:",
        options: ["Low", "Normal", "Very high"],
        required: true,
      },

      {
        id: "consome_ovo",
        type: "yes_no",
        title: "Do you eat eggs?",
        required: true,
      },
      {
        id: "consome_peixe",
        type: "yes_no",
        title: "Do you eat fish?",
        required: true,
      },
      {
        id: "consome_carne_vermelha",
        type: "yes_no",
        title: "Do you eat red meat?",
        required: true,
      },
      {
        id: "consome_tofu",
        type: "yes_no",
        title: "Do you eat tofu or plant-based protein?",
        required: true,
      },
      {
        id: "consome_leite",
        type: "yes_no",
        title: "Do you consume milk and dairy products?",
        required: true,
      },

      {
        id: "preferencia_carne",
        type: "yes_no",
        title: "Do you have a preference for any specific type of meat?",
        required: true,
      },
      {
        id: "tipo_carne_preferido",
        type: "text",
        title: "Which one?",
        condition: { id: "preferencia_carne", value: "Yes" },
        required: true,
      },

      {
        id: "dificuldade_carne_vermelha",
        type: "yes_no",
        title: "Do you have difficulty digesting red meat?",
        required: true,
      },

      {
        id: "gordura_cozinhar",
        type: "text",
        title:
          "What type of fat do you typically use for cooking? (olive oil, butter, soybean oil, lard, coconut oil, etc.)",
        required: true,
      },

      {
        id: "azeite",
        type: "yes_no",
        title: "Do you use olive oil regularly?",
        required: true,
      },
      {
        id: "quantidade_azeite",
        type: "text",
        title: "In what approximate amount per meal?",
        condition: { id: "azeite", value: "Yes" },
        required: true,
      },

      {
        id: "oleo_coco",
        type: "yes_no",
        title: "Do you use coconut oil or coconut products?",
        required: true,
      },
      {
        id: "frequencia_oleo_coco",
        type: "text",
        title: "How often?",
        condition: { id: "oleo_coco", value: "Yes" },
        required: true,
      },

      {
        id: "frituras",
        type: "yes_no",
        title: "Do you eat fried foods?",
        required: true,
      },
      {
        id: "frequencia_frituras",
        type: "text",
        title: "How often per week or per day?",
        condition: { id: "frituras", value: "Yes" },
        required: true,
      },
      {
        id: "alimentos_frituras",
        type: "text",
        title: "Which foods?",
        condition: { id: "frituras", value: "Yes" },
        required: true,
      },

      // 6. Cheat Meals
      {
        id: "section6_header",
        type: "welcome",
        title: t.sections.section6.title,
        description: t.sections.section6.description,
        buttonText: "Continue",
      },
      {
        id: "refeicoes_livres",
        type: "yes_no",
        title: "Do you have cheat meals?",
        required: true,
      },
      {
        id: "frequencia_refeicoes_livres",
        type: "text",
        title: "How often per week?",
        condition: { id: "refeicoes_livres", value: "Yes" },
        required: true,
      },
      {
        id: "dia_refeicao_livre",
        type: "text",
        title: "On which day do you usually have it?",
        condition: { id: "refeicoes_livres", value: "Yes" },
        required: true,
      },
      {
        id: "preferencia_refeicao_livre",
        type: "textarea",
        title: "What do you like to eat during these meals?",
        condition: { id: "refeicoes_livres", value: "Yes" },
        required: true,
      },
      {
        id: "preferencia_agendamento",
        type: "multiple_choice",
        title:
          "Do you prefer to have your cheat meal scheduled or decide in the moment?",
        options: ["Scheduled", "Decide in the moment"],
        required: true,
      },

      // 7. Macronutrients and Meal Composition
      {
        id: "section7_header",
        type: "welcome",
        title: t.sections.section7.title,
        description: t.sections.section7.description,
        buttonText: "Continue",
      },
      {
        id: "proteina_refeicoes",
        type: "yes_no",
        title: "Do you include a protein source in all meals?",
        required: true,
      },
      {
        id: "fontes_proteina",
        type: "textarea",
        title: "What are your main sources?",
        condition: { id: "proteina_refeicoes", value: "Yes" },
        required: true,
      },

      {
        id: "gorduras_boas",
        type: "yes_no",
        title: "Do you consume healthy fat sources?",
        required: true,
      },
      {
        id: "quais_gorduras_boas",
        type: "textarea",
        title:
          "Which ones (avocado, nuts, olive oil, egg yolk, coconut oil, etc.)",
        condition: { id: "gorduras_boas", value: "Yes" },
        required: true,
      },

      {
        id: "carboidratos_frequentes",
        type: "textarea",
        title:
          "Which carbohydrates do you consume most frequently? Do you prefer whole grains or refined?",
        required: true,
      },

      {
        id: "dieta_manipulacao_carbo",
        type: "yes_no",
        title: "Have you used a diet with carb manipulation (e.g., cycling)?",
        required: true,
      },
      {
        id: "modelo_dieta_carbo",
        type: "text",
        title: "Which model?",
        condition: { id: "dieta_manipulacao_carbo", value: "Yes" },
        required: true,
      },

      {
        id: "preferencia_ciclo_carbo",
        type: "multiple_choice",
        title:
          "Would you like to include carb cycling or maintain a linear pattern?",
        options: ["Carb cycling", "Linear pattern"],
        required: true,
      },

      // 8. Training and Lifestyle
      {
        id: "section8_header",
        type: "welcome",
        title: t.sections.section8.title,
        description: t.sections.section8.description,
        buttonText: "Continue",
      },
      {
        id: "pratica_atividade",
        type: "yes_no",
        title: "Do you engage in physical activity?",
        required: true,
      },
      {
        id: "modalidade_atividade",
        type: "text",
        title: "Which modality?",
        condition: { id: "pratica_atividade", value: "Yes" },
        required: true,
      },
      {
        id: "frequencia_atividade",
        type: "text",
        title: "Weekly frequency?",
        condition: { id: "pratica_atividade", value: "Yes" },
        required: true,
      },
      {
        id: "horario_atividade",
        type: "text",
        title: "Usual training time?",
        condition: { id: "pratica_atividade", value: "Yes" },
        required: true,
      },
      {
        id: "tipo_treino",
        type: "text",
        title:
          "Type of training (e.g., weight lifting, running, functional...)",
        condition: { id: "pratica_atividade", value: "Yes" },
        required: true,
      },
      {
        id: "nivel_treino",
        type: "multiple_choice",
        title: "Level:",
        options: ["Beginner", "Intermediate", "Advanced"],
        condition: { id: "pratica_atividade", value: "Yes" },
        required: true,
      },

      {
        id: "faz_cardio",
        type: "yes_no",
        title: "Do you do cardio?",
        required: true,
      },
      {
        id: "detalhes_cardio",
        type: "text",
        title: "What type and how often?",
        condition: { id: "faz_cardio", value: "Yes" },
        required: true,
      },

      {
        id: "preferencia_alimentar_treino",
        type: "yes_no",
        title: "Do you have food preferences for pre and post-workout?",
        required: true,
      },
      {
        id: "detalhes_alimentar_treino",
        type: "textarea",
        title: "What do you like or usually consume?",
        condition: { id: "preferencia_alimentar_treino", value: "Yes" },
        required: true,
      },

      {
        id: "usa_suplementos",
        type: "yes_no",
        title: "Do you use any supplements?",
        required: true,
      },
      {
        id: "quais_suplementos",
        type: "textarea",
        title: "Which ones?",
        condition: { id: "usa_suplementos", value: "Yes" },
        required: true,
      },

      // 9. Sleep and Stress
      {
        id: "section9_header",
        type: "welcome",
        title: t.sections.section9.title,
        description: t.sections.section9.description,
        buttonText: "Continue",
      },
      {
        id: "horas_sono",
        type: "text",
        title: "How many hours do you sleep per night?",
        required: true,
      },
      {
        id: "dificuldade_dormir",
        type: "yes_no",
        title:
          "Do you have difficulty falling asleep or wake up during the night?",
        required: true,
      },
      {
        id: "acorda_descansado",
        type: "yes_no",
        title: "Do you wake up feeling rested?",
        required: true,
      },
      {
        id: "estresse_elevado",
        type: "yes_no",
        title: "Are you in a period of high stress?",
        required: true,
      },
      {
        id: "estresse_afeta_alimentacao",
        type: "yes_no",
        title: "Does stress affect your eating or sleeping?",
        required: true,
      },

      // 10. Final Considerations
      {
        id: "section10_header",
        type: "welcome",
        title: t.sections.section10.title,
        description: t.sections.section10.description,
        buttonText: "Continue",
      },
      {
        id: "informacao_adicional",
        type: "textarea",
        title:
          "Is there any information you consider important that has not been addressed?",
        required: false,
      },
      {
        id: "preferencia_plano",
        type: "multiple_choice",
        title:
          "Would you prefer a plan with more freedom or more detailed structure?",
        options: [
          "More freedom",
          "More detailed structure",
          "Balance between both",
        ],
        required: true,
      },
      {
        id: "pesar_medir",
        type: "yes_no",
        title: "Are you willing to weigh and measure your food if necessary?",
        required: true,
      },

      // Conclusion
      {
        id: "thankYou",
        type: "thank_you",
        title: "Thank you for completing the questionnaire!",
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
        "ezbPPmM_lDMistyGT" // Public Key
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
                      "bg-emerald-600 hover:bg-emerald-700"
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
                      "bg-red-600 hover:bg-red-700"
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
              Your Progress
            </h3>
            <p className="text-gray-600">
              Track your nutrition assessment completion
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

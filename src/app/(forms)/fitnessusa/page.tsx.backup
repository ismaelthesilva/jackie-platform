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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Circle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Dumbbell,
  Target,
  Heart,
  User,
  Activity,
  Brain,
  Zap,
  Trophy,
  Clock,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CloudflareTurnstile from "@/components/CloudflareTurnstile";

// TypeScript interfaces
interface Question {
  id: string;
  type:
    | "welcome"
    | "text"
    | "number"
    | "email"
    | "textarea"
    | "yes_no"
    | "multiple_choice"
    | "multiple_select"
    | "checkbox"
    | "thank_you";
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

export default function FitnessUSAPage() {
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
        title: "PROFESSIONAL FITNESS & BODYBUILDING CONSULTATION QUESTIONNAIRE",
        description: "Designed for all levels: beginners to stage athletes",
        buttonText: "Start",
      },
      // SECTION 1 — PERSONAL & BASIC INFORMATION
      {
        id: "block1_header",
        type: "welcome",
        title: "SECTION 1 — PERSONAL & BASIC INFORMATION",
        description: "Let's start with some basic information about you.",
        buttonText: "Continue",
      },
      {
        id: "nome_completo",
        type: "text",
        title: "1. Full name:",
        required: true,
      },
      {
        id: "email",
        type: "email",
        title: "2. Please provide your email to receive your personalized plan",
        required: true,
      },
      {
        id: "data_nascimento",
        type: "text",
        title: "3. Date of birth:",
        required: true,
      },
      {
        id: "data_nascimento",
        type: "text",
        title: "3. Date of birth:",
        required: true,
      },
      {
        id: "altura",
        type: "number",
        title: "4. Height (in cm):",
        required: true,
      },
      {
        id: "peso",
        type: "number",
        title: "5. Current weight (in kg):",
        required: true,
      },
      {
        id: "percentual_gordura",
        type: "text",
        title: "6. Body fat percentage (if known):",
        required: false,
      },
      {
        id: "localizacao",
        type: "text",
        title: "7. Location (City and Country):",
        required: true,
      },
      {
        id: "profissao",
        type: "textarea",
        title:
          "8. Occupation and work routine (shift work, sedentary, active job, etc.):",
        required: true,
      },
      {
        id: "horario_sono",
        type: "text",
        title: "9. Usual sleep schedule (bedtime and wake time):",
        required: true,
      },
      {
        id: "horas_sono",
        type: "multiple_choice",
        title: "10. Average hours of sleep per night:",
        options: ["Less than 5h", "5h", "6h", "7h", "8h", "More than 8h"],
        required: true,
      },
      {
        id: "tipo_sono",
        type: "multiple_choice",
        title: "11. How would you rate your sleep?",
        options: ["Light", "Moderate", "Deep"],
        required: true,
      },
      {
        id: "acorda_descansado",
        type: "yes_no",
        title: "12. Do you wake up feeling rested?",
        required: true,
      },
      {
        id: "energia_dia",
        type: "textarea",
        title: "13. How would you describe your daily energy levels?",
        required: true,
      },
      {
        id: "fuma",
        type: "yes_no",
        title: "14. Do you smoke?",
        required: true,
      },
      {
        id: "alcool",
        type: "yes_no",
        title: "15. Do you consume alcohol?",
        required: true,
      },
      {
        id: "alcool_detalhes",
        type: "textarea",
        title: "Frequency and quantity:",
        condition: { id: "alcool", value: "Yes" },
        required: true,
      },
      {
        id: "gestante",
        type: "yes_no",
        title: "15. Are you pregnant or trying to conceive? (if applicable)",
        required: false,
      },

      // SECTION 2 — HEALTH HISTORY
      {
        id: "block2_header",
        type: "welcome",
        title: "SECTION 2 — HEALTH HISTORY",
        description: "Let's learn about your health and medical history.",
        buttonText: "Continue",
      },
      {
        id: "doencas",
        type: "textarea",
        title:
          "16. Do you have any diagnosed medical conditions? (e.g. hypothyroidism, PCOS, insulin resistance)",
        required: false,
      },
      {
        id: "lesoes",
        type: "textarea",
        title:
          "17. Have you ever suffered any injuries? Please specify location and year:",
        required: false,
      },
      {
        id: "cirurgias",
        type: "textarea",
        title: "18. Have you had any surgeries? Which ones and when?",
        required: false,
      },
      {
        id: "medicacao",
        type: "textarea",
        title: "19. Do you take any medications regularly? Which ones?",
        required: false,
      },
      {
        id: "alergias",
        type: "textarea",
        title: "20. Do you have any food allergies or intolerances?",
        required: false,
      },
      {
        id: "anticoncepcional",
        type: "textarea",
        title: "21. Do you use birth control? Specify type and method:",
        required: false,
      },
      {
        id: "exames_sangue",
        type: "yes_no",
        title: "22. Have you had blood work done in the last 6 months?",
        required: true,
      },
      {
        id: "exames_alteracoes",
        type: "textarea",
        title: "If yes, were there any abnormalities?",
        condition: { id: "exames_sangue", value: "Yes" },
        required: true,
      },

      // SECTION 3 — TRAINING HISTORY & EXPERIENCE
      {
        id: "block3_header",
        type: "welcome",
        title: "SECTION 3 — TRAINING HISTORY & EXPERIENCE",
        description: "Tell us about your training experience.",
        buttonText: "Continue",
      },
      {
        id: "tempo_treino",
        type: "text",
        title: "23. How long have you been training consistently?",
        required: true,
      },
      {
        id: "fases_cutting_bulking",
        type: "textarea",
        title:
          "24. Have you ever done cutting or bulking phases? How many times?",
        required: false,
      },
      {
        id: "acompanhamento",
        type: "textarea",
        title:
          "25. Have you ever worked with a professional coach or sports nutritionist?",
        required: false,
      },
      {
        id: "tipo_treino",
        type: "multiple_select",
        title: "26. What type of training are you currently doing?",
        options: [
          "Traditional strength training",
          "Functional training",
          "CrossFit",
          "Free-form cardio",
          "Other",
        ],
        required: true,
      },
      {
        id: "tipo_treino_outros",
        type: "text",
        title: "If other, please specify:",
        condition: { id: "tipo_treino", value: "Other" },
        required: true,
      },
      {
        id: "dias_treino",
        type: "text",
        title:
          "27. How many days per week can you realistically commit to training?",
        required: true,
      },
      {
        id: "tempo_treino_dia",
        type: "text",
        title: "28. How much time do you have per session?",
        required: true,
      },
      {
        id: "local_treino",
        type: "multiple_choice",
        title: "29. Do you prefer working out at home or in a gym?",
        options: ["Home", "Gym", "Both"],
        required: true,
      },
      {
        id: "restricao_equipamento",
        type: "textarea",
        title: "30. Do you have any equipment limitations?",
        required: false,
      },

      // SECTION 4 — GOALS & PHYSIQUE PRIORITIES
      {
        id: "block4_header",
        type: "welcome",
        title: "SECTION 4 — GOALS & PHYSIQUE PRIORITIES",
        description: "What are your goals and aesthetic targets?",
        buttonText: "Continue",
      },
      {
        id: "objetivo_principal",
        type: "multiple_choice",
        title: "31. What is your primary goal?",
        options: [
          "Fat loss",
          "Muscle gain",
          "Body recomposition",
          "Performance improvement",
          "Stage preparation (bodybuilding)",
        ],
        required: true,
      },
      {
        id: "objetivo_secundario",
        type: "textarea",
        title: "32. What is your secondary goal?",
        required: false,
      },
      {
        id: "competir",
        type: "textarea",
        title:
          "33. Are you planning to compete? If yes, in which category and federation?",
        required: false,
      },
      {
        id: "prazo_objetivo",
        type: "text",
        title: "34. What is your deadline to achieve this goal?",
        required: true,
      },
      {
        id: "dieta_restrita",
        type: "yes_no",
        title: "35. Are you willing to follow a strict diet if necessary?",
        required: true,
      },
      {
        id: "protocolos_avancados",
        type: "yes_no",
        title:
          "36. Are you open to advanced strategies (depletion, carb-loading, strategic fasting, etc.)?",
        required: true,
      },
      {
        id: "enfase_corpo",
        type: "textarea",
        title: "37. Which muscle group(s) do you want to emphasize?",
        required: false,
      },
      {
        id: "dificuldade_desenvolver",
        type: "textarea",
        title:
          "38. Which muscle group(s) do you have the hardest time activating or developing?",
        required: false,
      },
      {
        id: "anabolizantes",
        type: "textarea",
        title:
          "39. Have you ever used anabolic substances or performance enhancers? Which ones and when?",
        required: false,
      },
      {
        id: "estrategia_farmacologica",
        type: "yes_no",
        title:
          "40. Are you planning to use any pharmacological strategy under professional guidance?",
        required: false,
      },

      // SECTION 5 — TRAINING STYLE, LIMITATIONS & BIOFEEDBACK
      {
        id: "block5_header",
        type: "welcome",
        title: "SECTION 5 — TRAINING STYLE, LIMITATIONS & BIOFEEDBACK",
        description:
          "Let's understand your training preferences and limitations.",
        buttonText: "Continue",
      },
      {
        id: "exercicios_gosta",
        type: "textarea",
        title: "41. Which exercises do you enjoy the most? Why?",
        required: true,
      },
      {
        id: "exercicios_detesta",
        type: "textarea",
        title: "42. Which exercises do you dislike or avoid? Why?",
        required: true,
      },
      {
        id: "exercicios_lesao",
        type: "textarea",
        title:
          "43. Are there any exercises you cannot perform due to injury or discomfort?",
        required: false,
      },
      {
        id: "facilidade_treino",
        type: "multiple_choice",
        title: "44. What training style suits you best:",
        options: [
          "Heavy loads",
          "High volume (more reps)",
          "Advanced techniques (drop-sets, rest-pause, etc.)",
        ],
        required: true,
      },
      {
        id: "dificuldade_grupo",
        type: "textarea",
        title:
          "45. Do you struggle to activate any specific muscle group? Which one(s)?",
        required: false,
      },
      {
        id: "grupo_responde_facil",
        type: "textarea",
        title: "46. Which muscle groups respond the fastest for you?",
        required: true,
      },
      {
        id: "dores_articulares",
        type: "textarea",
        title: "47. Do you experience joint pain? Where and how often?",
        required: false,
      },
      {
        id: "reacao_treino",
        type: "multiple_choice",
        title: "48. How do you typically feel after a training session?",
        options: [
          "Energized",
          "Exhausted",
          "Sleepy",
          "Irritable or extremely hungry",
        ],
        required: true,
      },
      {
        id: "dificuldade_ficha",
        type: "yes_no",
        title:
          "49. Do you find it difficult to follow a workout plan on your own?",
        required: true,
      },
      {
        id: "preferencia_treino",
        type: "multiple_choice",
        title:
          "50. Do you prefer workouts with constant variation or structured progression?",
        options: ["Constant variation", "Structured progression", "Both"],
        required: true,
      },

      // SECTION 6 — CARDIO, MOBILITY & CONDITIONING
      {
        id: "block6_header",
        type: "welcome",
        title: "SECTION 6 — CARDIO, MOBILITY & CONDITIONING",
        description:
          "Information about your cardiovascular fitness and flexibility.",
        buttonText: "Continue",
      },
      {
        id: "resistencia_aerobica",
        type: "textarea",
        title: "51. How would you rate your cardiovascular endurance?",
        required: true,
      },
      {
        id: "hiit",
        type: "textarea",
        title:
          "52. Have you tried HIIT before? Did you enjoy it or feel unwell?",
        required: true,
      },
      {
        id: "cardio_jejum",
        type: "yes_no",
        title: "53. Are you open to fasted cardio, if strategically advised?",
        required: true,
      },
      {
        id: "limitacao_respiratoria",
        type: "textarea",
        title: "54. Do you have any respiratory or cardiovascular limitations?",
        required: false,
      },
      {
        id: "mobilidade",
        type: "textarea",
        title:
          "55. Can you comfortably perform mobility or stretching routines? Do you currently do any?",
        required: true,
      },

      // SECTION 7 — LIFESTYLE, ADHERENCE & MINDSET
      {
        id: "block7_header",
        type: "welcome",
        title: "SECTION 7 — LIFESTYLE, ADHERENCE & MINDSET",
        description: "Let's understand your lifestyle and mindset.",
        buttonText: "Continue",
      },
      {
        id: "dias_treino_facilidade",
        type: "textarea",
        title:
          "56. Which days are easiest for you to train? Which are most difficult?",
        required: true,
      },
      {
        id: "desafio_constancia",
        type: "textarea",
        title:
          "57. Whats your biggest challenge right now in staying consistent?",
        required: true,
      },
      {
        id: "apoio_familia",
        type: "yes_no",
        title:
          "58. Do you have support from family or friends regarding your fitness goals?",
        required: true,
      },
      {
        id: "motivo_desistencia",
        type: "textarea",
        title:
          "59. What tends to discourage or derail you from your fitness plans?",
        required: true,
      },
      {
        id: "comprometimento",
        type: "multiple_choice",
        title:
          "60. On a scale of 0 to 10, how committed are you to your current goal?",
        options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        required: true,
      },

      // SECTION 8 — PHOTOS & PROGRESS TRACKING
      {
        id: "block8_header",
        type: "welcome",
        title: "SECTION 8 — PHOTOS & PROGRESS TRACKING (Optional)",
        description: "How can we track your progress?",
        buttonText: "Continue",
      },
      {
        id: "fotos_corporais",
        type: "yes_no",
        title: "61. Are you open to sending progress photos for evaluation?",
        required: false,
      },
      {
        id: "fotos_anteriores",
        type: "yes_no",
        title: "62. Do you already have before/after photos?",
        required: false,
      },
      {
        id: "checkins",
        type: "multiple_choice",
        title: "63. Would you prefer weekly or biweekly check-ins?",
        options: ["Weekly", "Biweekly", "Monthly", "No regular check-ins"],
        required: true,
      },
      {
        id: "apps_registro",
        type: "yes_no",
        title: "64. Do you like using apps to track workouts or meals?",
        required: true,
      },

      // SECTION 9 — NUTRITION & SUPPLEMENTATION SNAPSHOT
      {
        id: "block9_header",
        type: "welcome",
        title: "SECTION 9 — NUTRITION & SUPPLEMENTATION SNAPSHOT",
        description: "Information about your nutrition and supplementation.",
        buttonText: "Continue",
      },
      {
        id: "plano_alimentar",
        type: "textarea",
        title: "65. Are you currently following a meal plan? Created by whom?",
        required: false,
      },
      {
        id: "suplementos",
        type: "textarea",
        title: "66. What supplements do you currently use (brand and dose)?",
        required: false,
      },
      {
        id: "ajuste_dieta",
        type: "yes_no",
        title:
          "67. Are you willing to adjust your diet based on your periodized training program?",
        required: true,
      },
      {
        id: "facilidade_cozinhar",
        type: "yes_no",
        title: "68. Do you find it easy to prepare your own meals?",
        required: true,
      },
      {
        id: "preferencia_dieta",
        type: "multiple_choice",
        title:
          "69. Do you prefer a fixed meal plan or flexible options with swaps?",
        options: ["Fixed meal plan", "Flexible options with swaps"],
        required: true,
      },

      // SECTION 10 — HYDRATION
      {
        id: "block10_header",
        type: "welcome",
        title: "SECTION 10 — HYDRATION",
        description: "Information about your hydration habits.",
        buttonText: "Continue",
      },
      {
        id: "consumo_agua",
        type: "text",
        title: "70. How much water do you drink per day (in liters)?",
        required: true,
      },
      {
        id: "monitora_agua",
        type: "yes_no",
        title: "71. Do you track your water intake?",
        required: true,
      },
      {
        id: "sede_dia",
        type: "textarea",
        title: "72. Do you feel thirsty throughout the day or during workouts?",
        required: true,
      },
      {
        id: "eletrolitos",
        type: "yes_no",
        title: "73. Do you add electrolytes or use hydration supplements?",
        required: false,
      },

      // SECTION 11 — AAP (Activation And Pain Patterns)
      {
        id: "block11_header",
        type: "welcome",
        title: "SECTION 11 — AAP (Activation And Pain Patterns)",
        description:
          "Information about your neuromuscular connection and pain patterns.",
        buttonText: "Continue",
      },
      {
        id: "ativacao_muscular",
        type: "textarea",
        title:
          "74. Do you feel the target muscle working in most exercises? If not, in which exercises do you struggle with activation?",
        required: true,
      },
      {
        id: "dor_muscular",
        type: "textarea",
        title:
          "75. Do you usually experience post-workout muscle soreness? Which muscle groups respond the most?",
        required: true,
      },
      {
        id: "dor_articular",
        type: "textarea",
        title:
          "76. Do you ever feel joint pain during training? If so, where and when?",
        required: false,
      },

      // Email and Conclusion
      {
        id: "informacao_adicional",
        type: "textarea",
        title:
          "77. Is there anything else you would like to share with me that is not included in this form?",
        required: false,
      },
      {
        id: "thankYou",
        type: "thank_you",
        title: "Thank you for completing the questionnaire!",
        description:
          "We will analyze your responses and send your personalized plan soon.",
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
        setClientEmail(String(answer));
      }

      // Find the current question
      const currentQ = questions.find((q) => q.id === questionId);

      if (!currentQ) return;

      // If it's a yes/no question
      if (currentQ.type === "yes_no") {
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
    console.log("Starting form submission via EmailJS...");

    try {
      // Build email body HTML
      let emailBody = "<h1>Fitness Assessment USA</h1>";
      emailBody += "<h2>Client Details</h2>";
      emailBody += `<p><strong>Name:</strong> ${
        answers.nome_completo || "N/A"
      }</p>`;
      emailBody += `<p><strong>Birth Date:</strong> ${
        answers.data_nascimento || "N/A"
      }</p>`;
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
            "data_nascimento",
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
        "template_48ud7sn", // Template ID
        templateParams,
        "ezbPPmM_lDMistyGT" // Public Key
      );
      console.log("EmailJS response:", response);

      setEmailSent(true);
      console.log("Email sent successfully, state updated");

      // Show success message
      alert(`✅ Success! Your assessment has been submitted successfully!

Dr. Jackie has received your information and will be in touch soon.

Your assessment was sent directly to Dr. Jackie, who will personally review it and create your personalized plan.

📧 Confirmation email: You'll receive a confirmation at ${clientEmail}

⏰ Timeline: Dr. Jackie will respond within 24-48 hours.

Thank you for trusting Dr. Jackie's work!`);
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

  const renderProgressTimeline = () => {
    if (currentQuestion === 1 || isLoading || emailSent) return null;

    const answeredQuestions = Object.keys(answers).length;
    const totalQuestions = questions.length - 1; // Exclude welcome question
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
              Track your fitness assessment completion
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

  const renderQuestion = (): React.ReactElement => {
    const currentQ = questions[currentQuestion];

    const handleKeyPress = (
      e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
      value: string | string[] | number | undefined
    ) => {
      if (e.key === "Enter" && (value || !currentQ.required)) {
        handleAnswer(currentQ.id, value || "");
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

    if (currentQ.type === "welcome") {
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
              onClick={() =>
                setCurrentQuestion(getNextQuestion(currentQuestion))
              }
            >
              {currentQ.buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (currentQ.type === "thank_you") {
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
                <span className="text-lg">Processing your responses...</span>
              </div>
            )}
            {emailSent && (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                <span className="text-lg font-semibold">
                  Successfully submitted! Check your email soon.
                </span>
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
          {["text", "number", "email"].includes(currentQ.type) && (
            <div className="space-y-6">
              <Input
                type={currentQ.type}
                placeholder="Type your answer..."
                value={String(answers[currentQ.id] || "")}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQ.id]: e.target.value,
                  }))
                }
                onKeyPress={(e) => handleKeyPress(e, answers[currentQ.id])}
                required={currentQ.required}
                autoFocus
                className="text-lg py-3"
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
                value={String(answers[currentQ.id] || "")}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQ.id]: e.target.value,
                  }))
                }
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
                    "h-16 text-lg font-semibold transition-all",
                    answers[currentQ.id] === "Yes" &&
                      "bg-emerald-600 hover:bg-emerald-700"
                  )}
                  onClick={() => handleAnswer(currentQ.id, "Yes")}
                >
                  Yes
                </Button>
                <Button
                  variant={
                    answers[currentQ.id] === "No" ? "default" : "outline"
                  }
                  size="lg"
                  className={cn(
                    "h-16 text-lg font-semibold transition-all",
                    answers[currentQ.id] === "No" &&
                      "bg-emerald-600 hover:bg-emerald-700"
                  )}
                  onClick={() => handleAnswer(currentQ.id, "No")}
                >
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

          {currentQ.type === "multiple_choice" && (
            <div className="space-y-6">
              <div className="space-y-3">
                {currentQ.options?.map((option) => (
                  <Button
                    key={option}
                    variant={
                      answers[currentQ.id] === option ? "default" : "outline"
                    }
                    size="lg"
                    className={cn(
                      "w-full h-auto p-4 text-left justify-start text-wrap whitespace-normal text-base font-medium",
                      answers[currentQ.id] === option &&
                        "bg-emerald-600 hover:bg-emerald-700"
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
                    Back
                  </Button>
                )}
              </div>
            </div>
          )}

          {currentQ.type === "multiple_select" && (
            <div className="space-y-6">
              <div className="space-y-3">
                {currentQ.options?.map((option) => {
                  const isSelected =
                    Array.isArray(answers[currentQ.id]) &&
                    (answers[currentQ.id] as string[]).includes(option);
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
                      (Array.isArray(answers[currentQ.id]) &&
                        (answers[currentQ.id] as string[]).length === 0))
                  }
                  className="px-6 bg-emerald-600 hover:bg-emerald-700"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {currentQ.type === "checkbox" && (
            <div className="space-y-6">
              <div className="space-y-3">
                {currentQ.options?.map((option) => {
                  const isChecked =
                    Array.isArray(answers[currentQ.id]) &&
                    (answers[currentQ.id] as string[]).includes(option);
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
                      (Array.isArray(answers[currentQ.id]) &&
                        (answers[currentQ.id] as string[]).length === 0))
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress bar at top */}
        {currentQuestion > 1 && !isLoading && !emailSent && (
          <div className="w-full bg-white rounded-full h-2 shadow-sm">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${
                  ((currentQuestion - 1) / (questions.length - 1)) * 100
                }%`,
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
}

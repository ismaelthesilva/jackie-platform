// NutritionUSA.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import emailjs from '@emailjs/browser';
import './Forms.css';
import DietPlanGenerator from '../../../services/DietPlanGenerator';
import DietPlanStorage from '../../../services/DietPlanStorage';

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
  type: 'welcome';
  buttonText: string;
}

interface TextQuestion extends BaseQuestion {
  type: 'text' | 'number' | 'email' | 'textarea';
}

interface YesNoQuestion extends BaseQuestion {
  type: 'yes_no';
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice' | 'multiple_select' | 'checkbox';
  options: string[];
}

interface ThankYouQuestion extends BaseQuestion {
  type: 'thank_you';
}

type Question = WelcomeQuestion | TextQuestion | YesNoQuestion | MultipleChoiceQuestion | ThankYouQuestion;

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

const NutritionUSA: React.FC = () => {
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
      title: 'Professional Nutrition Questionnaire',
      description: 'Smart Version with Branching Logic',
      buttonText: 'Start'
    },
    
    // 1. Initial Data
    {
      id: 'section1_header',
      type: 'welcome',
      title: '1. Basic Information',
      description: 'Let\'s start with some basic information about you.',
      buttonText: 'Continue'
    },
    { id: 'nome_completo', type: 'text', title: 'Full name:', required: true },
    { id: 'idade', type: 'number', title: 'Age:', required: true },
    { id: 'altura', type: 'number', title: 'Height (cm):', required: true },
    { id: 'peso', type: 'number', title: 'Current weight (kg):', required: true },
    { id: 'acompanhamento_anterior', type: 'yes_no', title: 'Have you previously worked with a nutritionist or personal trainer?', required: true },
    { id: 'tempo_acompanhamento', type: 'text', title: 'For how long?', condition: { id: 'acompanhamento_anterior', value: 'Yes' }, required: true },
    { id: 'dieta_anterior', type: 'yes_no', title: 'Have you followed a diet before?', required: true },
    { id: 'tempo_seguiu_plano', type: 'text', title: 'How long were you able to follow the plan?', condition: { id: 'dieta_anterior', value: 'Yes' }, required: true },
    
    // 2. Goal and History
    {
      id: 'section2_header',
      type: 'welcome',
      title: '2. Goals and History',
      description: 'Let\'s understand your goals and background.',
      buttonText: 'Continue'
    },
    { 
      id: 'objetivo_principal', 
      type: 'multiple_choice', 
      title: 'What is your main goal?',
      options: ['Weight loss', 'Muscle gain', 'Body recomposition', 'Aesthetics (shape/definition)', 'Athletic performance', 'Dietary reeducation'],
      required: true 
    },
    { id: 'meta_especifica', type: 'textarea', title: 'Do you have a specific weight goal, body fat percentage, or deadline to achieve your goal?', required: false },
    { id: 'competicoes', type: 'yes_no', title: 'Have you participated or plan to participate in competitions (e.g., bodybuilding)?', required: true },
    { id: 'categoria_competicao', type: 'text', title: 'Which category?', condition: { id: 'competicoes', value: 'Yes' }, required: true },
    { id: 'data_competicao', type: 'text', title: 'When was or will be the competition?', condition: { id: 'competicoes', value: 'Yes' }, required: true },
    
    // 3. Health and Digestion
    {
      id: 'section3_header',
      type: 'welcome',
      title: '3. Health and Digestion',
      description: 'Information about your health and digestive system.',
      buttonText: 'Continue'
    },
    { id: 'condicoes_saude', type: 'textarea', title: 'Do you have any health conditions? (e.g., PCOS, hypothyroidism, dysbiosis, gastritis, insulin resistance, etc.)', required: false },
    { id: 'medicamentos', type: 'yes_no', title: 'Do you take any medications or supplements?', required: true },
    { id: 'quais_medicamentos', type: 'textarea', title: 'Which ones? Dosages? Schedules?', condition: { id: 'medicamentos', value: 'Yes' }, required: true },
    { id: 'intolerancias', type: 'yes_no', title: 'Do you have any food intolerances or allergies?', required: true },
    { id: 'quais_intolerancias', type: 'textarea', title: 'Which ones?', condition: { id: 'intolerancias', value: 'Yes' }, required: true },
    { id: 'dificuldade_digestao', type: 'yes_no', title: 'Do you have difficulty digesting any foods?', required: true },
    { id: 'quais_dificuldade_digestao', type: 'textarea', title: 'Which one(s)?', condition: { id: 'dificuldade_digestao', value: 'Yes' }, required: true },
    
    // Digestive symptoms
    { id: 'inchaço_abdominal', type: 'yes_no', title: 'Do you often experience abdominal bloating?', required: true },
    { id: 'inchaço_detalhes', type: 'textarea', title: 'At what time of day and after which foods?', condition: { id: 'inchaço_abdominal', value: 'Yes' }, required: true },
    
    { id: 'azia', type: 'yes_no', title: 'Do you often experience heartburn?', required: true },
    { id: 'azia_detalhes', type: 'textarea', title: 'How frequently and in what situations?', condition: { id: 'azia', value: 'Yes' }, required: true },
    
    { id: 'gases', type: 'yes_no', title: 'Do you often experience gas/burping?', required: true },
    { id: 'gases_detalhes', type: 'textarea', title: 'At what times of the day?', condition: { id: 'gases', value: 'Yes' }, required: true },
    
    { id: 'desconforto_refeicoes', type: 'yes_no', title: 'Do you often experience discomfort after meals?', required: true },
    { id: 'desconforto_detalhes', type: 'textarea', title: 'How frequently and after what types of meals?', condition: { id: 'desconforto_refeicoes', value: 'Yes' }, required: true },
    
    { id: 'sonolencia_refeicoes', type: 'yes_no', title: 'Do you feel drowsy after meals?', required: true },
    { id: 'sonolencia_detalhes', type: 'textarea', title: 'Which meals and how often?', condition: { id: 'sonolencia_refeicoes', value: 'Yes' }, required: true },
    
    { id: 'queda_energia', type: 'yes_no', title: 'Do you feel a lack of energy or decreased physical/cognitive performance after eating?', required: true },
    { id: 'queda_energia_detalhes', type: 'textarea', title: 'After which meals or types of food?', condition: { id: 'queda_energia', value: 'Yes' }, required: true },
    
    { id: 'exames_recentes', type: 'yes_no', title: 'Have you had recent lab tests?', required: true },
    { id: 'exames_resultados', type: 'textarea', title: 'Can you share the main results?', condition: { id: 'exames_recentes', value: 'Yes' }, required: true },
    
    // 4. Eating Behavior and Routine
    {
      id: 'section4_header',
      type: 'welcome',
      title: '4. Eating Behavior and Routine',
      description: 'Information about your daily eating habits.',
      buttonText: 'Continue'
    },
    { id: 'quantidade_refeicoes', type: 'text', title: 'How many meals do you typically have per day?', required: true },
    { id: 'refeicoes_frequentes', type: 'textarea', title: 'Which meals do you have most frequently?', required: true },
    { id: 'horarios_fixos', type: 'yes_no', title: 'Do you have fixed meal times?', required: true },
    { id: 'quais_horarios', type: 'textarea', title: 'What times?', condition: { id: 'horarios_fixos', value: 'Yes' }, required: true },
    
    { id: 'pula_refeicoes', type: 'yes_no', title: 'Do you often skip meals?', required: true },
    { id: 'quais_pula_refeicoes', type: 'textarea', title: 'Which meals do you skip and why?', condition: { id: 'pula_refeicoes', value: 'Yes' }, required: true },
    
    { id: 'faz_jejum', type: 'yes_no', title: 'Do you practice fasting?', required: true },
    { id: 'detalhes_jejum', type: 'textarea', title: 'What type? How many hours? How often?', condition: { id: 'faz_jejum', value: 'Yes' }, required: true },
    
    { id: 'horario_fome', type: 'text', title: 'At what time of day do you feel most hungry?', required: true },
    
    { id: 'belisca', type: 'yes_no', title: 'Do you snack between meals?', required: true },
    { id: 'detalhes_beliscar', type: 'textarea', title: 'What? How often?', condition: { id: 'belisca', value: 'Yes' }, required: true },
    
    { id: 'compulsao', type: 'yes_no', title: 'Do you experience episodes of binge eating?', required: true },
    { id: 'detalhes_compulsao', type: 'textarea', title: 'In what situations and with which foods?', condition: { id: 'compulsao', value: 'Yes' }, required: true },
    
    { id: 'fome_emocional', type: 'yes_no', title: 'Do you experience episodes of emotional eating?', required: true },
    { id: 'detalhes_fome_emocional', type: 'textarea', title: 'How often and in what context?', condition: { id: 'fome_emocional', value: 'Yes' }, required: true },
    
    { id: 'bebe_refeicoes', type: 'yes_no', title: 'Do you typically drink liquids during meals?', required: true },
    { id: 'detalhes_bebe_refeicoes', type: 'textarea', title: 'Which beverages? In what quantity?', condition: { id: 'bebe_refeicoes', value: 'Yes' }, required: true },
    
    { id: 'bebidas_adocadas', type: 'yes_no', title: 'Do you consume sweetened drinks like juices, sodas, or energy drinks?', required: true },
    { id: 'quais_bebidas_adocadas', type: 'textarea', title: 'Which specific drinks?', condition: { id: 'bebidas_adocadas', value: 'Yes' }, required: true },
    { id: 'frequencia_bebidas_adocadas', type: 'text', title: 'How often per week?', condition: { id: 'bebidas_adocadas', value: 'Yes' }, required: true },
    { id: 'quantidade_bebidas_adocadas', type: 'text', title: 'In what quantity (ml or cans)?', condition: { id: 'bebidas_adocadas', value: 'Yes' }, required: true },
    
    { id: 'bebidas_zero', type: 'yes_no', title: 'Do you consume zero-calorie drinks (diet soda, teas sweetened with stevia, etc.)?', required: true },
    { id: 'detalhes_bebidas_zero', type: 'textarea', title: 'Which ones and how often?', condition: { id: 'bebidas_zero', value: 'Yes' }, required: true },
    
    { id: 'cafe', type: 'yes_no', title: 'Do you drink coffee?', required: true },
    { id: 'frequencia_cafe', type: 'text', title: 'How many times per day?', condition: { id: 'cafe', value: 'Yes' }, required: true },
    { id: 'quantidade_cafe', type: 'text', title: 'Quantity each time (ml or cups)?', condition: { id: 'cafe', value: 'Yes' }, required: true },
    { id: 'tipo_cafe', type: 'text', title: 'With sugar, sweetener, milk, or black?', condition: { id: 'cafe', value: 'Yes' }, required: true },
    
    { id: 'estimulantes', type: 'yes_no', title: 'Do you use other stimulants (pre-workouts, thermogenics, energy drinks)?', required: true },
    { id: 'detalhes_estimulantes', type: 'textarea', title: 'Which ones? At what time?', condition: { id: 'estimulantes', value: 'Yes' }, required: true },
    
    { id: 'alcool', type: 'yes_no', title: 'Do you consume alcohol?', required: true },
    { id: 'frequencia_alcool', type: 'text', title: 'How often?', condition: { id: 'alcool', value: 'Yes' }, required: true },
    { id: 'quantidade_alcool', type: 'text', title: 'In what quantity (glasses, cans, cups)?', condition: { id: 'alcool', value: 'Yes' }, required: true },
    { id: 'tipo_alcool', type: 'text', title: 'Which brands and types? (wine, beer, gin, spirits, etc.)', condition: { id: 'alcool', value: 'Yes' }, required: true },
    
    { id: 'cigarro', type: 'yes_no', title: 'Do you smoke cigarettes?', required: true },
    { id: 'detalhes_cigarro', type: 'text', title: 'For how long? How many per day?', condition: { id: 'cigarro', value: 'Yes' }, required: true },
    
    { id: 'vape', type: 'yes_no', title: 'Do you use e-cigarettes (vape)?', required: true },
    { id: 'detalhes_vape', type: 'text', title: 'How often? For how long?', condition: { id: 'vape', value: 'Yes' }, required: true },
    
    { id: 'charuto', type: 'yes_no', title: 'Do you smoke cigars?', required: true },
    { id: 'detalhes_charuto', type: 'text', title: 'How often? For how long?', condition: { id: 'charuto', value: 'Yes' }, required: true },
    
    // 5. Food Preferences and Aversions
    {
      id: 'section5_header',
      type: 'welcome',
      title: '5. Food Preferences and Aversions',
      description: 'Let\'s understand your food tastes and preferences.',
      buttonText: 'Continue'
    },
    { id: 'alimentos_gosta', type: 'textarea', title: 'Which foods do you really like and would like to keep in your diet?', required: true },
    { id: 'alimentos_evita', type: 'textarea', title: 'Which foods do you avoid or don\'t tolerate (due to taste, texture, or ideology)?', required: true },
    { id: 'cafe_manha_preferencia', type: 'text', title: 'Do you prefer sweet or savory breakfast?', required: true },
    { id: 'frutas_vegetais_preferidos', type: 'textarea', title: 'Which fruits and vegetables do you prefer?', required: true },
    { id: 'aversao_texturas', type: 'textarea', title: 'Do you have any aversion to certain textures or flavors (e.g. mint, coconut, cilantro, ginger)?', required: false },
    
    { id: 'paladar_alterado', type: 'yes_no', title: 'Do you often experience altered taste, dry mouth, or bitter taste?', required: true },
    { id: 'detalhes_paladar_alterado', type: 'text', title: 'In what situations?', condition: { id: 'paladar_alterado', value: 'Yes' }, required: true },
    
    { 
      id: 'nivel_apetite', 
      type: 'multiple_choice', 
      title: 'How would you rate your appetite:',
      options: ['Low', 'Normal', 'Very high'],
      required: true 
    },
    
    { id: 'consome_ovo', type: 'yes_no', title: 'Do you eat eggs?', required: true },
    { id: 'consome_peixe', type: 'yes_no', title: 'Do you eat fish?', required: true },
    { id: 'consome_carne_vermelha', type: 'yes_no', title: 'Do you eat red meat?', required: true },
    { id: 'consome_tofu', type: 'yes_no', title: 'Do you eat tofu or plant-based protein?', required: true },
    { id: 'consome_leite', type: 'yes_no', title: 'Do you consume milk and dairy products?', required: true },
    
    { id: 'preferencia_carne', type: 'yes_no', title: 'Do you have a preference for any specific type of meat?', required: true },
    { id: 'tipo_carne_preferido', type: 'text', title: 'Which one?', condition: { id: 'preferencia_carne', value: 'Yes' }, required: true },
    
    { id: 'dificuldade_carne_vermelha', type: 'yes_no', title: 'Do you have difficulty digesting red meat?', required: true },
    
    { id: 'gordura_cozinhar', type: 'text', title: 'What type of fat do you typically use for cooking? (olive oil, butter, soybean oil, lard, coconut oil, etc.)', required: true },
    
    { id: 'azeite', type: 'yes_no', title: 'Do you use olive oil regularly?', required: true },
    { id: 'quantidade_azeite', type: 'text', title: 'In what approximate amount per meal?', condition: { id: 'azeite', value: 'Yes' }, required: true },
    
    { id: 'oleo_coco', type: 'yes_no', title: 'Do you use coconut oil or coconut products?', required: true },
    { id: 'frequencia_oleo_coco', type: 'text', title: 'How often?', condition: { id: 'oleo_coco', value: 'Yes' }, required: true },
    
    { id: 'frituras', type: 'yes_no', title: 'Do you eat fried foods?', required: true },
    { id: 'frequencia_frituras', type: 'text', title: 'How often per week or per day?', condition: { id: 'frituras', value: 'Yes' }, required: true },
    { id: 'alimentos_frituras', type: 'text', title: 'Which foods?', condition: { id: 'frituras', value: 'Yes' }, required: true },
    
    // 6. Cheat Meals
    {
      id: 'section6_header',
      type: 'welcome',
      title: '6. Cheat Meals',
      description: 'Information about your preferences for cheat meals.',
      buttonText: 'Continue'
    },
    { id: 'refeicoes_livres', type: 'yes_no', title: 'Do you have cheat meals?', required: true },
    { id: 'frequencia_refeicoes_livres', type: 'text', title: 'How often per week?', condition: { id: 'refeicoes_livres', value: 'Yes' }, required: true },
    { id: 'dia_refeicao_livre', type: 'text', title: 'On which day do you usually have it?', condition: { id: 'refeicoes_livres', value: 'Yes' }, required: true },
    { id: 'preferencia_refeicao_livre', type: 'textarea', title: 'What do you like to eat during these meals?', condition: { id: 'refeicoes_livres', value: 'Yes' }, required: true },
    { 
      id: 'preferencia_agendamento', 
      type: 'multiple_choice', 
      title: 'Do you prefer to have your cheat meal scheduled or decide in the moment?',
      options: ['Scheduled', 'Decide in the moment'],
      required: true 
    },
    
    // 7. Macronutrients and Meal Composition
    {
      id: 'section7_header',
      type: 'welcome',
      title: '7. Macronutrients and Meal Composition',
      description: 'Information about how you organize your macronutrients.',
      buttonText: 'Continue'
    },
    { id: 'proteina_refeicoes', type: 'yes_no', title: 'Do you include a protein source in all meals?', required: true },
    { id: 'fontes_proteina', type: 'textarea', title: 'What are your main sources?', condition: { id: 'proteina_refeicoes', value: 'Yes' }, required: true },
    
    { id: 'gorduras_boas', type: 'yes_no', title: 'Do you consume healthy fat sources?', required: true },
    { id: 'quais_gorduras_boas', type: 'textarea', title: 'Which ones (avocado, nuts, olive oil, egg yolk, coconut oil, etc.)', condition: { id: 'gorduras_boas', value: 'Yes' }, required: true },
    
    { id: 'carboidratos_frequentes', type: 'textarea', title: 'Which carbohydrates do you consume most frequently? Do you prefer whole grains or refined?', required: true },
    
    { id: 'dieta_manipulacao_carbo', type: 'yes_no', title: 'Have you used a diet with carb manipulation (e.g., cycling)?', required: true },
    { id: 'modelo_dieta_carbo', type: 'text', title: 'Which model?', condition: { id: 'dieta_manipulacao_carbo', value: 'Yes' }, required: true },
    
    { 
      id: 'preferencia_ciclo_carbo', 
      type: 'multiple_choice', 
      title: 'Would you like to include carb cycling or maintain a linear pattern?',
      options: ['Carb cycling', 'Linear pattern'],
      required: true 
    },
    
    // 8. Training and Lifestyle
    {
      id: 'section8_header',
      type: 'welcome',
      title: '8. Training and Lifestyle',
      description: 'Information about your physical activities and routine.',
      buttonText: 'Continue'
    },
    { id: 'pratica_atividade', type: 'yes_no', title: 'Do you engage in physical activity?', required: true },
    { id: 'modalidade_atividade', type: 'text', title: 'Which modality?', condition: { id: 'pratica_atividade', value: 'Yes' }, required: true },
    { id: 'frequencia_atividade', type: 'text', title: 'Weekly frequency?', condition: { id: 'pratica_atividade', value: 'Yes' }, required: true },
    { id: 'horario_atividade', type: 'text', title: 'Usual training time?', condition: { id: 'pratica_atividade', value: 'Yes' }, required: true },
    { id: 'tipo_treino', type: 'text', title: 'Type of training (e.g., weight lifting, running, functional...)', condition: { id: 'pratica_atividade', value: 'Yes' }, required: true },
    { 
      id: 'nivel_treino', 
      type: 'multiple_choice', 
      title: 'Level:',
      options: ['Beginner', 'Intermediate', 'Advanced'],
      condition: { id: 'pratica_atividade', value: 'Yes' },
      required: true 
    },
    
    { id: 'faz_cardio', type: 'yes_no', title: 'Do you do cardio?', required: true },
    { id: 'detalhes_cardio', type: 'text', title: 'What type and how often?', condition: { id: 'faz_cardio', value: 'Yes' }, required: true },
    
    { id: 'preferencia_alimentar_treino', type: 'yes_no', title: 'Do you have food preferences for pre and post-workout?', required: true },
    { id: 'detalhes_alimentar_treino', type: 'textarea', title: 'What do you like or usually consume?', condition: { id: 'preferencia_alimentar_treino', value: 'Yes' }, required: true },
    
    { id: 'usa_suplementos', type: 'yes_no', title: 'Do you use any supplements?', required: true },
    { id: 'quais_suplementos', type: 'textarea', title: 'Which ones?', condition: { id: 'usa_suplementos', value: 'Yes' }, required: true },
    
    // 9. Sleep and Stress
    {
      id: 'section9_header',
      type: 'welcome',
      title: '9. Sleep and Stress',
      description: 'Information about your sleep and stress levels.',
      buttonText: 'Continue'
    },
    { id: 'horas_sono', type: 'text', title: 'How many hours do you sleep per night?', required: true },
    { id: 'dificuldade_dormir', type: 'yes_no', title: 'Do you have difficulty falling asleep or wake up during the night?', required: true },
    { id: 'acorda_descansado', type: 'yes_no', title: 'Do you wake up feeling rested?', required: true },
    { id: 'estresse_elevado', type: 'yes_no', title: 'Are you in a period of high stress?', required: true },
    { id: 'estresse_afeta_alimentacao', type: 'yes_no', title: 'Does stress affect your eating or sleeping?', required: true },
    
    // 10. Final Considerations
    {
      id: 'section10_header',
      type: 'welcome',
      title: '10. Final Considerations',
      description: 'Last section for additional information.',
      buttonText: 'Continue'
    },
    { id: 'informacao_adicional', type: 'textarea', title: 'Is there any information you consider important that has not been addressed?', required: false },
    { 
      id: 'preferencia_plano', 
      type: 'multiple_choice', 
      title: 'Would you prefer a plan with more freedom or more detailed structure?',
      options: ['More freedom', 'More detailed structure', 'Balance between both'],
      required: true 
    },
    { id: 'pesar_medir', type: 'yes_no', title: 'Are you willing to weigh and measure your food if necessary?', required: true },
    
    // Email and Conclusion
    {
      id: 'email',
      type: 'email',
      title: 'Please provide your email to receive your personalized nutrition plan',
      required: true
    },
    {
      id: 'thankYou',
      type: 'thank_you',
      title: 'Thank you for completing the questionnaire!',
      description: 'We will analyze your responses and send your personalized nutrition plan soon.'
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
      setClientEmail(answer as string);
    }

    // Find the current question
    const currentQ = questions.find(q => q.id === questionId);
    
    // If it's a yes/no question
    if (currentQ?.type === 'yes_no') {
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

  const generatePDFAndSendEmail = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    console.log('Starting AI diet plan generation and notification...');
    
    try {
      // Step 1: Generate AI Diet Plan
      console.log('Generating personalized diet plan...');
      const dietGenerator = new DietPlanGenerator();
      const dietPlan = dietGenerator.generatePlan(answers);
      
      // Step 2: Save draft for Dr. Jackie's review
      console.log('Saving diet plan for Dr. Jackie review...');
      const storage = new DietPlanStorage();
      storage.saveDraftPlan({
        ...dietPlan,
        clientProfile: {
          ...dietPlan.clientProfile,
          email: clientEmail || ''
        }
      });
      
      console.log(`Diet plan saved for client: ${dietPlan.clientProfile.name}`);
      
      // Step 3: Send notification to Dr. Jackie
      console.log('Building notification email for Dr. Jackie...');
      const notificationBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10b981;">🍎 New Diet Plan Ready for Review</h1>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
            <h2 style="margin: 0; color: #1f2937;">Client Information</h2>
            <p><strong>Name:</strong> ${dietPlan.clientProfile.name}</p>
            <p><strong>Email:</strong> ${clientEmail}</p>
            <p><strong>Goal:</strong> ${dietPlan.clientProfile.mainGoal}</p>
            <p><strong>Age:</strong> ${dietPlan.clientProfile.age} years</p>
            <p><strong>Weight:</strong> ${dietPlan.clientProfile.weight} kg</p>
            <p><strong>Activity Level:</strong> ${dietPlan.clientProfile.activityLevel}</p>
          </div>
          
          ${dietPlan.clientProfile.intolerances ? `
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0;">
            <h3 style="margin: 0; color: #dc2626;">⚠️ Important: Food Intolerances</h3>
            <p style="color: #dc2626; font-weight: bold;">${dietPlan.clientProfile.intolerances}</p>
          </div>
          ` : ''}
          
          ${dietPlan.clientProfile.healthConditions ? `
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
            <h3 style="margin: 0; color: #d97706;">🏥 Health Conditions</h3>
            <p style="color: #d97706;">${dietPlan.clientProfile.healthConditions}</p>
          </div>
          ` : ''}
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #374151;">📊 Generated Plan Summary</h3>
            <ul style="color: #6b7280;">
              <li><strong>Daily Calories:</strong> ${dietPlan.plan[0]?.totalCalories || 'N/A'} kcal</li>
              <li><strong>Protein:</strong> ${dietPlan.plan[0]?.macros.protein || 'N/A'}g daily</li>
              <li><strong>Carbs:</strong> ${dietPlan.plan[0]?.macros.carbs || 'N/A'}g daily</li>
              <li><strong>Fats:</strong> ${dietPlan.plan[0]?.macros.fats || 'N/A'}g daily</li>
              <li><strong>Plan Duration:</strong> 30 days</li>
              <li><strong>Guidelines:</strong> ${dietPlan.guidelines.length} personalized tips</li>
            </ul>
          </div>
          
          <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #065f46;">🍽️ Sample Meals (First 3 Days)</h3>
            ${dietPlan.plan.slice(0, 3).map(day => `
              <div style="margin-bottom: 16px; padding: 12px; background-color: white; border-radius: 6px; border: 1px solid #d1fae5;">
                <h4 style="color: #047857; margin: 0 0 8px 0;">Day ${day.day}</h4>
                <ul style="margin: 0; padding-left: 20px; color: #374151;">
                  <li><strong>Breakfast:</strong> ${day.meals.breakfast.name}</li>
                  <li><strong>Lunch:</strong> ${day.meals.lunch.name}</li>
                  <li><strong>Dinner:</strong> ${day.meals.dinner.name}</li>
                  ${day.meals.snack1 ? `<li><strong>Snack:</strong> ${day.meals.snack1.name}</li>` : ''}
                </ul>
              </div>
            `).join('')}
          </div>
          
          <div style="background-color: #dbeafe; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
            <h3 style="color: #1e40af; margin: 0 0 10px 0;">👩‍⚕️ Action Required</h3>
            <p style="color: #1e40af; margin: 0 0 15px 0;">Please review and approve this diet plan</p>
            <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://jackiesouto.com'}/admin/diet-plans" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Review Diet Plan →
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 14px; text-align: center;">
            Generated by Jackie Platform AI Diet System<br>
            Plan ID: ${dietPlan.id}
          </p>
        </div>
      `;

      // Step 4: Send notification to Dr. Jackie
      const templateParams: EmailParams = {
        to_email: 'jacksouto7@gmail.com',
        client_name: dietPlan.clientProfile.name,
        client_email: clientEmail || 'N/A',
        email_body: notificationBody
      };

      console.log('Sending notification email to Dr. Jackie...');
      const response = await emailjs.send(
        'service_28v1fvr',   // Service ID
        'template_wj6zu2c',  // Template ID
        templateParams,
        'ezbPPmM_lDMistyGT' // Public Key
      );
      console.log('EmailJS response:', response);

      setEmailSent(true);
      console.log('✅ AI Diet plan generated and Dr. Jackie notified successfully!');
      
    } catch (error) {
      console.error('❌ Error in AI diet generation:', error);
      alert('Failed to generate diet plan. Please check the console for details and try again.');
    } finally {
      setIsLoading(false);
      console.log('Process completed, loading state reset');
    }
  }, [answers, clientEmail]);

  useEffect(() => {
    if (formCompleted) {
      generatePDFAndSendEmail();
    }
  }, [formCompleted, generatePDFAndSendEmail]);

  const renderQuestion = () => {
    const currentQ = questions[currentQuestion];

    const handleKeyPress = (e: React.KeyboardEvent, value?: string | string[] | number) => {
      if (e.key === 'Enter' && (value || !currentQ.required)) {
        handleAnswer(currentQ.id, value || '');
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

    if (currentQ.type === 'welcome') {
      return (
        <div className="question-card welcome">
          <h1>{currentQ.title}</h1>
          <p>{currentQ.description}</p>
          <button 
            className="typeform-btn"
            onClick={() => setCurrentQuestion(getNextQuestion(currentQuestion))}
          >
            {currentQ.buttonText}
          </button>
        </div>
      );
    }

    if (currentQ.type === 'thank_you') {
      return (
        <div className="question-card thank-you">
          <h1>{currentQ.title}</h1>
          <p>{currentQ.description}</p>
          {isLoading && <p className="processing">Processing your responses...</p>}
          {emailSent && <p className="success">Successfully submitted! Check your email soon.</p>}
        </div>
      );
    }

    return (
      <div className="question-card" ref={formRef}>
        <h2>{currentQ.title}</h2>
        {currentQ.description && <p className="description">{currentQ.description}</p>}

        {['text', 'number', 'email'].includes(currentQ.type) && (
          <div className="input-group">
            <input
              type={currentQ.type as 'text' | 'number' | 'email'}
              placeholder="Type your answer..."
              value={answers[currentQ.id] as string || ''}
              onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
              onKeyPress={(e) => handleKeyPress(e, answers[currentQ.id])}
              required={currentQ.required}
              autoFocus
            />
            <div className="button-group">
              {currentQuestion > 0 && (
                <button 
                  className="typeform-btn back-btn"
                  onClick={handleBack}
                >
                  Back
                </button>
              )}
              <button 
                className="typeform-btn"
                onClick={() => handleAnswer(currentQ.id, answers[currentQ.id] || '')}
                disabled={currentQ.required && !answers[currentQ.id]}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentQ.type === 'textarea' && (
          <div className="input-group">
            <textarea
              placeholder="Type your answer..."
              value={answers[currentQ.id] as string || ''}
              onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
              onKeyPress={(e) => handleKeyPress(e, answers[currentQ.id])}
              required={currentQ.required}
              autoFocus
            />
            <div className="button-group">
              {currentQuestion > 0 && (
                <button 
                  className="typeform-btn back-btn"
                  onClick={handleBack}
                >
                  Back
                </button>
              )}
              <button 
                className="typeform-btn"
                onClick={() => handleAnswer(currentQ.id, answers[currentQ.id] || '')}
                disabled={currentQ.required && !answers[currentQ.id]}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentQ.type === 'yes_no' && (
          <div className="input-group">
            <div className="options-group">
              <button
                className={`typeform-option ${answers[currentQ.id] === 'Yes' ? 'selected' : ''}`}
                onClick={() => handleAnswer(currentQ.id, 'Yes')}
              >
                Yes
              </button>
              <button
                className={`typeform-option ${answers[currentQ.id] === 'No' ? 'selected' : ''}`}
                onClick={() => handleAnswer(currentQ.id, 'No')}
              >
                No
              </button>
            </div>
            <div className="button-group">
              {currentQuestion > 0 && (
                <button 
                  className="typeform-btn back-btn"
                  onClick={handleBack}
                >
                  Back
                </button>
              )}
            </div>
          </div>
        )}

        {currentQ.type === 'multiple_choice' && 'options' in currentQ && (
          <div className="input-group">
            <div className="options-group">
              {currentQ.options.map((option) => (
                <button
                  key={option}
                  className={`typeform-option ${answers[currentQ.id] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswer(currentQ.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="button-group">
              {currentQuestion > 0 && (
                <button 
                  className="typeform-btn back-btn"
                  onClick={handleBack}
                >
                  Back
                </button>
              )}
            </div>
          </div>
        )}

        {currentQ.type === 'multiple_select' && 'options' in currentQ && (
          <div className="options-group">
            {currentQ.options.map((option) => (
              <button
                key={option}
                className={`typeform-option ${
                  (answers[currentQ.id] as string[])?.includes(option) ? 'selected' : ''
                }`}
                onClick={() => {
                  const currentSelection = (answers[currentQ.id] as string[]) || [];
                  const newSelection = currentSelection.includes(option)
                    ? currentSelection.filter(item => item !== option)
                    : [...currentSelection, option];
                  setAnswers(prev => ({ ...prev, [currentQ.id]: newSelection }));
                }}
              >
                {option}
              </button>
            ))}
            <div className="button-group">
              {currentQuestion > 0 && (
                <button 
                  className="typeform-btn back-btn"
                  onClick={handleBack}
                >
                  Back
                </button>
              )}
              <button
                className="typeform-btn"
                onClick={() => handleAnswer(currentQ.id, answers[currentQ.id] || [])}
                disabled={currentQ.required && (!answers[currentQ.id] || (answers[currentQ.id] as string[]).length === 0)}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentQ.type === 'checkbox' && 'options' in currentQ && (
          <div className="input-group">
            <div className="options-group">
              {currentQ.options.map((option) => (
                <button
                  key={option}
                  className={`typeform-option ${
                    (answers[currentQ.id] as string[])?.includes(option) ? 'selected' : ''
                  }`}
                  onClick={() => {
                    const currentSelection = (answers[currentQ.id] as string[]) || [];
                    const newSelection = currentSelection.includes(option)
                      ? currentSelection.filter(item => item !== option)
                      : [...currentSelection, option];
                    setAnswers(prev => ({ ...prev, [currentQ.id]: newSelection }));
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="button-group">
              <div className="button-left">
                {currentQuestion > 0 && (
                  <button 
                    className="typeform-btn back-btn"
                    onClick={handleBack}
                  >
                    Back
                  </button>
                )}
              </div>
              <div className="button-right">
                <button
                  className="typeform-btn"
                  onClick={() => handleAnswer(currentQ.id, answers[currentQ.id] || [])}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
      <div 
        className="progress-timeline"
        style={{ '--timeline-progress': `${timelineProgress}%` } as React.CSSProperties}
      >
        <div className="timeline-header">
          <h3>Your Progress</h3>
          <p>Track your form completion</p>
        </div>
        
        <div className="timeline-container">
          <div className="timeline-line"></div>
          <div className="timeline-items">
            {timelineSteps.map((step, index) => {
              const isCompleted = index < Math.floor(currentQuestion / (totalQuestions / timelineSteps.length));
              const isCurrent = index === Math.floor(currentQuestion / (totalQuestions / timelineSteps.length));
              
              return (
                <div 
                  key={step.id} 
                  className={`timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="question-stats">
          <div className="stat-item">
            <span className="stat-number">{answeredQuestions}</span>
            <span className="stat-label">Answered</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{totalQuestions - answeredQuestions}</span>
            <span className="stat-label">Remaining</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{Math.round((answeredQuestions / totalQuestions) * 100)}%</span>
            <span className="stat-label">Complete</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="nutrition-form-container">
      <div className="form-content-wrapper">
        {/* Progress bar at top */}
        {currentQuestion > 1 && !isLoading && !emailSent && (
          <div className="progress-bar">
            <div
              className="progress"
              style={{
                width: `${((currentQuestion - 1) / (questions.length - 1)) * 100}%`,
              }}
            ></div>
          </div>
        )}
        
        {/* Main question card - centered */}
        <div className="question-card">
          {renderQuestion()}
        </div>
        
        {/* Progress timeline below */}
        {renderProgressTimeline()}
      </div>
    </div>
  );
};

export default NutritionUSA;

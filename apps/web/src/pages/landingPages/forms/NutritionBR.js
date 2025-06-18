// NutritionForm.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import emailjs from '@emailjs/browser';
import './Forms.css';

const NutritionBR = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [formCompleted, setFormCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const formRef = useRef();

  const questions = useMemo(() => [
    {
      id: 'welcome',
      type: 'welcome',
      title: 'Questionário Nutricional Profissional',
      description: 'Versão Inteligente com Lógica Ramificada',
      buttonText: 'Começar'
    },
    
    // 1. Dados Iniciais
    {
      id: 'section1_header',
      type: 'welcome',
      title: '1. Dados Iniciais',
      description: 'Vamos começar com algumas informações básicas sobre você.',
      buttonText: 'Continuar'
    },
    { id: 'nome_completo', type: 'text', title: 'Nome completo:', required: true },
    { id: 'idade', type: 'number', title: 'Idade:', required: true },
    { id: 'altura', type: 'number', title: 'Altura (cm):', required: true },
    { id: 'peso', type: 'number', title: 'Peso atual (kg):', required: true },
    { id: 'acompanhamento_anterior', type: 'yes_no', title: 'Já realizou acompanhamento com nutricionista ou personal trainer?', required: true },
    { id: 'tempo_acompanhamento', type: 'text', title: 'Por quanto tempo?', condition: { id: 'acompanhamento_anterior', value: 'Yes' }, required: true },
    { id: 'dieta_anterior', type: 'yes_no', title: 'Já fez dieta antes?', required: true },
    { id: 'tempo_seguiu_plano', type: 'text', title: 'Por quanto tempo conseguiu seguir o plano?', condition: { id: 'dieta_anterior', value: 'Yes' }, required: true },
    
    // 2. Objetivo e Histórico
    {
      id: 'section2_header',
      type: 'welcome',
      title: '2. Objetivo e Histórico',
      description: 'Vamos conhecer seus objetivos e histórico.',
      buttonText: 'Continuar'
    },
    { 
      id: 'objetivo_principal', 
      type: 'multiple_choice', 
      title: 'Qual é o seu objetivo principal?',
      options: ['Emagrecimento', 'Ganho de massa muscular', 'Recomposição corporal', 'Estética corporal (shape/definição)', 'Performance atlética', 'Reeducação alimentar'],
      required: true 
    },
    { id: 'meta_especifica', type: 'textarea', title: 'Tem meta de peso, percentual de gordura ou data específica para alcançar seu objetivo?', required: false },
    { id: 'competicoes', type: 'yes_no', title: 'Já participou ou pretende participar de competições (ex: fisiculturismo)?', required: true },
    { id: 'categoria_competicao', type: 'text', title: 'Qual categoria?', condition: { id: 'competicoes', value: 'Yes' }, required: true },
    { id: 'data_competicao', type: 'text', title: 'Quando foi ou será a competição?', condition: { id: 'competicoes', value: 'Yes' }, required: true },
    
    // 3. Saúde e Digestão
    {
      id: 'section3_header',
      type: 'welcome',
      title: '3. Saúde e Digestão',
      description: 'Informações sobre sua saúde e sistema digestivo.',
      buttonText: 'Continuar'
    },
    { id: 'condicoes_saude', type: 'textarea', title: 'Possui alguma condição de saúde? (ex: SOP, hipotireoidismo, disbiose, gastrite, resistência à insulina, etc.)', required: false },
    { id: 'medicamentos', type: 'yes_no', title: 'Faz uso de medicamentos ou suplementos?', required: true },
    { id: 'quais_medicamentos', type: 'textarea', title: 'Quais? Doses? Horários?', condition: { id: 'medicamentos', value: 'Yes' }, required: true },
    { id: 'intolerancias', type: 'yes_no', title: 'Possui intolerâncias ou alergias alimentares?', required: true },
    { id: 'quais_intolerancias', type: 'textarea', title: 'Quais?', condition: { id: 'intolerancias', value: 'Yes' }, required: true },
    { id: 'dificuldade_digestao', type: 'yes_no', title: 'Tem dificuldade de digerir algum alimento?', required: true },
    { id: 'quais_dificuldade_digestao', type: 'textarea', title: 'Qual(is)?', condition: { id: 'dificuldade_digestao', value: 'Yes' }, required: true },
    
    // Sintomas digestivos
    { id: 'inchaço_abdominal', type: 'yes_no', title: 'Costuma apresentar inchaço abdominal?', required: true },
    { id: 'inchaço_detalhes', type: 'textarea', title: 'Em que horário e após quais alimentos?', condition: { id: 'inchaço_abdominal', value: 'Yes' }, required: true },
    
    { id: 'azia', type: 'yes_no', title: 'Costuma apresentar azia?', required: true },
    { id: 'azia_detalhes', type: 'textarea', title: 'Frequência e situações em que ocorre?', condition: { id: 'azia', value: 'Yes' }, required: true },
    
    { id: 'gases', type: 'yes_no', title: 'Costuma apresentar gases/arrotos?', required: true },
    { id: 'gases_detalhes', type: 'textarea', title: 'Em que momentos do dia?', condition: { id: 'gases', value: 'Yes' }, required: true },
    
    { id: 'desconforto_refeicoes', type: 'yes_no', title: 'Costuma apresentar desconforto após refeições?', required: true },
    { id: 'desconforto_detalhes', type: 'textarea', title: 'Com que frequência e após quais tipos de refeições?', condition: { id: 'desconforto_refeicoes', value: 'Yes' }, required: true },
    
    { id: 'sonolencia_refeicoes', type: 'yes_no', title: 'Sente sonolência após as refeições?', required: true },
    { id: 'sonolencia_detalhes', type: 'textarea', title: 'Em quais refeições e com que frequência?', condition: { id: 'sonolencia_refeicoes', value: 'Yes' }, required: true },
    
    { id: 'queda_energia', type: 'yes_no', title: 'Sente falta de energia ou queda de rendimento físico/cognitivo após comer?', required: true },
    { id: 'queda_energia_detalhes', type: 'textarea', title: 'Após quais refeições ou tipos de alimentos?', condition: { id: 'queda_energia', value: 'Yes' }, required: true },
    
    { id: 'exames_recentes', type: 'yes_no', title: 'Já realizou exames laboratoriais recentes?', required: true },
    { id: 'exames_resultados', type: 'textarea', title: 'Pode compartilhar os resultados principais?', condition: { id: 'exames_recentes', value: 'Yes' }, required: true },
    
    // 4. Comportamento e Rotina Alimentar
    {
      id: 'section4_header',
      type: 'welcome',
      title: '4. Comportamento e Rotina Alimentar',
      description: 'Informações sobre seus hábitos alimentares diários.',
      buttonText: 'Continuar'
    },
    { id: 'quantidade_refeicoes', type: 'text', title: 'Quantas refeições costuma fazer por dia?', required: true },
    { id: 'refeicoes_frequentes', type: 'textarea', title: 'Quais refeições realiza com mais frequência?', required: true },
    { id: 'horarios_fixos', type: 'yes_no', title: 'Tem horários fixos para comer?', required: true },
    { id: 'quais_horarios', type: 'textarea', title: 'Quais?', condition: { id: 'horarios_fixos', value: 'Yes' }, required: true },
    
    { id: 'pula_refeicoes', type: 'yes_no', title: 'Costuma pular refeições?', required: true },
    { id: 'quais_pula_refeicoes', type: 'textarea', title: 'Quais refeições costuma pular e por quê?', condition: { id: 'pula_refeicoes', value: 'Yes' }, required: true },
    
    { id: 'faz_jejum', type: 'yes_no', title: 'Costuma fazer jejum?', required: true },
    { id: 'detalhes_jejum', type: 'textarea', title: 'Qual tipo? Quantas horas? Com que frequência?', condition: { id: 'faz_jejum', value: 'Yes' }, required: true },
    
    { id: 'horario_fome', type: 'text', title: 'Em qual horário sente mais fome?', required: true },
    
    { id: 'belisca', type: 'yes_no', title: 'Belisca entre refeições?', required: true },
    { id: 'detalhes_beliscar', type: 'textarea', title: 'O quê? Com que frequência?', condition: { id: 'belisca', value: 'Yes' }, required: true },
    
    { id: 'compulsao', type: 'yes_no', title: 'Tem episódios de compulsão alimentar?', required: true },
    { id: 'detalhes_compulsao', type: 'textarea', title: 'Em quais momentos e com quais alimentos?', condition: { id: 'compulsao', value: 'Yes' }, required: true },
    
    { id: 'fome_emocional', type: 'yes_no', title: 'Tem episódios de fome emocional?', required: true },
    { id: 'detalhes_fome_emocional', type: 'textarea', title: 'Com que frequência e em que contexto?', condition: { id: 'fome_emocional', value: 'Yes' }, required: true },
    
    { id: 'bebe_refeicoes', type: 'yes_no', title: 'Costuma beber líquidos durante as refeições?', required: true },
    { id: 'detalhes_bebe_refeicoes', type: 'textarea', title: 'Quais? Em que quantidade?', condition: { id: 'bebe_refeicoes', value: 'Yes' }, required: true },
    
    { id: 'bebidas_adocadas', type: 'yes_no', title: 'Costuma consumir bebidas adoçadas como sucos, refrigerantes ou energéticos?', required: true },
    { id: 'quais_bebidas_adocadas', type: 'textarea', title: 'Quais bebidas específicas?', condition: { id: 'bebidas_adocadas', value: 'Yes' }, required: true },
    { id: 'frequencia_bebidas_adocadas', type: 'text', title: 'Com que frequência por semana?', condition: { id: 'bebidas_adocadas', value: 'Yes' }, required: true },
    { id: 'quantidade_bebidas_adocadas', type: 'text', title: 'Em que quantidade (ml ou latas)?', condition: { id: 'bebidas_adocadas', value: 'Yes' }, required: true },
    
    { id: 'bebidas_zero', type: 'yes_no', title: 'Costuma consumir bebidas zero calorias (refrigerante zero, chás adoçados com estévia, etc.)?', required: true },
    { id: 'detalhes_bebidas_zero', type: 'textarea', title: 'Quais e com que frequência?', condition: { id: 'bebidas_zero', value: 'Yes' }, required: true },
    
    { id: 'cafe', type: 'yes_no', title: 'Costuma consumir café?', required: true },
    { id: 'frequencia_cafe', type: 'text', title: 'Quantas vezes por dia?', condition: { id: 'cafe', value: 'Yes' }, required: true },
    { id: 'quantidade_cafe', type: 'text', title: 'Quantidade por vez (ml ou xícara)?', condition: { id: 'cafe', value: 'Yes' }, required: true },
    { id: 'tipo_cafe', type: 'text', title: 'Com açúcar, adoçante, leite ou puro?', condition: { id: 'cafe', value: 'Yes' }, required: true },
    
    { id: 'estimulantes', type: 'yes_no', title: 'Usa outros estimulantes (pré-treinos, termogênicos, energéticos)?', required: true },
    { id: 'detalhes_estimulantes', type: 'textarea', title: 'Quais? Em que horário?', condition: { id: 'estimulantes', value: 'Yes' }, required: true },
    
    { id: 'alcool', type: 'yes_no', title: 'Consome álcool?', required: true },
    { id: 'frequencia_alcool', type: 'text', title: 'Com que frequência?', condition: { id: 'alcool', value: 'Yes' }, required: true },
    { id: 'quantidade_alcool', type: 'text', title: 'Em que quantidade (taças, latas, copos)?', condition: { id: 'alcool', value: 'Yes' }, required: true },
    { id: 'tipo_alcool', type: 'text', title: 'Quais marcas e tipos? (vinho, cerveja, gin, destilados, etc.)', condition: { id: 'alcool', value: 'Yes' }, required: true },
    
    { id: 'cigarro', type: 'yes_no', title: 'Fuma cigarro comum?', required: true },
    { id: 'detalhes_cigarro', type: 'text', title: 'Há quanto tempo? Quantos por dia?', condition: { id: 'cigarro', value: 'Yes' }, required: true },
    
    { id: 'vape', type: 'yes_no', title: 'Usa cigarro eletrônico (vape)?', required: true },
    { id: 'detalhes_vape', type: 'text', title: 'Com que frequência? Há quanto tempo?', condition: { id: 'vape', value: 'Yes' }, required: true },
    
    { id: 'charuto', type: 'yes_no', title: 'Usa charuto?', required: true },
    { id: 'detalhes_charuto', type: 'text', title: 'Com que frequência? Há quanto tempo?', condition: { id: 'charuto', value: 'Yes' }, required: true },
    
    // 5. Preferências e Rejeições Alimentares
    {
      id: 'section5_header',
      type: 'welcome',
      title: '5. Preferências e Rejeições Alimentares',
      description: 'Vamos entender seus gostos e preferências alimentares.',
      buttonText: 'Continuar'
    },
    { id: 'alimentos_gosta', type: 'textarea', title: 'Quais alimentos você gosta muito e gostaria de manter na dieta?', required: true },
    { id: 'alimentos_evita', type: 'textarea', title: 'Quais alimentos você evita ou não tolera (por sabor, textura ou ideologia)?', required: true },
    { id: 'cafe_manha_preferencia', type: 'text', title: 'Gosta de café da manhã doce ou salgado?', required: true },
    { id: 'frutas_vegetais_preferidos', type: 'textarea', title: 'Quais frutas e vegetais você prefere?', required: true },
    { id: 'aversao_texturas', type: 'textarea', title: 'Tem aversão a alguma textura ou sabor (ex: hortelã, coco, coentro, gengibre)?', required: false },
    
    { id: 'paladar_alterado', type: 'yes_no', title: 'Costuma sentir o paladar alterado, boca seca ou gosto amargo com frequência?', required: true },
    { id: 'detalhes_paladar_alterado', type: 'text', title: 'Em que situações?', condition: { id: 'paladar_alterado', value: 'Yes' }, required: true },
    
    { 
      id: 'nivel_apetite', 
      type: 'multiple_choice', 
      title: 'Considera seu apetite:',
      options: ['Baixo', 'Normal', 'Muito alto'],
      required: true 
    },
    
    { id: 'consome_ovo', type: 'yes_no', title: 'Costuma consumir ovo?', required: true },
    { id: 'consome_peixe', type: 'yes_no', title: 'Costuma consumir peixe?', required: true },
    { id: 'consome_carne_vermelha', type: 'yes_no', title: 'Costuma consumir carne vermelha?', required: true },
    { id: 'consome_tofu', type: 'yes_no', title: 'Costuma consumir tofu ou proteína vegetal?', required: true },
    { id: 'consome_leite', type: 'yes_no', title: 'Costuma consumir leite e derivados?', required: true },
    
    { id: 'preferencia_carne', type: 'yes_no', title: 'Tem preferência por algum tipo específico de carne?', required: true },
    { id: 'tipo_carne_preferido', type: 'text', title: 'Qual?', condition: { id: 'preferencia_carne', value: 'Yes' }, required: true },
    
    { id: 'dificuldade_carne_vermelha', type: 'yes_no', title: 'Tem dificuldade para digerir carne vermelha?', required: true },
    
    { id: 'gordura_cozinhar', type: 'text', title: 'Costuma usar qual tipo de gordura para cozinhar? (azeite, manteiga, óleo de soja, banha, óleo de coco, etc.)', required: true },
    
    { id: 'azeite', type: 'yes_no', title: 'Usa azeite de oliva regularmente?', required: true },
    { id: 'quantidade_azeite', type: 'text', title: 'Em qual quantidade aproximada por refeição?', condition: { id: 'azeite', value: 'Yes' }, required: true },
    
    { id: 'oleo_coco', type: 'yes_no', title: 'Usa óleo de coco ou produtos com coco?', required: true },
    { id: 'frequencia_oleo_coco', type: 'text', title: 'Com que frequência?', condition: { id: 'oleo_coco', value: 'Yes' }, required: true },
    
    { id: 'frituras', type: 'yes_no', title: 'Consome frituras?', required: true },
    { id: 'frequencia_frituras', type: 'text', title: 'Com que frequência por semana ou por dia?', condition: { id: 'frituras', value: 'Yes' }, required: true },
    { id: 'alimentos_frituras', type: 'text', title: 'Quais alimentos?', condition: { id: 'frituras', value: 'Yes' }, required: true },
    
    // 6. Refeições Livres
    {
      id: 'section6_header',
      type: 'welcome',
      title: '6. Refeições Livres',
      description: 'Informações sobre suas preferências para refeições livres.',
      buttonText: 'Continuar'
    },
    { id: 'refeicoes_livres', type: 'yes_no', title: 'Costuma fazer refeições livres?', required: true },
    { id: 'frequencia_refeicoes_livres', type: 'text', title: 'Com que frequência por semana?', condition: { id: 'refeicoes_livres', value: 'Yes' }, required: true },
    { id: 'dia_refeicao_livre', type: 'text', title: 'Em qual dia costuma fazer?', condition: { id: 'refeicoes_livres', value: 'Yes' }, required: true },
    { id: 'preferencia_refeicao_livre', type: 'textarea', title: 'O que mais gosta de comer nessas refeições?', condition: { id: 'refeicoes_livres', value: 'Yes' }, required: true },
    { 
      id: 'preferencia_agendamento', 
      type: 'multiple_choice', 
      title: 'Gosta que eu deixe a refeição livre agendada ou prefere decidir no momento?',
      options: ['Agendada', 'Decidir no momento'],
      required: true 
    },
    
    // 7. Macronutrientes e Composição das Refeições
    {
      id: 'section7_header',
      type: 'welcome',
      title: '7. Macronutrientes e Composição das Refeições',
      description: 'Informações sobre como você organiza seus macronutrientes.',
      buttonText: 'Continuar'
    },
    { id: 'proteina_refeicoes', type: 'yes_no', title: 'Costuma incluir fonte de proteína em todas as refeições?', required: true },
    { id: 'fontes_proteina', type: 'textarea', title: 'Quais são as principais fontes?', condition: { id: 'proteina_refeicoes', value: 'Yes' }, required: true },
    
    { id: 'gorduras_boas', type: 'yes_no', title: 'Consome fontes de gordura boas?', required: true },
    { id: 'quais_gorduras_boas', type: 'textarea', title: 'Quais (abacate, castanhas, azeite, gema, óleo de coco, etc.)', condition: { id: 'gorduras_boas', value: 'Yes' }, required: true },
    
    { id: 'carboidratos_frequentes', type: 'textarea', title: 'Quais carboidratos você consome com mais frequência? Prefere integrais ou refinados?', required: true },
    
    { id: 'dieta_manipulacao_carbo', type: 'yes_no', title: 'Já usou dieta com manipulação de carboidratos (ex: ciclo)?', required: true },
    { id: 'modelo_dieta_carbo', type: 'text', title: 'Qual modelo?', condition: { id: 'dieta_manipulacao_carbo', value: 'Yes' }, required: true },
    
    { 
      id: 'preferencia_ciclo_carbo', 
      type: 'multiple_choice', 
      title: 'Deseja incluir ciclo de carboidratos ou manter padrão linear?',
      options: ['Ciclo de carboidratos', 'Padrão linear'],
      required: true 
    },
    
    // 8. Treino e Estilo de Vida
    {
      id: 'section8_header',
      type: 'welcome',
      title: '8. Treino e Estilo de Vida',
      description: 'Informações sobre suas atividades físicas e rotina.',
      buttonText: 'Continuar'
    },
    { id: 'pratica_atividade', type: 'yes_no', title: 'Pratica atividade física?', required: true },
    { id: 'modalidade_atividade', type: 'text', title: 'Qual modalidade?', condition: { id: 'pratica_atividade', value: 'Yes' }, required: true },
    { id: 'frequencia_atividade', type: 'text', title: 'Frequência semanal?', condition: { id: 'pratica_atividade', value: 'Yes' }, required: true },
    { id: 'horario_atividade', type: 'text', title: 'Horário habitual dos treinos?', condition: { id: 'pratica_atividade', value: 'Yes' }, required: true },
    { id: 'tipo_treino', type: 'text', title: 'Tipo de treino (ex: musculação, corrida, funcional…)', condition: { id: 'pratica_atividade', value: 'Yes' }, required: true },
    { 
      id: 'nivel_treino', 
      type: 'multiple_choice', 
      title: 'Nível:',
      options: ['Iniciante', 'Intermediário', 'Avançado'],
      condition: { id: 'pratica_atividade', value: 'Yes' },
      required: true 
    },
    
    { id: 'faz_cardio', type: 'yes_no', title: 'Faz cardio?', required: true },
    { id: 'detalhes_cardio', type: 'text', title: 'Qual tipo e com que frequência?', condition: { id: 'faz_cardio', value: 'Yes' }, required: true },
    
    { id: 'preferencia_alimentar_treino', type: 'yes_no', title: 'Tem preferência alimentar para o pré e pós-treino?', required: true },
    { id: 'detalhes_alimentar_treino', type: 'textarea', title: 'O que gosta ou costuma consumir?', condition: { id: 'preferencia_alimentar_treino', value: 'Yes' }, required: true },
    
    { id: 'usa_suplementos', type: 'yes_no', title: 'Utiliza algum suplemento?', required: true },
    { id: 'quais_suplementos', type: 'textarea', title: 'Quais?', condition: { id: 'usa_suplementos', value: 'Yes' }, required: true },
    
    // 9. Sono e Estresse
    {
      id: 'section9_header',
      type: 'welcome',
      title: '9. Sono e Estresse',
      description: 'Informações sobre seu sono e níveis de estresse.',
      buttonText: 'Continuar'
    },
    { id: 'horas_sono', type: 'text', title: 'Quantas horas dorme por noite?', required: true },
    { id: 'dificuldade_dormir', type: 'yes_no', title: 'Tem dificuldade para dormir ou acorda durante a noite?', required: true },
    { id: 'acorda_descansado', type: 'yes_no', title: 'Acorda descansado(a)?', required: true },
    { id: 'estresse_elevado', type: 'yes_no', title: 'Está em um período de estresse elevado?', required: true },
    { id: 'estresse_afeta_alimentacao', type: 'yes_no', title: 'O estresse afeta sua alimentação ou sono?', required: true },
    
    // 10. Considerações Finais
    {
      id: 'section10_header',
      type: 'welcome',
      title: '10. Considerações Finais',
      description: 'Última seção para informações adicionais.',
      buttonText: 'Continuar'
    },
    { id: 'informacao_adicional', type: 'textarea', title: 'Existe alguma informação que você considera importante e ainda não foi abordada?', required: false },
    { 
      id: 'preferencia_plano', 
      type: 'multiple_choice', 
      title: 'Deseja um plano com mais liberdade ou mais rigor nos detalhes?',
      options: ['Mais liberdade', 'Mais rigor nos detalhes', 'Equilíbrio entre os dois'],
      required: true 
    },
    { id: 'pesar_medir', type: 'yes_no', title: 'Está disposto a pesar e medir os alimentos se necessário?', required: true },
    
    // Email e Conclusão
    {
      id: 'email',
      type: 'email',
      title: 'Por favor, forneça seu e-mail para receber seu plano nutricional personalizado',
      required: true
    },
    {
      id: 'thankYou',
      type: 'thank_you',
      title: 'Obrigado por completar o questionário!',
      description: 'Analisaremos suas respostas e enviaremos seu plano nutricional personalizado em breve.'
    }
  ], []);

  const shouldDisplayQuestion = useCallback((question) => {
    if (!question.condition) return true;
    const { id, value } = question.condition;
    return answers[id] === value;
  }, [answers]);

  const getNextQuestion = useCallback((currentIndex) => {
    for (let i = currentIndex + 1; i < questions.length; i++) {
      if (shouldDisplayQuestion(questions[i])) {
        return i;
      }
    }
    return questions.length - 1;
  }, [questions, shouldDisplayQuestion]);

  const handleAnswer = useCallback((questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    if (questionId === 'email') {
      setClientEmail(answer);
    }

    // Find the current question
    const currentQ = questions.find(q => q.id === questionId);
    
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

  const generatePDFAndSendEmail = useCallback(async () => {
    setIsLoading(true);
    console.log('Starting generatePDFAndSendEmail...');
    try {
      console.log('Building email body...');
      let emailBody = '<h1>Nutrition Assessment</h1>';
      emailBody += '<h2>Client Details</h2>';
      emailBody += `<p><strong>Name:</strong> ${answers.name || 'N/A'}</p>`;
      emailBody += `<p><strong>Age:</strong> ${answers.age || 'N/A'} years</p>`;
      emailBody += `<p><strong>Height:</strong> ${answers.height || 'N/A'} cm</p>`;
      emailBody += `<p><strong>Weight:</strong> ${answers.weight || 'N/A'} kg</p>`;
      emailBody += `<p><strong>Main Goal:</strong> ${answers.goal || 'N/A'}</p>`;
      emailBody += '<h2>Questionnaire Responses</h2>';
      questions.forEach((question) => {
        if (question.type === 'welcome' || question.type === 'thank_you' || 
            ['name', 'age', 'height', 'weight', 'goal', 'email'].includes(question.id)) {
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
          answerText = answerText.join(', ');
        }
        emailBody += `<p><strong>${question.title}</strong><br>${answerText}</p>`;
      });

      const templateParams = {
        to_email: 'jacksouto7@gmail.com',
        client_name: answers.name || 'Client',
        client_email: clientEmail || 'N/A',
        email_body: emailBody
      };
      console.log('Email params prepared:', templateParams);

      console.log('Sending email via EmailJS...');
      const response = await emailjs.send(
        'service_28v1fvr',   // Service ID
        'template_wj6zu2c',  // Template ID
        templateParams,
        'ezbPPmM_lDMistyGT' // Public Key
      );
      console.log('EmailJS response:', response);

      setEmailSent(true);
      console.log('Email sent successfully, state updated');
    } catch (error) {
      console.error('Error in generatePDFAndSendEmail:', error);
      alert('Failed to send email. Please check the console for details and try again.');
    } finally {
      setIsLoading(false);
      console.log('Process completed, loading state reset');
    }
  }, [answers, clientEmail, questions, shouldDisplayQuestion]);

  useEffect(() => {
    if (formCompleted) {
      generatePDFAndSendEmail();
    }
  }, [formCompleted, generatePDFAndSendEmail]);

  const renderQuestion = () => {
    const currentQ = questions[currentQuestion];

    const handleKeyPress = (e, value) => {
      if (e.key === 'Enter' && (value || !currentQ.required)) {
        handleAnswer(currentQ.id, value);
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
              type={currentQ.type}
              placeholder="Type your answer..."
              value={answers[currentQ.id] || ''}
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
              value={answers[currentQ.id] || ''}
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

        {currentQ.type === 'multiple_choice' && (
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

        {currentQ.type === 'multiple_select' && (
          <div className="options-group">
            {currentQ.options.map((option) => (
              <button
                key={option}
                className={`typeform-option ${
                  answers[currentQ.id]?.includes(option) ? 'selected' : ''
                }`}
                onClick={() => {
                  const currentSelection = answers[currentQ.id] || [];
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
                disabled={currentQ.required && (!answers[currentQ.id] || answers[currentQ.id].length === 0)}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentQ.type === 'checkbox' && (
          <div className="input-group">
            <div className="options-group">
              {currentQ.options.map((option) => (
                <button
                  key={option}
                  className={`typeform-option ${
                    answers[currentQ.id]?.includes(option) ? 'selected' : ''
                  }`}
                  onClick={() => {
                    const currentSelection = answers[currentQ.id] || [];
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

  return (
    <div className="nutrition-form-container">
      {renderQuestion()}
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{ width: `${(currentQuestion / (questions.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default NutritionBR;
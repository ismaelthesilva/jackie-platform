/**
 * Test data generator for Nutrition USA form
 * Provides complete answers to test all form questions including conditionals
 */

export interface FormAnswers {
  [key: string]: string | string[];
}

/**
 * Generates complete form answers that trigger ALL conditional questions
 * This ensures maximum test coverage by answering "Yes" to trigger follow-ups
 */
export function generateFullFormAnswers(): FormAnswers {
  return {
    // Section 1: Basic Information
    nome_completo: "John Test User",
    idade: "30",
    altura: "175",
    peso: "80",
    acompanhamento_anterior: "Yes",
    tempo_acompanhamento: "2 years with nutritionist and trainer",
    dieta_anterior: "Yes",
    tempo_seguiu_plano: "6 months consistently",

    // Section 2: Goals and History
    objetivo_principal: "Muscle gain",
    meta_especifica:
      "Gain 10kg of lean muscle mass in 6 months, target body fat 12%",
    competicoes: "Yes",
    categoria_competicao: "Men's Physique",
    data_competicao: "June 2026",

    // Section 3: Health and Digestion
    condicoes_saude: "Mild insulin resistance, monitoring with doctor",
    medicamentos: "Yes",
    quais_medicamentos:
      "Metformin 500mg 2x daily, Vitamin D 2000IU daily, Omega-3 1000mg",
    intolerancias: "Yes",
    quais_intolerancias: "Lactose intolerance, mild gluten sensitivity",
    dificuldade_digestao: "Yes",
    quais_dificuldade_digestao: "Red meat and dairy products",

    // Digestive symptoms
    inchaço_abdominal: "Yes",
    inchaço_detalhes: "Evening after dinner, especially with beans and dairy",
    azia: "Yes",
    azia_detalhes: "Once or twice a week after spicy foods",
    gases: "Yes",
    gases_detalhes: "Morning and evening",
    desconforto_refeicoes: "Yes",
    desconforto_detalhes: "After large meals with complex carbs",
    sonolencia_refeicoes: "Yes",
    sonolencia_detalhes: "After lunch, especially with rice and pasta",
    queda_energia: "Yes",
    queda_energia_detalhes: "After breakfast with sugary foods",
    exames_recentes: "Yes",
    exames_resultados:
      "Glucose 105 mg/dL, HbA1c 5.8%, Vitamin D 25 ng/mL (low)",

    // Section 4: Eating Behavior and Routine
    quantidade_refeicoes: "5-6 meals per day",
    refeicoes_frequentes:
      "Breakfast, mid-morning snack, lunch, pre-workout, post-workout, dinner",
    horarios_fixos: "Yes",
    quais_horarios: "7am, 10am, 1pm, 4pm, 7pm, 9pm",
    pula_refeicoes: "Yes",
    quais_pula_refeicoes:
      "Sometimes skip mid-morning snack due to work meetings",
    faz_jejum: "Yes",
    detalhes_jejum: "Intermittent fasting 16:8 on weekends, 16 hours fast",
    horario_fome: "Mid-morning around 10am and late evening",
    belisca: "Yes",
    detalhes_beliscar: "Nuts and protein bars, 2-3 times per week",
    compulsao: "Yes",
    detalhes_compulsao:
      "Weekend evenings with sweets and ice cream after stressful weeks",
    fome_emocional: "Yes",
    detalhes_fome_emocional: "During work stress, 2-3 times per month",
    bebe_refeicoes: "Yes",
    detalhes_bebe_refeicoes: "Water 200ml, sometimes coffee",

    // Beverages
    bebidas_adocadas: "Yes",
    quais_bebidas_adocadas: "Sports drinks post-workout, occasional juice",
    frequencia_bebidas_adocadas: "3-4 times per week",
    quantidade_bebidas_adocadas: "500ml sports drink post-workout",
    bebidas_zero: "Yes",
    detalhes_bebidas_zero: "Zero sugar energy drink 2-3 times per week",
    cafe: "Yes",
    frequencia_cafe: "2-3 times per day",
    quantidade_cafe: "200ml per cup",
    tipo_cafe: "Black with stevia sweetener",
    estimulantes: "Yes",
    detalhes_estimulantes:
      "Pre-workout with 200mg caffeine before training at 5pm",
    alcool: "Yes",
    frequencia_alcool: "Once or twice per month",
    quantidade_alcool: "2-3 beers or 2 glasses of wine",
    tipo_alcool: "Craft beer or red wine",

    // Smoking
    cigarro: "No",
    vape: "No",
    charuto: "No",

    // Section 5: Food Preferences and Aversions
    alimentos_gosta:
      "Chicken breast, salmon, eggs, sweet potato, rice, avocado, bananas, berries, almonds",
    alimentos_evita:
      "Organ meats, raw fish, cottage cheese (texture), cilantro, black licorice",
    cafe_manha_preferencia: "Sweet - prefer eggs with fruit and oatmeal",
    frutas_vegetais_preferidos:
      "Bananas, berries, apples, spinach, broccoli, asparagus, bell peppers",
    aversao_texturas:
      "Don't like slimy textures (okra), overly bitter foods, and the taste of mint chocolate",
    paladar_alterado: "Yes",
    detalhes_paladar_alterado:
      "After intense workouts, everything tastes bland",
    nivel_apetite: "Very high",

    // Food types
    consome_ovo: "Yes",
    consome_peixe: "Yes",
    consome_carne_vermelha: "Yes",
    consome_tofu: "Yes",
    consome_leite: "Yes",
    preferencia_carne: "Yes",
    tipo_carne_preferido: "Chicken and turkey, lean beef occasionally",
    dificuldade_carne_vermelha: "Yes",
    gordura_cozinhar: "Olive oil and avocado oil",
    azeite: "Yes",
    quantidade_azeite: "1-2 tablespoons per meal",
    oleo_coco: "Yes",
    frequencia_oleo_coco: "2-3 times per week for cooking",
    frituras: "Yes",
    frequencia_frituras: "Once per week on cheat day",
    alimentos_frituras: "Air-fried chicken wings, sweet potato fries",

    // Section 6: Cheat Meals
    refeicoes_livres: "Yes",
    frequencia_refeicoes_livres: "Once per week",
    dia_refeicao_livre: "Saturday evening",
    preferencia_refeicao_livre:
      "Pizza, burgers, ice cream, or sushi - whatever I'm craving",
    preferencia_agendamento: "Scheduled",

    // Section 7: Macronutrients and Meal Composition
    proteina_refeicoes: "Yes",
    fontes_proteina:
      "Chicken, fish, eggs, Greek yogurt, whey protein, lean beef",
    gorduras_boas: "Yes",
    quais_gorduras_boas:
      "Avocado, almonds, walnuts, olive oil, egg yolks, salmon",
    carboidratos_frequentes:
      "White rice, sweet potato, oatmeal, whole grain bread - prefer mix of whole and refined",
    dieta_manipulacao_carbo: "Yes",
    modelo_dieta_carbo:
      "Carb cycling - higher carbs on training days, lower on rest days",
    preferencia_ciclo_carbo: "Carb cycling",

    // Section 8: Training and Lifestyle
    pratica_atividade: "Yes",
    modalidade_atividade: "Weight training and functional fitness",
    frequencia_atividade: "5-6 days per week",
    horario_atividade: "5:00 PM - 6:30 PM on weekdays, 9:00 AM on weekends",
    tipo_treino: "Hypertrophy-focused weight training with compound movements",
    nivel_treino: "Advanced",
    faz_cardio: "Yes",
    detalhes_cardio: "LISS cardio 20-30 minutes 3x per week, HIIT 1x per week",
    preferencia_alimentar_treino: "Yes",
    detalhes_alimentar_treino:
      "Pre-workout: banana with peanut butter, Post-workout: whey protein shake with dextrose",
    usa_suplementos: "Yes",
    quais_suplementos:
      "Whey protein, creatine 5g, BCAA, multivitamin, omega-3, vitamin D, pre-workout",

    // Section 9: Sleep and Stress
    horas_sono: "7-8 hours",
    dificuldade_dormir: "Yes",
    acorda_descansado: "No",
    estresse_elevado: "Yes",
    estresse_afeta_alimentacao: "Yes",

    // Section 10: Final Considerations
    informacao_adicional:
      "Training for 5 years, want to compete next year. Very dedicated but struggle with consistency on weekends. Work schedule can be demanding.",
    preferencia_plano: "Balance between both",
    pesar_medir: "Yes",

    // Email
    email: "test@example.com",
  };
}

/**
 * Generates minimal form answers (only required fields)
 * Answers "No" to most conditionals to test minimal flow
 */
export function generateMinimalFormAnswers(): FormAnswers {
  return {
    // Basic required fields
    nome_completo: "Jane Minimal Test",
    idade: "25",
    altura: "165",
    peso: "60",
    acompanhamento_anterior: "No",
    dieta_anterior: "No",

    // Goals
    objetivo_principal: "Weight loss",
    competicoes: "No",

    // Health - no issues
    medicamentos: "No",
    intolerancias: "No",
    dificuldade_digestao: "No",
    inchaço_abdominal: "No",
    azia: "No",
    gases: "No",
    desconforto_refeicoes: "No",
    sonolencia_refeicoes: "No",
    queda_energia: "No",
    exames_recentes: "No",

    // Eating behavior
    quantidade_refeicoes: "3 meals",
    refeicoes_frequentes: "Breakfast, lunch, dinner",
    horarios_fixos: "No",
    pula_refeicoes: "No",
    faz_jejum: "No",
    horario_fome: "Normal meal times",
    belisca: "No",
    compulsao: "No",
    fome_emocional: "No",
    bebe_refeicoes: "No",
    bebidas_adocadas: "No",
    bebidas_zero: "No",
    cafe: "No",
    estimulantes: "No",
    alcool: "No",
    cigarro: "No",
    vape: "No",
    charuto: "No",

    // Preferences
    alimentos_gosta: "Most foods",
    alimentos_evita: "None specifically",
    cafe_manha_preferencia: "Sweet",
    frutas_vegetais_preferidos: "Apples, carrots, broccoli",
    paladar_alterado: "No",
    nivel_apetite: "Normal",

    // Food types
    consome_ovo: "Yes",
    consome_peixe: "Yes",
    consome_carne_vermelha: "Yes",
    consome_tofu: "No",
    consome_leite: "Yes",
    preferencia_carne: "No",
    dificuldade_carne_vermelha: "No",
    gordura_cozinhar: "Olive oil",
    azeite: "No",
    oleo_coco: "No",
    frituras: "No",

    // Cheat meals
    refeicoes_livres: "No",
    preferencia_agendamento: "Decide in the moment",

    // Macros
    proteina_refeicoes: "No",
    gorduras_boas: "No",
    carboidratos_frequentes: "Rice and bread",
    dieta_manipulacao_carbo: "No",
    preferencia_ciclo_carbo: "Linear pattern",

    // Training
    pratica_atividade: "No",
    faz_cardio: "No",
    preferencia_alimentar_treino: "No",
    usa_suplementos: "No",

    // Sleep and stress
    horas_sono: "7 hours",
    dificuldade_dormir: "No",
    acorda_descansado: "Yes",
    estresse_elevado: "No",
    estresse_afeta_alimentacao: "No",

    // Final
    preferencia_plano: "More freedom",
    pesar_medir: "No",

    // Email
    email: "minimal@example.com",
  };
}

/**
 * Get list of all expected question IDs that should be in the form
 */
export function getExpectedQuestionIds(): string[] {
  return Object.keys(generateFullFormAnswers());
}

/**
 * Count how many questions should be answered based on conditional logic
 */
export function getExpectedQuestionCount(answers: FormAnswers): number {
  let count = 0;

  // Count all answered questions
  for (const key in answers) {
    if (answers[key]) {
      count++;
    }
  }

  return count;
}

// Diet Plan Generator Service
// Converts client questionnaire answers into structured diet plans

export interface ClientProfile {
  // Basic Info
  name: string;
  email: string;
  age: number;
  height: number;
  weight: number;
  
  // Goals
  mainGoal: string;
  specificGoal?: string;
  
  // Health
  healthConditions?: string;
  medications?: string;
  intolerances?: string;
  digestiveIssues?: string;
  
  // Preferences
  likedFoods: string;
  avoidedFoods: string;
  breakfastPreference: string;
  meatPreferences: string;
  
  // Lifestyle
  activityLevel: string;
  trainingType?: string;
  trainingFrequency?: string;
  sleepHours: string;
  stressLevel: string;
  
  // Nutrition habits
  mealsPerDay: string;
  snacking: boolean;
  cheatMeals: boolean;
  carbCycling: string;
}

export interface Meal {
  name: string;
  ingredients: string[];
  portions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTime: string;
  instructions?: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface DayPlan {
  day: number;
  date: string;
  meals: {
    breakfast: Meal;
    snack1?: Meal;
    lunch: Meal;
    snack2?: Meal;
    dinner: Meal;
    snack3?: Meal;
  };
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface DietPlan {
  id: string;
  clientProfile: ClientProfile;
  plan: DayPlan[];
  guidelines: string[];
  status: 'draft' | 'approved' | 'sent';
  createdAt: string;
  reviewNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  sentAt?: string;
}

class DietPlanGenerator {
  private calculateBMR(profile: ClientProfile): number {
    // Mifflin-St Jeor Equation
    // For men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
    // For women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
    
    // Since we don't have gender in the form, we'll use a neutral calculation
    const baseBMR = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age);
    return baseBMR; // Will adjust based on other factors
  }

  private calculateTDEE(bmr: number, activityLevel: string): number {
    let multiplier = 1.2; // Sedentary
    
    if (activityLevel?.includes('1-2')) multiplier = 1.375; // Light activity
    if (activityLevel?.includes('3-4')) multiplier = 1.55;  // Moderate activity
    if (activityLevel?.includes('5-6')) multiplier = 1.725; // High activity
    if (activityLevel?.includes('daily') || activityLevel?.includes('7+')) multiplier = 1.9; // Very high
    
    return Math.round(bmr * multiplier);
  }

  private calculateTargetCalories(tdee: number, goal: string): number {
    let calories = tdee;
    
    switch (goal?.toLowerCase()) {
      case 'weight loss':
      case 'lose weight':
        calories = tdee * 0.8; // 20% deficit
        break;
      case 'muscle gain':
      case 'gain muscle':
        calories = tdee * 1.15; // 15% surplus
        break;
      case 'body recomposition':
      case 'maintain weight':
        calories = tdee * 0.95; // Slight deficit
        break;
      default:
        calories = tdee;
    }
    
    return Math.round(calories);
  }

  private calculateMacros(calories: number, goal: string) {
    let proteinRatio = 0.25;
    let carbRatio = 0.45;
    let fatRatio = 0.30;
    
    // Adjust based on goal
    switch (goal?.toLowerCase()) {
      case 'weight loss':
        proteinRatio = 0.35;
        carbRatio = 0.35;
        fatRatio = 0.30;
        break;
      case 'muscle gain':
        proteinRatio = 0.30;
        carbRatio = 0.45;
        fatRatio = 0.25;
        break;
      case 'body recomposition':
        proteinRatio = 0.30;
        carbRatio = 0.40;
        fatRatio = 0.30;
        break;
    }
    
    return {
      protein: Math.round((calories * proteinRatio) / 4), // 4 cal per gram
      carbs: Math.round((calories * carbRatio) / 4),     // 4 cal per gram
      fats: Math.round((calories * fatRatio) / 9)        // 9 cal per gram
    };
  }

  private getMealTemplates(): { [key: string]: Meal[] } {
    return {
      sweetBreakfasts: [
        {
          name: "Protein Pancakes with Berries",
          ingredients: ["2 large eggs", "1 medium banana", "30g rolled oats", "100g mixed berries", "1 tbsp honey", "1 tsp vanilla extract"],
          portions: ["2 large", "1 medium", "1/3 cup", "1/2 cup", "1 tbsp", "1 tsp"],
          calories: 385,
          protein: 20,
          carbs: 48,
          fats: 12,
          prepTime: "15 min",
          category: 'breakfast',
          instructions: "Blend eggs, banana, and oats until smooth. Cook as pancakes in non-stick pan. Top with berries and honey."
        },
        {
          name: "Greek Yogurt Power Bowl",
          ingredients: ["200g Greek yogurt (0% fat)", "30g granola", "1 tbsp almond butter", "100g mixed fruits", "1 tbsp chia seeds"],
          portions: ["3/4 cup", "1/4 cup", "1 tbsp", "1/2 cup", "1 tbsp"],
          calories: 420,
          protein: 25,
          carbs: 42,
          fats: 18,
          prepTime: "5 min",
          category: 'breakfast',
          instructions: "Layer yogurt in bowl, top with granola, fruits, almond butter, and chia seeds."
        },
        {
          name: "Overnight Oats with Protein",
          ingredients: ["50g rolled oats", "200ml almond milk", "1 scoop protein powder", "1 tbsp peanut butter", "1/2 banana sliced"],
          portions: ["1/2 cup", "1 cup", "1 scoop", "1 tbsp", "1/2 medium"],
          calories: 390,
          protein: 28,
          carbs: 35,
          fats: 15,
          prepTime: "5 min prep + overnight",
          category: 'breakfast',
          instructions: "Mix all ingredients except banana. Refrigerate overnight. Top with banana before eating."
        }
      ],
      savoryBreakfasts: [
        {
          name: "Veggie Scrambled Eggs",
          ingredients: ["3 large eggs", "50g fresh spinach", "1/2 medium avocado", "30g feta cheese", "1 slice whole grain bread", "1 tsp olive oil"],
          portions: ["3 large", "1 cup", "1/2 medium", "1 oz", "1 slice", "1 tsp"],
          calories: 465,
          protein: 28,
          carbs: 25,
          fats: 30,
          prepTime: "12 min",
          category: 'breakfast',
          instructions: "Sauté spinach, scramble eggs, serve with avocado, feta, and toast."
        },
        {
          name: "Protein Breakfast Wrap",
          ingredients: ["1 whole wheat tortilla", "2 large eggs", "50g turkey breast", "30g cheese", "1/4 avocado", "2 tbsp salsa"],
          portions: ["1 large", "2 large", "2 oz", "1 oz", "1/4 medium", "2 tbsp"],
          calories: 445,
          protein: 32,
          carbs: 28,
          fats: 24,
          prepTime: "10 min",
          category: 'breakfast',
          instructions: "Scramble eggs, warm tortilla, add turkey, cheese, avocado, and salsa. Roll and serve."
        }
      ],
      lunchOptions: [
        {
          name: "Grilled Chicken Power Salad",
          ingredients: ["150g chicken breast", "2 cups mixed greens", "1/2 avocado", "100g cherry tomatoes", "30g nuts", "2 tbsp olive oil vinaigrette"],
          portions: ["5 oz", "2 cups", "1/2 medium", "1/2 cup", "1 oz", "2 tbsp"],
          calories: 485,
          protein: 38,
          carbs: 15,
          fats: 32,
          prepTime: "20 min",
          category: 'lunch',
          instructions: "Grill chicken, toss salad ingredients, slice avocado, drizzle with dressing."
        },
        {
          name: "Quinoa Buddha Bowl",
          ingredients: ["80g cooked quinoa", "120g grilled tofu", "100g roasted vegetables", "1/4 avocado", "2 tbsp tahini dressing", "1 tbsp pumpkin seeds"],
          portions: ["1/2 cup", "4 oz", "1/2 cup", "1/4 medium", "2 tbsp", "1 tbsp"],
          calories: 465,
          protein: 22,
          carbs: 38,
          fats: 26,
          prepTime: "25 min",
          category: 'lunch',
          instructions: "Cook quinoa, grill tofu, roast vegetables, assemble bowl with tahini dressing."
        },
        {
          name: "Turkey and Hummus Wrap",
          ingredients: ["1 whole wheat tortilla", "120g turkey breast", "3 tbsp hummus", "50g cucumber", "50g tomatoes", "30g spinach"],
          portions: ["1 large", "4 oz", "3 tbsp", "1/3 cup", "1/3 cup", "1 cup"],
          calories: 425,
          protein: 35,
          carbs: 32,
          fats: 18,
          prepTime: "8 min",
          category: 'lunch',
          instructions: "Spread hummus on tortilla, add turkey and vegetables, roll tightly."
        }
      ],
      dinnerOptions: [
        {
          name: "Baked Salmon with Sweet Potato",
          ingredients: ["150g salmon fillet", "200g sweet potato", "100g broccoli", "1 tbsp olive oil", "1 lemon", "herbs and spices"],
          portions: ["5 oz", "1 medium", "1/2 cup", "1 tbsp", "1/2 lemon", "to taste"],
          calories: 485,
          protein: 35,
          carbs: 35,
          fats: 22,
          prepTime: "30 min",
          category: 'dinner',
          instructions: "Bake salmon at 400°F for 12-15 min. Roast sweet potato and broccoli. Season with lemon and herbs."
        },
        {
          name: "Lean Beef Stir-Fry",
          ingredients: ["120g lean beef strips", "150g mixed vegetables", "80g brown rice", "1 tbsp sesame oil", "2 tbsp low-sodium soy sauce", "1 tsp ginger"],
          portions: ["4 oz", "1 cup", "1/2 cup cooked", "1 tbsp", "2 tbsp", "1 tsp"],
          calories: 465,
          protein: 32,
          carbs: 38,
          fats: 20,
          prepTime: "20 min",
          category: 'dinner',
          instructions: "Stir-fry beef and vegetables in sesame oil. Serve over brown rice with soy sauce and ginger."
        },
        {
          name: "Chicken and Vegetable Curry",
          ingredients: ["140g chicken breast", "200g mixed vegetables", "80g basmati rice", "100ml coconut milk", "2 tbsp curry paste", "1 tbsp olive oil"],
          portions: ["5 oz", "1 cup", "1/2 cup cooked", "1/3 cup", "2 tbsp", "1 tbsp"],
          calories: 495,
          protein: 36,
          carbs: 42,
          fats: 20,
          prepTime: "25 min",
          category: 'dinner',
          instructions: "Sauté chicken, add vegetables and curry paste, simmer with coconut milk. Serve over rice."
        }
      ],
      snackOptions: [
        {
          name: "Apple with Almond Butter",
          ingredients: ["1 medium apple", "2 tbsp almond butter"],
          portions: ["1 medium", "2 tbsp"],
          calories: 285,
          protein: 8,
          carbs: 32,
          fats: 16,
          prepTime: "2 min",
          category: 'snack',
          instructions: "Slice apple and serve with almond butter for dipping."
        },
        {
          name: "Greek Yogurt with Nuts",
          ingredients: ["150g Greek yogurt", "20g mixed nuts", "1 tsp honey"],
          portions: ["2/3 cup", "small handful", "1 tsp"],
          calories: 245,
          protein: 18,
          carbs: 12,
          fats: 14,
          prepTime: "3 min",
          category: 'snack',
          instructions: "Top yogurt with nuts and drizzle with honey."
        },
        {
          name: "Protein Smoothie",
          ingredients: ["1 scoop protein powder", "200ml unsweetened almond milk", "1/2 banana", "1 tbsp peanut butter", "Ice cubes"],
          portions: ["1 scoop", "1 cup", "1/2 medium", "1 tbsp", "as needed"],
          calories: 295,
          protein: 26,
          carbs: 18,
          fats: 12,
          prepTime: "5 min",
          category: 'snack',
          instructions: "Blend all ingredients until smooth. Add ice for desired consistency."
        }
      ]
    };
  }

  private filterMealsByPreferences(meals: Meal[], profile: ClientProfile): Meal[] {
    return meals.filter(meal => {
      // Filter by dietary restrictions
      if (profile.intolerances?.toLowerCase().includes('dairy')) {
        const hasDairy = meal.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes('yogurt') || 
          ingredient.toLowerCase().includes('cheese') || 
          ingredient.toLowerCase().includes('milk')
        );
        if (hasDairy) return false;
      }
      
      if (profile.intolerances?.toLowerCase().includes('gluten')) {
        const hasGluten = meal.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes('bread') || 
          ingredient.toLowerCase().includes('oats') ||
          ingredient.toLowerCase().includes('tortilla')
        );
        if (hasGluten) return false;
      }
      
      if (profile.intolerances?.toLowerCase().includes('nuts')) {
        const hasNuts = meal.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes('almond') || 
          ingredient.toLowerCase().includes('peanut') ||
          ingredient.toLowerCase().includes('nuts')
        );
        if (hasNuts) return false;
      }
      
      // Filter by meat preferences
      if (profile.meatPreferences === 'vegetarian' || profile.meatPreferences?.toLowerCase().includes('no')) {
        const hasMeat = meal.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes('chicken') || 
          ingredient.toLowerCase().includes('beef') ||
          ingredient.toLowerCase().includes('turkey') ||
          ingredient.toLowerCase().includes('salmon') ||
          ingredient.toLowerCase().includes('fish')
        );
        if (hasMeat) return false;
      }
      
      return true;
    });
  }

  private generateGuidelines(profile: ClientProfile): string[] {
    const guidelines = [
      "Drink at least 2-3 liters of water daily",
      "Eat slowly and chew thoroughly",
      "Include vegetables in every main meal",
      "Aim to eat every 3-4 hours to maintain energy levels"
    ];

    if (profile.intolerances) {
      guidelines.push(`Strictly avoid: ${profile.intolerances}`);
    }

    if (profile.healthConditions) {
      guidelines.push(`Monitor health conditions: ${profile.healthConditions}`);
    }

    if (profile.stressLevel === 'high') {
      guidelines.push("Consider stress-reduction techniques like meditation");
      guidelines.push("Prioritize 7-8 hours of quality sleep");
    }

    if (profile.mainGoal === 'Weight loss') {
      guidelines.push("Focus on portion control and avoid late-night eating");
      guidelines.push("Include protein in every meal to maintain satiety");
    } else if (profile.mainGoal === 'Muscle gain') {
      guidelines.push("Eat within 30 minutes after workout");
      guidelines.push("Don't skip meals, especially breakfast");
    }

    if (profile.trainingType) {
      guidelines.push(`Optimize nutrition for ${profile.trainingType} training`);
    }

    return guidelines;
  }

  public generatePlan(answers: any): DietPlan {
    // Convert questionnaire answers to profile
    const profile: ClientProfile = {
      name: answers.nome_completo || 'Client',
      email: answers.email || '',
      age: parseInt(answers.idade) || 30,
      height: parseInt(answers.altura) || 170,
      weight: parseInt(answers.peso) || 70,
      mainGoal: answers.objetivo_principal || 'Weight loss',
      specificGoal: answers.meta_especifica,
      healthConditions: answers.condicoes_saude,
      medications: answers.quais_medicamentos,
      intolerances: answers.quais_intolerancias,
      digestiveIssues: answers.dificuldade_digestao,
      likedFoods: answers.alimentos_gosta,
      avoidedFoods: answers.alimentos_evita,
      breakfastPreference: answers.cafe_manha_preferencia,
      meatPreferences: answers.consome_carne_vermelha,
      activityLevel: answers.frequencia_atividade || 'moderate',
      trainingType: answers.tipo_treino,
      trainingFrequency: answers.frequencia_treino,
      sleepHours: answers.horas_sono,
      stressLevel: answers.estresse_elevado === 'Yes' ? 'high' : 'normal',
      mealsPerDay: answers.quantidade_refeicoes,
      snacking: answers.belisca === 'Yes',
      cheatMeals: answers.refeicoes_livres === 'Yes',
      carbCycling: answers.preferencia_ciclo_carbo
    };

    // Calculate nutrition targets
    const bmr = this.calculateBMR(profile);
    const tdee = this.calculateTDEE(bmr, profile.activityLevel);
    const targetCalories = this.calculateTargetCalories(tdee, profile.mainGoal);
    const macros = this.calculateMacros(targetCalories, profile.mainGoal);

    // Get and filter meal templates
    const allMealTemplates = this.getMealTemplates();
    
    const breakfastOptions = profile.breakfastPreference === 'sweet' 
      ? this.filterMealsByPreferences(allMealTemplates.sweetBreakfasts, profile)
      : this.filterMealsByPreferences(allMealTemplates.savoryBreakfasts, profile);
    
    const lunchOptions = this.filterMealsByPreferences(allMealTemplates.lunchOptions, profile);
    const dinnerOptions = this.filterMealsByPreferences(allMealTemplates.dinnerOptions, profile);
    const snackOptions = this.filterMealsByPreferences(allMealTemplates.snackOptions, profile);

    // Generate 30-day plan
    const plan: DayPlan[] = [];
    const startDate = new Date();
    
    for (let day = 1; day <= 30; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day - 1);
      
      const dayPlan: DayPlan = {
        day,
        date: currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        meals: {
          breakfast: breakfastOptions[day % breakfastOptions.length] || allMealTemplates.sweetBreakfasts[0],
          lunch: lunchOptions[day % lunchOptions.length] || allMealTemplates.lunchOptions[0],
          dinner: dinnerOptions[day % dinnerOptions.length] || allMealTemplates.dinnerOptions[0]
        },
        totalCalories: targetCalories,
        macros
      };
      
      // Add snacks if client snacks
      if (profile.snacking && snackOptions.length > 0) {
        dayPlan.meals.snack1 = snackOptions[day % snackOptions.length];
      }
      
      plan.push(dayPlan);
    }

    const guidelines = this.generateGuidelines(profile);

    return {
      id: `diet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clientProfile: profile,
      plan,
      guidelines,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
  }
}

export default DietPlanGenerator;

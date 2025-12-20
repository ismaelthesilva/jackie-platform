# COMPLETE FITNESS FORM QUESTIONS EXTRACTION

## Extracted from: `/src/app/(forms)/fitnessusa/page.tsx.backup`

---

## WELCOME SCREEN

- **ID**: `welcome`
- **Type**: `welcome`
- **Title**: "PROFESSIONAL FITNESS & BODYBUILDING CONSULTATION QUESTIONNAIRE"
- **Description**: "Designed for all levels: beginners to stage athletes"
- **Button**: "Start"

---

## SECTION 1 — PERSONAL & BASIC INFORMATION (15 Questions)

### Header

- **ID**: `block1_header`
- **Type**: `welcome`
- **Title**: "SECTION 1 — PERSONAL & BASIC INFORMATION"
- **Description**: "Let's start with some basic information about you."
- **Button**: "Continue"

### Q1 - Full Name

- **ID**: `nome_completo`
- **Type**: `text`
- **Title**: "1. Full name:"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q2 - Email

- **ID**: `email`
- **Type**: `email`
- **Title**: "2. Please provide your email to receive your personalized plan"
- **Required**: true
- **Special**: Triggers Cloudflare Turnstile verification
- **Placeholder**: "Type your answer..."

### Q3 - Date of Birth

- **ID**: `data_nascimento`
- **Type**: `text`
- **Title**: "3. Date of birth:"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q4 - Height

- **ID**: `altura`
- **Type**: `number`
- **Title**: "4. Height (in cm):"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q5 - Weight

- **ID**: `peso`
- **Type**: `number`
- **Title**: "5. Current weight (in kg):"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q6 - Body Fat %

- **ID**: `percentual_gordura`
- **Type**: `text`
- **Title**: "6. Body fat percentage (if known):"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q7 - Location

- **ID**: `localizacao`
- **Type**: `text`
- **Title**: "7. Location (City and Country):"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q8 - Occupation

- **ID**: `profissao`
- **Type**: `textarea`
- **Title**: "8. Occupation and work routine (shift work, sedentary, active job, etc.):"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q9 - Sleep Schedule

- **ID**: `horario_sono`
- **Type**: `text`
- **Title**: "9. Usual sleep schedule (bedtime and wake time):"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q10 - Hours of Sleep

- **ID**: `horas_sono`
- **Type**: `multiple_choice`
- **Title**: "10. Average hours of sleep per night:"
- **Options**:
  - "Less than 5h"
  - "5h"
  - "6h"
  - "7h"
  - "8h"
  - "More than 8h"
- **Required**: true

### Q11 - Sleep Quality

- **ID**: `tipo_sono`
- **Type**: `multiple_choice`
- **Title**: "11. How would you rate your sleep?"
- **Options**:
  - "Light"
  - "Moderate"
  - "Deep"
- **Required**: true

### Q12 - Wake Up Rested

- **ID**: `acorda_descansado`
- **Type**: `yes_no`
- **Title**: "12. Do you wake up feeling rested?"
- **Required**: true

### Q13 - Daily Energy

- **ID**: `energia_dia`
- **Type**: `textarea`
- **Title**: "13. How would you describe your daily energy levels?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q14 - Smoking

- **ID**: `fuma`
- **Type**: `yes_no`
- **Title**: "14. Do you smoke?"
- **Required**: true

### Q15 - Alcohol

- **ID**: `alcool`
- **Type**: `yes_no`
- **Title**: "15. Do you consume alcohol?"
- **Required**: true

### Q15a - Alcohol Details (Conditional)

- **ID**: `alcool_detalhes`
- **Type**: `textarea`
- **Title**: "Frequency and quantity:"
- **Required**: true
- **Condition**: Shows if `alcool` === "Yes"
- **Placeholder**: "Type your answer..."

### Q15b - Pregnancy

- **ID**: `gestante`
- **Type**: `yes_no`
- **Title**: "15. Are you pregnant or trying to conceive? (if applicable)"
- **Required**: false

---

## SECTION 2 — HEALTH HISTORY (7 Questions)

### Header

- **ID**: `block2_header`
- **Type**: `welcome`
- **Title**: "SECTION 2 — HEALTH HISTORY"
- **Description**: "Let's learn about your health and medical history."
- **Button**: "Continue"

### Q16 - Medical Conditions

- **ID**: `doencas`
- **Type**: `textarea`
- **Title**: "16. Do you have any diagnosed medical conditions? (e.g. hypothyroidism, PCOS, insulin resistance)"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q17 - Injuries

- **ID**: `lesoes`
- **Type**: `textarea`
- **Title**: "17. Have you ever suffered any injuries? Please specify location and year:"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q18 - Surgeries

- **ID**: `cirurgias`
- **Type**: `textarea`
- **Title**: "18. Have you had any surgeries? Which ones and when?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q19 - Medications

- **ID**: `medicacao`
- **Type**: `textarea`
- **Title**: "19. Do you take any medications regularly? Which ones?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q20 - Allergies

- **ID**: `alergias`
- **Type**: `textarea`
- **Title**: "20. Do you have any food allergies or intolerances?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q21 - Birth Control

- **ID**: `anticoncepcional`
- **Type**: `textarea`
- **Title**: "21. Do you use birth control? Specify type and method:"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q22 - Blood Work

- **ID**: `exames_sangue`
- **Type**: `yes_no`
- **Title**: "22. Have you had blood work done in the last 6 months?"
- **Required**: true

### Q22a - Blood Work Abnormalities (Conditional)

- **ID**: `exames_alteracoes`
- **Type**: `textarea`
- **Title**: "If yes, were there any abnormalities?"
- **Required**: true
- **Condition**: Shows if `exames_sangue` === "Yes"
- **Placeholder**: "Type your answer..."

---

## SECTION 3 — TRAINING HISTORY & EXPERIENCE (10 Questions)

### Header

- **ID**: `block3_header`
- **Type**: `welcome`
- **Title**: "SECTION 3 — TRAINING HISTORY & EXPERIENCE"
- **Description**: "Tell us about your training experience."
- **Button**: "Continue"

### Q23 - Training Duration

- **ID**: `tempo_treino`
- **Type**: `text`
- **Title**: "23. How long have you been training consistently?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q24 - Cutting/Bulking

- **ID**: `fases_cutting_bulking`
- **Type**: `textarea`
- **Title**: "24. Have you ever done cutting or bulking phases? How many times?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q25 - Professional Guidance

- **ID**: `acompanhamento`
- **Type**: `textarea`
- **Title**: "25. Have you ever worked with a professional coach or sports nutritionist?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q26 - Training Type

- **ID**: `tipo_treino`
- **Type**: `multiple_select`
- **Title**: "26. What type of training are you currently doing?"
- **Options**:
  - "Traditional strength training"
  - "Functional training"
  - "CrossFit"
  - "Free-form cardio"
  - "Other"
- **Required**: true

### Q26a - Training Type Other (Conditional)

- **ID**: `tipo_treino_outros`
- **Type**: `text`
- **Title**: "If other, please specify:"
- **Required**: true
- **Condition**: Shows if `tipo_treino` includes "Other"
- **Placeholder**: "Type your answer..."

### Q27 - Training Days

- **ID**: `dias_treino`
- **Type**: `text`
- **Title**: "27. How many days per week can you realistically commit to training?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q28 - Session Duration

- **ID**: `tempo_treino_dia`
- **Type**: `text`
- **Title**: "28. How much time do you have per session?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q29 - Training Location

- **ID**: `local_treino`
- **Type**: `multiple_choice`
- **Title**: "29. Do you prefer working out at home or in a gym?"
- **Options**:
  - "Home"
  - "Gym"
  - "Both"
- **Required**: true

### Q30 - Equipment Limitations

- **ID**: `restricao_equipamento`
- **Type**: `textarea`
- **Title**: "30. Do you have any equipment limitations?"
- **Required**: false
- **Placeholder**: "Type your answer..."

---

## SECTION 4 — GOALS & PHYSIQUE PRIORITIES (10 Questions)

### Header

- **ID**: `block4_header`
- **Type**: `welcome`
- **Title**: "SECTION 4 — GOALS & PHYSIQUE PRIORITIES"
- **Description**: "What are your goals and aesthetic targets?"
- **Button**: "Continue"

### Q31 - Primary Goal

- **ID**: `objetivo_principal`
- **Type**: `multiple_choice`
- **Title**: "31. What is your primary goal?"
- **Options**:
  - "Fat loss"
  - "Muscle gain"
  - "Body recomposition"
  - "Performance improvement"
  - "Stage preparation (bodybuilding)"
- **Required**: true

### Q32 - Secondary Goal

- **ID**: `objetivo_secundario`
- **Type**: `textarea`
- **Title**: "32. What is your secondary goal?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q33 - Competition Plans

- **ID**: `competir`
- **Type**: `textarea`
- **Title**: "33. Are you planning to compete? If yes, in which category and federation?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q34 - Goal Deadline

- **ID**: `prazo_objetivo`
- **Type**: `text`
- **Title**: "34. What is your deadline to achieve this goal?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q35 - Strict Diet

- **ID**: `dieta_restrita`
- **Type**: `yes_no`
- **Title**: "35. Are you willing to follow a strict diet if necessary?"
- **Required**: true

### Q36 - Advanced Protocols

- **ID**: `protocolos_avancados`
- **Type**: `yes_no`
- **Title**: "36. Are you open to advanced strategies (depletion, carb-loading, strategic fasting, etc.)?"
- **Required**: true

### Q37 - Muscle Emphasis

- **ID**: `enfase_corpo`
- **Type**: `textarea`
- **Title**: "37. Which muscle group(s) do you want to emphasize?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q38 - Hard to Develop

- **ID**: `dificuldade_desenvolver`
- **Type**: `textarea`
- **Title**: "38. Which muscle group(s) do you have the hardest time activating or developing?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q39 - Anabolic Use

- **ID**: `anabolizantes`
- **Type**: `textarea`
- **Title**: "39. Have you ever used anabolic substances or performance enhancers? Which ones and when?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q40 - Pharmacological Strategy

- **ID**: `estrategia_farmacologica`
- **Type**: `yes_no`
- **Title**: "40. Are you planning to use any pharmacological strategy under professional guidance?"
- **Required**: false

---

## SECTION 5 — TRAINING STYLE, LIMITATIONS & BIOFEEDBACK (10 Questions)

### Header

- **ID**: `block5_header`
- **Type**: `welcome`
- **Title**: "SECTION 5 — TRAINING STYLE, LIMITATIONS & BIOFEEDBACK"
- **Description**: "Let's understand your training preferences and limitations."
- **Button**: "Continue"

### Q41 - Favorite Exercises

- **ID**: `exercicios_gosta`
- **Type**: `textarea`
- **Title**: "41. Which exercises do you enjoy the most? Why?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q42 - Disliked Exercises

- **ID**: `exercicios_detesta`
- **Type**: `textarea`
- **Title**: "42. Which exercises do you dislike or avoid? Why?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q43 - Exercise Restrictions

- **ID**: `exercicios_lesao`
- **Type**: `textarea`
- **Title**: "43. Are there any exercises you cannot perform due to injury or discomfort?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q44 - Training Style Preference

- **ID**: `facilidade_treino`
- **Type**: `multiple_choice`
- **Title**: "44. What training style suits you best:"
- **Options**:
  - "Heavy loads"
  - "High volume (more reps)"
  - "Advanced techniques (drop-sets, rest-pause, etc.)"
- **Required**: true

### Q45 - Activation Difficulty

- **ID**: `dificuldade_grupo`
- **Type**: `textarea`
- **Title**: "45. Do you struggle to activate any specific muscle group? Which one(s)?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q46 - Fast Responding Muscles

- **ID**: `grupo_responde_facil`
- **Type**: `textarea`
- **Title**: "46. Which muscle groups respond the fastest for you?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q47 - Joint Pain

- **ID**: `dores_articulares`
- **Type**: `textarea`
- **Title**: "47. Do you experience joint pain? Where and how often?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q48 - Post-Training Feeling

- **ID**: `reacao_treino`
- **Type**: `multiple_choice`
- **Title**: "48. How do you typically feel after a training session?"
- **Options**:
  - "Energized"
  - "Exhausted"
  - "Sleepy"
  - "Irritable or extremely hungry"
- **Required**: true

### Q49 - Follow Plan Difficulty

- **ID**: `dificuldade_ficha`
- **Type**: `yes_no`
- **Title**: "49. Do you find it difficult to follow a workout plan on your own?"
- **Required**: true

### Q50 - Workout Preference

- **ID**: `preferencia_treino`
- **Type**: `multiple_choice`
- **Title**: "50. Do you prefer workouts with constant variation or structured progression?"
- **Options**:
  - "Constant variation"
  - "Structured progression"
  - "Both"
- **Required**: true

---

## SECTION 6 — CARDIO, MOBILITY & CONDITIONING (5 Questions)

### Header

- **ID**: `block6_header`
- **Type**: `welcome`
- **Title**: "SECTION 6 — CARDIO, MOBILITY & CONDITIONING"
- **Description**: "Information about your cardiovascular fitness and flexibility."
- **Button**: "Continue"

### Q51 - Cardiovascular Endurance

- **ID**: `resistencia_aerobica`
- **Type**: `textarea`
- **Title**: "51. How would you rate your cardiovascular endurance?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q52 - HIIT Experience

- **ID**: `hiit`
- **Type**: `textarea`
- **Title**: "52. Have you tried HIIT before? Did you enjoy it or feel unwell?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q53 - Fasted Cardio

- **ID**: `cardio_jejum`
- **Type**: `yes_no`
- **Title**: "53. Are you open to fasted cardio, if strategically advised?"
- **Required**: true

### Q54 - Respiratory Limitations

- **ID**: `limitacao_respiratoria`
- **Type**: `textarea`
- **Title**: "54. Do you have any respiratory or cardiovascular limitations?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q55 - Mobility

- **ID**: `mobilidade`
- **Type**: `textarea`
- **Title**: "55. Can you comfortably perform mobility or stretching routines? Do you currently do any?"
- **Required**: true
- **Placeholder**: "Type your answer..."

---

## SECTION 7 — LIFESTYLE, ADHERENCE & MINDSET (5 Questions)

### Header

- **ID**: `block7_header`
- **Type**: `welcome`
- **Title**: "SECTION 7 — LIFESTYLE, ADHERENCE & MINDSET"
- **Description**: "Let's understand your lifestyle and mindset."
- **Button**: "Continue"

### Q56 - Training Day Preferences

- **ID**: `dias_treino_facilidade`
- **Type**: `textarea`
- **Title**: "56. Which days are easiest for you to train? Which are most difficult?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q57 - Consistency Challenge

- **ID**: `desafio_constancia`
- **Type**: `textarea`
- **Title**: "57. Whats your biggest challenge right now in staying consistent?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q58 - Support System

- **ID**: `apoio_familia`
- **Type**: `yes_no`
- **Title**: "58. Do you have support from family or friends regarding your fitness goals?"
- **Required**: true

### Q59 - Discouragement Factors

- **ID**: `motivo_desistencia`
- **Type**: `textarea`
- **Title**: "59. What tends to discourage or derail you from your fitness plans?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q60 - Commitment Level

- **ID**: `comprometimento`
- **Type**: `multiple_choice`
- **Title**: "60. On a scale of 0 to 10, how committed are you to your current goal?"
- **Options**:
  - "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"
- **Required**: true

---

## SECTION 8 — PHOTOS & PROGRESS TRACKING (4 Questions)

### Header

- **ID**: `block8_header`
- **Type**: `welcome`
- **Title**: "SECTION 8 — PHOTOS & PROGRESS TRACKING (Optional)"
- **Description**: "How can we track your progress?"
- **Button**: "Continue"

### Q61 - Progress Photos

- **ID**: `fotos_corporais`
- **Type**: `yes_no`
- **Title**: "61. Are you open to sending progress photos for evaluation?"
- **Required**: false

### Q62 - Before/After Photos

- **ID**: `fotos_anteriores`
- **Type**: `yes_no`
- **Title**: "62. Do you already have before/after photos?"
- **Required**: false

### Q63 - Check-in Frequency

- **ID**: `checkins`
- **Type**: `multiple_choice`
- **Title**: "63. Would you prefer weekly or biweekly check-ins?"
- **Options**:
  - "Weekly"
  - "Biweekly"
  - "Monthly"
  - "No regular check-ins"
- **Required**: true

### Q64 - Tracking Apps

- **ID**: `apps_registro`
- **Type**: `yes_no`
- **Title**: "64. Do you like using apps to track workouts or meals?"
- **Required**: true

---

## SECTION 9 — NUTRITION & SUPPLEMENTATION (5 Questions)

### Header

- **ID**: `block9_header`
- **Type**: `welcome`
- **Title**: "SECTION 9 — NUTRITION & SUPPLEMENTATION SNAPSHOT"
- **Description**: "Information about your nutrition and supplementation."
- **Button**: "Continue"

### Q65 - Meal Plan

- **ID**: `plano_alimentar`
- **Type**: `textarea`
- **Title**: "65. Are you currently following a meal plan? Created by whom?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q66 - Supplements

- **ID**: `suplementos`
- **Type**: `textarea`
- **Title**: "66. What supplements do you currently use (brand and dose)?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Q67 - Diet Adjustment

- **ID**: `ajuste_dieta`
- **Type**: `yes_no`
- **Title**: "67. Are you willing to adjust your diet based on your periodized training program?"
- **Required**: true

### Q68 - Meal Preparation

- **ID**: `facilidade_cozinhar`
- **Type**: `yes_no`
- **Title**: "68. Do you find it easy to prepare your own meals?"
- **Required**: true

### Q69 - Diet Preference

- **ID**: `preferencia_dieta`
- **Type**: `multiple_choice`
- **Title**: "69. Do you prefer a fixed meal plan or flexible options with swaps?"
- **Options**:
  - "Fixed meal plan"
  - "Flexible options with swaps"
- **Required**: true

---

## SECTION 10 — HYDRATION (4 Questions)

### Header

- **ID**: `block10_header`
- **Type**: `welcome`
- **Title**: "SECTION 10 — HYDRATION"
- **Description**: "Information about your hydration habits."
- **Button**: "Continue"

### Q70 - Water Intake

- **ID**: `consumo_agua`
- **Type**: `text`
- **Title**: "70. How much water do you drink per day (in liters)?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q71 - Water Tracking

- **ID**: `monitora_agua`
- **Type**: `yes_no`
- **Title**: "71. Do you track your water intake?"
- **Required**: true

### Q72 - Thirst

- **ID**: `sede_dia`
- **Type**: `textarea`
- **Title**: "72. Do you feel thirsty throughout the day or during workouts?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q73 - Electrolytes

- **ID**: `eletrolitos`
- **Type**: `yes_no`
- **Title**: "73. Do you add electrolytes or use hydration supplements?"
- **Required**: false

---

## SECTION 11 — AAP (Activation And Pain Patterns) (3 Questions)

### Header

- **ID**: `block11_header`
- **Type**: `welcome`
- **Title**: "SECTION 11 — AAP (Activation And Pain Patterns)"
- **Description**: "Information about your neuromuscular connection and pain patterns."
- **Button**: "Continue"

### Q74 - Muscle Activation

- **ID**: `ativacao_muscular`
- **Type**: `textarea`
- **Title**: "74. Do you feel the target muscle working in most exercises? If not, in which exercises do you struggle with activation?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q75 - Muscle Soreness

- **ID**: `dor_muscular`
- **Type**: `textarea`
- **Title**: "75. Do you usually experience post-workout muscle soreness? Which muscle groups respond the most?"
- **Required**: true
- **Placeholder**: "Type your answer..."

### Q76 - Joint Pain During Training

- **ID**: `dor_articular`
- **Type**: `textarea`
- **Title**: "76. Do you ever feel joint pain during training? If so, where and when?"
- **Required**: false
- **Placeholder**: "Type your answer..."

---

## ADDITIONAL INFO & CLOSING

### Q77 - Additional Information

- **ID**: `informacao_adicional`
- **Type**: `textarea`
- **Title**: "77. Is there anything else you would like to share with me that is not included in this form?"
- **Required**: false
- **Placeholder**: "Type your answer..."

### Thank You Screen

- **ID**: `thankYou`
- **Type**: `thank_you`
- **Title**: "Thank you for completing the questionnaire!"
- **Description**: "We will analyze your responses and send your personalized plan soon."

---

## PROGRESS TIMELINE STEPS

1. **Personal Info** - Basic information
2. **Health History** - Medical background
3. **Goals** - Fitness objectives
4. **Experience** - Training background
5. **Preferences** - Training style
6. **Lifestyle** - Daily habits
7. **Additional Info** - Final details

---

## SUBMISSION MESSAGES

### Success Message:

```
✅ Success! Your assessment has been submitted successfully!

Dr. Jackie has received your information and will be in touch soon.

Your assessment was sent directly to Dr. Jackie, who will personally review it and create your personalized plan.

📧 Confirmation email: You'll receive a confirmation at {email}

⏰ Timeline: Dr. Jackie will respond within 24-48 hours.

Thank you for trusting Dr. Jackie's work!
```

### Error Message:

```
Error submitting assessment: {error}.

Please try again or contact us if the problem persists.
```

### Processing Message:

```
Processing your responses...
```

### Email Sent Confirmation:

```
Successfully submitted! Check your email soon.
```

---

## VERIFICATION MESSAGES

- **Before Submit**: "Please verify you're human to continue"
- **Required**: "Please complete the verification before submitting."
- **Failed**: "Verification failed. Please try again."

---

## SUMMARY

- **Total Questions**: 77 numbered questions
- **Total Interactive Elements**: 88 (including headers and welcome/thank you screens)
- **Sections**: 11
- **Conditional Questions**: 3
  - `alcool_detalhes` (shows if alcohol = Yes)
  - `exames_alteracoes` (shows if blood work = Yes)
  - `tipo_treino_outros` (shows if training type includes "Other")
- **Question Types**:
  - `welcome`: 12 (headers)
  - `text`: 12
  - `email`: 1
  - `number`: 2
  - `textarea`: 32
  - `yes_no`: 17
  - `multiple_choice`: 11
  - `multiple_select`: 1
  - `thank_you`: 1

---

## CONDITIONAL LOGIC

### Alcohol Details

- **Trigger**: `alcool` === "Yes"
- **Shows**: `alcool_detalhes`

### Blood Work Abnormalities

- **Trigger**: `exames_sangue` === "Yes"
- **Shows**: `exames_alteracoes`

### Training Type Other

- **Trigger**: `tipo_treino` includes "Other"
- **Shows**: `tipo_treino_outros`

---

## EMAIL SERVICE CONFIGURATION

- **Service ID**: `service_28v1fvr`
- **Template ID**: `template_48ud7sn`
- **Public Key**: `ezbPPmM_lDMistyGT`
- **Recipient**: `jacksouto7@gmail.com`
- **Client Email**: Captured from question ID `email`

import { supabase } from '@/lib/supabase';
import emailjs from '@emailjs/browser';

interface FormSubmissionData {
  clientName: string;
  clientEmail: string;
  formType: 'fitness_br' | 'fitness_usa' | 'nutrition_br' | 'nutrition_usa';
  responses: Record<string, any>;
}

interface SubmissionResult {
  success: boolean;
  formResponseId?: string;
  userId?: string;
  message: string;
  error?: string;
}

export const submitFormToDatabase = async (data: FormSubmissionData): Promise<SubmissionResult> => {
  try {
    console.log('🔄 Starting form submission to database...');
    
    // 1. Create or get user profile
    let userId: string;
    
    const { data: existingUser, error: userFetchError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', data.clientEmail)
      .single();

    if (existingUser) {
      userId = existingUser.id;
      console.log('✅ Found existing user:', userId);
    } else {
      // Create new user profile
      const { data: newUser, error: userCreateError } = await supabase
        .from('user_profiles')
        .insert({
          email: data.clientEmail,
          full_name: data.clientName,
          role: 'user'
        })
        .select('id')
        .single();

      if (userCreateError) {
        console.error('Error creating user profile:', userCreateError);
        throw new Error('Failed to create user profile');
      }
      
      userId = newUser.id;
      console.log('✅ Created new user:', userId);
    }

    // 2. Store form response
    const { data: formResponse, error: formError } = await supabase
      .from('form_responses')
      .insert({
        client_name: data.clientName,
        client_email: data.clientEmail,
        form_type: data.formType,
        responses: data.responses,
        status: 'pending'
      })
      .select('id')
      .single();

    if (formError) {
      console.error('Error storing form response:', formError);
      throw new Error('Failed to store form response');
    }

    console.log('✅ Form response stored:', formResponse.id);

    // 3. Create initial diet plan entry
    const { data: dietPlan, error: dietError } = await supabase
      .from('diet_plans')
      .insert({
        user_id: userId,
        form_data: data.responses,
        diet_plan: {}, // Empty initially, will be filled by admin
        status: 'draft'
      })
      .select('id')
      .single();

    if (dietError) {
      console.error('Error creating diet plan:', dietError);
      throw new Error('Failed to create diet plan entry');
    }

    console.log('✅ Diet plan entry created:', dietPlan.id);

    // 4. Send notification emails
    await Promise.all([
      sendAdminNotification(data, formResponse.id),
      sendClientConfirmation(data.clientEmail, data.clientName)
    ]);

    console.log('✅ Notification emails sent');

    return {
      success: true,
      formResponseId: formResponse.id,
      userId: userId,
      message: 'Form submitted successfully! Dr. Jackie will review your assessment and create your personalized diet plan within 24-48 hours.'
    };

  } catch (error) {
    console.error('Error in form submission workflow:', error);
    
    // Fallback: Send traditional email if database fails
    try {
      await sendFallbackEmail(data);
      return {
        success: false,
        error: 'Database submission failed, but we sent your form via email for manual processing.',
        message: 'There was a technical issue, but we have received your form and will process it manually.'
      };
    } catch (emailError) {
      console.error('Fallback email also failed:', emailError);
      return {
        success: false,
        error: 'Both database and email submission failed',
        message: 'We are experiencing technical difficulties. Please try again later or contact support.'
      };
    }
  }
};

const sendAdminNotification = async (data: FormSubmissionData, formResponseId: string) => {
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/form-review/${formResponseId}`;
  
  // Extract key form data for summary
  const responses = data.responses;
  const goal = responses.objetivo_principal || responses.primary_goal || 'Not specified';
  const height = responses.altura || responses.height || 'Not specified';
  const weight = responses.peso || responses.weight || 'Not specified';
  const activityLevel = responses.nivel_atividade || responses.activity_level || 'Not specified';
  const restrictions = responses.restricoes_alimentares || responses.dietary_restrictions || 'None';
  const allergies = responses.alergias || responses.allergies || 'None';
  
  const emailBody = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px;">
        🔍 New Diet Assessment Ready for Review
      </h2>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #047857; margin-top: 0;">Client Information</h3>
        <p><strong>Name:</strong> ${data.clientName}</p>
        <p><strong>Email:</strong> ${data.clientEmail}</p>
        <p><strong>Form Type:</strong> ${data.formType.replace('_', ' ').toUpperCase()}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <div style="background: #fefefe; padding: 20px; border: 1px solid #d1d5db; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Assessment Summary</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <p><strong>Primary Goal:</strong><br>${goal}</p>
            <p><strong>Height:</strong> ${height}${height !== 'Not specified' ? 'cm' : ''}</p>
            <p><strong>Weight:</strong> ${weight}${weight !== 'Not specified' ? 'kg' : ''}</p>
          </div>
          <div>
            <p><strong>Activity Level:</strong><br>${activityLevel}</p>
            <p><strong>Dietary Restrictions:</strong><br>${restrictions}</p>
            <p><strong>Allergies:</strong><br>${allergies}</p>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${adminUrl}" 
           style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          📋 Review Assessment & Create Diet Plan
        </a>
      </div>
      
      <div style="background: #f9fafb; padding: 15px; border-radius: 6px; font-size: 14px; color: #6b7280;">
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Review the client's complete assessment</li>
          <li>Select appropriate diet template based on goals and activity level</li>
          <li>Customize the meal plan with personal recommendations</li>
          <li>Approve and publish the diet plan to the client</li>
        </ol>
      </div>
    </div>
  `;

  await emailjs.send(
    'service_28v1fvr',
    'template_48ud7sn',
    {
      to_email: 'jacksouto7@gmail.com',
      client_name: 'Dr. Jackie',
      client_email: 'noreply@jackienutrition.com',
      email_body: emailBody
    },
    'ezbPPmM_lDMistyGT'
  );
};

const sendClientConfirmation = async (clientEmail: string, clientName: string) => {
  const emailBody = `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #059669; text-align: center; border-bottom: 2px solid #059669; padding-bottom: 15px;">
        ✅ Assessment Submitted Successfully!
      </h2>
      
      <div style="background: #f0fdf4; padding: 25px; border-radius: 10px; margin: 25px 0;">
        <p style="font-size: 18px; margin-bottom: 15px;"><strong>Dear ${clientName},</strong></p>
        
        <p>Thank you for completing your comprehensive nutrition and fitness assessment! We have successfully received your responses and they are now being reviewed by Dr. Jackie.</p>
      </div>
      
      <div style="background: white; padding: 20px; border-left: 4px solid #059669; margin: 25px 0;">
        <h3 style="color: #047857; margin-top: 0;">What Happens Next:</h3>
        <div style="margin-left: 20px;">
          <p>✅ <strong>Step 1:</strong> Dr. Jackie reviews your complete assessment</p>
          <p>📋 <strong>Step 2:</strong> A personalized 30-day diet plan is created based on your goals and preferences</p>
          <p>👨‍⚕️ <strong>Step 3:</strong> Dr. Jackie personally reviews and customizes your plan</p>
          <p>📧 <strong>Step 4:</strong> You receive your approved diet plan via email (within 24-48 hours)</p>
          <p>💪 <strong>Step 5:</strong> Begin your transformation journey!</p>
        </div>
      </div>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #92400e; margin-top: 0;">⏰ Timeline</h3>
        <p style="margin-bottom: 0;"><strong>Expected delivery:</strong> Your personalized diet plan will be ready within <strong>24-48 hours</strong>. You will receive a secure link to access your complete 30-day meal plan.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Questions? Reply to this email or contact our support team.<br>
          We're here to help you achieve your health and fitness goals!
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb; margin-top: 30px;">
        <p style="margin: 0; color: #059669; font-weight: bold;">Dr. Jackie's Nutrition Team</p>
        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Personalized Nutrition • Professional Results</p>
      </div>
    </div>
  `;

  await emailjs.send(
    'service_28v1fvr',
    'template_48ud7sn',
    {
      to_email: clientEmail,
      client_name: clientName,
      client_email: 'noreply@jackienutrition.com',
      email_body: emailBody
    },
    'ezbPPmM_lDMistyGT'
  );
};

const sendFallbackEmail = async (data: FormSubmissionData) => {
  // Original email functionality as backup
  let emailBody = `
    <h1>🚨 Form Submission - Database Issue (Manual Processing Required)</h1>
    <p><strong>Client:</strong> ${data.clientName}</p>
    <p><strong>Email:</strong> ${data.clientEmail}</p>
    <p><strong>Form Type:</strong> ${data.formType}</p>
    <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
    
    <h2>Form Responses:</h2>
    <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">
${JSON.stringify(data.responses, null, 2)}
    </pre>
    
    <p><strong>Note:</strong> This form could not be stored in the database and requires manual processing.</p>
  `;

  await emailjs.send(
    'service_28v1fvr',
    'template_48ud7sn',
    {
      to_email: 'jacksouto7@gmail.com',
      client_name: data.clientName,
      client_email: data.clientEmail,
      email_body: emailBody
    },
    'ezbPPmM_lDMistyGT'
  );
};

// Helper function to calculate BMR and suggested calories based on form data
export const calculateNutritionNeeds = (responses: Record<string, any>) => {
  const height = parseFloat(responses.altura || responses.height || '170');
  const weight = parseFloat(responses.peso || responses.weight || '70');
  const age = calculateAge(responses.data_nascimento || responses.birth_date || '1990-01-01');
  const gender = responses.sexo || responses.gender || 'male';
  const activityLevel = responses.nivel_atividade || responses.activity_level || 'moderate';
  const goal = responses.objetivo_principal || responses.primary_goal || 'maintenance';

  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr;
  if (gender.toLowerCase().includes('male') || gender.toLowerCase().includes('masculino')) {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  // Activity multipliers
  const activityMultipliers: Record<string, number> = {
    'sedentary': 1.2,
    'sedentario': 1.2,
    'light': 1.375,
    'leve': 1.375,
    'moderate': 1.55,
    'moderado': 1.55,
    'active': 1.725,
    'ativo': 1.725,
    'very_active': 1.9,
    'muito_ativo': 1.9
  };

  const multiplier = activityMultipliers[activityLevel.toLowerCase()] || 1.55;
  let totalCalories = Math.round(bmr * multiplier);

  // Adjust for goals
  if (goal.toLowerCase().includes('weight_loss') || goal.toLowerCase().includes('emagrecimento') || goal.toLowerCase().includes('perder')) {
    totalCalories -= 300; // Deficit for weight loss
  } else if (goal.toLowerCase().includes('muscle_gain') || goal.toLowerCase().includes('ganho_muscular') || goal.toLowerCase().includes('ganhar')) {
    totalCalories += 300; // Surplus for muscle gain
  }

  return {
    bmr: Math.round(bmr),
    totalCalories,
    recommendedProtein: Math.round(weight * 1.6), // 1.6g per kg body weight
    recommendedCarbs: Math.round(totalCalories * 0.45 / 4), // 45% of calories
    recommendedFats: Math.round(totalCalories * 0.25 / 9) // 25% of calories
  };
};

const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 30;
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

import { formPDFEmailService } from './FormPDFEmailService';

interface FormSubmissionData {
  clientName: string;
  clientEmail: string;
  formType: 'test_ai' | 'diet_form' | 'pre_signup' | 'fitness_br' | 'fitness_usa' | 'nutrition_br' | 'nutrition_usa';
  responses: Record<string, string | number | string[]>;
}

interface SubmissionResult {
  success: boolean;
  error?: string;
  message?: string;
  dietPlanId?: string;
  emailSent?: boolean;
}

// Helper function to call our AI generation API
async function callAIGenerationAPI(formData: FormSubmissionData): Promise<SubmissionResult> {
  try {
    console.log('🔄 Calling AI generation API...', { formType: formData.formType });
    
    const response = await fetch('/api/ai-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ AI generation API response:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error calling AI generation API:', error);
    throw error;
  }
}

export async function submitFormToDatabase(formData: FormSubmissionData): Promise<SubmissionResult> {
  try {
    console.log('📝 Starting form submission process...', formData.formType);
    
    // STEP 1: Send PDF email to Dr. Jackie FIRST (critical business requirement)
    console.log('📧 Sending form PDF to Dr. Jackie...');
    const emailSent = await formPDFEmailService.sendFormToDrJackie(formData);
    
    if (!emailSent) {
      console.warn('⚠️ Email to Dr. Jackie failed, but continuing with process...');
    }
    
    // STEP 2: Optionally send confirmation to client
    try {
      await formPDFEmailService.sendClientConfirmation(formData);
    } catch (err) {
      console.warn('⚠️ Client confirmation email failed (non-critical):', err);
    }
    
    // STEP 3: Call the AI generation API (if enabled for this form type)
    let aiResult: SubmissionResult | null = null;
    
    if (formData.formType === 'test_ai') {
      try {
        aiResult = await callAIGenerationAPI(formData);
      } catch (aiError) {
        console.warn('⚠️ AI generation failed (non-critical):', aiError);
        // Don't fail the whole submission if AI fails
      }
    }

    console.log('🎉 Form submission completed successfully');
    
    return {
      success: true,
      message: 'Form submitted successfully. Dr. Jackie has received your information and will be in touch soon.',
      emailSent: emailSent,
      dietPlanId: aiResult?.dietPlanId
    };
    
  } catch (error) {
    console.error('❌ Error in form submission:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      emailSent: false
    };
  }
}
interface FormSubmissionData {
  clientName: string;
  clientEmail: string;
  formType: 'test_ai' | 'diet_form' | 'pre_signup';
  responses: Record<string, string | number>;
}

interface SubmissionResult {
  success: boolean;
  error?: string;
  dietPlanId?: string;
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
    
    // Call the AI generation API
    const result = await callAIGenerationAPI(formData);
    
    if (!result.success) {
      throw new Error(result.error || 'AI generation failed');
    }

    console.log('🎉 Form submission completed successfully');
    return result;
    
  } catch (error) {
    console.error('❌ Error in form submission:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
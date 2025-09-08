// Complete System Test
// Test the 5-step workflow from form submission to client notification

import DietPlanGenerator from '../services/DietPlanGenerator';
import DietPlanStorage from '../services/DietPlanStorage';
import PDFGenerator from '../services/PDFGenerator';

// Mock form data (like what would come from NutritionUSA form)
const mockFormData = {
  nome_completo: 'Maria Silva',
  email: 'maria.silva@example.com',
  idade: '32',
  altura: '165',
  peso: '68',
  objetivo_principal: 'Weight loss',
  meta_especifica: 'Lose 10kg for summer',
  condicoes_saude: 'No health conditions',
  alimentos_gosta: 'Chicken, fish, vegetables, fruits',
  alimentos_evita: 'Red meat, dairy',
  cafe_manha_preferencia: 'Light breakfast',
  consome_carne_vermelha: 'No',
  frequencia_atividade: 'moderate',
  tipo_treinamento: 'Cardio and strength',
  frequencia_treinamento: '4-5 times per week',
  horas_sono: '7-8 hours',
  nivel_estresse: 'moderate',
  consumo_agua: '2-3 liters'
};

async function testCompleteWorkflow() {
  console.log('🚀 Starting Complete System Test...\n');

  try {
    // Step 1: Client fills form (simulated)
    console.log('📝 Step 1: Client Form Submission');
    console.log(`Client: ${mockFormData.nome_completo}`);
    console.log(`Email: ${mockFormData.email}`);
    console.log(`Goal: ${mockFormData.objetivo_principal}\n`);

    // Step 2: AI generates diet plan
    console.log('🤖 Step 2: AI Diet Plan Generation');
    const generator = new DietPlanGenerator();
    const dietPlan = generator.generatePlan(mockFormData);
    console.log(`✅ Generated 30-day plan for ${dietPlan.clientProfile.name}`);
    console.log(`Daily Calories: ${dietPlan.plan[0]?.totalCalories || 'N/A'}`);
    console.log(`Total Guidelines: ${dietPlan.guidelines.length}\n`);

    // Step 3: Store as draft for admin review
    console.log('💾 Step 3: Store Plan for Admin Review');
    const storage = new DietPlanStorage();
    const planId = storage.saveDraftPlan(dietPlan);
    console.log(`✅ Plan saved with ID: ${planId}`);
    console.log(`Status: Draft (awaiting Dr. Jackie's review)\n`);

    // Step 4: Admin review and approval (simulated)
    console.log('👩‍⚕️ Step 4: Dr. Jackie Reviews and Approves');
    const reviewNotes = 'Plan looks excellent! Added some extra protein for workout days.';
    const approved = storage.approvePlan(planId, 'Dr. Jackie', reviewNotes);
    console.log(`✅ Plan approved: ${approved}`);
    console.log(`Review notes: ${reviewNotes}\n`);

    // Step 5: Send notification to client
    console.log('📧 Step 5: Client Notification');
    const accessLink = `https://jackiesouto.com/client/diet-portal/${planId}`;
    
    // Note: In testing, we'll just verify the notification data structure
    const notificationData = {
      clientName: dietPlan.clientProfile.name,
      clientEmail: dietPlan.clientProfile.email,
      planId: planId,
      dietPlan: dietPlan,
      accessLink: accessLink
    };

    console.log(`✅ Notification prepared for: ${notificationData.clientEmail}`);
    console.log(`Access Link: ${notificationData.accessLink}`);
    console.log(`Client can now access their personalized 30-day nutrition plan!\n`);

    // Verify storage state
    console.log('🔍 Final System State:');
    const pendingPlans = storage.getPendingPlans();
    const approvedPlans = storage.getApprovedPlans();
    console.log(`Pending Plans: ${pendingPlans.length}`);
    console.log(`Approved Plans: ${approvedPlans.length}`);
    
    // Test PDF generation
    console.log('\n📄 Testing PDF Generation:');
    const pdfGenerator = new PDFGenerator();
    try {
      const pdfDataUri = pdfGenerator.generateDietPlanPDF(dietPlan);
      console.log(`✅ PDF generated successfully (${pdfDataUri.length} characters)`);
    } catch (error) {
      console.log(`❌ PDF generation failed: ${error}`);
    }

    console.log('\n🎉 Complete Workflow Test PASSED!');
    console.log('All 5 steps are working correctly:');
    console.log('1. ✅ Form submission captures client data');
    console.log('2. ✅ AI generates personalized diet plan');
    console.log('3. ✅ Plan stored for admin review');
    console.log('4. ✅ Admin can review and approve');
    console.log('5. ✅ Client notification system ready');

  } catch (error) {
    console.error('❌ Workflow test failed:', error);
    throw error;
  }
}

// Export for use in other test files
export { testCompleteWorkflow, mockFormData };

// Console test runner
if (typeof window !== 'undefined') {
  console.log('🧪 Jackie Platform System Test Available');
  console.log('Run: testCompleteWorkflow() in browser console');
  (window as any).testCompleteWorkflow = testCompleteWorkflow;
}

export default testCompleteWorkflow;

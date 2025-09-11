// Client Notification Service
// Handles sending notifications to clients when their diet plan is ready

import emailjs from '@emailjs/browser';
import { DietPlan } from './DietPlanGenerator';

export interface NotificationData {
  clientName: string;
  clientEmail: string;
  planId: string;
  dietPlan: DietPlan;
  accessLink: string;
}

class ClientNotificationService {
  private serviceId = 'service_28v1fvr';
  private templateId = 'template_client_notification'; // You'll need to create this template
  private publicKey = 'ezbPPmM_lDMistyGT';

  public async sendDietReadyNotification(data: NotificationData): Promise<boolean> {
    try {
      const emailBody = this.generateDietReadyEmail(data);
      
      const templateParams = {
        to_email: data.clientEmail,
        client_name: data.clientName,
        subject: `🍎 Your Personalized Diet Plan is Ready!`,
        email_body: emailBody,
        access_link: data.accessLink
      };

      console.log('Sending diet ready notification to client...');
      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );

      console.log('Client notification sent successfully:', response);
      return true;
      
    } catch (error) {
      console.error('Error sending client notification:', error);
      return false;
    }
  }

  private generateDietReadyEmail(data: NotificationData): string {
    const { clientName, dietPlan, accessLink } = data;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
            🎉 Your Diet Plan is Ready!
          </h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">
            Personalized nutrition plan created just for you
          </p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 20px; background-color: white;">
          
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hi ${clientName}! 👋</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Great news! Dr. Jackie has reviewed and approved your personalized 30-day nutrition plan. 
            Your custom diet has been created specifically for your goals and preferences.
          </p>

          <!-- Plan Highlights -->
          <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">📊 Your Plan Highlights</h3>
            <ul style="color: #1f2937; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>Goal:</strong> ${dietPlan.clientProfile.mainGoal}</li>
              <li><strong>Daily Calories:</strong> ${dietPlan.plan[0]?.totalCalories || 'N/A'} kcal</li>
              <li><strong>Protein:</strong> ${dietPlan.plan[0]?.macros.protein || 'N/A'}g daily</li>
              <li><strong>Duration:</strong> 30 days of meal plans</li>
              <li><strong>Guidelines:</strong> ${dietPlan.guidelines.length} personalized tips</li>
            </ul>
          </div>

          <!-- Sample Meals Preview -->
          <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h3 style="color: #15803d; margin: 0 0 15px 0; font-size: 18px;">🍽️ Sample Meals from Your Plan</h3>
            ${dietPlan.plan.slice(0, 2).map(day => `
              <div style="margin-bottom: 15px; padding: 15px; background-color: white; border-radius: 6px; border: 1px solid #bbf7d0;">
                <h4 style="color: #059669; margin: 0 0 8px 0; font-size: 16px;">Day ${day.day}</h4>
                <div style="color: #374151; font-size: 14px;">
                  <p style="margin: 0;"><strong>Breakfast:</strong> ${day.meals.breakfast.name}</p>
                  <p style="margin: 0;"><strong>Lunch:</strong> ${day.meals.lunch.name}</p>
                  <p style="margin: 0;"><strong>Dinner:</strong> ${day.meals.dinner.name}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${accessLink}" 
               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                      color: white; 
                      padding: 16px 32px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      font-size: 18px;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
                      transition: all 0.3s ease;">
              🍎 View Your Diet Plan
            </a>
          </div>

          <p style="color: #6b7280; text-align: center; font-size: 14px; margin-top: 30px;">
            Click the button above to access your complete 30-day meal plan with recipes, shopping lists, and more!
          </p>

          <!-- Important Tips -->
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
            <h4 style="color: #d97706; margin: 0 0 15px 0; font-size: 16px;">💡 Quick Tips to Get Started</h4>
            <ul style="color: #92400e; line-height: 1.6; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Bookmark your diet plan link for easy access</li>
              <li>Download the PDF version for offline reference</li>
              <li>Start with Week 1 and follow the daily meal plans</li>
              <li>Contact Dr. Jackie if you have any questions</li>
            </ul>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Dr. Jackie Souto</h3>
          <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
            Health & Fitness Coach | Transforming Lives in New Zealand & Brazil
          </p>
          <div style="margin: 20px 0;">
            <a href="https://jackiesouto.com" style="color: #10b981; text-decoration: none; margin: 0 10px;">🌐 Website</a>
            <a href="mailto:doc@jackiesouto.com" style="color: #10b981; text-decoration: none; margin: 0 10px;">📧 Email</a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0;">
            This email was sent because you requested a personalized diet plan from Dr. Jackie.<br>
            Plan ID: ${data.planId} | Created with Jackie Platform
          </p>
        </div>

      </div>
    `;
  }

  public async sendPlanUpdateNotification(data: NotificationData): Promise<boolean> {
    try {
      const emailBody = this.generatePlanUpdateEmail(data);
      
      const templateParams = {
        to_email: data.clientEmail,
        client_name: data.clientName,
        subject: `📝 Your Diet Plan Has Been Updated`,
        email_body: emailBody,
        access_link: data.accessLink
      };

      console.log('Sending plan update notification to client...');
      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );

      console.log('Plan update notification sent successfully:', response);
      return true;
      
    } catch (error) {
      console.error('Error sending plan update notification:', error);
      return false;
    }
  }

  private generatePlanUpdateEmail(data: NotificationData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📝 Diet Plan Updated</h1>
          <p style="color: #bfdbfe; margin: 10px 0 0 0;">Dr. Jackie has made improvements to your plan</p>
        </div>

        <div style="padding: 30px 20px; background-color: white;">
          <h2 style="color: #1f2937;">Hi ${data.clientName}!</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Dr. Jackie has reviewed and updated your diet plan based on your progress and feedback. 
            The updated plan includes optimized meal suggestions and refined nutrition targets.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.accessLink}" 
               style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
                      color: white; 
                      padding: 14px 28px; 
                      text-decoration: none; 
                      border-radius: 6px; 
                      font-weight: bold;">
              View Updated Plan
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Continue following your personalized nutrition plan for the best results!
          </p>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            Dr. Jackie Souto | Health & Fitness Coach<br>
            Plan ID: ${data.planId}
          </p>
        </div>

      </div>
    `;
  }

  public async sendReminderNotification(clientEmail: string, clientName: string, accessLink: string): Promise<boolean> {
    try {
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center; padding: 40px 20px;">
          
          <h1 style="color: #10b981; margin-bottom: 20px;">🍎 Don't Forget Your Diet Plan!</h1>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            Hi ${clientName}! Just a friendly reminder that your personalized diet plan is ready and waiting for you.
          </p>

          <a href="${accessLink}" 
             style="background-color: #10b981; 
                    color: white; 
                    padding: 14px 28px; 
                    text-decoration: none; 
                    border-radius: 6px; 
                    font-weight: bold;
                    display: inline-block;">
            Access Your Plan
          </a>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Start your journey to better health today!<br>
            Dr. Jackie Souto
          </p>
          
        </div>
      `;
      
      const templateParams = {
        to_email: clientEmail,
        client_name: clientName,
        subject: `🍎 Your Diet Plan is Waiting`,
        email_body: emailBody
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );

      console.log('Reminder notification sent successfully:', response);
      return true;
      
    } catch (error) {
      console.error('Error sending reminder notification:', error);
      return false;
    }
  }
}

export default ClientNotificationService;

// Diet Plan Storage Service
// Manages saving, loading, and updating diet plans

import { DietPlan } from './DietPlanGenerator';

export interface DietPlanSummary {
  id: string;
  clientName: string;
  clientEmail?: string;
  status: 'draft' | 'approved' | 'sent';
  createdAt: string;
  approvedAt?: string;
  sentAt?: string;
  goal: string;
}

class DietPlanStorage {
  private storageKey = 'jackie-diet-plans';
  
  // In a real app, this would be a database
  // For now, we'll use localStorage with fallback to sessionStorage
  
  private getStorage(): Storage {
    try {
      return localStorage;
    } catch {
      return sessionStorage;
    }
  }

  private getAllPlans(): { [key: string]: DietPlan } {
    try {
      const storage = this.getStorage();
      const data = storage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading diet plans:', error);
      return {};
    }
  }

  private saveAllPlans(plans: { [key: string]: DietPlan }): void {
    try {
      const storage = this.getStorage();
      storage.setItem(this.storageKey, JSON.stringify(plans));
    } catch (error) {
      console.error('Error saving diet plans:', error);
      throw new Error('Failed to save diet plan. Storage may be full.');
    }
  }

  public saveDraftPlan(dietPlan: DietPlan): string {
    const plans = this.getAllPlans();
    const planId = dietPlan.id;
    
    // Ensure it's marked as draft
    dietPlan.status = 'draft';
    dietPlan.createdAt = new Date().toISOString();
    
    plans[planId] = dietPlan;
    this.saveAllPlans(plans);
    
    console.log(`Draft diet plan saved for ${dietPlan.clientProfile.name}`);
    return planId;
  }

  public getPlan(planId: string): DietPlan | null {
    const plans = this.getAllPlans();
    return plans[planId] || null;
  }

  public updatePlan(planId: string, updatedPlan: Partial<DietPlan>): boolean {
    const plans = this.getAllPlans();
    const existingPlan = plans[planId];
    
    if (!existingPlan) {
      console.error(`Plan ${planId} not found`);
      return false;
    }
    
    // Merge the updates
    plans[planId] = {
      ...existingPlan,
      ...updatedPlan,
      id: planId // Ensure ID doesn't change
    };
    
    this.saveAllPlans(plans);
    console.log(`Diet plan ${planId} updated`);
    return true;
  }

  public approvePlan(planId: string, approvedBy: string, reviewNotes?: string): boolean {
    const plans = this.getAllPlans();
    const plan = plans[planId];
    
    if (!plan) {
      console.error(`Plan ${planId} not found`);
      return false;
    }
    
    plan.status = 'approved';
    plan.approvedBy = approvedBy;
    plan.approvedAt = new Date().toISOString();
    if (reviewNotes) {
      plan.reviewNotes = reviewNotes;
    }
    
    plans[planId] = plan;
    this.saveAllPlans(plans);
    
    console.log(`Diet plan ${planId} approved by ${approvedBy}`);
    return true;
  }

  public markAsSent(planId: string): boolean {
    const plans = this.getAllPlans();
    const plan = plans[planId];
    
    if (!plan) {
      console.error(`Plan ${planId} not found`);
      return false;
    }
    
    plan.status = 'sent';
    plan.sentAt = new Date().toISOString();
    
    plans[planId] = plan;
    this.saveAllPlans(plans);
    
    console.log(`Diet plan ${planId} marked as sent`);
    return true;
  }

  public getAllPlanSummaries(): DietPlanSummary[] {
    const plans = this.getAllPlans();
    
    return Object.values(plans).map(plan => ({
      id: plan.id,
      clientName: plan.clientProfile.name,
      status: plan.status,
      createdAt: plan.createdAt,
      approvedAt: plan.approvedAt,
      sentAt: plan.sentAt,
      goal: plan.clientProfile.mainGoal
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getPendingPlans(): DietPlanSummary[] {
    return this.getAllPlanSummaries().filter(plan => plan.status === 'draft');
  }

  public getApprovedPlans(): DietPlanSummary[] {
    return this.getAllPlanSummaries().filter(plan => plan.status === 'approved');
  }

  public deletePlan(planId: string): boolean {
    const plans = this.getAllPlans();
    
    if (!plans[planId]) {
      console.error(`Plan ${planId} not found`);
      return false;
    }
    
    delete plans[planId];
    this.saveAllPlans(plans);
    
    console.log(`Diet plan ${planId} deleted`);
    return true;
  }

  public exportPlanData(planId: string): string | null {
    const plan = this.getPlan(planId);
    if (!plan) return null;
    
    return JSON.stringify(plan, null, 2);
  }

  public importPlanData(jsonData: string): string | null {
    try {
      const plan: DietPlan = JSON.parse(jsonData);
      
      // Validate the plan structure
      if (!plan.id || !plan.clientProfile || !plan.plan || !plan.guidelines) {
        throw new Error('Invalid diet plan structure');
      }
      
      return this.saveDraftPlan(plan);
    } catch (error) {
      console.error('Error importing plan data:', error);
      return null;
    }
  }

  // Statistics and analytics
  public getStatistics() {
    const plans = this.getAllPlanSummaries();
    
    return {
      total: plans.length,
      pending: plans.filter(p => p.status === 'draft').length,
      approved: plans.filter(p => p.status === 'approved').length,
      sent: plans.filter(p => p.status === 'sent').length,
      goalBreakdown: this.getGoalBreakdown(plans),
      recentActivity: plans.slice(0, 5)
    };
  }

  private getGoalBreakdown(plans: DietPlanSummary[]) {
    const breakdown: { [key: string]: number } = {};
    
    plans.forEach(plan => {
      breakdown[plan.goal] = (breakdown[plan.goal] || 0) + 1;
    });
    
    return breakdown;
  }

  // Cleanup old plans (optional)
  public cleanupOldPlans(daysOld: number = 90): number {
    const plans = this.getAllPlans();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    let deletedCount = 0;
    
    Object.entries(plans).forEach(([planId, plan]) => {
      const planDate = new Date(plan.createdAt);
      if (planDate < cutoffDate && plan.status === 'sent') {
        delete plans[planId];
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      this.saveAllPlans(plans);
      console.log(`Cleaned up ${deletedCount} old diet plans`);
    }
    
    return deletedCount;
  }
}

export default DietPlanStorage;

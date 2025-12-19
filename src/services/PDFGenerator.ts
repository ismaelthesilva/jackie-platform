// PDF Generator Service
// Converts diet plans to professional PDF documents

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DietPlan, DayPlan, Meal } from './DietPlanGenerator';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
  }

  private addHeader(title: string): void {
    // Add Dr. Jackie branding
    this.doc.setFontSize(24);
    this.doc.setTextColor(16, 185, 129); // Emerald color
    this.doc.text('Dr. Jackie Souto', this.margin, 30);
    
    this.doc.setFontSize(12);
    this.doc.setTextColor(107, 114, 128); // Gray color
    this.doc.text('Health & Fitness Coach', this.margin, 40);
    this.doc.text('jackiesouto.com', this.margin, 48);
    
    // Main title
    this.doc.setFontSize(20);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, this.margin, 70);
    
    // Add a line separator
    this.doc.setDrawColor(229, 231, 235); // Gray-200
    this.doc.line(this.margin, 75, this.pageWidth - this.margin, 75);
  }

  private addClientProfile(dietPlan: DietPlan): void {
    const profile = dietPlan.clientProfile;
    let yPosition = 90;
    
    this.doc.setFontSize(16);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(`Prepared for: ${profile.name}`, this.margin, yPosition);
    yPosition += 15;
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(75, 85, 99); // Gray-600
    this.doc.text('Client Profile Summary', this.margin, yPosition);
    yPosition += 10;
    
    this.doc.setFontSize(11);
    const profileInfo = [
      `Age: ${profile.age} years`,
      `Height: ${profile.height} cm`,
      `Weight: ${profile.weight} kg`,
      `Primary Goal: ${profile.mainGoal}`,
      `Activity Level: ${profile.activityLevel}`,
      profile.specificGoal ? `Specific Goal: ${profile.specificGoal}` : null,
      profile.healthConditions ? `Health Conditions: ${profile.healthConditions}` : null,
      profile.intolerances ? `Food Intolerances: ${profile.intolerances}` : null
    ].filter(Boolean);
    
    profileInfo.forEach((info) => {
      if (info) {
        this.doc.text(info, this.margin + 5, yPosition);
        yPosition += 8;
      }
    });

    // Nutrition targets
    yPosition += 10;
    this.doc.setFontSize(14);
    this.doc.setTextColor(75, 85, 99);
    this.doc.text('Daily Nutrition Targets', this.margin, yPosition);
    yPosition += 10;
    
    this.doc.setFontSize(11);
    const firstDay = dietPlan.plan[0];
    const nutritionInfo = [
      `Daily Calories: ${firstDay.totalCalories} kcal`,
      `Protein: ${firstDay.macros.protein}g`,
      `Carbohydrates: ${firstDay.macros.carbs}g`,
      `Fats: ${firstDay.macros.fats}g`
    ];
    
    nutritionInfo.forEach((info) => {
      this.doc.text(info, this.margin + 5, yPosition);
      yPosition += 8;
    });
  }

  private addGuidelines(guidelines: string[]): void {
    this.doc.addPage();
    this.doc.setFontSize(18);
    this.doc.setTextColor(16, 185, 129);
    this.doc.text('Nutrition Guidelines', this.margin, 30);
    
    let yPosition = 50;
    this.doc.setFontSize(11);
    this.doc.setTextColor(0, 0, 0);
    
    guidelines.forEach((guideline, index) => {
      if (yPosition > this.pageHeight - 30) {
        this.doc.addPage();
        yPosition = 30;
      }
      
      this.doc.text(`${index + 1}. ${guideline}`, this.margin, yPosition);
      yPosition += 12;
    });
  }

  private addWeeklyOverview(dietPlan: DietPlan): void {
    this.doc.addPage();
    this.doc.setFontSize(18);
    this.doc.setTextColor(16, 185, 129);
    this.doc.text('30-Day Meal Plan Overview', this.margin, 30);
    
    // Create weekly tables
    for (let week = 0; week < 4; week++) {
      if (week > 0) this.doc.addPage();
      
      const weekStart = week * 7;
      const weekEnd = Math.min(weekStart + 7, dietPlan.plan.length);
      const weekPlan = dietPlan.plan.slice(weekStart, weekEnd);
      
      this.doc.setFontSize(16);
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(`Week ${week + 1}`, this.margin, week > 0 ? 30 : 50);
      
      // Create table data
      const tableData = weekPlan.map(day => [
        `Day ${day.day}`,
        this.truncateText(day.meals.breakfast.name, 25),
        this.truncateText(day.meals.lunch.name, 25),
        this.truncateText(day.meals.dinner.name, 25),
        `${day.totalCalories}`
      ]);

      this.doc.autoTable({
        head: [['Day', 'Breakfast', 'Lunch', 'Dinner', 'Calories']],
        body: tableData,
        startY: week > 0 ? 40 : 60,
        styles: { 
          fontSize: 9,
          cellPadding: 3
        },
        headStyles: { 
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontSize: 10
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 40 },
          2: { cellWidth: 40 },
          3: { cellWidth: 40 },
          4: { cellWidth: 25 }
        }
      });
    }
  }

  private addDetailedRecipes(dietPlan: DietPlan): void {
    this.doc.addPage();
    this.doc.setFontSize(18);
    this.doc.setTextColor(16, 185, 129);
    this.doc.text('Recipe Details', this.margin, 30);
    
    // Get unique meals
    const uniqueMeals = this.getUniqueMeals(dietPlan.plan);
    let yPosition = 50;
    
    uniqueMeals.forEach((meal, index) => {
      // Check if we need a new page
      if (yPosition > this.pageHeight - 100) {
        this.doc.addPage();
        yPosition = 30;
      }
      
      // Recipe name
      this.doc.setFontSize(14);
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(meal.name, this.margin, yPosition);
      yPosition += 8;
      
      // Nutrition info
      this.doc.setFontSize(10);
      this.doc.setTextColor(107, 114, 128);
      this.doc.text(
        `${meal.calories} cal | ${meal.protein}g protein | ${meal.carbs}g carbs | ${meal.fats}g fats | ${meal.prepTime}`,
        this.margin,
        yPosition
      );
      yPosition += 12;
      
      // Ingredients
      this.doc.setFontSize(11);
      this.doc.setTextColor(0, 0, 0);
      this.doc.text('Ingredients:', this.margin, yPosition);
      yPosition += 8;
      
      meal.ingredients.forEach((ingredient, idx) => {
        const portion = meal.portions[idx] || '';
        this.doc.setFontSize(10);
        this.doc.text(`• ${ingredient} (${portion})`, this.margin + 5, yPosition);
        yPosition += 6;
      });
      
      // Instructions
      if (meal.instructions) {
        yPosition += 5;
        this.doc.setFontSize(11);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text('Instructions:', this.margin, yPosition);
        yPosition += 8;
        
        this.doc.setFontSize(10);
        const splitInstructions = this.doc.splitTextToSize(
          meal.instructions,
          this.pageWidth - (this.margin * 2)
        );
        
        splitInstructions.forEach((line: string) => {
          if (yPosition > this.pageHeight - 30) {
            this.doc.addPage();
            yPosition = 30;
          }
          this.doc.text(line, this.margin + 5, yPosition);
          yPosition += 6;
        });
      }
      
      yPosition += 15;
      
      // Add separator line between recipes
      if (index < uniqueMeals.length - 1) {
        this.doc.setDrawColor(229, 231, 235);
        this.doc.line(this.margin, yPosition - 5, this.pageWidth - this.margin, yPosition - 5);
        yPosition += 5;
      }
    });
  }

  private addFooter(): void {
    const totalPages = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      
      // Page number
      this.doc.setFontSize(10);
      this.doc.setTextColor(107, 114, 128);
      this.doc.text(
        `Page ${i} of ${totalPages}`,
        this.pageWidth - this.margin - 30,
        this.pageHeight - 10
      );
      
      // Footer text
      this.doc.text(
        'Created by Dr. Jackie Souto | jackiesouto.com',
        this.margin,
        this.pageHeight - 10
      );
    }
  }

  private getUniqueMeals(plan: DayPlan[]): Meal[] {
    const uniqueMeals = new Map<string, Meal>();
    
    plan.forEach(day => {
      Object.values(day.meals).forEach((meal) => {
        if (meal && !uniqueMeals.has(meal.name)) {
          uniqueMeals.set(meal.name, meal);
        }
      });
    });
    
    return Array.from(uniqueMeals.values()).sort((a, b) => {
      // Sort by category: breakfast, lunch, dinner, snack
      const categoryOrder = { breakfast: 1, lunch: 2, dinner: 3, snack: 4 };
      return categoryOrder[a.category] - categoryOrder[b.category];
    });
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  public generateDietPlanPDF(dietPlan: DietPlan): string {
    // Reset document
    this.doc = new jsPDF();
    
    // Add content sections
    this.addHeader('30-Day Personalized Diet Plan');
    this.addClientProfile(dietPlan);
    this.addGuidelines(dietPlan.guidelines);
    this.addWeeklyOverview(dietPlan);
    this.addDetailedRecipes(dietPlan);
    this.addFooter();
    
    // Return as data URI for email attachment or download
    return this.doc.output('datauristring');
  }

  public downloadPDF(dietPlan: DietPlan, filename?: string): void {
    this.generateDietPlanPDF(dietPlan);
    const fileName = filename || `diet-plan-${dietPlan.clientProfile.name.replace(/\s+/g, '-')}.pdf`;
    this.doc.save(fileName);
  }
}

export default PDFGenerator;

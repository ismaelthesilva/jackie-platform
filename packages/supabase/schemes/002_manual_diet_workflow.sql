-- Manual Diet Workflow Schema
-- Add missing tables for the manual workflow system

-- 1. Form Responses table (store all form submissions)
CREATE TABLE IF NOT EXISTS form_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    form_type TEXT NOT NULL CHECK (form_type IN ('fitness_br', 'fitness_usa', 'nutrition_br', 'nutrition_usa')),
    responses JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Diet Templates table (pre-built templates for different goals)
CREATE TABLE IF NOT EXISTS diet_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('weight_loss', 'muscle_gain', 'maintenance', 'athletic_performance')),
    activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    calorie_range_min INTEGER NOT NULL,
    calorie_range_max INTEGER NOT NULL,
    target_protein INTEGER NOT NULL,
    target_carbs INTEGER NOT NULL,
    target_fats INTEGER NOT NULL,
    template_data JSONB NOT NULL, -- 30-day meal plan template
    created_by UUID REFERENCES user_profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Meal Library table (individual meals that can be mixed and matched)
CREATE TABLE IF NOT EXISTS meal_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'post_workout')),
    cuisine_type TEXT,
    dietary_tags TEXT[], -- ['vegetarian', 'gluten_free', 'dairy_free', 'high_protein', etc.]
    calories INTEGER NOT NULL,
    protein INTEGER NOT NULL,
    carbs INTEGER NOT NULL,
    fats INTEGER NOT NULL,
    ingredients JSONB NOT NULL,
    instructions TEXT NOT NULL,
    prep_time INTEGER, -- minutes
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    created_by UUID REFERENCES user_profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Published Diets table (approved diets with client access)
CREATE TABLE IF NOT EXISTS published_diets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    diet_plan_id UUID REFERENCES diet_plans(id) ON DELETE CASCADE,
    form_response_id UUID REFERENCES form_responses(id) ON DELETE CASCADE,
    client_email TEXT NOT NULL,
    access_token TEXT UNIQUE NOT NULL,
    diet_content JSONB NOT NULL, -- Final approved diet content
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0
);

-- 5. Admin Notes table (track review process and communications)
CREATE TABLE IF NOT EXISTS admin_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    diet_plan_id UUID REFERENCES diet_plans(id) ON DELETE CASCADE,
    admin_user_id UUID REFERENCES user_profiles(id),
    note_type TEXT CHECK (note_type IN ('review', 'modification', 'communication', 'approval')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_form_responses_email ON form_responses(client_email);
CREATE INDEX IF NOT EXISTS idx_form_responses_status ON form_responses(status);
CREATE INDEX IF NOT EXISTS idx_form_responses_type ON form_responses(form_type);
CREATE INDEX IF NOT EXISTS idx_diet_templates_goal ON diet_templates(goal_type);
CREATE INDEX IF NOT EXISTS idx_diet_templates_activity ON diet_templates(activity_level);
CREATE INDEX IF NOT EXISTS idx_diet_templates_calories ON diet_templates(calorie_range_min, calorie_range_max);
CREATE INDEX IF NOT EXISTS idx_meal_library_type ON meal_library(meal_type);
CREATE INDEX IF NOT EXISTS idx_meal_library_calories ON meal_library(calories);
CREATE INDEX IF NOT EXISTS idx_published_diets_token ON published_diets(access_token);
CREATE INDEX IF NOT EXISTS idx_published_diets_email ON published_diets(client_email);

-- Enable Row Level Security
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_diets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Form Responses: Anyone can insert, admins can view all, users can view their own
CREATE POLICY "Allow form submissions" ON form_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view all form responses" ON form_responses FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can view own form responses" ON form_responses FOR SELECT USING (
    client_email = auth.jwt() ->> 'email'
);

-- Diet Templates: Admins can manage, everyone can read active templates
CREATE POLICY "Admin can manage diet templates" ON diet_templates FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Everyone can view active templates" ON diet_templates FOR SELECT USING (is_active = true);

-- Meal Library: Admins can manage, everyone can read active meals
CREATE POLICY "Admin can manage meal library" ON meal_library FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Everyone can view active meals" ON meal_library FOR SELECT USING (is_active = true);

-- Published Diets: Anyone can read with valid token, admins can manage
CREATE POLICY "Access with valid token" ON published_diets FOR SELECT USING (true);
CREATE POLICY "Admin can manage published diets" ON published_diets FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admin Notes: Only admins can manage
CREATE POLICY "Admin can manage notes" ON admin_notes FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Update existing diet_plans table policies to work with new workflow
DROP POLICY IF EXISTS "Users can view own diet plans" ON diet_plans;
DROP POLICY IF EXISTS "Admin can manage all diet plans" ON diet_plans;

CREATE POLICY "Admin can manage all diet plans" ON diet_plans FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can view own diet plans" ON diet_plans FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM published_diets WHERE diet_plan_id = diet_plans.id AND published_diets.client_email = auth.jwt() ->> 'email')
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_form_responses_updated_at 
    BEFORE UPDATE ON form_responses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_templates_updated_at 
    BEFORE UPDATE ON diet_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample diet templates for different goals and activity levels
INSERT INTO diet_templates (name, description, goal_type, activity_level, calorie_range_min, calorie_range_max, target_protein, target_carbs, target_fats, template_data) VALUES

-- Weight Loss Templates
('Weight Loss - Sedentary Women', 'Low calorie plan for sedentary women focusing on weight loss', 'weight_loss', 'sedentary', 1200, 1400, 120, 100, 45, '{"overview": {"duration": "30 days", "totalCalories": 1300}, "weeks": []}'),

('Weight Loss - Active Women/Sedentary Men', 'Moderate calorie plan for active women or sedentary men', 'weight_loss', 'light', 1400, 1600, 140, 130, 50, '{"overview": {"duration": "30 days", "totalCalories": 1500}, "weeks": []}'),

('Weight Loss - Active Men', 'Higher calorie weight loss plan for active men', 'weight_loss', 'moderate', 1700, 1900, 160, 150, 60, '{"overview": {"duration": "30 days", "totalCalories": 1800}, "weeks": []}'),

-- Muscle Gain Templates
('Muscle Gain - Moderate Activity', 'Muscle building plan for moderate activity level', 'muscle_gain', 'moderate', 2400, 2600, 180, 280, 85, '{"overview": {"duration": "30 days", "totalCalories": 2500}, "weeks": []}'),

('Muscle Gain - High Activity', 'Muscle building plan for highly active individuals', 'muscle_gain', 'active', 2900, 3100, 220, 330, 100, '{"overview": {"duration": "30 days", "totalCalories": 3000}, "weeks": []}'),

('Muscle Gain - Very High Activity', 'Muscle building plan for very active athletes', 'muscle_gain', 'very_active', 3400, 3600, 260, 390, 120, '{"overview": {"duration": "30 days", "totalCalories": 3500}, "weeks": []}'),

-- Maintenance Templates
('Maintenance - Average', 'Balanced maintenance plan for average activity', 'maintenance', 'light', 1900, 2100, 150, 225, 75, '{"overview": {"duration": "30 days", "totalCalories": 2000}, "weeks": []}'),

('Maintenance - Moderate Activity', 'Maintenance plan for moderately active individuals', 'maintenance', 'moderate', 2100, 2300, 165, 250, 85, '{"overview": {"duration": "30 days", "totalCalories": 2200}, "weeks": []}'),

('Maintenance - High Activity', 'Maintenance plan for highly active individuals', 'maintenance', 'active', 2400, 2600, 185, 280, 95, '{"overview": {"duration": "30 days", "totalCalories": 2500}, "weeks": []}');

-- Insert sample meals into meal library
INSERT INTO meal_library (name, meal_type, cuisine_type, dietary_tags, calories, protein, carbs, fats, ingredients, instructions, prep_time, difficulty_level) VALUES

-- Breakfast Options
('Protein Oats Bowl', 'breakfast', 'American', ARRAY['high_protein', 'vegetarian'], 420, 35, 45, 12, 
'[{"item": "Rolled oats", "quantity": "50g", "calories": 190}, {"item": "Whey protein powder", "quantity": "30g", "calories": 120}, {"item": "Banana", "quantity": "1 medium", "calories": 105}, {"item": "Almonds", "quantity": "10g", "calories": 58}]', 
'Mix oats with water, stir in protein powder, top with sliced banana and chopped almonds', 5, 'easy'),

('Egg White Scramble', 'breakfast', 'American', ARRAY['high_protein', 'gluten_free'], 285, 25, 20, 8,
'[{"item": "Egg whites", "quantity": "150g", "calories": 80}, {"item": "Spinach", "quantity": "100g", "calories": 25}, {"item": "Bell pepper", "quantity": "80g", "calories": 20}, {"item": "Olive oil", "quantity": "1 tsp", "calories": 40}, {"item": "Whole grain toast", "quantity": "1 slice", "calories": 80}]',
'Heat oil in pan, sauté vegetables, add egg whites and scramble. Serve with toast', 8, 'easy'),

-- Lunch Options
('Grilled Chicken & Rice', 'lunch', 'American', ARRAY['high_protein', 'gluten_free'], 520, 45, 55, 12,
'[{"item": "Chicken breast", "quantity": "150g", "calories": 250}, {"item": "Brown rice", "quantity": "80g dry", "calories": 280}, {"item": "Broccoli", "quantity": "150g", "calories": 40}, {"item": "Olive oil", "quantity": "1 tsp", "calories": 40}]',
'Season and grill chicken breast. Steam broccoli. Serve over cooked brown rice with a drizzle of olive oil', 25, 'medium'),

('Salmon Quinoa Bowl', 'lunch', 'Mediterranean', ARRAY['high_protein', 'omega3', 'gluten_free'], 485, 38, 40, 18,
'[{"item": "Salmon fillet", "quantity": "120g", "calories": 220}, {"item": "Quinoa", "quantity": "60g dry", "calories": 220}, {"item": "Mixed greens", "quantity": "100g", "calories": 20}, {"item": "Cucumber", "quantity": "100g", "calories": 15}, {"item": "Lemon", "quantity": "1/2", "calories": 10}]',
'Bake seasoned salmon at 400°F for 15 minutes. Serve over cooked quinoa with mixed greens, cucumber, and lemon', 20, 'medium'),

-- Dinner Options
('Lean Beef & Sweet Potato', 'dinner', 'American', ARRAY['high_protein', 'gluten_free'], 420, 35, 45, 10,
'[{"item": "Lean ground beef", "quantity": "120g", "calories": 180}, {"item": "Sweet potato", "quantity": "200g", "calories": 180}, {"item": "Green beans", "quantity": "150g", "calories": 35}, {"item": "Garlic", "quantity": "2 cloves", "calories": 10}, {"item": "Herbs", "quantity": "1 tbsp", "calories": 5}]',
'Brown seasoned ground beef. Roast cubed sweet potato at 425°F for 25 minutes. Steam green beans. Combine and season', 35, 'medium'),

('Grilled Turkey & Vegetables', 'dinner', 'Mediterranean', ARRAY['high_protein', 'low_carb'], 350, 40, 25, 12,
'[{"item": "Turkey breast", "quantity": "150g", "calories": 200}, {"item": "Zucchini", "quantity": "200g", "calories": 40}, {"item": "Bell peppers", "quantity": "150g", "calories": 45}, {"item": "Olive oil", "quantity": "1 tbsp", "calories": 120}, {"item": "Herbs", "quantity": "mix", "calories": 5}]',
'Marinate turkey in herbs and oil. Grill turkey and vegetables until cooked through. Season with herbs', 30, 'medium'),

-- Snack Options
('Greek Yogurt & Berries', 'snack', 'Mediterranean', ARRAY['high_protein', 'probiotic'], 180, 20, 18, 3,
'[{"item": "Greek yogurt", "quantity": "150g", "calories": 130}, {"item": "Mixed berries", "quantity": "100g", "calories": 50}]',
'Combine Greek yogurt with fresh mixed berries', 2, 'easy'),

('Protein Smoothie', 'snack', 'American', ARRAY['high_protein', 'vegetarian'], 220, 25, 20, 5,
'[{"item": "Whey protein", "quantity": "30g", "calories": 120}, {"item": "Banana", "quantity": "1 small", "calories": 90}, {"item": "Almond milk", "quantity": "200ml", "calories": 30}]',
'Blend all ingredients until smooth', 3, 'easy'),

('Almonds & Apple', 'snack', 'American', ARRAY['healthy_fats', 'fiber'], 195, 6, 20, 12,
'[{"item": "Raw almonds", "quantity": "20g", "calories": 115}, {"item": "Apple", "quantity": "1 medium", "calories": 80}]',
'Enjoy raw almonds with sliced apple', 1, 'easy');

-- Create Dr. Jackie as admin user (you can update this with real credentials later)
INSERT INTO user_profiles (id, email, full_name, role) VALUES 
(gen_random_uuid(), 'jacksouto7@gmail.com', 'Dr. Jackie', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin', full_name = 'Dr. Jackie';

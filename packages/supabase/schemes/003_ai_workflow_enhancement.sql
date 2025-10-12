-- AI Workflow Enhancement Schema
-- Add AI-specific columns and tables to support AI diet generation

-- 1. Add AI columns to existing diet_plans table
ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS ai_prompt TEXT;
ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS ai_model_used TEXT DEFAULT 'gpt-4';
ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS ai_generation_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS ai_cost DECIMAL(10,4);
ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS generation_method TEXT DEFAULT 'template' CHECK (generation_method IN ('template', 'ai', 'hybrid'));

-- 2. Create AI generation logs table
CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    diet_plan_id UUID REFERENCES diet_plans(id) ON DELETE CASCADE,
    form_response_id UUID REFERENCES form_responses(id) ON DELETE CASCADE,
    model_used TEXT NOT NULL DEFAULT 'gpt-4',
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    total_cost DECIMAL(10,4),
    generation_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create client notifications table
CREATE TABLE IF NOT EXISTS client_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    diet_plan_id UUID REFERENCES diet_plans(id) ON DELETE CASCADE,
    notification_type TEXT CHECK (notification_type IN ('diet_ready', 'diet_updated', 'review_requested', 'diet_approved')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    email_sent BOOLEAN DEFAULT false,
    read_status BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create AI cost tracking table
CREATE TABLE IF NOT EXISTS ai_cost_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_requests INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    average_cost_per_request DECIMAL(10,4),
    model_breakdown JSONB, -- {"gpt-4": {"requests": 10, "cost": 15.50}, "gpt-3.5": {...}}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- Create indexes for AI tables
CREATE INDEX IF NOT EXISTS idx_ai_logs_diet_plan ON ai_generation_logs(diet_plan_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_success ON ai_generation_logs(success);
CREATE INDEX IF NOT EXISTS idx_ai_logs_cost ON ai_generation_logs(total_cost);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON client_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON client_notifications(read_status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON client_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_date ON ai_cost_tracking(date);

-- Enable RLS on new AI tables
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cost_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI tables

-- AI Generation Logs: Only admins can view
CREATE POLICY "Admin can view ai logs" ON ai_generation_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Client Notifications: Users can view their own, admins can view all
CREATE POLICY "Users can view own notifications" ON client_notifications FOR SELECT USING (
    user_id = auth.uid()
);
CREATE POLICY "Admin can manage all notifications" ON client_notifications FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- AI Cost Tracking: Only admins can view
CREATE POLICY "Admin can view cost tracking" ON ai_cost_tracking FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create function to update daily AI cost tracking
CREATE OR REPLACE FUNCTION update_ai_cost_tracking()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily cost tracking when new AI generation log is inserted
    INSERT INTO ai_cost_tracking (date, total_requests, total_tokens, total_cost)
    VALUES (CURRENT_DATE, 1, NEW.total_tokens, NEW.total_cost)
    ON CONFLICT (date) 
    DO UPDATE SET 
        total_requests = ai_cost_tracking.total_requests + 1,
        total_tokens = ai_cost_tracking.total_tokens + NEW.total_tokens,
        total_cost = ai_cost_tracking.total_cost + NEW.total_cost,
        average_cost_per_request = (ai_cost_tracking.total_cost + NEW.total_cost) / (ai_cost_tracking.total_requests + 1);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update cost tracking
CREATE TRIGGER update_ai_cost_tracking_trigger
    AFTER INSERT ON ai_generation_logs
    FOR EACH ROW EXECUTE FUNCTION update_ai_cost_tracking();

-- Create function to generate secure access tokens
CREATE OR REPLACE FUNCTION generate_access_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Update published_diets to use the new function for access tokens
ALTER TABLE published_diets ALTER COLUMN access_token SET DEFAULT generate_access_token();
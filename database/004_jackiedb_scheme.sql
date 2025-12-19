| complete_database_info                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| -- ============================================
-- COMPLETE DATABASE INFO
-- Generated: 2025-10-12 08:16:35.780485+00
-- ============================================

-- TABLES
-- ============================================
TABLE: admin_notes
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  diet_plan_id UUID,
  admin_user_id UUID,
  note_type TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()

TABLE: ai_cost_tracking
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  average_cost_per_request NUMERIC,
  model_breakdown JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()

TABLE: ai_generation_logs
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  diet_plan_id UUID,
  form_response_id UUID,
  model_used TEXT NOT NULL DEFAULT 'gpt-4'::text,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  total_cost NUMERIC,
  generation_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()

TABLE: client_notifications
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID,
  diet_plan_id UUID,
  notification_type TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  email_sent BOOLEAN DEFAULT false,
  read_status BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now()

TABLE: diet_plans
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  form_data JSONB NOT NULL,
  diet_plan JSONB NOT NULL,
  status TEXT DEFAULT 'draft'::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID,
  review_notes TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  ai_prompt TEXT,
  ai_model_used TEXT DEFAULT 'gpt-4'::text,
  ai_generation_time TIMESTAMP WITH TIME ZONE,
  ai_cost NUMERIC,
  generation_method TEXT DEFAULT 'template'::text

TABLE: diet_templates
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL,
  activity_level TEXT NOT NULL,
  calorie_range_min INTEGER NOT NULL,
  calorie_range_max INTEGER NOT NULL,
  target_protein INTEGER NOT NULL,
  target_carbs INTEGER NOT NULL,
  target_fats INTEGER NOT NULL,
  template_data JSONB NOT NULL,
  created_by UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()

TABLE: form_responses
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  form_type TEXT NOT NULL,
  responses JSONB NOT NULL,
  status TEXT DEFAULT 'pending'::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()

TABLE: meal_library
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  cuisine_type TEXT,
  dietary_tags ARRAY,
  calories INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  carbs INTEGER NOT NULL,
  fats INTEGER NOT NULL,
  ingredients JSONB NOT NULL,
  instructions TEXT NOT NULL,
  prep_time INTEGER,
  difficulty_level TEXT,
  created_by UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()

TABLE: published_diets
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  diet_plan_id UUID,
  form_response_id UUID,
  client_email TEXT NOT NULL,
  access_token TEXT NOT NULL DEFAULT generate_access_token(),
  diet_content JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + '90 days'::interval),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0

TABLE: user_profiles
  id UUID NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user'::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()


-- ENUMS
-- ============================================
No enums found

-- RELATIONSHIPS
-- ============================================
RELATIONSHIP: admin_notes.diet_plan_id -> diet_plans.id
RELATIONSHIP: admin_notes.admin_user_id -> user_profiles.id
RELATIONSHIP: ai_generation_logs.form_response_id -> form_responses.id
RELATIONSHIP: ai_generation_logs.diet_plan_id -> diet_plans.id
RELATIONSHIP: client_notifications.diet_plan_id -> diet_plans.id
RELATIONSHIP: client_notifications.user_id -> user_profiles.id
RELATIONSHIP: diet_plans.reviewed_by -> user_profiles.id
RELATIONSHIP: diet_plans.user_id -> user_profiles.id
RELATIONSHIP: diet_templates.created_by -> user_profiles.id
RELATIONSHIP: meal_library.created_by -> user_profiles.id
RELATIONSHIP: published_diets.diet_plan_id -> diet_plans.id
RELATIONSHIP: published_diets.form_response_id -> form_responses.id

-- TABLE LIST
-- ============================================
TABLE_LIST: admin_notes, ai_cost_tracking, ai_generation_logs, client_notifications, diet_plans, diet_templates, form_responses, meal_library, published_diets, user_profiles

-- END OF DATABASE INFO
-- ============================================ |
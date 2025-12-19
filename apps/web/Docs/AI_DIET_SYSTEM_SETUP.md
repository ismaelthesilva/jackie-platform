# Jackie Platform - Complete AI Diet Workflow Setup Guide

## 🚀 Complete System Overview

The Jackie Platform is now a fully integrated AI-powered nutrition platform that provides end-to-end diet planning with unlimited client access. The system includes:

- **AI-Powered Diet Generation** using OpenAI GPT-4
- **Admin Review Dashboard** for Dr. Jackie to approve plans
- **Client Authentication System** with unlimited access
- **Multiple Assessment Forms** (Nutrition/Fitness for USA/Brazil)
- **Supabase Database** with comprehensive schema
- **EmailJS Notifications** for workflow updates

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account with database access
- OpenAI API account (for AI diet generation)
- EmailJS account (for notifications)

## 🛠️ Installation & Setup

### 1. Environment Variables

Create `.env.local` in the root directory:

```bash
# Required for AI Diet Generation
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install

# Install OpenAI SDK (required for AI functionality)
npm install openai
```

### 3. Database Setup

Run the SQL schema files in Supabase in order:

1. `packages/supabase/schemes/001_jackiedb_scheme.sql`
2. `packages/supabase/schemes/002_manual_diet_workflow.sql`  
3. `packages/supabase/schemes/003_ai_workflow_enhancement.sql`
4. `packages/supabase/schemes/004_jackiedb_scheme.sql`

This creates all necessary tables:
- `form_responses` - Assessment submissions
- `ai_diet_generations` - AI-generated diet plans
- `published_diets` - Approved diets for client access
- `auth.users` - Client authentication (Supabase Auth)

### 4. Enable Supabase Auth

In your Supabase dashboard:
1. Go to Authentication → Settings
2. Enable "User Signups"
3. Configure email templates for verification
4. Set up redirect URLs for your domain

## 🔧 Configuration

### OpenAI API Setup

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env.local` file
3. Ensure you have credits available (diet generation costs ~$2-5 per plan)

### EmailJS Setup

1. Create templates for:
   - Form submission confirmation
   - AI diet generation notification
   - Diet approval notification
   - Client access notification

2. Configure service with your email provider (Gmail, Outlook, etc.)

## 🎯 Complete Workflow

### 1. Client Assessment Submission
- Client fills out nutrition/fitness form
- AI automatically generates 30-day personalized diet plan
- Plan stored in database for admin review
- Client receives confirmation email with account creation instructions

### 2. Admin Review Process
- Dr. Jackie accesses `/app/admin/ai-review/[id]`
- Reviews AI-generated diet plan week by week
- Can approve or request modifications
- Publishes approved diet for client access

### 3. Client Account System
- Clients create accounts at `/client/auth`
- Accounts linked to their assessment submissions
- **Unlimited access** to all their diet plans
- No token expiration - permanent access

### 4. Client Dashboard
- Comprehensive dashboard at `/client/dashboard`
- View active diets, pending reviews, assessment history
- Track AI generation costs and plan status
- Access published diet plans with detailed meal breakdowns

## 📁 Key Files & Components

### Core Services
- `src/services/aiDietService.ts` - OpenAI integration & diet generation
- `src/services/formSubmissionService.ts` - Form processing with AI workflow
- `src/lib/supabase.ts` - Database configuration

### Admin Interface
- `src/app/admin/ai-review/[id]/page.tsx` - Diet plan review interface
- Comprehensive approval workflow with client notifications

### Client Interface  
- `src/app/client/auth/page.tsx` - Authentication system
- `src/app/client/dashboard/page.tsx` - Comprehensive client dashboard
- `src/app/client/diet-view/[token]/page.tsx` - Diet plan viewer

### Assessment Forms
- `src/app/forms/nutritionusa/page.tsx`
- `src/app/forms/nutritionbr/page.tsx`
- `src/app/forms/fitnessusa/page.tsx`
- `src/app/forms/fitnessbr/page.tsx`

All forms include updated success messages guiding users to create accounts.

## 🚀 Deployment

### Development
```bash
npm run dev
# or
pnpm dev
```

### Production Build
```bash
npm run build
npm start
```

### Environment-Specific Notes
- Ensure all environment variables are set in production
- Supabase RLS policies should be configured for security
- OpenAI API rate limits should be monitored

## 🔐 Security Considerations

- Supabase Row Level Security (RLS) enabled
- Client authentication required for diet access
- Admin routes should be protected
- OpenAI API key stored securely in environment variables

## 💰 Cost Monitoring

The system tracks AI generation costs:
- Estimated $2-5 per diet plan generation
- Costs displayed in admin interface
- Client dashboard shows generation expense per plan

## 🎉 Success! System Complete

The Jackie Platform now provides:

✅ **Complete AI Workflow** - Automatic diet generation with GPT-4
✅ **Admin Review System** - Dr. Jackie can review and approve all plans  
✅ **Client Account System** - Unlimited access to diet plans
✅ **Comprehensive Dashboard** - Full client and admin interfaces
✅ **Multi-language Support** - English and Portuguese forms
✅ **Cost Tracking** - Monitor AI generation expenses
✅ **Email Notifications** - Automated workflow updates

## 🆘 Troubleshooting

### AI Diet Generation Not Working
- Check OpenAI API key in environment variables
- Verify API credits are available
- Check server logs for API errors

### Form Submissions Failing
- Verify Supabase connection settings
- Check database table structure matches schema
- Ensure EmailJS configuration is correct

### Client Authentication Issues
- Confirm Supabase Auth is enabled
- Check redirect URLs are configured
- Verify email verification settings

### Missing Diet Plans in Client Dashboard
- Ensure diet has been published by admin
- Check client email matches assessment submission
- Verify database relationships are correct

## 📞 Support

For technical issues or customization requests, check:
1. Server logs for detailed error messages
2. Supabase dashboard for database issues
3. OpenAI usage dashboard for API problems
4. EmailJS logs for notification failures

---

**🎊 The Jackie Platform is now production-ready with complete AI-powered diet workflow!**

# Jackie Platform - Complete Authentication & Dashboard System

A comprehensive diet plan management system with AI generation, admin approval workflow, and client dashboards.

## 🎯 Features

### For Clients (Users)
- **Integrated Test Form**: Simple 3-question form with authentication
- **AI Diet Plan Generation**: Personalized 30-day diet plans
- **User Dashboard**: View diet plan status and download approved plans
- **Email Notifications**: Get notified when plans are ready

### For Dr. Jackie (Admin)
- **Admin Dashboard**: Review and approve AI-generated diet plans
- **Plan Management**: Edit, approve, reject, or send plans to clients
- **Client Overview**: View all client plans and their statuses
- **Professional Review**: Add review notes before approval

### Technical Features
- **Supabase Authentication**: Secure user management with role-based access
- **Real-time Database**: Instant updates across dashboards
- **Row-Level Security**: Data protection at the database level
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### 1. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. In your Supabase dashboard, go to SQL Editor
3. Run the schema from `database/supabase-schema.sql`
4. Get your project URL and anon key from Settings > API

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_SITE_URL=http://localhost:5173
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

## 📱 Usage

### Routes

- `/` or `/form` - Integrated test form (main entry point)
- `/dashboard` - User dashboard (requires authentication)
- `/admin` - Admin dashboard (requires admin role)

### Creating Your First Diet Plan

1. Visit the form at `http://localhost:5173`
2. Fill out the 3-question form
3. Create an account when prompted
4. Your AI diet plan is generated and sent for review
5. Access your dashboard to track status

### Admin Setup

1. Create your admin account through the form first
2. In Supabase, update your user role:
   ```sql
   UPDATE user_profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```
3. Access the admin dashboard at `/admin`

## 🛠 Technical Architecture

### Frontend Components

```
src/
├── components/
│   ├── Auth.tsx                    # Login/Register component
│   ├── DashboardRouter.tsx         # Route handling with auth
│   └── ui/                         # Reusable UI components
├── context/
│   └── AuthContext.tsx             # Authentication state management
├── lib/
│   └── supabase.ts                 # Supabase client & helpers
├── pages/
│   ├── admin/
│   │   └── AdminDashboard.tsx      # Dr. Jackie's dashboard
│   ├── client/
│   │   └── UserDashboard.tsx       # Client dashboard
│   └── landingPages/forms/
│       └── IntegratedTestForm.tsx  # Main form with auth
└── services/
    ├── DietPlanGenerator.ts        # AI diet generation
    └── DietPlanStorage.ts          # Local storage backup
```

### Database Schema

```sql
user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user', -- 'user' or 'admin'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

diet_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  form_data JSONB,            -- Original form responses
  diet_plan JSONB,            -- AI-generated plan
  status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'sent'
  reviewed_by UUID,           -- Admin who reviewed
  review_notes TEXT,          -- Admin's review comments
  sent_at TIMESTAMP,          -- When sent to client
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Workflow

1. **Form Submission**: Client fills form → Account creation → AI generation
2. **Admin Review**: Dr. Jackie reviews → Approves/Rejects → Adds notes
3. **Plan Delivery**: Approved plans → Sent to client → Available in dashboard
4. **Client Access**: Notifications → Dashboard access → PDF download

## 🔧 Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

## 🔐 Security Features

- **Row-Level Security**: Users can only access their own data
- **Role-Based Access**: Admin-only routes and functions
- **Authentication Required**: All data access requires login
- **Input Validation**: Form validation and sanitization
- **Secure Storage**: Sensitive data encrypted at rest

## 📊 Admin Features

### Diet Plan Management
- View all client diet plans
- Filter by status (draft, approved, sent)
- Review AI-generated plans
- Add professional notes
- Approve or reject plans
- Send approved plans to clients

### Analytics Dashboard
- Total plans created
- Plans pending review
- Plans approved
- Plans sent to clients

## 👥 User Features

### Personal Dashboard
- View all personal diet plans
- Track approval status
- Download approved plans
- Request new plans
- Contact Dr. Jackie

### Plan Status Tracking
- **Draft**: Under review by Dr. Jackie
- **Approved**: Ready for use
- **Sent**: Delivered and accessible

## 🎨 UI Components

Built with:
- **React + TypeScript**: Type-safe component development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Beautiful, consistent icons

## 🔄 State Management

- **AuthContext**: Global authentication state
- **Supabase Realtime**: Real-time database updates
- **Local Storage**: Offline backup and caching

## 📱 Responsive Design

- Mobile-first approach
- Tablet-optimized layouts
- Desktop-enhanced features
- Touch-friendly interactions

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🆘 Troubleshooting

### Common Issues

1. **Authentication not working**: Check Supabase URL and keys
2. **Database errors**: Ensure schema is properly applied
3. **Role access denied**: Verify user role in database
4. **Form not submitting**: Check network and console for errors

### Debug Mode

Add to `.env` for detailed logging:
```env
VITE_DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review Supabase documentation
- Create an issue in the repository

---

**Built with ❤️ for Dr. Jackie's nutrition platform**

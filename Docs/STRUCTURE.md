# Jackie Platform - Project Structure Guide

## 📁 Directory Structure

```
jackie-platform/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (forms)/           # Route group for forms
│   │   ├── (pten)/            # Route group for PT pages
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin dashboard
│   │   ├── client/            # Client portal
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   └── ...                # Feature components
│   ├── context/               # React Context providers
│   ├── lib/                   # Utilities & configs
│   │   ├── env.ts            # Environment validation
│   │   ├── supabase.ts       # Supabase client
│   │   └── utils.ts          # Helper functions
│   ├── services/              # Business logic & API calls
│   ├── types/                 # TypeScript type definitions
│   └── locales/               # i18n translations
├── public/                    # Static assets
├── tests/                     # Playwright E2E tests
└── Docs/                      # Documentation

```

## ✅ Best Practices Implemented

### 1. **App Router Structure**

- ✓ Using Next.js 16 App Router
- ✓ Route groups `(forms)`, `(pten)` for logical organization
- ✓ Collocated layouts per route
- ✓ API routes in `app/api/`

### 2. **TypeScript**

- ✓ Strict mode enabled
- ✓ Path aliases (`@/*`)
- ✓ Centralized types in `src/types/`
- ✓ Environment variable type safety

### 3. **Code Organization**

- ✓ Components separated by domain
- ✓ Services layer for business logic
- ✓ Context providers for state management
- ✓ Utility functions in `lib/`

### 4. **Security**

- ✓ Content Security Policy headers
- ✓ Environment variable validation
- ✓ Cloudflare Turnstile for bot protection
- ✓ Supabase Row Level Security

### 5. **Performance**

- ✓ Image optimization with remotePatterns
- ✓ Package optimization (lucide-react)
- ✓ Proper use of `'use client'` directive
- ✓ Route rewrites for clean URLs

### 6. **Testing**

- ✓ Playwright for E2E testing
- ✓ Separate test data files
- ✓ Test reports generated

## 🚀 Development Workflow

### Commands

```bash
npm run dev         # Start development server (port 3001)
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Lint code
npm run test        # Run E2E tests
npm run test:ui     # Run tests with UI
```

### Adding New Features

#### 1. New Page

```bash
# Create in appropriate route group
src/app/(forms)/new-form/page.tsx
```

#### 2. New Component

```bash
# Feature component
src/components/NewFeature.tsx

# UI component (shadcn)
src/components/ui/new-ui-element.tsx
```

#### 3. New API Route

```bash
src/app/api/new-endpoint/route.ts
```

#### 4. New Type

```bash
# Add to existing or create new
src/types/feature-name.ts
```

## 📦 Key Dependencies

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Supabase** - Database & Auth
- **Cloudflare Turnstile** - Bot protection
- **EmailJS** - Email service
- **Playwright** - E2E testing

## 🔧 Configuration Files

- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `playwright.config.ts` - Test configuration
- `.env.local` - Environment variables (not in git)

## 🌐 Environment Variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

Optional:

- `TURNSTILE_SECRET_KEY`
- `OPENAI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📝 Code Style

- Use TypeScript for all new files
- Follow Next.js App Router conventions
- Use `'use client'` only when necessary
- Prefer server components by default
- Use path aliases (`@/`) for imports
- Keep components small and focused
- Extract business logic to services
- Use centralized types from `src/types/`

## 🔐 Security Checklist

- [ ] Environment variables properly configured
- [ ] CSP headers in place
- [ ] Bot protection enabled
- [ ] API routes protected
- [ ] Supabase RLS enabled
- [ ] No secrets in client code
- [ ] Input validation on forms
- [ ] XSS protection enabled

## 📊 Performance Checklist

- [ ] Images optimized
- [ ] Fonts loaded efficiently
- [ ] Bundle size monitored
- [ ] API routes cached appropriately
- [ ] Server components used by default
- [ ] Client components minimized
- [ ] Lazy loading implemented

## 🐛 Debugging

- Check browser console for client errors
- Check terminal for server errors
- Use React DevTools
- Check Network tab for API issues
- Review Vercel logs in production

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

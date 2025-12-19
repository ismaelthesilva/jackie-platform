# Cloudflare Turnstile Setup Guide

This guide explains how to configure Cloudflare Turnstile for the Fitness USA and Nutrition USA forms.

## What is Cloudflare Turnstile?

Cloudflare Turnstile is a CAPTCHA alternative that helps prevent bot submissions while providing a better user experience. It's been integrated into the Fitness USA and Nutrition USA forms to protect against automated spam.

## Setup Instructions

### 1. Get Your Turnstile Keys

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** in the left sidebar
3. Click **Add Site**
4. Configure your site:
   - **Site name**: Jackie Platform Forms (or any name you prefer)
   - **Domain**: Add your production domain (e.g., `jackie-platform.vercel.app`)
   - For local development, you can use `localhost`
5. Click **Create**
6. Copy your **Site Key** and **Secret Key**

### 2. Configure Environment Variables

Add these variables to your `.env.local` file in the `apps/web` directory:

```bash
# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here
```

**Important:**

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is the public site key (client-side)
- `TURNSTILE_SECRET_KEY` is the private secret key (server-side, if needed for verification)

### 3. Testing Keys (Development Only)

Cloudflare provides test keys that always pass verification:

```bash
# Test keys - always pass (for development only)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

⚠️ **Never use test keys in production!**

### 4. Deploy to Production

When deploying to Vercel or other hosting platforms:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`
4. Redeploy your application

## How It Works

### User Experience

1. User fills out the form questions
2. When they reach the email field and enter their email
3. A Turnstile verification widget appears below the email field
4. User completes the verification (usually just clicking a checkbox)
5. The "Next" button becomes enabled
6. Form submission proceeds normally

### Implementation Details

The Turnstile component has been added to:

- **Fitness USA Form**: `apps/web/src/app/(forms)/fitnessusa/page.tsx`
- **Nutrition USA Form**: `apps/web/src/app/(forms)/nutritionusa/page.tsx`

The verification:

- Shows only when the user enters their email
- Must be completed before proceeding to the next question
- Prevents form submission without a valid token
- Automatically blocks most bot submissions

## Component Location

The reusable Turnstile component is located at:

```
apps/web/src/components/CloudflareTurnstile.tsx
```

## Troubleshooting

### Verification widget not showing

- Check that `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set in your environment
- Verify the key is correct (no extra spaces or quotes)
- Check the browser console for errors

### "Verification failed" error

- The secret key might be incorrect
- The domain might not be allowed in your Turnstile site configuration
- Network issues preventing connection to Cloudflare

### Widget showing error message

If you see "Turnstile configuration error":

- The `NEXT_PUBLIC_TURNSTILE_SITE_KEY` environment variable is missing
- Restart your development server after adding the environment variable

## Security Notes

- The site key is public and safe to expose in client-side code
- The secret key should never be exposed in client-side code
- For full security, implement server-side verification of tokens (optional but recommended)
- Tokens are single-use and expire after a short time

## Support

For issues with Cloudflare Turnstile:

- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Cloudflare Community](https://community.cloudflare.com/)

For issues with this implementation:

- Check the component code in `CloudflareTurnstile.tsx`
- Review the form integration in the respective form files

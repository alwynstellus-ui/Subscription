# Quick Start Guide

Follow these steps to get your newsletter app running:

## 1. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to the **SQL Editor**
3. Copy the entire contents of `supabase/migrations/20250118_initial_schema.sql`
4. Paste and run it in the SQL Editor
5. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

## 2. Set Up Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Select **Email** as the authentication method
3. From the Clerk Dashboard, copy:
   - Publishable Key
   - Secret Key
4. **Set up webhook** for user synchronization:
   - Go to **Webhooks** in Clerk Dashboard
   - Click **Add Endpoint**
   - URL: `https://your-domain.com/api/webhooks/clerk` (use ngrok or similar for local testing)
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Copy the **Signing Secret**

## 3. Set Up Resend Email

1. Go to [resend.com](https://resend.com) and create an account
2. Create an API key
3. For production, verify your domain
4. For development, you can use `onboarding@resend.dev`

## 4. Create Environment File

Create `.env.local` in the root directory:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk (get these from clerk.com dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase (get these from supabase.com dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Resend (get from resend.com)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_WEBHOOK_SECRET=whsec_...
```

## 5. Run the App

```bash
cd newsletter-app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6. Test the Subscription Flow

1. **Subscribe**: Enter your email on the homepage
2. **Check email**: Look for confirmation email from Resend
3. **Confirm**: Click the confirmation link
4. **Welcome**: Receive welcome email

## 7. Create Your First Admin

1. **Sign up** through the app at `/sign-up`
2. Go to **Supabase Dashboard → Table Editor → users**
3. Find your user and change `role` from `'user'` to `'admin'`
4. **Sign out** and **sign back in**
5. You should now see admin features (once implemented)

## 8. Test Webhooks Locally (Optional)

To test Clerk webhooks locally:

```bash
# Install ngrok
npm install -g ngrok

# Run ngrok
ngrok http 3000

# Use the ngrok URL for your Clerk webhook endpoint
# Example: https://abc123.ngrok.io/api/webhooks/clerk
```

## Common Issues

### "Missing Supabase environment variables"
- Make sure `.env.local` exists
- Check that all Supabase keys are copied correctly
- Restart the dev server after adding env vars

### "Invalid Clerk keys"
- Verify keys from Clerk Dashboard
- Make sure you're using the correct publishable/secret pair
- Check for extra spaces or missing characters

### "Failed to send email"
- Verify RESEND_API_KEY is correct
- Check RESEND_FROM_EMAIL is valid
- For production, verify your domain in Resend

### Webhook not receiving events
- Use ngrok for local testing
- Check webhook URL is publicly accessible
- Verify signing secret matches

## Next Steps

Once the app is running:

1. ✅ Test the subscription flow
2. ✅ Create an admin account
3. 🔄 Build the user dashboard (work in progress)
4. 🔄 Build the admin panel (work in progress)
5. 🔄 Implement campaign sending
6. 🔄 Add analytics

See `IMPLEMENTATION_STATUS.md` for detailed progress and remaining tasks.

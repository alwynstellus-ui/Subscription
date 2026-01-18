# Newsletter Subscription Manager

A powerful newsletter subscription management system built with Next.js 15, Clerk, Supabase, and Resend.

## Features

- **Public Subscription**: Users can subscribe to newsletters via email with double opt-in
- **User Dashboard**: Authenticated users can manage subscription preferences and view history
- **Admin Panel**: Admins can manage subscribers, create campaigns, and view analytics
- **Email Campaigns**: Send newsletters with tracking (opens, clicks, bounces)
- **Analytics**: Campaign performance metrics and subscriber insights

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend + React Email
- **UI**: shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod

## Setup Instructions

### 1. Clone and Install Dependencies

\`\`\`bash
cd newsletter-app
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy the contents of `supabase/migrations/20250118_initial_schema.sql`
4. Paste and run the migration in the SQL Editor
5. Get your Supabase credentials:
   - Go to Settings > API
   - Copy the Project URL
   - Copy the `anon` public key
   - Copy the `service_role` secret key (for server-side operations)

### 3. Set Up Clerk

1. Create an account at [clerk.com](https://clerk.com)
2. Create a new application
3. Get your API keys from the Clerk Dashboard
4. Configure the application:
   - Enable Email authentication
   - Set up custom roles (add 'admin' role in Clerk Dashboard > User & Authentication > Roles)
5. Set up the webhook for user sync:
   - Go to Webhooks in Clerk Dashboard
   - Create endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Subscribe to: `user.created` and `user.updated`
   - Copy the webhook secret

### 4. Set Up Resend

1. Create an account at [resend.com](https://resend.com)
2. Verify your domain (or use Resend's test domain for development)
3. Create an API key
4. Set up webhook (optional, for tracking email events):
   - Endpoint: `https://your-domain.com/api/webhooks/resend`
   - Events: delivered, opened, clicked, bounced, complained

### 5. Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=newsletters@yourdomain.com
RESEND_WEBHOOK_SECRET=whsec_...
\`\`\`

### 6. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

\`\`\`
newsletter-app/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # User dashboard (protected)
│   ├── (admin)/             # Admin panel (protected)
│   ├── (public)/            # Public pages
│   ├── api/                 # API routes and webhooks
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── forms/               # Form components
│   ├── admin/               # Admin-specific components
│   └── layout/              # Layout components
├── lib/
│   ├── supabase/            # Supabase clients
│   ├── clerk/               # Clerk utilities
│   ├── email/               # Email templates and sending
│   └── actions/             # Server actions
└── supabase/
    └── migrations/          # Database migrations
\`\`\`

## Database Schema

- **users**: Synced from Clerk via webhook
- **subscribers**: Newsletter subscribers with double opt-in
- **subscription_preferences**: User preferences by category
- **campaigns**: Email campaigns created by admins
- **campaign_sends**: Track individual email sends
- **email_events**: Detailed event tracking (opens, clicks, etc.)

## Usage

### Creating Your First Admin User

1. Sign up through the app
2. Go to your Supabase dashboard
3. Navigate to Table Editor > users
4. Find your user record and change the `role` field to `'admin'`
5. Sign out and sign back in

### Sending a Campaign

1. Go to `/admin/campaigns/new`
2. Fill in campaign details (name, subject, content)
3. Choose a category (optional, filters by subscriber preferences)
4. Click "Send" or "Save Draft"

### Managing Subscribers

1. Go to `/admin/subscribers`
2. View all subscribers with status filters
3. Export to CSV
4. Search by email

## Development

\`\`\`bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
\`\`\`

## License

MIT

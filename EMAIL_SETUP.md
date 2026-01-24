# Email Integration Setup Guide

This guide explains how to set up Gmail and Outlook API integrations for automatic email scanning.

## Gmail API Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it "Newsletter Subscription Scanner" or similar

### 2. Enable Gmail API

1. In the Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click "Enable"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Fill in required fields:
   - App name: "Newsletter Subscription Scanner"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - Click "Add or Remove Scopes"
   - Add: `https://www.googleapis.com/auth/gmail.readonly`
5. Save and Continue
6. Add test users (your email addresses)
7. Save and Continue

### 4. Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Newsletter App"
5. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/gmail/callback` (development)
   - `https://newsletter-app-cyan.vercel.app/api/auth/gmail/callback` (production)
6. Click "Create"
7. **Save the Client ID and Client Secret**

### 5. Add Environment Variables

Add to `.env.local` and Vercel:

```env
NEXT_PUBLIC_GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret
```

---

## Outlook/Microsoft API Setup

### 1. Register Application in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "App registrations"
3. Click "New registration"

### 2. Configure Application

1. Name: "Newsletter Subscription Scanner"
2. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
3. Redirect URI:
   - Platform: "Web"
   - URI: `https://newsletter-app-cyan.vercel.app/api/auth/outlook/callback`
4. Click "Register"

### 3. Add Redirect URIs

1. Go to "Authentication" in the left menu
2. Add another redirect URI:
   - `http://localhost:3000/api/auth/outlook/callback` (development)
3. Save

### 4. Configure API Permissions

1. Go to "API permissions"
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Select "Delegated permissions"
5. Add these permissions:
   - `Mail.Read`
   - `offline_access`
6. Click "Add permissions"
7. **Important**: Click "Grant admin consent" (if you're an admin)

### 5. Create Client Secret

1. Go to "Certificates & secrets"
2. Click "New client secret"
3. Description: "Newsletter App"
4. Expiry: 24 months (or your preference)
5. Click "Add"
6. **Copy the secret value immediately** (you won't see it again)

### 6. Get Application ID

1. Go to "Overview"
2. Copy the "Application (client) ID"

### 7. Add Environment Variables

Add to `.env.local` and Vercel:

```env
NEXT_PUBLIC_OUTLOOK_CLIENT_ID=your_application_id
OUTLOOK_CLIENT_SECRET=your_client_secret_value
```

---

## Complete Environment Variables

Your `.env.local` should have:

```env
# Gmail
NEXT_PUBLIC_GMAIL_CLIENT_ID=xxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxx

# Outlook
NEXT_PUBLIC_OUTLOOK_CLIENT_ID=xxx-xxx-xxx-xxx-xxx
OUTLOOK_CLIENT_SECRET=xxx

# App (already exists)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production (Vercel), add the same variables with production URLs.

---

## Testing the Integration

### Development

1. Start your local server: `npm run dev`
2. Go to: `http://localhost:3000/subscriptions/scan`
3. Click "Connect Email" tab
4. Click "Connect Gmail" or "Connect Outlook"
5. Authorize the app
6. You should be redirected back with a success message

### Production

1. Deploy to Vercel
2. Add all environment variables in Vercel dashboard
3. Go to: `https://newsletter-app-cyan.vercel.app/subscriptions/scan`
4. Test the flow

---

## Troubleshooting

### Gmail Issues

**Error: redirect_uri_mismatch**
- Make sure the redirect URI in your Google Cloud Console exactly matches your app URL
- Include both `/api/auth/gmail/callback` paths (local + production)

**Error: access_denied**
- Make sure you added your email as a test user
- Check that Gmail API is enabled

### Outlook Issues

**Error: invalid_client**
- Verify the Client ID and Secret are correct
- Check that redirect URIs are added in Azure

**Error: insufficient_permissions**
- Grant admin consent for the permissions
- Make sure `Mail.Read` and `offline_access` are added

---

## Security Notes

1. **Never commit secrets** - Use `.env.local` which is gitignored
2. **Tokens are encrypted** - Stored securely in the database
3. **Read-only access** - App only reads emails, never sends or deletes
4. **User consent required** - Users must explicitly authorize
5. **Revoke access** - Users can disconnect anytime from the app or provider settings

---

## How It Works

1. User clicks "Connect Gmail" or "Connect Outlook"
2. Redirected to OAuth provider (Google/Microsoft)
3. User authorizes read-only email access
4. Provider redirects back with authorization code
5. App exchanges code for access token
6. Token stored encrypted in database
7. App can now scan emails for subscriptions
8. Parser extracts subscription details automatically
9. User reviews and adds subscriptions with one click

---

## Database Migration

Don't forget to run this migration in Supabase:

```sql
-- File: supabase/migrations/20250124_create_email_connections.sql
```

Run it in Supabase Dashboard → SQL Editor

---

## Support

If you encounter issues:
1. Check environment variables are set correctly
2. Verify redirect URIs match exactly
3. Check console for error messages
4. Ensure APIs are enabled in respective consoles

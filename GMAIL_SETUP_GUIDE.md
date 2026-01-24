# Gmail API Setup - Simple Guide

Follow these steps to enable Gmail email scanning in your app.

## 🎯 What You'll Get

After setup, users can:
1. Click "Connect Gmail Account"
2. Authorize the app (read-only access)
3. Click "Scan Now" to automatically find all subscriptions in their email
4. Add detected subscriptions with one click

---

## 📋 Step-by-Step Setup (15 minutes)

### Step 1: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/
2. Sign in with your Google account
3. Click "Select a project" at the top
4. Click "NEW PROJECT"
5. Project name: **"Newsletter Subscription Scanner"**
6. Click "CREATE"
7. Wait for project to be created, then select it

---

### Step 2: Enable Gmail API

1. In the search bar at the top, type: **"Gmail API"**
2. Click on "Gmail API" in the results
3. Click the **"ENABLE"** button
4. Wait for it to enable (takes 10 seconds)

---

### Step 3: Configure OAuth Consent Screen

1. In the left sidebar, click **"OAuth consent screen"**
2. Select **"External"** user type
3. Click **"CREATE"**

**Fill in the form:**
- App name: `Newsletter Subscription Scanner`
- User support email: `your-email@example.com` (your email)
- App logo: *(optional, can skip)*
- Application home page: `https://newsletter-app-cyan.vercel.app`
- Authorized domains:
  - Click "ADD DOMAIN"
  - Enter: `vercel.app`
- Developer contact: `your-email@example.com`
- Click **"SAVE AND CONTINUE"**

---

### Step 4: Add Scopes

1. Click **"ADD OR REMOVE SCOPES"**
2. In the filter box, type: **"gmail.readonly"**
3. Check the box for:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - Description should say: "Read all resources and their metadata—no write operations"
4. Click **"UPDATE"**
5. Click **"SAVE AND CONTINUE"**

---

### Step 5: Add Test Users

1. Click **"ADD USERS"**
2. Enter email addresses (one per line) of people who can test:
   ```
   your-email@example.com
   test-user@example.com
   ```
3. Click **"ADD"**
4. Click **"SAVE AND CONTINUE"**
5. Review the summary and click **"BACK TO DASHBOARD"**

---

### Step 6: Create OAuth Credentials

1. In the left sidebar, click **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. Application type: **"Web application"**
5. Name: `Newsletter App`

**Authorized redirect URIs:**
1. Click **"+ ADD URI"**
2. Add these URIs (one at a time):
   ```
   http://localhost:3000/api/auth/gmail/callback
   ```
3. Click **"+ ADD URI"** again
4. Add:
   ```
   https://newsletter-app-cyan.vercel.app/api/auth/gmail/callback
   ```

7. Click **"CREATE"**

---

### Step 7: Copy Your Credentials

You'll see a popup with:
- **Client ID**: Something like `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abc123def456`

**⚠️ IMPORTANT: Copy both of these now!**

Click "DOWNLOAD JSON" to save a backup (optional but recommended)

---

### Step 8: Add to Vercel Environment Variables

1. Go to: https://vercel.com/alwynstellus-projects/newsletter-app/settings/environment-variables
2. Add **First Variable**:
   - Name: `NEXT_PUBLIC_GMAIL_CLIENT_ID`
   - Value: *paste your Client ID* (the long one ending in .apps.googleusercontent.com)
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

3. Add **Second Variable**:
   - Name: `GMAIL_CLIENT_SECRET`
   - Value: *paste your Client Secret* (starts with GOCSPX-)
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

---

### Step 9: Redeploy Your App

**Option A: Automatic (Recommended)**
1. Push any small change to GitHub (or click "Redeploy" in Vercel)
2. Wait for deployment to complete

**Option B: Using Vercel CLI**
```bash
cd newsletter-app
npx vercel --prod
```

---

### Step 10: Test It! 🎉

1. Go to: https://newsletter-app-cyan.vercel.app
2. Sign in to your account
3. Go to "Subscriptions" → "Scan Email"
4. You should now see: **"Connect Gmail Account"** button (enabled)
5. Click it
6. Authorize the app (Google will show permission screen)
7. You'll be redirected back
8. Click **"Scan Now"**
9. See your subscriptions automatically detected!

---

## 🔧 Troubleshooting

### Issue: "Redirect URI mismatch"
**Fix:** Make sure you added both redirect URIs exactly:
- `http://localhost:3000/api/auth/gmail/callback`
- `https://newsletter-app-cyan.vercel.app/api/auth/gmail/callback`

### Issue: "Access blocked: This app's request is invalid"
**Fix:**
1. Go back to OAuth consent screen
2. Make sure status is not "In production"
3. Add your email as a test user

### Issue: Button still says "Gmail Not Configured"
**Fix:**
1. Verify environment variables are saved in Vercel
2. Redeploy the app
3. Wait 1-2 minutes for deployment
4. Hard refresh the page (Ctrl+Shift+R)

### Issue: "This app hasn't been verified by Google"
**Fix:**
- This is normal for apps in testing mode
- Click "Advanced" → "Go to Newsletter Subscription Scanner (unsafe)"
- This only shows for test users
- To remove this, you need to submit app for Google verification (not required for testing)

---

## 🔐 Security Notes

✅ **Read-only access**: App can ONLY read emails, never send or delete
✅ **User consent required**: Each user must authorize individually
✅ **Revokable**: Users can disconnect anytime from the app or Google account settings
✅ **Encrypted storage**: OAuth tokens stored encrypted in database
✅ **Limited scope**: Only `gmail.readonly` - no other Google data accessed

---

## 📝 What Happens When User Connects

1. User clicks "Connect Gmail Account"
2. Redirected to Google authorization page
3. Google shows: "Newsletter Subscription Scanner wants to read your email"
4. User clicks "Allow"
5. Google redirects back to your app with authorization code
6. App exchanges code for access token
7. Token stored encrypted in database
8. User can now scan emails anytime

---

## 🎯 After Setup Checklist

- [ ] Gmail API enabled in Google Cloud Console
- [ ] OAuth consent screen configured
- [ ] Test users added
- [ ] OAuth credentials created
- [ ] Redirect URIs added correctly
- [ ] Environment variables added to Vercel
- [ ] App redeployed
- [ ] Tested: Can click "Connect Gmail Account"
- [ ] Tested: Can scan emails successfully

---

## 🆘 Need Help?

Common issues:
- **Wrong redirect URI**: Copy-paste exactly from this guide
- **Environment variables**: Make sure no extra spaces
- **Deployment**: Wait for full deployment to complete
- **Cache**: Try incognito/private browsing mode

---

## 🔄 Development vs Production

**For local development** (optional):
1. Add environment variables to `.env.local`:
   ```
   NEXT_PUBLIC_GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GMAIL_CLIENT_SECRET=your_client_secret
   ```
2. Restart your dev server: `npm run dev`

**For production** (required):
- Environment variables in Vercel (already done in Step 8)

---

That's it! Your users can now connect Gmail and automatically scan for subscriptions. 🎉

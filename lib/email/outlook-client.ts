/**
 * Outlook/Microsoft Graph API Client
 * Connects to user's Outlook/Microsoft account to scan for subscription emails
 */

import { EmailMessage } from './gmail-client';

export interface OutlookAuthResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

/**
 * Check if Outlook is configured
 */
export function isOutlookConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID &&
    process.env.OUTLOOK_CLIENT_SECRET &&
    process.env.NEXT_PUBLIC_APP_URL
  );
}

/**
 * Initialize Microsoft OAuth flow
 */
export function getOutlookAuthUrl(): string {
  if (!isOutlookConfigured()) {
    throw new Error('Outlook API is not configured. Please set up OUTLOOK_CLIENT_ID and OUTLOOK_CLIENT_SECRET environment variables.');
  }

  const clientId = process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/outlook/callback`;

  const scopes = ['Mail.Read', 'offline_access'].join(' ');

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    response_mode: 'query',
    scope: scopes,
  });

  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeOutlookCode(code: string): Promise<OutlookAuthResponse> {
  const clientId = process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID!;
  const clientSecret = process.env.OUTLOOK_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/outlook/callback`;

  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: 'Mail.Read offline_access',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return response.json();
}

/**
 * Search Outlook for subscription-related emails
 */
export async function searchOutlookEmails(
  accessToken: string,
  maxResults: number = 100
): Promise<EmailMessage[]> {
  // Microsoft Graph API search filter
  const filter = `contains(subject,'subscription') or contains(subject,'invoice') or contains(subject,'receipt') or contains(subject,'billing') or contains(subject,'payment')`;

  const params = new URLSearchParams({
    $filter: filter,
    $top: maxResults.toString(),
    $select: 'id,subject,from,receivedDateTime,body',
  });

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to search Outlook messages');
  }

  const data = await response.json();

  return (data.value || []).map((msg: any) => ({
    id: msg.id,
    subject: msg.subject || '',
    from: msg.from?.emailAddress?.address || '',
    body: msg.body?.content || '',
    date: msg.receivedDateTime || '',
  }));
}

/**
 * Get specific email message
 */
export async function getOutlookMessage(
  accessToken: string,
  messageId: string
): Promise<EmailMessage | null> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${messageId}?$select=id,subject,from,receivedDateTime,body`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const msg = await response.json();

  return {
    id: msg.id,
    subject: msg.subject || '',
    from: msg.from?.emailAddress?.address || '',
    body: msg.body?.content || '',
    date: msg.receivedDateTime || '',
  };
}

/**
 * Gmail API Client
 * Connects to user's Gmail account to scan for subscription emails
 */

export interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  body: string;
  date: string;
}

export interface GmailAuthResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

/**
 * Check if Gmail is configured
 */
export function isGmailConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.NEXT_PUBLIC_APP_URL
  );
}

/**
 * Initialize Gmail OAuth flow
 */
export function getGmailAuthUrl(): string {
  if (!isGmailConfigured()) {
    throw new Error('Gmail API is not configured. Please set up GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET environment variables.');
  }

  const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`;

  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeGmailCode(code: string): Promise<GmailAuthResponse> {
  const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID!;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return response.json();
}

/**
 * Search Gmail for subscription-related emails
 */
export async function searchGmailEmails(
  accessToken: string,
  query: string = 'subscription OR invoice OR receipt OR billing OR payment',
  maxResults: number = 100
): Promise<string[]> {
  const params = new URLSearchParams({
    q: query,
    maxResults: maxResults.toString(),
  });

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to search Gmail messages');
  }

  const data = await response.json();
  return data.messages?.map((msg: any) => msg.id) || [];
}

/**
 * Get email message details
 */
export async function getGmailMessage(
  accessToken: string,
  messageId: string
): Promise<EmailMessage | null> {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  // Extract headers
  const headers = data.payload.headers;
  const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
  const from = headers.find((h: any) => h.name === 'From')?.value || '';
  const date = headers.find((h: any) => h.name === 'Date')?.value || '';

  // Extract body
  let body = '';

  function extractBody(part: any): void {
    if (part.mimeType === 'text/plain' && part.body.data) {
      body += Buffer.from(part.body.data, 'base64').toString('utf-8');
    } else if (part.mimeType === 'text/html' && part.body.data && !body) {
      // Use HTML as fallback if no plain text
      const html = Buffer.from(part.body.data, 'base64').toString('utf-8');
      // Simple HTML to text conversion
      body += html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    } else if (part.parts) {
      part.parts.forEach(extractBody);
    }
  }

  if (data.payload.parts) {
    data.payload.parts.forEach(extractBody);
  } else if (data.payload.body.data) {
    body = Buffer.from(data.payload.body.data, 'base64').toString('utf-8');
  }

  return {
    id: messageId,
    subject,
    from,
    body: body.trim(),
    date,
  };
}

/**
 * Batch fetch multiple email messages
 */
export async function batchGetGmailMessages(
  accessToken: string,
  messageIds: string[]
): Promise<EmailMessage[]> {
  const messages: EmailMessage[] = [];

  // Process in batches of 10 to avoid rate limits
  for (let i = 0; i < messageIds.length; i += 10) {
    const batch = messageIds.slice(i, i + 10);
    const promises = batch.map(id => getGmailMessage(accessToken, id));
    const results = await Promise.all(promises);
    messages.push(...results.filter((msg): msg is EmailMessage => msg !== null));
  }

  return messages;
}

import { NextRequest, NextResponse } from "next/server";
import { exchangeGmailCode } from "@/lib/email/gmail-client";
import { saveEmailConnection } from "@/lib/actions/email-connection-actions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/subscriptions/scan?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/subscriptions/scan?error=no_code', request.url)
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await exchangeGmailCode(code);

    // Get user email from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userInfoResponse.json();

    // Save connection to database
    await saveEmailConnection({
      provider: 'gmail',
      email_address: userInfo.email,
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_in: tokenResponse.expires_in,
    });

    // Redirect to scan page with success
    return NextResponse.redirect(
      new URL('/subscriptions/scan?connected=gmail', request.url)
    );
  } catch (error) {
    console.error('Gmail OAuth error:', error);
    return NextResponse.redirect(
      new URL('/subscriptions/scan?error=auth_failed', request.url)
    );
  }
}

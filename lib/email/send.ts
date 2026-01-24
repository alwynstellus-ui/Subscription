import { render } from "@react-email/render";
import { resend, checkResendConfig } from "./resend";
import { ConfirmationEmail } from "./templates/confirmation";
import { WelcomeEmail } from "./templates/welcome";

const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_APP_URL environment variable is required for email links");
  }
  return url;
}

function ensureConfigured() {
  checkResendConfig();
}

export async function sendConfirmationEmail(email: string, token: string) {
  ensureConfigured();

  const confirmationUrl = `${getAppUrl()}/confirm?token=${token}`;

  const html = await render(
    ConfirmationEmail({ email, confirmationUrl })
  );

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Confirm your newsletter subscription",
      html,
    });

    if (error) {
      console.error("Error sending confirmation email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, hasAccount: boolean) {
  ensureConfigured();

  const dashboardUrl = hasAccount ? `${getAppUrl()}/dashboard` : undefined;

  const html = await render(
    WelcomeEmail({ email, dashboardUrl })
  );

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Welcome to our newsletter!",
      html,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
}

export async function sendUnsubscribeConfirmation(email: string) {
  ensureConfigured();

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "You've been unsubscribed",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Unsubscribed Successfully</h1>
          <p>You've been unsubscribed from our newsletter.</p>
          <p>We're sorry to see you go! If you change your mind, you can always subscribe again.</p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This was sent to ${email}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending unsubscribe confirmation:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to send unsubscribe confirmation:", error);
    throw error;
  }
}

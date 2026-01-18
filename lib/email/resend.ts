import { Resend } from "resend";

// Initialize with a placeholder during build time
// The real key will be used at runtime
const apiKey = process.env.RESEND_API_KEY || "re_placeholder";

export const resend = new Resend(apiKey);

export function checkResendConfig() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
}

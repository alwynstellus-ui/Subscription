import { NextResponse } from "next/server";
import { isGmailConfigured } from "@/lib/email/gmail-client";
import { isOutlookConfigured } from "@/lib/email/outlook-client";

export async function GET() {
  return NextResponse.json({
    gmail: isGmailConfigured(),
    outlook: isOutlookConfigured(),
  });
}

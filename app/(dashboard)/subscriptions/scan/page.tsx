"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmailConnectionManager } from "@/components/subscriptions/email-connection-manager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ScanEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle OAuth callback success/error
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected) {
      toast.success(`${connected === 'gmail' ? 'Gmail' : 'Outlook'} account connected successfully!`);
      // Clean up URL
      window.history.replaceState({}, '', '/subscriptions/scan');
    }

    if (error) {
      if (error === 'auth_failed') {
        toast.error('Failed to connect email account. Please try again.');
      } else if (error === 'no_code') {
        toast.error('Authorization cancelled or failed.');
      } else {
        toast.error('An error occurred. Please try again.');
      }
      // Clean up URL
      window.history.replaceState({}, '', '/subscriptions/scan');
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/subscriptions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subscriptions
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Connect Email & Scan</h2>
        <p className="text-muted-foreground">
          Connect your Gmail account to automatically scan and detect all your subscriptions
        </p>
      </div>

      <EmailConnectionManager />
    </div>
  );
}

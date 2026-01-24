"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmailScanner } from "@/components/subscriptions/email-scanner";
import { EmailConnectionManager } from "@/components/subscriptions/email-connection-manager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Scan } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ScanEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("connect");

  useEffect(() => {
    // Handle OAuth callback success/error
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected) {
      toast.success(`${connected === 'gmail' ? 'Gmail' : 'Outlook'} account connected successfully!`);
      setActiveTab("connect"); // Stay on connect tab to show scanning options
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

  const handleSubscriptionAdded = () => {
    // Redirect to subscriptions list after successful add
    setTimeout(() => {
      router.push("/subscriptions");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/subscriptions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subscriptions
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Scan Emails for Subscriptions</h2>
        <p className="text-muted-foreground">
          Connect your email account to automatically detect subscriptions or paste email content manually
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connect">
            <Mail className="h-4 w-4 mr-2" />
            Connect Email
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Scan className="h-4 w-4 mr-2" />
            Manual Scan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connect" className="space-y-6">
          <EmailConnectionManager />
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <EmailScanner onSubscriptionAdded={handleSubscriptionAdded} />

          <div className="bg-muted/50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Tips for manual scanning:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Copy the entire email content including subject and body</li>
              <li>• Make sure pricing information is included (e.g., "$9.99/month" or "AED 49.99")</li>
              <li>• Include billing cycle information (monthly, yearly, etc.)</li>
              <li>• Works best with subscription receipts, invoices, and renewal notices</li>
              <li>• Supported currencies: AED, USD ($), EUR (€), GBP (£)</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

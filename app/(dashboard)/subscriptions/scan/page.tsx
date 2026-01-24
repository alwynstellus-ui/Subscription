"use client";

import { useRouter } from "next/navigation";
import { EmailScanner } from "@/components/subscriptions/email-scanner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ScanEmailPage() {
  const router = useRouter();

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
        <h2 className="text-3xl font-bold tracking-tight">Scan Email for Subscription</h2>
        <p className="text-muted-foreground">
          Automatically extract subscription details from your email receipts
        </p>
      </div>

      <EmailScanner onSubscriptionAdded={handleSubscriptionAdded} />

      <div className="bg-muted/50 p-6 rounded-lg">
        <h3 className="font-semibold mb-3">Tips for best results:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Copy the entire email content including subject and body</li>
          <li>• Make sure pricing information is included (e.g., "$9.99/month" or "AED 49.99")</li>
          <li>• Include billing cycle information (monthly, yearly, etc.)</li>
          <li>• Works best with subscription receipts, invoices, and renewal notices</li>
          <li>• Supported currencies: AED, USD ($), EUR (€), GBP (£)</li>
        </ul>
      </div>
    </div>
  );
}

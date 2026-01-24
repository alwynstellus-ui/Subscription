"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Scan, Mail, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import { parseEmailForSubscription, type ParsedSubscription } from "@/lib/email/subscription-parser";
import { addUserSubscription } from "@/lib/actions/subscription-tracker-actions";
import { toast } from "sonner";

export function EmailScanner({ onSubscriptionAdded }: { onSubscriptionAdded?: () => void }) {
  const [emailSubject, setEmailSubject] = useState("");
  const [emailFrom, setEmailFrom] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailDate, setEmailDate] = useState("");
  const [scanning, setScanning] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedSubscription | null>(null);
  const [adding, setAdding] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setParsedResult(null);

    // Simulate processing delay
    setTimeout(() => {
      const result = parseEmailForSubscription(
        emailSubject,
        emailFrom,
        emailBody,
        emailDate || new Date().toISOString()
      );

      setParsedResult(result);
      setScanning(false);

      if (result) {
        if (result.confidence >= 70) {
          toast.success("Subscription detected with high confidence!");
        } else if (result.confidence >= 40) {
          toast.info("Subscription detected, please verify details");
        } else {
          toast.warning("Subscription detected with low confidence");
        }
      } else {
        toast.error("No subscription information found in email");
      }
    }, 1000);
  };

  const handleAddSubscription = async () => {
    if (!parsedResult) return;

    setAdding(true);

    const result = await addUserSubscription({
      application_name: parsedResult.application_name,
      date_subscribed: parsedResult.date_subscribed || new Date().toISOString().split('T')[0],
      cost_aed: parsedResult.cost_aed || 0,
      billing_cycle: parsedResult.billing_cycle || 'monthly',
      status: 'active',
      notes: `Imported from email: ${parsedResult.email_subject}`,
    });

    setAdding(false);

    if (result.success) {
      toast.success("Subscription added successfully!");
      // Reset form
      setEmailSubject("");
      setEmailFrom("");
      setEmailBody("");
      setEmailDate("");
      setParsedResult(null);

      if (onSubscriptionAdded) {
        onSubscriptionAdded();
      }
    } else {
      toast.error(result.error || "Failed to add subscription");
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return "default";
    if (confidence >= 40) return "secondary";
    return "destructive";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 70) return "High";
    if (confidence >= 40) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Scanner</CardTitle>
          </div>
          <CardDescription>
            Paste email content to automatically extract subscription information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-subject">Email Subject *</Label>
            <Input
              id="email-subject"
              placeholder="Your Netflix subscription receipt"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-from">From (Email Address)</Label>
            <Input
              id="email-from"
              placeholder="billing@netflix.com"
              value={emailFrom}
              onChange={(e) => setEmailFrom(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-date">Email Date</Label>
            <Input
              id="email-date"
              type="date"
              value={emailDate}
              onChange={(e) => setEmailDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-body">Email Body *</Label>
            <Textarea
              id="email-body"
              rows={8}
              placeholder="Paste the email content here... Include pricing, billing information, etc."
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
            />
          </div>

          <Button
            onClick={handleScan}
            disabled={!emailSubject || !emailBody || scanning}
            className="w-full"
          >
            <Scan className="h-4 w-4 mr-2" />
            {scanning ? "Scanning..." : "Scan Email"}
          </Button>
        </CardContent>
      </Card>

      {parsedResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <CardTitle>Detected Subscription</CardTitle>
              </div>
              <Badge variant={getConfidenceColor(parsedResult.confidence)}>
                {getConfidenceText(parsedResult.confidence)} Confidence ({parsedResult.confidence}%)
              </Badge>
            </div>
            <CardDescription>
              Review the extracted information before adding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm text-muted-foreground">Application Name</Label>
                <p className="text-lg font-semibold">{parsedResult.application_name}</p>
              </div>

              {parsedResult.cost_aed && (
                <div>
                  <Label className="text-sm text-muted-foreground">Cost</Label>
                  <p className="text-lg font-semibold">AED {parsedResult.cost_aed.toFixed(2)}</p>
                </div>
              )}

              {parsedResult.billing_cycle && (
                <div>
                  <Label className="text-sm text-muted-foreground">Billing Cycle</Label>
                  <p className="text-lg font-semibold capitalize">{parsedResult.billing_cycle}</p>
                </div>
              )}

              {parsedResult.date_subscribed && (
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p className="text-lg font-semibold">{parsedResult.date_subscribed}</p>
                </div>
              )}
            </div>

            {parsedResult.confidence < 70 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Low confidence detection.</strong> Please verify the extracted information
                  is correct before adding.
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddSubscription}
                disabled={adding}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                {adding ? "Adding..." : "Add Subscription"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setParsedResult(null)}
                className="flex-1"
              >
                Scan Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

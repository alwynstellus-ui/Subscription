"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addUserSubscription } from "@/lib/actions/subscription-tracker-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewSubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    application_name: "",
    date_subscribed: "",
    date_ending: "",
    cost_aed: "",
    billing_cycle: "monthly" as 'monthly' | 'quarterly' | 'yearly' | 'one-time',
    status: "active" as 'active' | 'cancelled' | 'expired',
    auto_renewal: true,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.application_name || !formData.date_subscribed || !formData.cost_aed) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    const result = await addUserSubscription({
      application_name: formData.application_name,
      date_subscribed: formData.date_subscribed,
      date_ending: formData.date_ending || undefined,
      cost_aed: parseFloat(formData.cost_aed),
      billing_cycle: formData.billing_cycle,
      status: formData.status,
      auto_renewal: formData.auto_renewal,
      notes: formData.notes || undefined,
    });

    if (result.success) {
      toast.success("Subscription added successfully!");
      router.push("/subscriptions");
    } else {
      toast.error(result.error || "Failed to add subscription");
      setLoading(false);
    }
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
        <h2 className="text-3xl font-bold tracking-tight">Add Subscription</h2>
        <p className="text-muted-foreground">
          Track a new subscription to an application or service
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
          <CardDescription>
            Enter the details of your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="application_name">Application Name *</Label>
                <Input
                  id="application_name"
                  placeholder="Netflix, Spotify, etc."
                  value={formData.application_name}
                  onChange={(e) => setFormData({ ...formData, application_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost_aed">Cost (AED) *</Label>
                <Input
                  id="cost_aed"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="49.99"
                  value={formData.cost_aed}
                  onChange={(e) => setFormData({ ...formData, cost_aed: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_subscribed">Date Subscribed *</Label>
                <Input
                  id="date_subscribed"
                  type="date"
                  value={formData.date_subscribed}
                  onChange={(e) => setFormData({ ...formData, date_subscribed: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_ending">Date Ending (Optional)</Label>
                <Input
                  id="date_ending"
                  type="date"
                  value={formData.date_ending}
                  onChange={(e) => setFormData({ ...formData, date_ending: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_cycle">Billing Cycle *</Label>
                <select
                  id="billing_cycle"
                  value={formData.billing_cycle}
                  onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="one-time">One-time</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auto_renewal">Auto Renewal</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto_renewal"
                  checked={formData.auto_renewal}
                  onChange={(e) => setFormData({ ...formData, auto_renewal: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="auto_renewal" className="text-sm">
                  This subscription auto-renews
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Additional notes about this subscription..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Adding..." : "Add Subscription"}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/subscriptions">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

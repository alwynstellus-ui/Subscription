"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCampaign, sendCampaign } from "@/lib/actions/campaign-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    category: "",
  });

  const handleSubmit = async (sendNow: boolean) => {
    if (!formData.name || !formData.subject || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const result = await createCampaign(formData);

      if (!result.success) {
        toast.error(result.error || "Failed to create campaign");
        setLoading(false);
        return;
      }

      if (sendNow && result.data) {
        const sendResult = await sendCampaign(result.data.id);
        if (sendResult.success) {
          toast.success(sendResult.message || "Campaign sent successfully!");
        } else {
          toast.error(sendResult.error || "Failed to send campaign");
        }
      } else {
        toast.success("Campaign saved as draft");
      }

      router.push("/admin/campaigns");
    } catch (error) {
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Campaign</h2>
        <p className="text-muted-foreground">
          Send a newsletter to your subscribers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Fill in the details for your email campaign
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              placeholder="Weekly Newsletter - Jan 2025"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Internal name for this campaign
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject *</Label>
            <Input
              id="subject"
              placeholder="Your Weekly Update: January 2025"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              What subscribers will see in their inbox
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Subscribers</option>
              <option value="weekly_digest">Weekly Digest</option>
              <option value="product_updates">Product Updates</option>
              <option value="announcements">Announcements</option>
            </select>
            <p className="text-sm text-muted-foreground">
              Filter recipients by preference category
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Email Content *</Label>
            <textarea
              id="content"
              rows={12}
              placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border rounded-md font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              HTML content for your email (unsubscribe link will be added automatically)
            </p>
          </div>

          <div className="border-t pt-6 flex gap-3">
            <Button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Sending..." : "Send Now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

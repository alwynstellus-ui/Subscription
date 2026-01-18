import { getAllCampaigns } from "@/lib/actions/campaign-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Plus, Mail } from "lucide-react";

export default async function CampaignsPage() {
  const result = await getAllCampaigns();

  const campaigns = result.success && result.data ? result.data : [];

  const statusColor = {
    draft: "secondary",
    scheduled: "default",
    sending: "default",
    sent: "default",
    cancelled: "destructive",
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campaigns</h2>
          <p className="text-muted-foreground">
            Create and manage email campaigns
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/campaigns/new">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Campaigns Yet</CardTitle>
            <CardDescription>
              Create your first campaign to start sending newsletters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/campaigns/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign: any) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {campaign.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {campaign.subject}
                    </CardDescription>
                  </div>
                  <Badge variant={statusColor[campaign.status as keyof typeof statusColor]}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {format(new Date(campaign.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  {campaign.sent_at && (
                    <div>
                      <p className="text-muted-foreground">Sent</p>
                      <p className="font-medium">
                        {format(new Date(campaign.sent_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  )}
                  {campaign.category && (
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-medium capitalize">
                        {campaign.category.replace(/_/g, " ")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

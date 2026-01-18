import { getAllCampaigns, getCampaignStats } from "@/lib/actions/campaign-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { BarChart, TrendingUp, Mail, Eye, MousePointer, XCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const result = await getAllCampaigns();
  const campaigns = result.success ? result.data?.filter((c: any) => c.status === "sent") : [];

  // Get stats for each campaign
  const campaignsWithStats = await Promise.all(
    (campaigns || []).map(async (campaign: any) => {
      const statsResult = await getCampaignStats(campaign.id);
      return {
        ...campaign,
        stats: statsResult.success ? statsResult.data : null,
      };
    })
  );

  // Calculate overall stats
  const overallStats = campaignsWithStats.reduce(
    (acc, campaign) => {
      if (campaign.stats) {
        acc.total += campaign.stats.total;
        acc.sent += campaign.stats.sent;
        acc.delivered += campaign.stats.delivered;
        acc.opened += campaign.stats.opened;
        acc.clicked += campaign.stats.clicked;
        acc.bounced += campaign.stats.bounced;
      }
      return acc;
    },
    { total: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0 }
  );

  const openRate = overallStats.delivered > 0
    ? ((overallStats.opened / overallStats.delivered) * 100).toFixed(1)
    : "0";

  const clickRate = overallStats.delivered > 0
    ? ((overallStats.clicked / overallStats.delivered) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Track campaign performance and engagement
        </p>
      </div>

      {campaignsWithStats.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Analytics Yet</CardTitle>
            <CardDescription>
              Send your first campaign to see analytics here
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats.sent}</div>
                <p className="text-xs text-muted-foreground">
                  Across {campaignsWithStats.length} campaigns
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {overallStats.opened} of {overallStats.delivered} delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clickRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {overallStats.clicked} of {overallStats.delivered} delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overallStats.sent > 0
                    ? ((overallStats.bounced / overallStats.sent) * 100).toFixed(1)
                    : "0"}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {overallStats.bounced} bounced
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Detailed metrics for each campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaignsWithStats.map((campaign: any) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {campaign.subject}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sent {format(new Date(campaign.sent_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    {campaign.stats && (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Sent</p>
                          <p className="text-lg font-bold">{campaign.stats.sent}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Delivered</p>
                          <p className="text-lg font-bold">{campaign.stats.delivered}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Opened</p>
                          <p className="text-lg font-bold">
                            {campaign.stats.opened}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({campaign.stats.delivered > 0
                                ? ((campaign.stats.opened / campaign.stats.delivered) * 100).toFixed(0)
                                : 0}%)
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Clicked</p>
                          <p className="text-lg font-bold">
                            {campaign.stats.clicked}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({campaign.stats.delivered > 0
                                ? ((campaign.stats.clicked / campaign.stats.delivered) * 100).toFixed(0)
                                : 0}%)
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Bounced</p>
                          <p className="text-lg font-bold text-destructive">
                            {campaign.stats.bounced}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Failed</p>
                          <p className="text-lg font-bold text-destructive">
                            {campaign.stats.failed}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

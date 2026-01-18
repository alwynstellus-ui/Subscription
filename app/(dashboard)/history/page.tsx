import { getCampaignHistory } from "@/lib/actions/user-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Eye, MousePointer } from "lucide-react";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const result = await getCampaignHistory();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Email History</h2>
        <p className="text-muted-foreground">
          View all newsletters you've received
        </p>
      </div>

      {!result.success || !result.data || result.data.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No History Yet</CardTitle>
            <CardDescription>
              You haven't received any newsletters yet. Check back soon!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {result.data.map((send: any) => (
            <Card key={send.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {send.campaigns?.subject || "Newsletter"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {send.campaigns?.name || "Campaign"}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      send.status === "delivered" || send.status === "opened" || send.status === "clicked"
                        ? "default"
                        : send.status === "bounced" || send.status === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {send.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Sent</p>
                    <p className="font-medium">
                      {send.sent_at
                        ? format(new Date(send.sent_at), "MMM d, yyyy")
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delivered</p>
                    <p className="font-medium">
                      {send.delivered_at
                        ? format(new Date(send.delivered_at), "MMM d, h:mm a")
                        : "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Opened</p>
                      <p className="font-medium">
                        {send.opened_at ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Clicked</p>
                      <p className="font-medium">
                        {send.clicked_at ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

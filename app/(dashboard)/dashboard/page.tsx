import { getUserSubscription } from "@/lib/actions/user-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";

export default async function DashboardPage() {
  const result = await getUserSubscription();

  if (!result.success || !result.data) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome!</h2>
          <p className="text-muted-foreground">
            You're not subscribed to our newsletter yet.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Subscribe to Our Newsletter</CardTitle>
            <CardDescription>
              Visit our homepage to subscribe and start receiving updates.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const subscription = result.data;
  const statusColor = {
    active: "default",
    pending: "secondary",
    unsubscribed: "destructive",
  } as const;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Manage your newsletter subscription
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Subscription Status
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={statusColor[subscription.status as keyof typeof statusColor]}>
              {subscription.status.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Subscribed Since
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription.confirmed_at
                ? format(new Date(subscription.confirmed_at), "MMM d, yyyy")
                : "Pending"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Email Address
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">
              {subscription.email}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
          <CardDescription>
            Information about your newsletter subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-lg font-semibold capitalize">{subscription.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Source</p>
              <p className="text-lg font-semibold capitalize">{subscription.source}</p>
            </div>
          </div>

          {subscription.status === "active" && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                You're all set! You'll receive our newsletters at <strong>{subscription.email}</strong>.
                Manage your preferences to customize what you receive.
              </p>
            </div>
          )}

          {subscription.status === "pending" && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Please check your email and click the confirmation link to activate your subscription.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

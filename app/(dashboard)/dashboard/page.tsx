import { getUserSubscription } from "@/lib/actions/user-actions";
import { getSubscriptionStats } from "@/lib/actions/subscription-tracker-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, Calendar, CreditCard, TrendingUp, DollarSign, AlertCircle, Plus, Scan } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [subscriptionResult, statsResult] = await Promise.all([
    getUserSubscription(),
    getSubscriptionStats(),
  ]);

  const subscription = subscriptionResult.success ? subscriptionResult.data : null;
  const stats = statsResult.success ? statsResult.data : null;

  const statusColor = {
    active: "default",
    pending: "secondary",
    unsubscribed: "destructive",
  } as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome Back!</h2>
        <p className="text-muted-foreground">
          Here's an overview of your subscriptions and newsletter status
        </p>
      </div>

      {/* Newsletter Subscription Status */}
      {subscription && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <CardTitle>Newsletter Subscription</CardTitle>
              </div>
              <Badge variant={statusColor[subscription.status as keyof typeof statusColor]}>
                {subscription.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                <p className="text-sm font-semibold truncate">{subscription.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subscribed Since</p>
                <p className="text-sm font-semibold">
                  {subscription.confirmed_at
                    ? format(new Date(subscription.confirmed_at), "MMM d, yyyy")
                    : "Pending confirmation"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Source</p>
                <p className="text-sm font-semibold capitalize">{subscription.source}</p>
              </div>
            </div>

            {subscription.status === "pending" && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  Please check your email and click the confirmation link to activate your subscription.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subscription Tracker Stats */}
      {stats && stats.total_subscriptions > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_subscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.active_subscriptions} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">AED {stats.monthly_cost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Per month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yearly Cost</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">AED {stats.yearly_cost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Per year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_subscriptions}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your subscriptions</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Button asChild variant="outline" className="h-24 flex-col gap-2">
                <Link href="/subscriptions">
                  <CreditCard className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">View All</div>
                    <div className="text-xs text-muted-foreground">See all subscriptions</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-24 flex-col gap-2">
                <Link href="/subscriptions/scan">
                  <Scan className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Scan Email</div>
                    <div className="text-xs text-muted-foreground">Auto-detect subscription</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-24 flex-col gap-2">
                <Link href="/subscriptions/new">
                  <Plus className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Add Manually</div>
                    <div className="text-xs text-muted-foreground">Create new subscription</div>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Empty State - No Subscriptions */
        <Card>
          <CardHeader>
            <CardTitle>Subscription Tracker</CardTitle>
            <CardDescription>
              Track all your app and service subscriptions in one place
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No subscriptions tracked yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start tracking your subscriptions to Netflix, Spotify, Adobe, and more. Monitor your
              spending and never miss a renewal.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link href="/subscriptions/scan">
                  <Scan className="h-4 w-4 mr-2" />
                  Scan Email
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/subscriptions/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manually
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Newsletter Preferences</CardTitle>
            </div>
            <CardDescription>Customize what you receive</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your newsletter categories and subscription duration preferences.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/preferences">Manage Preferences</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Newsletter History</CardTitle>
            </div>
            <CardDescription>View past newsletters</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Check all newsletters you've received and track your engagement.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/history">View History</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

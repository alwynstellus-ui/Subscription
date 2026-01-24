"use client";

import { useEffect, useState } from "react";
import { getUserSubscriptions, deleteUserSubscription, getSubscriptionStats, type UserSubscription } from "@/lib/actions/subscription-tracker-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Edit, TrendingUp, Calendar, DollarSign, Scan } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [stats, setStats] = useState({
    total_subscriptions: 0,
    active_subscriptions: 0,
    monthly_cost: 0,
    yearly_cost: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [subsResult, statsResult] = await Promise.all([
      getUserSubscriptions(),
      getSubscriptionStats(),
    ]);

    if (subsResult.success && subsResult.data) {
      setSubscriptions(subsResult.data);
    }

    if (statsResult.success && statsResult.data) {
      setStats(statsResult.data);
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription?")) {
      return;
    }

    const result = await deleteUserSubscription(id);
    if (result.success) {
      toast.success("Subscription deleted successfully");
      loadData();
    } else {
      toast.error(result.error || "Failed to delete subscription");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'cancelled':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Subscriptions</h2>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Subscriptions</h2>
          <p className="text-muted-foreground">
            Track and manage all your subscriptions in one place
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/subscriptions/scan">
              <Scan className="h-4 w-4 mr-2" />
              Scan Email
            </Link>
          </Button>
          <Button asChild>
            <Link href="/subscriptions/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Manually
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
            <p className="text-xs text-muted-foreground">
              Per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Cost</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {stats.yearly_cost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_subscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>
            View and manage your subscription details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No subscriptions tracked yet</p>
              <Button asChild>
                <Link href="/subscriptions/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Subscription
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Application</th>
                    <th className="text-left p-4 font-medium">Date Subscribed</th>
                    <th className="text-left p-4 font-medium">Date Ending</th>
                    <th className="text-left p-4 font-medium">Cost (AED)</th>
                    <th className="text-left p-4 font-medium">Billing</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{sub.application_name}</td>
                      <td className="p-4">
                        {format(new Date(sub.date_subscribed), "MMM d, yyyy")}
                      </td>
                      <td className="p-4">
                        {sub.date_ending
                          ? format(new Date(sub.date_ending), "MMM d, yyyy")
                          : "N/A"}
                      </td>
                      <td className="p-4 font-semibold">
                        AED {Number(sub.cost_aed).toFixed(2)}
                      </td>
                      <td className="p-4 capitalize">{sub.billing_cycle}</td>
                      <td className="p-4">
                        <Badge variant={getStatusColor(sub.status)}>
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <Link href={`/subscriptions/edit/${sub.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(sub.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

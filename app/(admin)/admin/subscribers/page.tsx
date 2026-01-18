"use client";

import { useEffect, useState } from "react";
import { getAllSubscribers, deleteSubscriber, exportSubscribers } from "@/lib/actions/admin-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Download, Trash2, Search } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadSubscribers();
  }, [page, statusFilter]);

  const loadSubscribers = async () => {
    setLoading(true);
    const result = await getAllSubscribers(page, 50, statusFilter === "all" ? undefined : statusFilter, search);
    if (result.success) {
      setSubscribers(result.data || []);
      setTotal(result.total || 0);
    } else {
      toast.error(result.error || "Failed to load subscribers");
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(1);
    loadSubscribers();
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete subscriber ${email}?`)) return;

    const result = await deleteSubscriber(id);
    if (result.success) {
      toast.success("Subscriber deleted");
      loadSubscribers();
    } else {
      toast.error(result.error || "Failed to delete");
    }
  };

  const handleExport = async () => {
    const result = await exportSubscribers(statusFilter === "all" ? undefined : statusFilter);
    if (result.success && result.data) {
      const blob = new Blob([result.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscribers-${new Date().toISOString()}.csv`;
      a.click();
      toast.success("Exported successfully");
    } else {
      toast.error(result.error || "Failed to export");
    }
  };

  const statusColor = {
    active: "default",
    pending: "secondary",
    unsubscribed: "destructive",
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscribers</h2>
          <p className="text-muted-foreground">
            Manage your newsletter subscribers
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>Subscriber List</CardTitle>
              <CardDescription>
                {total} total subscribers
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subscribers found
            </div>
          ) : (
            <div className="space-y-2">
              {subscribers.map((subscriber) => (
                <div
                  key={subscriber.id}
                  className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{subscriber.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {format(new Date(subscriber.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusColor[subscriber.status as keyof typeof statusColor]}>
                      {subscriber.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(subscriber.id, subscriber.email)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {total > 50 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(total / 50)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 50)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

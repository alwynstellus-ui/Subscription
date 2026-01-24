"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Trash2, RefreshCw, CheckCircle2, AlertCircle, Loader2, Plus } from "lucide-react";
import { getEmailConnections, deleteEmailConnection, scanEmailsForSubscriptions, type EmailConnection } from "@/lib/actions/email-connection-actions";
import { addUserSubscription } from "@/lib/actions/subscription-tracker-actions";
import { getGmailAuthUrl } from "@/lib/email/gmail-client";
import { getOutlookAuthUrl } from "@/lib/email/outlook-client";
import { toast } from "sonner";
import { ParsedSubscription } from "@/lib/email/subscription-parser";

export function EmailConnectionManager() {
  const [connections, setConnections] = useState<EmailConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState<string | null>(null);
  const [scannedResults, setScannedResults] = useState<ParsedSubscription[]>([]);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setLoading(true);
    const result = await getEmailConnections();

    if (result.success && result.data) {
      setConnections(result.data as EmailConnection[]);
    }

    setLoading(false);
  };

  const handleConnectGmail = () => {
    const authUrl = getGmailAuthUrl();
    window.location.href = authUrl;
  };

  const handleConnectOutlook = () => {
    const authUrl = getOutlookAuthUrl();
    window.location.href = authUrl;
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm("Are you sure you want to disconnect this email account?")) {
      return;
    }

    const result = await deleteEmailConnection(connectionId);

    if (result.success) {
      toast.success("Email account disconnected");
      loadConnections();
    } else {
      toast.error(result.error || "Failed to disconnect");
    }
  };

  const handleScan = async (connectionId: string) => {
    setScanning(connectionId);
    setScannedResults([]);

    const result = await scanEmailsForSubscriptions(connectionId);

    setScanning(null);

    if (result.success && result.data) {
      setScannedResults(result.data);
      toast.success(result.message || "Scan completed!");
    } else {
      if (result.expired) {
        toast.error("Email connection expired. Please reconnect.");
        loadConnections();
      } else {
        toast.error(result.error || "Failed to scan emails");
      }
    }
  };

  const handleAddSubscription = async (subscription: ParsedSubscription) => {
    setAdding(subscription.application_name);

    const result = await addUserSubscription({
      application_name: subscription.application_name,
      date_subscribed: subscription.date_subscribed || new Date().toISOString().split('T')[0],
      cost_aed: subscription.cost_aed || 0,
      billing_cycle: subscription.billing_cycle || 'monthly',
      status: 'active',
      notes: `Auto-detected from ${subscription.email_from}`,
    });

    setAdding(null);

    if (result.success) {
      toast.success(`${subscription.application_name} added!`);
      // Remove from results
      setScannedResults(prev => prev.filter(s => s.application_name !== subscription.application_name));
    } else {
      toast.error(result.error || "Failed to add subscription");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'expired':
        return 'destructive';
      case 'disconnected':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return "default";
    if (confidence >= 40) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading connections...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connect Buttons */}
      {connections.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Email</CardTitle>
            <CardDescription>
              Connect Gmail or Outlook to automatically scan for subscription emails
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={handleConnectGmail} className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Connect Gmail
            </Button>
            <Button onClick={handleConnectOutlook} variant="outline" className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Connect Outlook
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Connected Accounts */}
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Connected Email Accounts</CardTitle>
                <CardDescription>Manage your connected email accounts</CardDescription>
              </div>
              {connections.length < 2 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={connections[0]?.provider === 'gmail' ? handleConnectOutlook : handleConnectGmail}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add {connections[0]?.provider === 'gmail' ? 'Outlook' : 'Gmail'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {connections.map(connection => (
              <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Mail className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{connection.email_address}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">
                        {connection.provider}
                      </Badge>
                      <Badge variant={getStatusColor(connection.status)}>
                        {connection.status}
                      </Badge>
                      {connection.last_scanned_at && (
                        <p className="text-xs text-muted-foreground">
                          Last scanned: {new Date(connection.last_scanned_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScan(connection.id)}
                    disabled={scanning === connection.id}
                  >
                    {scanning === connection.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Scan Now
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(connection.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Scan Results */}
      {scannedResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle>Found {scannedResults.length} Subscriptions</CardTitle>
            </div>
            <CardDescription>Review and add the detected subscriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scannedResults.map((subscription, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{subscription.application_name}</h4>
                    <Badge variant={getConfidenceColor(subscription.confidence)}>
                      {subscription.confidence}% confidence
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {subscription.cost_aed && (
                      <div>
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="ml-2 font-medium">AED {subscription.cost_aed.toFixed(2)}</span>
                      </div>
                    )}
                    {subscription.billing_cycle && (
                      <div>
                        <span className="text-muted-foreground">Cycle:</span>
                        <span className="ml-2 font-medium capitalize">{subscription.billing_cycle}</span>
                      </div>
                    )}
                    {subscription.date_subscribed && (
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <span className="ml-2 font-medium">{subscription.date_subscribed}</span>
                      </div>
                    )}
                  </div>
                  {subscription.confidence < 70 && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                      <AlertCircle className="h-3 w-3" />
                      Low confidence - please verify details
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleAddSubscription(subscription)}
                  disabled={adding === subscription.application_name}
                  size="sm"
                >
                  {adding === subscription.application_name ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {scannedResults.length === 0 && !scanning && connections.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Ready to Scan</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click "Scan Now" on any connected account to search for subscription emails
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

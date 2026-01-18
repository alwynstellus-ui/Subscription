import { confirmSubscription } from "@/lib/actions/subscription-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Invalid Link</CardTitle>
            </div>
            <CardDescription>
              No confirmation token provided
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const result = await confirmSubscription(token);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-destructive" />
            )}
            <CardTitle>
              {result.success ? "Subscription Confirmed!" : "Confirmation Failed"}
            </CardTitle>
          </div>
          <CardDescription>
            {result.success ? result.message : result.error}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.success && (
            <p className="text-sm text-muted-foreground">
              You'll now receive our newsletters. Check your inbox for a welcome message!
            </p>
          )}
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/sign-up">Create Account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

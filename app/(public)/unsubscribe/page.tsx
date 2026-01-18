import { unsubscribeEmail } from "@/lib/actions/subscription-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export default async function UnsubscribePage({
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
              No unsubscribe token provided
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

  const result = await unsubscribeEmail(token);

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
              {result.success ? "Unsubscribed Successfully" : "Unsubscribe Failed"}
            </CardTitle>
          </div>
          <CardDescription>
            {result.success ? result.message : result.error}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.success && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                We're sorry to see you go! You won't receive any more newsletters from us.
              </p>
              <p className="text-sm text-muted-foreground">
                If you change your mind, you can always subscribe again from our homepage.
              </p>
            </div>
          )}
          <Button asChild className="w-full">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

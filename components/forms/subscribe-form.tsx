"use client";

import { useState } from "react";
import { subscribeEmail } from "@/lib/actions/subscription-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await subscribeEmail(email);

      if (result.success) {
        toast.success(result.message);
        setEmail("");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-lg">
          Email Address
        </Label>
        <div className="flex gap-2">
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Subscribing..." : "Subscribe"}
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        We'll send you a confirmation email. No spam, unsubscribe anytime.
      </p>
    </form>
  );
}

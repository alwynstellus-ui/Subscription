"use client";

import { useEffect, useState } from "react";
import { getUserPreferences, updateUserPreferences } from "@/lib/actions/user-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Preference {
  id: string;
  category: string;
  enabled: boolean;
}

const categoryDescriptions: Record<string, string> = {
  weekly_digest: "Receive our weekly roundup of the best content",
  product_updates: "Get notified about new features and updates",
  announcements: "Important announcements and news",
};

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const result = await getUserPreferences();
    if (result.success && result.data) {
      setPreferences(result.data);
    } else {
      toast.error(result.error || "Failed to load preferences");
    }
    setLoading(false);
  };

  const handleToggle = (category: string) => {
    setPreferences(prefs =>
      prefs.map(p =>
        p.category === category ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const prefs = preferences.reduce((acc, p) => {
      acc[p.category] = p.enabled;
      return acc;
    }, {} as Record<string, boolean>);

    const result = await updateUserPreferences(prefs);
    if (result.success) {
      toast.success("Preferences saved successfully!");
    } else {
      toast.error(result.error || "Failed to save preferences");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Preferences</h2>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (preferences.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Preferences</h2>
          <p className="text-muted-foreground">
            No subscription found. Please subscribe to our newsletter first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Preferences</h2>
        <p className="text-muted-foreground">
          Customize your newsletter subscription
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>
            Choose which types of emails you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {preferences.map((pref) => (
            <div key={pref.id} className="flex items-start justify-between space-x-4">
              <div className="flex-1">
                <Label
                  htmlFor={pref.category}
                  className="text-base font-medium capitalize cursor-pointer"
                >
                  {pref.category.replace(/_/g, " ")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {categoryDescriptions[pref.category] || "Stay updated with this category"}
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={pref.category}
                  checked={pref.enabled}
                  onChange={() => handleToggle(pref.category)}
                  className="h-5 w-5 rounded border-gray-300 cursor-pointer"
                />
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

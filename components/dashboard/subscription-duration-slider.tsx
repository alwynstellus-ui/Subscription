"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DURATION_OPTIONS = [
  { value: 0, months: 3, label: "3 Months" },
  { value: 1, months: 6, label: "6 Months" },
  { value: 2, months: 9, label: "9 Months" },
  { value: 3, months: 12, label: "1 Year" },
  { value: 4, months: 24, label: "2 Years" },
  { value: 5, months: 60, label: "5 Years" },
];

interface SubscriptionDurationSliderProps {
  initialDuration?: number;
  onSave?: (months: number) => Promise<{ success: boolean; error?: string }>;
}

export function SubscriptionDurationSlider({
  initialDuration = 12,
  onSave,
}: SubscriptionDurationSliderProps) {
  // Find the initial index based on duration
  const initialIndex = DURATION_OPTIONS.findIndex(
    (opt) => opt.months === initialDuration
  );
  const [sliderValue, setSliderValue] = useState(initialIndex >= 0 ? initialIndex : 3);
  const [saving, setSaving] = useState(false);

  const selectedOption = DURATION_OPTIONS[sliderValue];

  const handleSave = async () => {
    if (!onSave) return;

    setSaving(true);
    try {
      const result = await onSave(selectedOption.months);
      if (result.success) {
        toast.success("Subscription duration updated successfully!");
      } else {
        toast.error(result.error || "Failed to update duration");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="duration-slider" className="text-base font-semibold">
            Subscription Duration
          </Label>
          <span className="text-2xl font-bold text-primary">
            {selectedOption.label}
          </span>
        </div>

        <div className="space-y-2">
          <Slider
            id="duration-slider"
            min={0}
            max={5}
            step={1}
            value={[sliderValue]}
            onValueChange={(value) => setSliderValue(value[0])}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground px-1">
            {DURATION_OPTIONS.map((option) => (
              <span key={option.value} className="text-center">
                {option.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Selected: <span className="font-medium text-foreground">{selectedOption.months} months</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Choose your preferred subscription duration
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Duration"}
        </Button>
      </div>
    </div>
  );
}

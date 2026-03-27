import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TIPS = [
  {
    heading: "Stay hydrated",
    body: "Drinking enough water supports digestion, energy, and clear thinking. Aim for 6–8 glasses a day.",
  },
  {
    heading: "Move a little",
    body: "Even a 10-minute walk improves mood and circulation. You don't need a gym to feel better.",
  },
  {
    heading: "Prioritise sleep",
    body: "7–9 hours of quality sleep helps your body repair and your mind reset. A consistent bedtime makes a big difference.",
  },
  {
    heading: "Eat whole foods",
    body: "Vegetables, legumes, and whole grains fuel your body steadily. Limit ultra-processed snacks when you can.",
  },
  {
    heading: "Breathe deeply",
    body: "Three slow, deep breaths activate your body's calm response. Try it before a stressful moment.",
  },
  {
    heading: "Connect with others",
    body: "Strong social ties improve both mental and physical health. A short call or message counts.",
  },
  {
    heading: "Limit screen time before bed",
    body: "Blue light from screens can delay sleep onset. Try switching off devices 30 minutes before bed.",
  },
];

interface CareTipCardProps {
  /** 0-based index into the TIPS array. Defaults to day-of-week. */
  tipIndex?: number;
}

export function CareTipCard({ tipIndex }: CareTipCardProps) {
  const idx = tipIndex !== undefined ? tipIndex : new Date().getDay();
  const tip = TIPS[idx % TIPS.length];

  return (
    <Card className="border border-primary/10 bg-primary/5 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
              Daily tip
            </p>
            <p className="text-sm font-semibold text-foreground leading-snug">
              {tip.heading}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              {tip.body}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

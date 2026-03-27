import type { SymptomEntry, TriageOutcome, TriageLevel } from "@/lib/types";

/**
 * Rule-based triage engine for MVP.
 *
 * This is a simplified deterministic engine — NOT medical advice.
 * A real deployment would integrate a validated clinical decision support system.
 *
 * Levels (ascending urgency):
 *   self_care → non_urgent → semi_urgent → urgent → emergency
 */

// Red-flag symptom IDs that escalate to emergency
const EMERGENCY_SYMPTOMS = new Set([
  "chest_pain",
  "shortness_of_breath",
  "palpitations",
  "confusion",
  "blood_in_stool",
  "vision_changes",
  "neck_stiffness",
]);

// Symptoms that escalate to urgent when severe
const URGENT_WHEN_SEVERE = new Set([
  "abdominal_pain",
  "vomiting",
  "dizziness",
  "fever",
  "headache",
]);

const TRIAGE_METADATA: Record<
  TriageLevel,
  Omit<TriageOutcome, "level">
> = {
  emergency: {
    label: "Emergency",
    recommendation:
      "Your symptoms need immediate medical attention. Please call emergency services or go to the nearest emergency department now.",
    seekCareWithin: "Immediately",
  },
  urgent: {
    label: "Urgent",
    recommendation:
      "Your symptoms need prompt medical attention. Please visit an urgent care clinic or emergency department within the next few hours.",
    seekCareWithin: "Within 2–4 hours",
  },
  semi_urgent: {
    label: "Semi-Urgent",
    recommendation:
      "Your symptoms should be assessed by a clinician. Book an appointment or visit a walk-in clinic today.",
    seekCareWithin: "Within 24 hours",
  },
  non_urgent: {
    label: "Non-Urgent",
    recommendation:
      "Your symptoms are not immediately dangerous. Schedule an appointment with your primary care provider within the next few days.",
    seekCareWithin: "Within 2–3 days",
  },
  self_care: {
    label: "Self-Care",
    recommendation:
      "Your symptoms can likely be managed at home with rest and over-the-counter remedies. If symptoms worsen or persist beyond 5 days, consult a clinician.",
    seekCareWithin: "Not required — monitor at home",
  },
};

export function runTriage(symptoms: SymptomEntry[]): TriageOutcome {
  let level: TriageLevel = "self_care";

  for (const entry of symptoms) {
    // Emergency override
    if (EMERGENCY_SYMPTOMS.has(entry.symptomId)) {
      level = "emergency";
      break;
    }

    // Severe severity on key symptoms → urgent
    if (entry.severity === "severe" && URGENT_WHEN_SEVERE.has(entry.symptomId)) {
      level = escalate(level, "urgent");
    }

    // Moderate severity → semi-urgent minimum
    if (entry.severity === "moderate") {
      level = escalate(level, "semi_urgent");
    }

    // Long duration bumps urgency one level
    if (
      entry.duration === "more_than_1_week" &&
      level === "self_care"
    ) {
      level = escalate(level, "non_urgent");
    }
  }

  return { level, ...TRIAGE_METADATA[level] };
}

/** Returns the higher urgency of two triage levels. */
function escalate(current: TriageLevel, candidate: TriageLevel): TriageLevel {
  const order: TriageLevel[] = [
    "self_care",
    "non_urgent",
    "semi_urgent",
    "urgent",
    "emergency",
  ];
  return order.indexOf(candidate) > order.indexOf(current) ? candidate : current;
}

export function triageLevelColor(level: TriageLevel): string {
  const map: Record<TriageLevel, string> = {
    emergency: "text-red-600",
    urgent: "text-orange-600",
    semi_urgent: "text-yellow-600",
    non_urgent: "text-green-600",
    self_care: "text-blue-600",
  };
  return map[level];
}

export function triageLevelBg(level: TriageLevel): string {
  const map: Record<TriageLevel, string> = {
    emergency: "bg-red-50 border-red-200",
    urgent: "bg-orange-50 border-orange-200",
    semi_urgent: "bg-yellow-50 border-yellow-200",
    non_urgent: "bg-green-50 border-green-200",
    self_care: "bg-blue-50 border-blue-200",
  };
  return map[level];
}

export function triageBadgeVariant(
  level: TriageLevel
): "emergency" | "urgent" | "semi_urgent" | "non_urgent" | "self_care" {
  return level;
}

import type { SymptomEntry, TriageOutcome, TriageLevel } from "@/lib/types";

/**
 * Rule-based triage engine for MVP.
 *
 * NOT medical advice. A real deployment would integrate a validated
 * clinical decision support system.
 *
 * Levels (ascending urgency):
 *   self_care → non_urgent → semi_urgent → urgent → emergency
 *
 * Action mapping:
 *   self_care   → pharmacy  ("Visit a pharmacy")
 *   non_urgent  → nurse     ("Request nurse follow-up")
 *   semi_urgent → doctor    ("Book a doctor consultation")
 *   urgent      → clinic    ("Find an urgent care clinic")
 *   emergency   → emergency ("Seek emergency care now")
 */

// ── Symptom-level escalation rules ────────────────────────────────────────────

const EMERGENCY_SYMPTOMS = new Set([
  "chest_pain",
  "shortness_of_breath",
  "palpitations",
  "confusion",
  "blood_in_stool",
  "vision_changes",
  "neck_stiffness",
]);

const URGENT_WHEN_SEVERE = new Set([
  "abdominal_pain",
  "vomiting",
  "dizziness",
  "fever",
  "headache",
]);

// ── Danger sign escalation rules ──────────────────────────────────────────────

/** Any of these danger sign IDs immediately escalates to emergency */
const EMERGENCY_DANGER_SIGNS = new Set([
  "ds_fever_neck",
  "ds_fever_confused",
  "ds_fever_breath",
  "ds_head_worst",
  "ds_head_vision",
  "ds_head_weakness",
  "ds_head_neck",
  "ds_cough_blood",
  "ds_cough_sentence",
  "ds_cough_blue",
  "ds_cough_chest",
  "ds_gut_blood",
  "ds_gut_severe",
  "ds_gut_rigid",
  "ds_injury_deform",
  "ds_injury_bladder",
  "ds_injury_head",
  "ds_skin_breath",
  "ds_skin_throat",
  "ds_other_confused",
  "ds_other_chest",
  "ds_other_breath",
]);

/** Any of these danger sign IDs escalates to at least urgent */
const URGENT_DANGER_SIGNS = new Set([
  "ds_fever_high",
  "ds_fever_rash",
  "ds_head_vomit",
  "ds_cough_worse",
  "ds_gut_fluids",
  "ds_gut_dehydrated",
  "ds_injury_noweight",
  "ds_injury_numb",
  "ds_skin_spreading",
  "ds_skin_fever",
  "ds_other_severe",
]);

// ── Outcome metadata ──────────────────────────────────────────────────────────

const TRIAGE_METADATA: Record<TriageLevel, Omit<TriageOutcome, "level">> = {
  emergency: {
    label:           "Emergency",
    recommendation:  "Seek emergency care immediately",
    rationale:       "One or more of your symptoms are potentially life-threatening. Please call emergency services or go to the nearest emergency department right now.",
    seekCareWithin:  "Immediately — do not wait",
    nextAction:      "emergency",
    nextActionLabel: "Seek emergency care now",
  },
  urgent: {
    label:           "Urgent",
    recommendation:  "Go to an urgent care clinic today",
    rationale:       "Your symptoms are significant and need a clinician's assessment within the next few hours. Do not wait until tomorrow.",
    seekCareWithin:  "Within 2–4 hours",
    nextAction:      "clinic",
    nextActionLabel: "Find urgent care clinic",
  },
  semi_urgent: {
    label:           "See a doctor",
    recommendation:  "Book a doctor consultation",
    rationale:       "Your symptoms should be reviewed by a doctor. Book an appointment or visit a walk-in clinic today or tomorrow.",
    seekCareWithin:  "Within 24 hours",
    nextAction:      "doctor",
    nextActionLabel: "Book doctor consultation",
  },
  non_urgent: {
    label:           "Nurse follow-up",
    recommendation:  "Request a nurse follow-up",
    rationale:       "A nurse can assess your symptoms and advise whether you need further care. Book a call or visit within the next few days.",
    seekCareWithin:  "Within 2–3 days",
    nextAction:      "nurse",
    nextActionLabel: "Request nurse follow-up",
  },
  self_care: {
    label:           "Self care",
    recommendation:  "You can manage this at home",
    rationale:       "Your symptoms appear mild and can likely be managed with rest and over-the-counter remedies. A pharmacist can advise on the best options.",
    seekCareWithin:  "Monitor — see a doctor if symptoms worsen or persist beyond 5 days",
    nextAction:      "pharmacy",
    nextActionLabel: "Visit a pharmacy",
  },
};

// ── Main engine ───────────────────────────────────────────────────────────────

/**
 * @param symptoms    Array of structured symptom entries from intake
 * @param dangerSigns Array of danger sign IDs selected during intake
 */
export function runTriage(
  symptoms: SymptomEntry[],
  dangerSigns: string[] = []
): TriageOutcome {
  let level: TriageLevel = "self_care";

  // ── 1. Danger signs take priority ─────────────────────────────────────────
  for (const sign of dangerSigns) {
    if (EMERGENCY_DANGER_SIGNS.has(sign)) {
      level = "emergency";
      break; // highest possible — stop immediately
    }
    if (URGENT_DANGER_SIGNS.has(sign)) {
      level = escalate(level, "urgent");
    }
  }

  // ── 2. Symptom-level rules (only if not already at emergency) ──────────────
  if (level !== "emergency") {
    for (const entry of symptoms) {
      if (EMERGENCY_SYMPTOMS.has(entry.symptomId)) {
        level = "emergency";
        break;
      }
      if (entry.severity === "severe" && URGENT_WHEN_SEVERE.has(entry.symptomId)) {
        level = escalate(level, "urgent");
      }
      if (entry.severity === "moderate") {
        level = escalate(level, "semi_urgent");
      }
      if (entry.duration === "more_than_1_week" && level === "self_care") {
        level = escalate(level, "non_urgent");
      }
    }
  }

  return { level, ...TRIAGE_METADATA[level] };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the higher urgency of two triage levels. */
function escalate(current: TriageLevel, candidate: TriageLevel): TriageLevel {
  const ORDER: TriageLevel[] = [
    "self_care",
    "non_urgent",
    "semi_urgent",
    "urgent",
    "emergency",
  ];
  return ORDER.indexOf(candidate) > ORDER.indexOf(current) ? candidate : current;
}

export function triageLevelColor(level: TriageLevel): string {
  return {
    emergency:   "text-red-600",
    urgent:      "text-orange-600",
    semi_urgent: "text-amber-600",
    non_urgent:  "text-green-600",
    self_care:   "text-blue-600",
  }[level];
}

export function triageLevelBg(level: TriageLevel): string {
  return {
    emergency:   "bg-red-50 border-red-200",
    urgent:      "bg-orange-50 border-orange-200",
    semi_urgent: "bg-amber-50 border-amber-200",
    non_urgent:  "bg-green-50 border-green-200",
    self_care:   "bg-blue-50 border-blue-200",
  }[level];
}

export function triageBadgeVariant(
  level: TriageLevel
): "emergency" | "urgent" | "semi_urgent" | "non_urgent" | "self_care" {
  return level;
}

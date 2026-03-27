// ─────────────────────────────────────────────
// Core domain types for the eHealth MVP
// ─────────────────────────────────────────────

// Auth
export interface AuthUser {
  id: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export type UserRole = "patient" | "clinician" | "admin";

// Patient
export interface Patient {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string; // ISO date string
  sex: BiologicalSex;
  phone: string;
  location: string | null;
  emergencyContact: EmergencyContact | null;
  createdAt: string;
  updatedAt: string;
}

export type BiologicalSex = "male" | "female" | "other" | "prefer_not_to_say";

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// Encounter
export interface Encounter {
  id: string;
  patientId: string;
  patient?: Patient;
  chiefComplaint: string;
  symptoms: SymptomEntry[];
  triageOutcome: TriageOutcome | null;
  intakeContext: IntakeContext | null;
  status: EncounterStatus;
  clinicianId: string | null;
  clinicianNotes: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EncounterStatus =
  | "in_progress"
  | "pending_review"
  | "reviewed"
  | "closed";

// Symptoms
export interface SymptomEntry {
  symptomId: string;
  label: string;
  severity: SymptomSeverity;
  duration: SymptomDuration;
  notes?: string;
}

export type SymptomSeverity = "mild" | "moderate" | "severe";
export type SymptomDuration =
  | "less_than_1_day"
  | "1_3_days"
  | "4_7_days"
  | "more_than_1_week";

export interface SymptomOption {
  id: string;
  label: string;
  category: SymptomCategory;
  redFlagKeywords?: string[];
}

export type SymptomCategory =
  | "head_neck"
  | "chest_respiratory"
  | "abdomen_digestive"
  | "musculoskeletal"
  | "skin"
  | "mental_emotional"
  | "general";

// Triage
export interface TriageOutcome {
  level: TriageLevel;
  /** Short display label, e.g. "Urgent" */
  label: string;
  /** Headline on the result screen, e.g. "Visit an urgent care clinic today" */
  recommendation: string;
  /** One-sentence plain-language rationale */
  rationale: string;
  /** When to seek care, e.g. "Within 2–4 hours" */
  seekCareWithin: string;
  /** Action key for the primary CTA on the result screen */
  nextAction: "home" | "pharmacy" | "nurse" | "doctor" | "clinic" | "emergency";
  /** Button label for the primary CTA */
  nextActionLabel: string;
}

export type TriageLevel =
  | "emergency"
  | "urgent"
  | "semi_urgent"
  | "non_urgent"
  | "self_care";

// Structured context captured during guided intake
export interface IntakeContext {
  /** Selected category ID (fever, headache, cough, stomach, injury, skin, other) */
  categoryId: string;
  /** Selected danger sign IDs */
  dangerSigns: string[];
  /** Whether the patient is taking medication */
  takesMedication: boolean;
  /** Free-text medication description (if takesMedication is true) */
  medication: string | null;
  /** Selected condition IDs */
  conditions: string[];
}

// Clinician
export interface Clinician {
  id: string;
  userId: string;
  fullName: string;
  specialty: string | null;
  createdAt: string;
}

// Admin
export interface Admin {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  createdAt: string;
}

// Session context (used in layouts and server components)
export interface SessionContext {
  userId: string;
  role: UserRole;
  /** Resolved display name from the correct domain table */
  displayName: string | null;
}

// Queue item (encounter enriched for clinician view)
export interface QueueItem {
  encounterId: string;
  patientName: string;
  patientId: string;
  chiefComplaint: string;
  triageLevel: TriageLevel;
  createdAt: string;
  status: EncounterStatus;
}

// Shared API response wrapper
export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

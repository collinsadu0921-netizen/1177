import type { SymptomOption } from "@/lib/types";

/**
 * Curated symptom catalogue for MVP intake flow.
 * Organised by body system category.
 */
export const SYMPTOMS: SymptomOption[] = [
  // Head & Neck
  { id: "headache", label: "Headache", category: "head_neck" },
  { id: "dizziness", label: "Dizziness or vertigo", category: "head_neck" },
  { id: "neck_stiffness", label: "Stiff neck", category: "head_neck", redFlagKeywords: ["meningitis"] },
  { id: "sore_throat", label: "Sore throat", category: "head_neck" },
  { id: "earache", label: "Ear pain", category: "head_neck" },
  { id: "vision_changes", label: "Vision changes", category: "head_neck" },

  // Chest & Respiratory
  { id: "chest_pain", label: "Chest pain or tightness", category: "chest_respiratory", redFlagKeywords: ["cardiac"] },
  { id: "shortness_of_breath", label: "Shortness of breath", category: "chest_respiratory", redFlagKeywords: ["cardiac", "pulmonary"] },
  { id: "cough", label: "Cough", category: "chest_respiratory" },
  { id: "wheezing", label: "Wheezing", category: "chest_respiratory" },
  { id: "palpitations", label: "Heart palpitations", category: "chest_respiratory", redFlagKeywords: ["arrhythmia"] },

  // Abdomen & Digestive
  { id: "abdominal_pain", label: "Abdominal pain", category: "abdomen_digestive" },
  { id: "nausea", label: "Nausea", category: "abdomen_digestive" },
  { id: "vomiting", label: "Vomiting", category: "abdomen_digestive" },
  { id: "diarrhea", label: "Diarrhea", category: "abdomen_digestive" },
  { id: "constipation", label: "Constipation", category: "abdomen_digestive" },
  { id: "blood_in_stool", label: "Blood in stool", category: "abdomen_digestive", redFlagKeywords: ["GI bleed"] },

  // Musculoskeletal
  { id: "back_pain", label: "Back pain", category: "musculoskeletal" },
  { id: "joint_pain", label: "Joint pain or swelling", category: "musculoskeletal" },
  { id: "muscle_weakness", label: "Muscle weakness", category: "musculoskeletal" },
  { id: "limb_pain", label: "Arm or leg pain", category: "musculoskeletal" },

  // Skin
  { id: "rash", label: "Rash or skin irritation", category: "skin" },
  { id: "itching", label: "Itching", category: "skin" },
  { id: "swelling", label: "Swelling or oedema", category: "skin" },

  // Mental & Emotional
  { id: "anxiety", label: "Anxiety or panic", category: "mental_emotional" },
  { id: "low_mood", label: "Low mood or depression", category: "mental_emotional" },
  { id: "sleep_problems", label: "Sleep difficulties", category: "mental_emotional" },
  { id: "confusion", label: "Confusion or memory issues", category: "mental_emotional", redFlagKeywords: ["delirium"] },

  // General
  { id: "fever", label: "Fever or chills", category: "general" },
  { id: "fatigue", label: "Fatigue or low energy", category: "general" },
  { id: "weight_loss", label: "Unexplained weight loss", category: "general" },
  { id: "loss_of_appetite", label: "Loss of appetite", category: "general" },
  { id: "night_sweats", label: "Night sweats", category: "general" },
];

export const SYMPTOM_CATEGORIES: { id: string; label: string }[] = [
  { id: "general", label: "General" },
  { id: "head_neck", label: "Head & Neck" },
  { id: "chest_respiratory", label: "Chest & Breathing" },
  { id: "abdomen_digestive", label: "Stomach & Digestion" },
  { id: "musculoskeletal", label: "Muscles & Joints" },
  { id: "skin", label: "Skin" },
  { id: "mental_emotional", label: "Mental & Emotional" },
];

export function getSymptomById(id: string): SymptomOption | undefined {
  return SYMPTOMS.find((s) => s.id === id);
}

export function getSymptomsByCategory(category: string): SymptomOption[] {
  return SYMPTOMS.filter((s) => s.category === category);
}

/**
 * Category-level config for the guided symptom intake wizard.
 *
 * Each category maps to:
 *   - A canonical set of symptom IDs (from symptoms/data.ts)
 *   - A set of danger signs specific to that category
 *
 * Danger signs feed directly into triage escalation — any selection
 * of an "emergency" sign escalates to emergency; "urgent" signs
 * escalate to at least urgent.
 */

export interface DangerSign {
  id: string;
  label: string;
  escalation: "emergency" | "urgent";
}

export interface CategoryConfig {
  id: string;
  label: string;
  emoji: string;
  description: string;
  /** Symptom IDs from domains/symptoms/data.ts shown in this category */
  symptomIds: string[];
  dangerSigns: DangerSign[];
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: "fever",
    label: "Fever or chills",
    emoji: "🌡️",
    description: "High temperature, sweats, or feeling feverish",
    symptomIds: ["fever", "fatigue", "headache", "sore_throat", "night_sweats"],
    dangerSigns: [
      { id: "ds_fever_high",      label: "Temperature above 39 °C / 102 °F", escalation: "urgent" },
      { id: "ds_fever_rash",      label: "Fever with a skin rash",            escalation: "urgent" },
      { id: "ds_fever_neck",      label: "Stiff neck or light sensitivity",   escalation: "emergency" },
      { id: "ds_fever_confused",  label: "Confusion or disorientation",       escalation: "emergency" },
      { id: "ds_fever_breath",    label: "Difficulty breathing",              escalation: "emergency" },
    ],
  },
  {
    id: "headache",
    label: "Headache or dizziness",
    emoji: "🤕",
    description: "Head pain, vertigo, or balance problems",
    symptomIds: ["headache", "dizziness", "vision_changes", "neck_stiffness"],
    dangerSigns: [
      { id: "ds_head_worst",      label: "Sudden worst headache of your life", escalation: "emergency" },
      { id: "ds_head_vision",     label: "Sudden vision loss or double vision", escalation: "emergency" },
      { id: "ds_head_weakness",   label: "Weakness or numbness on one side",   escalation: "emergency" },
      { id: "ds_head_neck",       label: "Stiff neck with fever",              escalation: "emergency" },
      { id: "ds_head_vomit",      label: "Severe vomiting with headache",      escalation: "urgent" },
    ],
  },
  {
    id: "cough",
    label: "Cough or breathing",
    emoji: "😮‍💨",
    description: "Cough, chest tightness, or shortness of breath",
    symptomIds: ["cough", "shortness_of_breath", "wheezing", "chest_pain"],
    dangerSigns: [
      { id: "ds_cough_blood",     label: "Coughing up blood",                 escalation: "emergency" },
      { id: "ds_cough_sentence",  label: "Unable to complete a sentence",      escalation: "emergency" },
      { id: "ds_cough_blue",      label: "Lips or face turning blue or grey",  escalation: "emergency" },
      { id: "ds_cough_chest",     label: "Severe chest pain",                 escalation: "emergency" },
      { id: "ds_cough_worse",     label: "Symptoms worsening rapidly",         escalation: "urgent" },
    ],
  },
  {
    id: "stomach",
    label: "Stomach or gut pain",
    emoji: "🫃",
    description: "Abdominal pain, nausea, or digestive symptoms",
    symptomIds: ["abdominal_pain", "nausea", "vomiting", "diarrhea", "constipation", "blood_in_stool"],
    dangerSigns: [
      { id: "ds_gut_blood",       label: "Blood in stool or vomit",           escalation: "emergency" },
      { id: "ds_gut_severe",      label: "Sudden severe abdominal pain (8/10+)", escalation: "emergency" },
      { id: "ds_gut_rigid",       label: "Abdomen feels rigid or board-like",  escalation: "emergency" },
      { id: "ds_gut_fluids",      label: "Cannot keep any fluids down",        escalation: "urgent" },
      { id: "ds_gut_dehydrated",  label: "Signs of dehydration (dizzy, dry mouth)", escalation: "urgent" },
    ],
  },
  {
    id: "injury",
    label: "Injury or pain",
    emoji: "🦴",
    description: "Trauma, sprains, fractures, or persistent pain",
    symptomIds: ["back_pain", "joint_pain", "limb_pain", "muscle_weakness"],
    dangerSigns: [
      { id: "ds_injury_noweight", label: "Unable to bear weight on the limb", escalation: "urgent" },
      { id: "ds_injury_deform",   label: "Visible deformity or bone exposed",  escalation: "emergency" },
      { id: "ds_injury_numb",     label: "Numbness or tingling below injury",   escalation: "urgent" },
      { id: "ds_injury_bladder",  label: "Loss of bladder or bowel control",   escalation: "emergency" },
      { id: "ds_injury_head",     label: "Head injury with confusion or vomit", escalation: "emergency" },
    ],
  },
  {
    id: "skin",
    label: "Skin issue",
    emoji: "🩹",
    description: "Rash, itching, swelling, or skin changes",
    symptomIds: ["rash", "itching", "swelling"],
    dangerSigns: [
      { id: "ds_skin_spreading",  label: "Rash spreading rapidly or blistering", escalation: "urgent" },
      { id: "ds_skin_breath",     label: "Rash with difficulty breathing",      escalation: "emergency" },
      { id: "ds_skin_throat",     label: "Throat swelling or difficulty swallowing", escalation: "emergency" },
      { id: "ds_skin_fever",      label: "Skin rash with high fever",           escalation: "urgent" },
    ],
  },
  {
    id: "other",
    label: "Something else",
    emoji: "❓",
    description: "General symptoms or anything not listed above",
    symptomIds: ["fatigue", "weight_loss", "loss_of_appetite", "anxiety", "low_mood", "sleep_problems", "confusion"],
    dangerSigns: [
      { id: "ds_other_confused",  label: "Sudden confusion or disorientation", escalation: "emergency" },
      { id: "ds_other_chest",     label: "Chest pain or tightness",            escalation: "emergency" },
      { id: "ds_other_breath",    label: "Difficulty breathing",               escalation: "emergency" },
      { id: "ds_other_severe",    label: "Symptom is sudden and severe",        escalation: "urgent" },
    ],
  },
];

export const CONDITIONS = [
  { id: "diabetes",       label: "Diabetes" },
  { id: "hypertension",   label: "Hypertension" },
  { id: "asthma",         label: "Asthma" },
  { id: "heart_disease",  label: "Heart disease" },
  { id: "kidney_disease", label: "Kidney disease" },
  { id: "none",           label: "None of these" },
] as const;

export type ConditionId = typeof CONDITIONS[number]["id"];

export function getCategoryById(id: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

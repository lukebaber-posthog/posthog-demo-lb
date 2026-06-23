// The 5-step Sprout plant-care survey. Step 4 is an open text field on purpose:
// it's the friction point where the demo funnel shows a drop-off.
// Step numbers and types are kept stable (choice, rating, choice, text, choice)
// so the seed script and the saved PostHog funnel insight keep working.
export type SurveyQuestionType = "choice" | "rating" | "text";

export type SurveyQuestion = {
  id: string;
  step: number; // 1-indexed
  type: SurveyQuestionType;
  prompt: string;
  options?: string[]; // for "choice"
};

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: "source",
    step: 1,
    type: "choice",
    prompt: "How did you first hear about Sprout?",
    options: ["Search engine", "Social media", "A friend or fellow plant parent", "A local plant nursery"],
  },
  {
    // Keep id "recommend" — the survey flow reads it for the recommend_score property.
    id: "recommend",
    step: 2,
    type: "rating",
    prompt: "How likely are you to recommend Sprout to a fellow plant parent? (1–5)",
  },
  {
    id: "top_feature",
    step: 3,
    type: "choice",
    prompt: "Which feature keeps your plants happiest?",
    options: ["Watering reminders", "Plant identification", "Care guides", "The community board"],
  },
  {
    id: "plant_problem",
    step: 4,
    type: "text",
    prompt: "In your own words, what's the one plant problem you wish Sprout could solve?",
  },
  {
    id: "plant_count",
    step: 5,
    type: "choice",
    prompt: "How many plants are you caring for right now?",
    options: ["Just my first 🌱", "2–5", "6–15", "A whole jungle (15+)"],
  },
];

export const SURVEY_TOTAL_STEPS = SURVEY_QUESTIONS.length;

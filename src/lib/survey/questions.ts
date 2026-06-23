// The Sprout plant-care survey: 2 quick questions + 1 long-form story, then a
// completion page. Step 3 (the long-form text) is the intended friction point
// where the demo funnel shows its drop-off.
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
    id: "top_feature",
    step: 1,
    type: "choice",
    prompt: "Which feature keeps your plants happiest?",
    options: ["Watering reminders", "Plant identification", "Care guides", "The community board"],
  },
  {
    // Keep id "recommend" — the survey flow reads it for the recommend_score property.
    id: "recommend",
    step: 2,
    type: "rating",
    prompt: "How likely are you to recommend Sprout to a fellow plant parent? (1–5)",
  },
  {
    id: "plant_story",
    step: 3,
    type: "text",
    prompt: "Tell us your plant story — your proudest win, your trickiest plant, and what you wish were easier.",
  },
];

export const SURVEY_TOTAL_STEPS = SURVEY_QUESTIONS.length;

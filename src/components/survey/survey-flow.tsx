"use client";

import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EVENTS, track } from "@/lib/analytics/events";
import { saveSurveyStep } from "@/lib/survey/actions";
import {
  SURVEY_QUESTIONS,
  SURVEY_TOTAL_STEPS,
  type SurveyQuestion,
} from "@/lib/survey/questions";

type Phase = "intro" | "in_progress" | "complete";

// Selected-state styling for choice/rating buttons.
const selectedClasses =
  "border-[#00E599] ring-1 ring-[#00E599] text-green-600";
const unselectedClasses =
  "border-[#E4E5E7] dark:border-[#303236]";

export function SurveyFlow() {
  const [phase, setPhase] = useState<Phase>("intro");
  // 1-indexed current step; only meaningful while in_progress.
  const [step, setStep] = useState(1);
  // Map of question id -> answer (string for choice/text, number for rating).
  const [answers, setAnswers] = useState<Record<string, string | number>>({});

  // Keep the latest state readable inside the unmount cleanup.
  const stateRef = useRef({ phase, step });
  stateRef.current = { phase, step };

  // Stable id for this survey session, used to upsert partial responses.
  const responseIdRef = useRef<string>("");

  // Best-effort abandonment tracking: if the survey was started but never
  // completed, report the last fully completed step on unmount.
  useEffect(() => {
    return () => {
      const { phase: p, step: s } = stateRef.current;
      if (p === "in_progress") {
        track(EVENTS.SURVEY_ABANDONED, { last_completed_step: s - 1 });
      }
    };
  }, []);

  const question = SURVEY_QUESTIONS.find((q) => q.step === step);

  const handleStart = () => {
    responseIdRef.current = crypto.randomUUID();
    track(EVENTS.SURVEY_STARTED);
    setPhase("in_progress");
    setStep(1);
  };

  const setAnswer = (id: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const isAnswered = (q: SurveyQuestion): boolean => {
    const value = answers[q.id];
    if (q.type === "text") {
      return typeof value === "string" && value.trim().length > 0;
    }
    return value !== undefined;
  };

  const handleNext = async () => {
    if (!question || !isAnswered(question)) return;
    track(EVENTS.SURVEY_STEP_COMPLETED, {
      step: question.step,
      question_id: question.id,
    });
    await saveSurveyStep({
      responseId: responseIdRef.current,
      step: question.step,
      value: String(answers[question.id] ?? ""),
      distinctId: posthog.get_distinct_id(),
    }).catch(() => {});
    setStep((s) => s + 1);
  };

  const handleFinish = async () => {
    if (!question || !isAnswered(question)) return;
    track(EVENTS.SURVEY_STEP_COMPLETED, {
      step: question.step,
      question_id: question.id,
    });
    const recommendRaw = answers["recommend"];
    const recommend_score =
      typeof recommendRaw === "number" ? recommendRaw : undefined;
    track(EVENTS.SURVEY_COMPLETED, { recommend_score });
    await saveSurveyStep({
      responseId: responseIdRef.current,
      step: question.step,
      value: String(answers[question.id] ?? ""),
      distinctId: posthog.get_distinct_id(),
      completed: true,
    }).catch(() => {});
    setPhase("complete");
  };

  if (phase === "intro") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3.5">
          <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-4xl">
            Help us help your plants thrive 🌱
          </h1>
          <p className="text-base leading-snug tracking-tight text-[#61646B] md:text-lg dark:text-[#94979E]">
            Two quick questions and a little about your plant story. It takes
            under a minute and helps us grow the right features.
          </p>
        </div>
        <div>
          <Button data-testid="survey-start" onClick={handleStart}>
            Start survey
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div
        data-testid="survey-complete"
        className="rounded-xl border border-[#E4E5E7] p-5 dark:border-[#303236]"
      >
        <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-4xl">
          Thanks, plant parent! 🌱
        </h1>
        <p className="mt-3.5 text-base leading-snug tracking-tight text-[#61646B] md:text-lg dark:text-[#94979E]">
          Your feedback helps us keep more houseplants happy and thriving. We
          appreciate you taking the time.
        </p>
      </div>
    );
  }

  // in_progress
  if (!question) return null;

  const answered = isAnswered(question);
  const isLastStep = step === SURVEY_TOTAL_STEPS;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-green-600">
          Step {step} of {SURVEY_TOTAL_STEPS}
        </p>
        <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-4xl">
          {question.prompt}
        </h1>
      </div>

      {question.type === "choice" && (
        <div className="flex flex-col gap-3">
          {question.options?.map((option) => {
            const isSelected = answers[question.id] === option;
            return (
              <Button
                key={option}
                data-testid="survey-option"
                variant="outline"
                className={`h-auto justify-start whitespace-normal px-4 py-3 text-sm ${
                  isSelected ? selectedClasses : unselectedClasses
                }`}
                aria-pressed={isSelected}
                onClick={() => setAnswer(question.id, option)}
              >
                {option}
              </Button>
            );
          })}
        </div>
      )}

      {question.type === "rating" && (
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((rating) => {
            const isSelected = answers[question.id] === rating;
            return (
              <Button
                key={rating}
                data-testid="survey-rating"
                variant="outline"
                className={`size-12 text-base ${
                  isSelected ? selectedClasses : unselectedClasses
                }`}
                aria-pressed={isSelected}
                onClick={() => setAnswer(question.id, rating)}
              >
                {rating}
              </Button>
            );
          })}
        </div>
      )}

      {question.type === "text" && (
        <Textarea
          data-testid="survey-text"
          rows={6}
          required
          placeholder="Share as much as you'd like — the more detail, the better..."
          value={(answers[question.id] as string) ?? ""}
          onChange={(e) => setAnswer(question.id, e.target.value)}
        />
      )}

      <div>
        {isLastStep ? (
          <Button
            data-testid="survey-finish"
            disabled={!answered}
            onClick={handleFinish}
          >
            Finish
          </Button>
        ) : (
          <Button
            data-testid="survey-next"
            disabled={!answered}
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

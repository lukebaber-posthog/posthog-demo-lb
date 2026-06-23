"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import posthog from "posthog-js";
import { createNote } from "@/lib/notes/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Saving..." : "Save note"}
    </Button>
  );
}

export function NoteForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        const content = String(formData.get("content") ?? "").trim();
        posthog.capture("note_created", { content_length: content.length });
        await createNote(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-2"
    >
      <Textarea
        name="content"
        placeholder="Jot down a private note about your plants — watering, light, repotting..."
        maxLength={2000}
        required
      />
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

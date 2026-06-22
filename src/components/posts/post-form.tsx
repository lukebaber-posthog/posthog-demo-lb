"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import posthog from "posthog-js";
import { createPost } from "@/lib/posts/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Posting..." : "Post"}
    </Button>
  );
}

export function PostForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        const content = String(formData.get("content") ?? "").trim();
        posthog.capture("post_submitted", { content_length: content.length });
        await createPost(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-2"
    >
      <Textarea
        name="content"
        placeholder="Say something anonymously..."
        maxLength={1000}
        required
      />
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}

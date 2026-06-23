"use client";

import { useTransition } from "react";
import posthog from "posthog-js";
import { LuArrowBigUp, LuArrowBigDown } from "react-icons/lu";
import { upvotePost, downvotePost } from "@/lib/posts/actions";

export function VoteButtons({
  postId,
  upvotes,
  downvotes,
}: {
  postId: number;
  upvotes: number;
  downvotes: number;
}) {
  const [isPending, startTransition] = useTransition();
  const score = upvotes - downvotes;

  const vote = (direction: "up" | "down") => {
    posthog.capture("post_voted", { post_id: postId, direction });
    startTransition(async () => {
      if (direction === "up") await upvotePost(postId);
      else await downvotePost(postId);
    });
  };

  return (
    <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
      <button
        type="button"
        data-testid="post-upvote"
        aria-label="Upvote"
        disabled={isPending}
        onClick={() => vote("up")}
        className="rounded p-0.5 transition-colors hover:text-green-600 disabled:opacity-50"
      >
        <LuArrowBigUp className="size-5" />
      </button>
      <span className="text-sm font-semibold tabular-nums text-foreground">{score}</span>
      <button
        type="button"
        data-testid="post-downvote"
        aria-label="Downvote"
        disabled={isPending}
        onClick={() => vote("down")}
        className="rounded p-0.5 transition-colors hover:text-red-500 disabled:opacity-50"
      >
        <LuArrowBigDown className="size-5" />
      </button>
    </div>
  );
}

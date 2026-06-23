import type { Post } from "@/lib/db/schema";
import { VoteButtons } from "./vote-buttons";

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No posts yet. Be the first to share something with the plant community. 🌱
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {posts.map((post) => (
        <li key={post.id} className="flex gap-3 border border-border bg-background p-4">
          <VoteButtons postId={post.id} upvotes={post.upvotes} downvotes={post.downvotes} />
          <div className="min-w-0 flex-1">
            <p className="text-sm whitespace-pre-wrap break-words">{post.content}</p>
            <time
              className="mt-2 block text-xs text-muted-foreground"
              dateTime={post.createdAt.toISOString()}
            >
              {formatTimestamp(post.createdAt)}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}

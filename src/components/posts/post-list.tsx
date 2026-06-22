import type { Post } from "@/lib/db/schema";

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
        No posts yet. Be the first to say something.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {posts.map((post) => (
        <li
          key={post.id}
          className="rounded-md border border-border bg-background p-4"
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {post.content}
          </p>
          <time
            className="mt-2 block text-xs text-muted-foreground"
            dateTime={post.createdAt.toISOString()}
          >
            {formatTimestamp(post.createdAt)}
          </time>
        </li>
      ))}
    </ul>
  );
}

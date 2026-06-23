import Link from "next/link";
import { NavBar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { PostForm } from "@/components/posts/post-form";
import { PostList } from "@/components/posts/post-list";
import { getPosts } from "@/lib/posts/actions";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const { posts, total, totalPages } = await getPosts(pageNum);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 md:max-w-lg md:px-0 lg:max-w-xl">
        <NavBar />
        <main className="flex flex-1 flex-col gap-8 py-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-4xl md:leading-none">
              Plant Board 🌱
            </h1>
            <p className="text-sm text-muted-foreground">
              Share your plant wins, ask for help, and swap care tips. Top-voted posts rise to the top.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/pricing" data-testid="home-cta-pricing">
                See plans
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/survey" data-testid="home-cta-survey">
                Take the 1-minute plant survey
              </Link>
            </Button>
          </div>
          <PostForm />
          <PostList posts={posts} />
          {totalPages > 1 && (
            <nav className="flex items-center justify-between gap-2 text-sm" aria-label="Pagination">
              {pageNum > 1 ? (
                <Button variant="outline" asChild>
                  <Link
                    href={pageNum - 1 === 1 ? "/" : `/?page=${pageNum - 1}`}
                    data-testid="posts-prev"
                  >
                    ← Prev
                  </Link>
                </Button>
              ) : (
                <span className="w-16" />
              )}
              <span className="text-muted-foreground">
                Page {pageNum} of {totalPages} · {total} posts
              </span>
              {pageNum < totalPages ? (
                <Button variant="outline" asChild>
                  <Link href={`/?page=${pageNum + 1}`} data-testid="posts-next">
                    Next →
                  </Link>
                </Button>
              ) : (
                <span className="w-16" />
              )}
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}

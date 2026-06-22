import { NavBar } from "@/components/navbar";
import { PostForm } from "@/components/posts/post-form";
import { PostList } from "@/components/posts/post-list";
import { getPosts } from "@/lib/posts/actions";

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 md:max-w-lg md:px-0 lg:max-w-xl">
        <NavBar />
        <main className="flex flex-1 flex-col gap-8 py-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-4xl md:leading-none">
              Message Board
            </h1>
            <p className="text-sm text-muted-foreground">
              Post anonymously. Everyone sees everything.
            </p>
          </div>
          <PostForm />
          <PostList posts={posts} />
        </main>
      </div>
    </div>
  );
}

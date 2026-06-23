import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { SiteShell } from "@/components/site-shell";
import { NoteForm } from "@/components/notes/note-form";
import { NoteList } from "@/components/notes/note-list";
import { getNotes } from "@/lib/notes/actions";

// Reads the session cookie, so it must render dynamically.
export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/sign-in");

  const notes = await getNotes();

  return (
    <SiteShell>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-4xl md:leading-none">
          Your plant notes
        </h1>
        <p className="text-sm text-muted-foreground">
          Private to {session.user.name ?? session.user.email} — only you can see these.
        </p>
      </div>
      <NoteForm />
      <NoteList notes={notes} />
    </SiteShell>
  );
}

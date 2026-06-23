import type { Note } from "@/lib/db/schema";

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function NoteList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No notes yet. Your private plant journal starts here. 🌱
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {notes.map((note) => (
        <li key={note.id} className="border border-border bg-background p-4">
          <p className="text-sm whitespace-pre-wrap break-words">{note.content}</p>
          <time
            className="mt-2 block text-xs text-muted-foreground"
            dateTime={note.createdAt.toISOString()}
          >
            {formatTimestamp(note.createdAt)}
          </time>
        </li>
      ))}
    </ul>
  );
}

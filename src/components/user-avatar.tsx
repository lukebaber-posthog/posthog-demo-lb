import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// First initial of the name, falling back to the email, then "?".
function initialOf(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "";
  return source.charAt(0).toUpperCase() || "?";
}

/**
 * Small circular avatar showing the user's initial, with their full name shown
 * on hover/focus via a tooltip.
 */
export function UserAvatar({
  name,
  email,
  className,
}: {
  name?: string | null;
  email?: string | null;
  className?: string;
}) {
  const label = name?.trim() || email?.trim() || "Account";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          data-testid="user-avatar"
          aria-label={label}
          className={cn(
            "inline-flex size-8 shrink-0 cursor-default items-center justify-center rounded-full bg-green-600 text-xs font-semibold text-white select-none",
            className
          )}
        >
          {initialOf(name, email)}
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

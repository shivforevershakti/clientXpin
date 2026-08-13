import { MoreVertical } from "lucide-react";

/** Title row with a live-status dot and overflow menu affordance, shared by grid panels. */
export function PanelHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
        <span className="sr-only">Live</span>
        <button type="button" aria-label={`More options for ${title}`} className="text-foreground-muted hover:text-foreground">
          <MoreVertical className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

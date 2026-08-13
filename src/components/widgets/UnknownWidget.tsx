import { HelpCircle } from "lucide-react";
import { WidgetSchema } from "../../types";

/** Graceful fallback rendered for unrecognized widget schema types instead of crashing the grid. */
export function UnknownWidget({ widget }: { widget: WidgetSchema }) {
  return (
    <div role="status" className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface-sunken p-6 text-center">
      <HelpCircle className="h-6 w-6 text-foreground-muted" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">Unsupported widget type</p>
      <p className="text-xs text-foreground-muted">
        “{widget.type}” has no registered renderer for “{widget.title}”.
      </p>
    </div>
  );
}

import { useRef } from "react";
import { Clock, MessageSquare, MoreVertical, X } from "lucide-react";
import clsx from "clsx";
import { useDashboardStore } from "../../store/dashboardStore";
import { useDrawerA11y } from "../../hooks/useDrawerA11y";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
}

export function InvestigationHistoryPanel({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const history = useDashboardStore((s) => s.history);
  const generate = useDashboardStore((s) => s.generate);
  const isStreaming = useDashboardStore((s) => s.isStreaming);
  const panelRef = useRef<HTMLElement>(null);

  useDrawerA11y(open, onClose, panelRef);

  const runFromHistory = (prompt: string) => {
    generate(prompt);
    onClose?.();
  };

  return (
    <>
      {open && (
        <div onClick={onClose} className="fixed inset-0 z-30 bg-black/50 lg:hidden" aria-hidden="true" />
      )}
      <aside
        ref={panelRef}
        id="investigation-history"
        role="dialog"
        aria-modal={open}
        aria-label="Investigation history"
        tabIndex={-1}
        className={clsx(
          "fixed inset-y-0 right-0 z-40 flex w-72 shrink-0 flex-col border-l border-border bg-surface-sunken transition-transform duration-200 lg:static lg:flex lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-foreground-muted" />
            <h2 className="text-sm font-semibold text-foreground">Investigation History</h2>
          </div>
          <button onClick={onClose} aria-label="Close history" className="text-foreground-muted hover:text-foreground lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {history.length === 0 && <p className="px-1.5 py-2 text-xs text-foreground-muted">No queries yet.</p>}
          <ul className="flex flex-col gap-3">
            {history.map((entry, i) => (
              <li key={entry.id} className="group flex items-start gap-2">
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground-muted" aria-hidden="true" />
                <button
                  disabled={isStreaming}
                  onClick={() => runFromHistory(entry.prompt)}
                  aria-label={`Re-run investigation: ${entry.prompt}`}
                  className="min-w-0 flex-1 text-left disabled:opacity-60"
                >
                  <p
                    className={clsx(
                      "line-clamp-2 text-xs transition-colors group-hover:text-foreground",
                      i === 0 ? "font-medium text-foreground" : "text-foreground-muted"
                    )}
                  >
                    {entry.prompt}
                  </p>
                  <p className="mt-1 text-[10px] text-foreground-muted">{timeAgo(entry.timestamp)}</p>
                </button>
                <button type="button" aria-label="More options" className="mt-0.5 shrink-0 text-foreground-muted opacity-0 transition-opacity group-hover:opacity-100">
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}

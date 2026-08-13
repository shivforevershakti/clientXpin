import { ChevronRight, Globe, History, Menu, MoreHorizontal, Share2 } from "lucide-react";
import { CompactThemeToggle } from "../ThemeToggle";

export function TopBar({
  activeLabel,
  onMenuClick,
  onHistoryClick,
  navOpen,
  historyOpen,
}: {
  activeLabel: string;
  onMenuClick?: () => void;
  onHistoryClick?: () => void;
  navOpen?: boolean;
  historyOpen?: boolean;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-1.5 text-xs text-foreground-muted">
        <button
          onClick={onMenuClick}
          aria-label="Toggle navigation"
          aria-expanded={navOpen}
          aria-controls="main-navigation"
          className="mr-1 rounded-lg border border-border p-1.5 text-foreground-muted hover:text-foreground md:hidden"
        >
          <Menu className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <span className="hidden shrink-0 sm:inline">Investigation</span>
        <ChevronRight className="hidden h-3 w-3 shrink-0 sm:block" aria-hidden="true" />
        <span className="truncate font-medium text-foreground">{activeLabel}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-full border border-border py-1.5 pl-3 pr-3 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          <span className="text-xs font-medium text-foreground">neonDB</span>
          <ChevronRight className="h-3 w-3 rotate-90 text-foreground-muted" aria-hidden="true" />
        </div>
        <button className="hidden items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs text-foreground-muted hover:text-foreground sm:flex">
          <Globe className="h-3.5 w-3.5" aria-hidden="true" /> EN
        </button>
        <CompactThemeToggle />
        <button
          onClick={onHistoryClick}
          aria-label="Toggle investigation history"
          aria-expanded={historyOpen}
          aria-controls="investigation-history"
          className="rounded-lg border border-border p-1.5 text-foreground-muted hover:text-foreground lg:hidden"
        >
          <History className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button aria-label="Share investigation" className="hidden rounded-lg border border-border p-1.5 text-foreground-muted hover:text-foreground sm:block">
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button aria-label="More options" className="hidden rounded-lg border border-border p-1.5 text-foreground-muted hover:text-foreground sm:block">
          <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

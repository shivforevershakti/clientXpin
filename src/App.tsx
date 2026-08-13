import { useEffect, useState } from "react";
import { useDashboardStore } from "./store/dashboardStore";
import { useThemeStore } from "./store/themeStore";
import { GridLayout } from "./components/layout/GridLayout";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { InvestigationHistoryPanel } from "./components/layout/InvestigationHistoryPanel";
import { ChatInputBar } from "./components/layout/ChatInputBar";
import { HeadlineSummary } from "./components/HeadlineSummary";
import { ToastViewport } from "./components/Toast";
import { WidgetSchema } from "./types";

export default function App() {
  const { theme } = useThemeStore();
  const { widgets, expectedWidgetCount, isStreaming, error, summary, activeLabel, generate, reorderWidgets } = useDashboardStore();
  const [navOpen, setNavOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    generate("Show me high-risk accounts and critical exposure review", "High Risk Accounts Review");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReorder = (next: WidgetSchema[]) => {
    reorderWidgets(next);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          activeLabel={activeLabel}
          onMenuClick={() => setNavOpen((v) => !v)}
          onHistoryClick={() => setHistoryOpen((v) => !v)}
          navOpen={navOpen}
          historyOpen={historyOpen}
        />

        <div className="relative flex-1 overflow-hidden">
          <main id="main-content" tabIndex={-1} className="h-full overflow-y-auto px-4 pb-28 pt-4 sm:px-6 sm:pt-6">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:gap-6">
              <HeadlineSummary summary={summary} />

              {error && (
                <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
              )}

              <GridLayout widgets={widgets} expectedCount={expectedWidgetCount} isStreaming={isStreaming} onReorder={handleReorder} />

              {!isStreaming && widgets.length === 0 && !error && (
                <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-foreground-muted">
                  Enter a prompt below to generate your dashboard.
                </div>
              )}
            </div>
          </main>

          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4 sm:px-6">
            <div className="pointer-events-auto w-full max-w-2xl">
              <ChatInputBar onSubmit={generate} isStreaming={isStreaming} />
            </div>
          </div>
        </div>
      </div>

      <InvestigationHistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />

      <ToastViewport />
    </div>
  );
}

import { useRef, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  Cog,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Search,
  Settings,
  ShieldAlert,
} from "lucide-react";
import clsx from "clsx";
import { useDashboardStore } from "../../store/dashboardStore";
import { useDrawerA11y } from "../../hooks/useDrawerA11y";

const INVESTIGATIONS = [
  { label: "How many active customers…", prompt: "How many active customers do we have right now?" },
  { label: "High Risk Accounts Review", prompt: "Show me high-risk accounts and critical exposure review" },
  { label: "Customer Risk Distribution", prompt: "Show customer risk distribution across regions" },
  { label: "Top Customers Analysis", prompt: "Analyze our top customers by exposure" },
  { label: "Fraud Risk Monitoring", prompt: "Monitor fraud risk and flagged accounts today" },
  { label: "Geographic Risk Exposure", prompt: "Show geographic risk exposure by region" },
];

const NAV_ITEMS = [
  { label: "Chat with Data", icon: MessageSquare },
  { label: "Dashboards", icon: LayoutDashboard },
  { label: "Saved Reports", icon: FileText },
  { label: "Admin Console", icon: Cog },
  { label: "Settings", icon: Settings },
];

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const generate = useDashboardStore((s) => s.generate);
  const isStreaming = useDashboardStore((s) => s.isStreaming);
  const [active, setActive] = useState("High Risk Accounts Review");
  const panelRef = useRef<HTMLElement>(null);

  useDrawerA11y(open, onClose, panelRef);

  const runInvestigation = (label: string, prompt: string) => {
    if (isStreaming) return;
    setActive(label);
    generate(prompt, label);
    onClose?.();
  };

  return (
    <>
      {open && (
        <div onClick={onClose} className="fixed inset-0 z-30 bg-black/50 md:hidden" aria-hidden="true" />
      )}
      <aside
        ref={panelRef}
        id="main-navigation"
        role="dialog"
        aria-modal={open}
        aria-label="Main navigation"
        tabIndex={-1}
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-border bg-surface-sunken transition-transform duration-200 md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
          Z
        </div>
        <span className="text-sm font-semibold text-foreground">BI Portal</span>
      </div>

      <div className="flex flex-col gap-3 px-3 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 text-foreground-muted" aria-hidden="true" />
          <input
            placeholder="Search"
            aria-label="Search investigations"
            className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-foreground-muted"
          />
        </div>

        <button
          onClick={() => runInvestigation("New Investigation", "Show me a fresh account risk overview")}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground transition-transform active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" />
          New Investigation
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <p className="flex items-center gap-1.5 px-1.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
          <ShieldAlert className="h-3.5 w-3.5" /> Investigations
        </p>
        <ul className="flex flex-col gap-0.5">
          {INVESTIGATIONS.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => runInvestigation(item.label, item.prompt)}
                aria-current={active === item.label ? "page" : undefined}
                className={clsx(
                  "w-full truncate rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                  active === item.label
                    ? "bg-accent/15 font-medium text-accent"
                    : "text-foreground-muted hover:bg-surface hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
          <li>
            <button className="flex w-full items-center gap-1 rounded-lg px-2.5 py-2 text-left text-xs text-foreground-muted hover:text-foreground">
              View All <ChevronDown className="h-3 w-3" />
            </button>
          </li>
        </ul>

        <div className="my-2 border-t border-border" />

        <ul className="flex flex-col gap-0.5 pb-2">
          {NAV_ITEMS.map(({ label, icon: Icon }) => (
            <li key={label}>
              <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-foreground-muted transition-colors hover:bg-surface hover:text-foreground">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
          LN
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">Lisa Nguyen</p>
          <p className="truncate text-[11px] text-foreground-muted">Manager</p>
        </div>
        <BarChart3 className="ml-auto h-4 w-4 text-foreground-muted" />
      </div>
      </aside>
    </>
  );
}

import { Contrast, Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { useThemeStore, ThemeMode } from "../store/themeStore";

const OPTIONS: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
  { mode: "light", icon: Sun, label: "Light" },
  { mode: "dark", icon: Moon, label: "Dark" },
  { mode: "high-contrast", icon: Contrast, label: "High Contrast" },
];

/** Compact single-icon variant that cycles through theme modes on click (matches BI Portal top bar). */
export function CompactThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const currentIndex = OPTIONS.findIndex((o) => o.mode === theme);
  const current = OPTIONS[currentIndex] ?? OPTIONS[1];
  const Icon = current.icon;

  const cycle = () => {
    const next = OPTIONS[(currentIndex + 1) % OPTIONS.length];
    setTheme(next.mode);
  };

  return (
    <button
      title={`Theme: ${current.label} (click to cycle)`}
      aria-label="Cycle theme"
      onClick={cycle}
      className="rounded-lg border border-border p-1.5 text-foreground-muted transition-colors hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-surface-raised p-1">
      {OPTIONS.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          title={label}
          aria-label={`Switch to ${label} theme`}
          onClick={() => setTheme(mode)}
          className={clsx(
            "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
            theme === mode ? "bg-accent text-accent-foreground" : "text-foreground-muted hover:text-foreground"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

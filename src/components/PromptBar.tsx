import { FormEvent, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Show me real-time system analytics and active user regions",
  "Give me agent configuration controls and command panel",
  "Build a monitoring dashboard for API performance",
];

export function PromptBar({ onSubmit, isStreaming }: { onSubmit: (prompt: string) => void; isStreaming: boolean }) {
  const [prompt, setPrompt] = useState(SUGGESTIONS[0]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isStreaming) return;
    onSubmit(prompt.trim());
  };

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface-raised px-3 py-2.5 shadow-card focus-within:border-accent">
          <Sparkles className="h-4 w-4 shrink-0 text-accent" />
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the dashboard you want…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-muted"
          />
        </div>
        <button
          type="submit"
          disabled={isStreaming}
          className="flex h-full items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-transform active:scale-[0.97] disabled:opacity-60"
        >
          {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
        </button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setPrompt(s)}
            className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-foreground-muted transition-colors hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

import { FormEvent, useState } from "react";
import { ChevronDown, Languages, Loader2, Mic, Paperclip, Settings, SendHorizonal, Sparkles } from "lucide-react";

export function ChatInputBar({ onSubmit, isStreaming }: { onSubmit: (prompt: string) => void; isStreaming: boolean }) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isStreaming) return;
    onSubmit(prompt.trim());
    setPrompt("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Generate dashboard from a prompt"
      className="mx-auto flex w-full flex-col gap-2 rounded-2xl border border-border bg-surface-raised/95 p-3 shadow-card backdrop-blur-md"
    >
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your request here…"
        aria-label="Dashboard prompt"
        className="w-full bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-foreground-muted"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button type="button" aria-label="Attach file" className="shrink-0 rounded-lg p-1.5 text-foreground-muted hover:text-foreground">
            <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-foreground-muted hover:text-foreground"
          >
            Full Analysis <ChevronDown className="h-3 w-3" aria-hidden="true" />
          </button>
          <button type="button" aria-label="Generation settings" className="hidden shrink-0 rounded-lg p-1.5 text-foreground-muted hover:text-foreground sm:block">
            <Settings className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button type="button" aria-label="AI suggestions" className="hidden shrink-0 rounded-lg p-1.5 text-foreground-muted hover:text-foreground sm:block">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button type="button" aria-label="Language: English" className="hidden shrink-0 items-center gap-1 rounded-lg p-1.5 text-xs text-foreground-muted hover:text-foreground sm:flex">
            <Languages className="h-3.5 w-3.5" aria-hidden="true" /> EN
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" aria-label="Voice input" className="hidden rounded-lg p-1.5 text-foreground-muted hover:text-foreground sm:block">
            <Mic className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="submit"
            disabled={isStreaming}
            aria-label="Generate dashboard"
            aria-busy={isStreaming}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform active:scale-95 disabled:opacity-60"
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <SendHorizonal className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </form>
  );
}

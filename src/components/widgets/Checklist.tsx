import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import clsx from "clsx";
import { ChecklistData, WidgetSchema } from "../../types";
import { useDashboardStore } from "../../store/dashboardStore";
import { PanelHeader } from "./PanelHeader";

export function Checklist({ widget }: { widget: WidgetSchema<ChecklistData> }) {
  const { items, actionEndpoint } = widget.data;
  const applyWidgetAction = useDashboardStore((s) => s.applyWidgetAction);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const toggle = async (itemId: string, done: boolean) => {
    setPendingId(itemId);
    await applyWidgetAction(actionEndpoint, widget.id, "toggle_checklist_item", { itemId, done }, (w) => {
      const data = w.data as ChecklistData;
      return {
        ...w,
        data: { ...data, items: data.items.map((it) => (it.id === itemId ? { ...it, done } : it)) },
      };
    });
    setPendingId(null);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex h-full min-h-[280px] flex-col gap-3 rounded-xl border border-border bg-surface-raised p-4 shadow-card"
    >
      <PanelHeader title={widget.title} />
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              role="checkbox"
              aria-checked={item.done}
              disabled={pendingId === item.id}
              onClick={() => toggle(item.id, !item.done)}
              className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-surface-sunken disabled:opacity-60"
            >
              <span
                aria-hidden="true"
                className={clsx(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                  item.done ? "border-accent bg-accent" : "border-border bg-transparent"
                )}
              >
                {item.done && <Check className="h-3 w-3 text-accent-foreground" />}
              </span>
              <span className={clsx("text-sm", item.done ? "text-foreground-muted line-through" : "text-foreground")}>
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

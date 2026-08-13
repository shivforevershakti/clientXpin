import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { DashboardSummary } from "../types";

export function HeadlineSummary({ summary }: { summary: DashboardSummary | null }) {
  if (!summary) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col gap-2">
      <h2 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">{summary.headline}</h2>
      <p className="text-sm text-foreground-muted">{summary.subtext}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        {summary.badges.map((badge) => (
          <span
            key={badge}
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-[11px] text-foreground-muted"
          >
            <BadgeCheck className="h-3 w-3 text-accent" />
            {badge}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

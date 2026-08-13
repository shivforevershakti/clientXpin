import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { MetricCardData, WidgetSchema } from "../../types";
import clsx from "clsx";

function Sparkline({ points, status }: { points: number[]; status: string }) {
  if (!points || points.length === 0) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const width = 160;
  const height = 40;
  const step = width / (points.length - 1 || 1);

  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const strokeColor =
    status === "danger" ? "rgb(var(--color-danger))" : status === "warning" ? "rgb(var(--color-warning))" : "rgb(var(--color-success))";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-full" preserveAspectRatio="none">
      <path d={path} fill="none" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MetricCard({ widget }: { widget: WidgetSchema<MetricCardData> }) {
  const { value, unit, trend, status, sparkline } = widget.data;
  const isPositive = trend?.trim().startsWith("+");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      role="group"
      aria-label={`${widget.title}: ${value} ${unit}, trend ${trend}`}
      className="flex h-[110px] flex-col justify-between gap-2 rounded-lg border border-border bg-surface-raised p-4 shadow-card transition-shadow hover:shadow-lg"
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-foreground-muted">{widget.title}</p>

      <div className="flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
          <span className="text-xs text-foreground-muted">{unit}</span>
        </div>
        <div className="h-8 w-16 shrink-0 opacity-80" aria-hidden="true">
          <Sparkline points={sparkline} status={status} />
        </div>
      </div>

      <span
        className={clsx(
          "flex w-fit items-center gap-0.5 text-xs font-semibold",
          isPositive ? "text-success" : "text-danger"
        )}
      >
        {isPositive ? <ArrowUpRight className="h-3 w-3" aria-hidden="true" /> : <ArrowDownRight className="h-3 w-3" aria-hidden="true" />}
        {trend}
      </span>
    </motion.div>
  );
}

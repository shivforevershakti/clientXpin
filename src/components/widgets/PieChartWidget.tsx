import { motion } from "framer-motion";
import { PieChartData, WidgetSchema } from "../../types";
import { PanelHeader } from "./PanelHeader";

const SLICE_COLORS = [
  "rgb(var(--color-chart))",
  "rgb(var(--color-accent))",
  "rgb(var(--color-success))",
  "rgb(var(--color-warning))",
  "rgb(var(--color-danger))",
  "rgb(var(--color-fg-muted))",
];

const SIZE = 120;
const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PieChartWidget({ widget }: { widget: WidgetSchema<PieChartData> }) {
  const { slices } = widget.data;
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;

  let offsetSoFar = 0;
  const segments = slices.map((slice, i) => {
    const fraction = slice.value / total;
    const dash = fraction * CIRCUMFERENCE;
    const segment = {
      slice,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      dasharray: `${dash} ${CIRCUMFERENCE - dash}`,
      dashoffset: -offsetSoFar,
      percent: Math.round(fraction * 100),
    };
    offsetSoFar += dash;
    return segment;
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex h-full min-h-[280px] flex-col gap-4 rounded-xl border border-border bg-surface-raised p-4 shadow-card"
    >
      <PanelHeader title={widget.title} />
      <div className="flex flex-1 items-center gap-4">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-28 w-28 shrink-0 -rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="rgb(var(--color-surface-sunken))" strokeWidth={16} />
          {segments.map((seg, i) => (
            <motion.circle
              key={seg.slice.label}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth={16}
              strokeDasharray={seg.dasharray}
              initial={{ strokeDashoffset: 0, opacity: 0 }}
              animate={{ strokeDashoffset: seg.dashoffset, opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
            />
          ))}
        </svg>
        <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
          {segments.map((seg) => (
            <li key={seg.slice.label} className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="min-w-0 flex-1 truncate text-foreground-muted">{seg.slice.label}</span>
              <span className="shrink-0 font-medium text-foreground">{seg.percent}%</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

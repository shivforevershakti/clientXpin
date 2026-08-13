import { motion } from "framer-motion";
import { BarChartData, WidgetSchema } from "../../types";
import { PanelHeader } from "./PanelHeader";

export function BarChartWidget({ widget }: { widget: WidgetSchema<BarChartData> }) {
  const { bars } = widget.data;
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex h-full min-h-[280px] flex-col gap-4 rounded-xl border border-border bg-surface-raised p-4 shadow-card"
    >
      <PanelHeader title={widget.title} />
      <div className="flex h-32 items-end justify-between gap-1.5 px-1" title={bars.map((b) => `${b.label}: ${b.value}`).join(", ")}>
        {bars.map((bar, i) => (
          <motion.div
            key={bar.label}
            initial={{ height: 0 }}
            animate={{ height: `${(bar.value / max) * 100}%` }}
            transition={{ duration: 0.5, delay: i * 0.03, ease: "easeOut" }}
            className="min-h-[4px] w-full flex-1 rounded-t-sm bg-chart"
          />
        ))}
      </div>
    </motion.div>
  );
}

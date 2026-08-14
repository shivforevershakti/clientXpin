import { motion } from "framer-motion";
import { BarChart3, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { BarChartData, WidgetSchema } from "../../types";
import { PanelHeader } from "./PanelHeader";

const BAR_COLORS = [
  "rgb(var(--color-chart-1))",
  "rgb(var(--color-chart-2))",
  "rgb(var(--color-chart-3))",
  "rgb(var(--color-chart-4))",
  "rgb(var(--color-chart-5))",
  "rgb(var(--color-chart-6))",
];

export function BarChartWidget({
  widget,
}: {
  widget: WidgetSchema<BarChartData>;
}) {
  const { bars } = widget.data;

  const [activeIndex, setActiveIndex] = useState<number | null>(
    null
  );

  const max = Math.max(
    ...bars.map((bar) => bar.value),
    1
  );

  const total = useMemo(
    () =>
      bars.reduce(
        (sum, bar) => sum + bar.value,
        0
      ),
    [bars]
  );

  const highestBar = useMemo(() => {
    if (!bars.length) return null;

    return bars.reduce((highest, current) =>
      current.value > highest.value
        ? current
        : highest
    );
  }, [bars]);

  /*
   * Generate simple Y-axis grid values.
   */
  const gridLines = [100, 75, 50, 25, 0];

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      className="
        group relative flex h-full min-h-[380px]
        flex-col overflow-hidden
        rounded-2xl
        border border-border
        bg-surface-raised
        p-5
        shadow-card
      "
    >
      {/* =====================================================
          Decorative background
          ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute -right-24 -top-24
          h-48 w-48
          rounded-full
          bg-accent/10
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute -bottom-24 -left-24
          h-48 w-48
          rounded-full
          bg-chart/5
          blur-3xl
        "
      />

      {/* =====================================================
          Header
          ===================================================== */}

      <div className="relative z-10">
        <PanelHeader title={widget.title} />
      </div>

      {/* =====================================================
          Chart
          ===================================================== */}

      <div className="relative z-10 mt-6 flex flex-1">
        {/* Y Axis */}

        <div
          className="
            flex
            w-8
            shrink-0
            flex-col
            justify-between
            pb-7
            pt-1
            text-right
          "
        >
          {gridLines.map((line) => (
            <span
              key={line}
              className="
                text-[9px]
                font-medium
                text-foreground-muted
              "
            >
              {Math.round((max * line) / 100)}
            </span>
          ))}
        </div>

        {/* Chart area */}

        <div className="relative flex min-w-0 flex-1 flex-col">
          {/* Grid */}

          <div
            className="
              pointer-events-none
              absolute inset-x-0
              top-0 bottom-7
              flex flex-col
              justify-between
            "
          >
            {gridLines.map((line) => (
              <div
                key={line}
                className="
                  h-px
                  w-full
                  border-t
                  border-dashed
                  border-border/60
                "
              />
            ))}
          </div>

          {/* Bars */}

          <div
            className="
              relative
              flex h-56
              items-end
              justify-between
              gap-2
              px-1
              pb-7
            "
          >
            {bars.map((bar, index) => {
              const percentage =
                (bar.value / max) * 100;

              const isActive =
                activeIndex === index;

              const isDimmed =
                activeIndex !== null &&
                !isActive;

              const color =
                BAR_COLORS[
                  index % BAR_COLORS.length
                ];

              return (
                <div
                  key={bar.label}
                  className="
                    relative
                    flex h-full
                    min-w-0
                    flex-1
                    flex-col
                    items-center
                    justify-end
                  "
                  onMouseEnter={() =>
                    setActiveIndex(index)
                  }
                  onMouseLeave={() =>
                    setActiveIndex(null)
                  }
                >
                  {/* =================================================
                      Value tooltip
                      ================================================= */}

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 4,
                      scale: 0.9,
                    }}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      y: isActive ? 0 : 4,
                      scale: isActive ? 1 : 0.9,
                    }}
                    className="
                      pointer-events-none
                      absolute
                      -top-9
                      z-20
                      whitespace-nowrap
                      rounded-lg
                      border
                      border-border
                      bg-surface-raised
                      px-2.5
                      py-1.5
                      text-[10px]
                      font-semibold
                      text-foreground
                      shadow-lg
                    "
                  >
                    {bar.label}:{" "}
                    {bar.value.toLocaleString()}
                  </motion.div>

                  {/* =================================================
                      Bar
                      ================================================= */}

                  <motion.div
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: `${percentage}%`,
                      opacity: isDimmed
                        ? 0.25
                        : 1,
                    }}
                    transition={{
                      height: {
                        duration: 0.65,
                        delay: index * 0.05,
                        ease: "easeOut",
                      },
                      opacity: {
                        duration: 0.2,
                      },
                    }}
                    className="
                      relative
                      w-full
                      max-w-12
                      min-h-[4px]
                      cursor-pointer
                      overflow-hidden
                      rounded-t-lg
                      transition-all
                      duration-200
                    "
                    style={{
                      background: `linear-gradient(
                        180deg,
                        ${color},
                        color-mix(
                          in srgb,
                          ${color} 65%,
                          transparent
                        )
                      )`,
                      boxShadow: isActive
                        ? `0 0 18px ${color}`
                        : `0 4px 12px ${color
                            .replace("rgb(", "rgba(")
                            .replace(")", ", 0.15)")}`,
                    }}
                  >
                    {/* Highlight */}

                    <div
                      className="
                        absolute
                        inset-x-0
                        top-0
                        h-px
                        bg-white/50
                      "
                    />

                    {/* Inner shine */}

                    <motion.div
                      animate={{
                        opacity: isActive ? 0.4 : 0,
                      }}
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-r
                        from-transparent
                        via-white
                        to-transparent
                      "
                    />
                  </motion.div>

                  {/* =================================================
                      Value above bar
                      ================================================= */}

                  <motion.span
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity:
                        isActive ||
                        index ===
                          bars.indexOf(highestBar!)
                          ? 1
                          : 0,
                    }}
                    className="
                      pointer-events-none
                      absolute
                      -top-5
                      text-[9px]
                      font-bold
                      text-foreground-muted
                    "
                  >
                    {bar.value.toLocaleString()}
                  </motion.span>

                  {/* =================================================
                      X Axis label
                      ================================================= */}

                  <span
                    className="
                      absolute
                      -bottom-6
                      w-full
                      truncate
                      px-1
                      text-center
                      text-[9px]
                      font-medium
                      text-foreground-muted
                    "
                    title={bar.label}
                  >
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================
          Summary
          ===================================================== */}

      {highestBar && (
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.45,
            duration: 0.3,
          }}
          className="
            relative
            z-10
            mt-4
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-border
            bg-surface-sunken/60
            px-3.5
            py-3
          "
        >
          {/* Icon */}

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-accent/10
            "
          >
            <Sparkles
              size={15}
              className="text-accent"
            />
          </div>

          {/* Summary */}

          <p
            className="
              min-w-0
              flex-1
              text-xs
              leading-relaxed
              text-foreground-muted
            "
          >
            <span className="font-semibold text-foreground">
              {highestBar.label}
            </span>{" "}
            has the highest value at{" "}
            <span className="font-semibold text-accent">
              {highestBar.value.toLocaleString()}
            </span>
            .
          </p>

          {/* Total */}

          <div className="hidden shrink-0 text-right sm:block">
            <p
              className="
                text-[9px]
                uppercase
                tracking-wider
                text-foreground-muted
              "
            >
              Total
            </p>

            <p
              className="
                text-xs
                font-bold
                text-foreground
              "
            >
              {total.toLocaleString()}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
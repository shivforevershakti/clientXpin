import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { PieChartData, WidgetSchema } from "../../types";
import { PanelHeader } from "./PanelHeader";

/**
 * Design-token based chart colors.
 *
 * These are defined in index.css:
 * --color-chart-1
 * --color-chart-2
 * --color-chart-3
 * --color-chart-4
 * --color-chart-5
 * --color-chart-6
 */
const SLICE_COLORS = [
  "rgb(var(--color-chart-1))",
  "rgb(var(--color-chart-2))",
  "rgb(var(--color-chart-3))",
  "rgb(var(--color-chart-4))",
  "rgb(var(--color-chart-5))",
  "rgb(var(--color-chart-6))",
];

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 76;
const STROKE_WIDTH = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PieChartWidget({
  widget,
}: {
  widget: WidgetSchema<PieChartData>;
}) {
  const { slices } = widget.data;

  const [activeIndex, setActiveIndex] = useState<number | null>(
    null
  );

  const total = useMemo(() => {
    return slices.reduce((sum, slice) => sum + slice.value, 0);
  }, [slices]);

  const safeTotal = total || 1;

  /*
   * Build chart segments.
   */
  const segments = useMemo(() => {
    let offset = 0;

    return slices.map((slice, index) => {
      const fraction = slice.value / safeTotal;
      const dash = fraction * CIRCUMFERENCE;

      const segment = {
        slice,
        index,
        color: SLICE_COLORS[index % SLICE_COLORS.length],
        dashArray: `${dash} ${CIRCUMFERENCE - dash}`,
        dashOffset: -offset,
        fraction,
        percent: Math.round(fraction * 100),
      };

      offset += dash;

      return segment;
    });
  }, [slices, safeTotal]);

  /*
   * Find the largest category for the insight section.
   */
  const largestSlice = useMemo(() => {
    if (!slices.length) {
      return null;
    }

    return slices.reduce((largest, current) =>
      current.value > largest.value ? current : largest
    );
  }, [slices]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
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
          Decorative background glow
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
          Chart + Legend
          ===================================================== */}

      <div
        className="
          relative z-10
          mt-5
          flex flex-1
          flex-col
          items-center
          gap-6
          lg:flex-row
          lg:items-center
        "
      >
        {/* ===================================================
            DONUT CHART
            =================================================== */}

        <div className="relative flex shrink-0 items-center justify-center">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="
              h-56 w-56
              overflow-visible
              -rotate-90
              transition-transform
              duration-500
              group-hover:scale-[1.02]
            "
          >
            {/* -----------------------------------------------
                Outer decorative ring
                ----------------------------------------------- */}

            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS + 20}
              fill="none"
              stroke="rgb(var(--color-border) / 0.35)"
              strokeWidth="1"
              strokeDasharray="2 8"
            />

            {/* -----------------------------------------------
                Donut background / track
                ----------------------------------------------- */}

            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="rgb(var(--color-chart-track))"
              strokeWidth={STROKE_WIDTH}
            />

            {/* -----------------------------------------------
                Donut segments
                ----------------------------------------------- */}

            {segments.map((segment, index) => {
              const isActive = activeIndex === index;

              const isDimmed =
                activeIndex !== null && !isActive;

              return (
                <motion.circle
                  key={`${segment.slice.label}-${index}`}
                  cx={CENTER}
                  cy={CENTER}
                  r={isActive ? RADIUS + 4 : RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={
                    isActive
                      ? STROKE_WIDTH + 4
                      : STROKE_WIDTH
                  }
                  strokeLinecap="round"
                  strokeDasharray={segment.dashArray}
                  initial={{
                    strokeDashoffset: CIRCUMFERENCE,
                    opacity: 0,
                  }}
                  animate={{
                    strokeDashoffset: segment.dashOffset,
                    opacity: isDimmed ? 0.25 : 1,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.08,
                    ease: "easeOut",
                  }}
                  style={{
                    cursor: "pointer",
                    filter: isActive
                      ? `drop-shadow(0 0 7px ${segment.color})`
                      : undefined,
                  }}
                  onMouseEnter={() =>
                    setActiveIndex(index)
                  }
                  onMouseLeave={() =>
                    setActiveIndex(null)
                  }
                />
              );
            })}

            {/* -----------------------------------------------
                Percentage labels
                ----------------------------------------------- */}

            {segments.map((segment) => {
              /*
               * Don't show very small percentages because
               * there isn't enough space inside the slice.
               */
              if (segment.percent < 8) {
                return null;
              }

              const startFraction = segments
                .slice(0, segment.index)
                .reduce(
                  (sum, item) => sum + item.fraction,
                  0
                );

              const middleFraction =
                startFraction +
                segment.fraction / 2;

              const angle =
                middleFraction * Math.PI * 2 -
                Math.PI / 2;

              const labelRadius = RADIUS;

              const x =
                CENTER +
                Math.cos(angle) * labelRadius;

              const y =
                CENTER +
                Math.sin(angle) * labelRadius;

              return (
                <motion.text
                  key={`percentage-${segment.index}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="
                    pointer-events-none
                    fill-[rgb(var(--color-chart-label))]
                    text-[11px]
                    font-bold
                  "
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    delay:
                      0.7 + segment.index * 0.05,
                    duration: 0.2,
                  }}
                >
                  {segment.percent}%
                </motion.text>
              );
            })}
          </svg>

          {/* =================================================
              CENTER CONTENT
              ================================================= */}

          <div
            className="
              pointer-events-none
              absolute inset-0
              flex flex-col
              items-center
              justify-center
            "
          >
            <span
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-foreground-muted
              "
            >
              Total
            </span>

            <motion.span
              key={total}
              initial={{
                opacity: 0,
                y: 5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="
                mt-1
                text-2xl
                font-bold
                tracking-tight
                text-foreground
              "
            >
              {total.toLocaleString()}
            </motion.span>

            <span
              className="
                mt-1.5
                rounded-full
                bg-success/10
                px-2.5
                py-1
                text-[10px]
                font-semibold
                text-success
              "
            >
              Distribution
            </span>
          </div>
        </div>

        {/* ===================================================
            LEGEND
            =================================================== */}

        <div className="min-w-0 w-full flex-1">
          <div className="flex flex-col gap-2">
            {segments.map((segment, index) => {
              const isActive = activeIndex === index;

              const isDimmed =
                activeIndex !== null && !isActive;

              return (
                <motion.div
                  key={`${segment.slice.label}-legend-${index}`}
                  initial={{
                    opacity: 0,
                    x: 10,
                  }}
                  animate={{
                    opacity: isDimmed ? 0.4 : 1,
                    x: 0,
                  }}
                  transition={{
                    duration: 0.25,
                    delay: index * 0.05,
                  }}
                  onMouseEnter={() =>
                    setActiveIndex(index)
                  }
                  onMouseLeave={() =>
                    setActiveIndex(null)
                  }
                  className={`
                    relative
                    flex
                    items-center
                    gap-3
                    overflow-hidden
                    rounded-xl
                    border
                    px-3
                    py-2.5
                    cursor-pointer
                    transition-all
                    duration-200

                    ${
                      isActive
                        ? "border-border bg-surface-sunken shadow-sm"
                        : "border-transparent bg-surface-sunken/40 hover:border-border hover:bg-surface-sunken"
                    }
                  `}
                >
                  {/* Active left indicator */}

                  <motion.span
                    animate={{
                      scaleY: isActive ? 1 : 0.5,
                      opacity: isActive ? 1 : 0.7,
                    }}
                    className="
                      absolute
                      left-0
                      h-full
                      w-0.5
                      origin-center
                      rounded-r-full
                    "
                    style={{
                      backgroundColor:
                        segment.color,
                    }}
                  />

                  {/* Color indicator */}

                  <span
                    className="
                      h-2.5
                      w-2.5
                      shrink-0
                      rounded-full
                    "
                    style={{
                      backgroundColor:
                        segment.color,
                      boxShadow: `
                        0 0 10px
                        color-mix(
                          in srgb,
                          ${segment.color} 35%,
                          transparent
                        )
                      `,
                    }}
                  />

                  {/* Label */}

                  <span
                    className="
                      min-w-0
                      flex-1
                      truncate
                      text-xs
                      font-medium
                      text-foreground-muted
                    "
                  >
                    {segment.slice.label}
                  </span>

                  {/* Percentage */}

                  <span
                    className="
                      shrink-0
                      text-xs
                      font-bold
                      text-foreground
                    "
                  >
                    {segment.percent}%
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================
          INSIGHT
          ===================================================== */}

      {largestSlice && (
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
            mt-5
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
          {/* Sparkle icon */}

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

          {/* Insight text */}

          <p
            className="
              text-xs
              leading-relaxed
              text-foreground-muted
            "
          >
            <span className="font-semibold text-foreground">
              {largestSlice.label}
            </span>{" "}
            contributes the most with{" "}
            <span className="font-semibold text-accent">
              {Math.round(
                (largestSlice.value / safeTotal) *
                  100
              )}
              %
            </span>{" "}
            of the overall distribution.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
import { CSSProperties } from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import clsx from "clsx";
import { WidgetSchema } from "../../types";
import { WidgetRenderer } from "../registry/WidgetRegistry";
import { WidgetSkeleton, SkeletonVariant } from "./Skeleton";

interface GridLayoutProps {
  widgets: WidgetSchema[];
  expectedCount: number;
  isStreaming: boolean;
  onReorder: (widgets: WidgetSchema[]) => void;
}

const METRIC_TYPE = "METRIC_CARD";
const TABLE_TYPE = "DATA_TABLE";

/**
 * A single sortable widget. Only the small grip handle carries the drag
 * listeners (not the whole card) so interactive widget content — sliders,
 * inputs, table sort buttons — keeps working normally while dragging.
 */
function SortableWidget({ widget }: { widget: WidgetSchema }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={clsx("group relative", isDragging && "z-20")}>
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${widget.title}. Press space bar to pick up, arrow keys to move, space bar again to drop, escape to cancel.`}
        className="absolute -left-1.5 -top-1.5 z-10 flex h-6 w-6 touch-none cursor-grab items-center justify-center rounded-full border border-border bg-surface-raised text-foreground-muted opacity-0 shadow-card transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <motion.div
        layout
        animate={isDragging ? { scale: 1.02, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.35)" } : { scale: 1, boxShadow: "none" }}
        transition={{ duration: 0.15 }}
      >
        <WidgetRenderer widget={widget} />
      </motion.div>
    </div>
  );
}

/**
 * Renders one draggable, reorderable row of widgets sharing a grid template.
 * Uses dnd-kit's rectSortingStrategy (rather than framer-motion's axis-based
 * Reorder) because it correctly computes swap targets for multi-column CSS
 * Grid layouts, not just single-axis stacked lists.
 */
function WidgetRow({
  items,
  className,
  onReorder,
  skeletonCount,
  skeletonVariant,
}: {
  items: WidgetSchema[];
  className: string;
  onReorder: (next: WidgetSchema[]) => void;
  skeletonCount: number;
  skeletonVariant: SkeletonVariant;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (items.length === 0 && skeletonCount === 0) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((w) => w.id === active.id);
    const newIndex = items.findIndex((w) => w.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div className={className}>
          <AnimatePresence initial={false}>
            {items.map((widget) => (
              <SortableWidget key={widget.id} widget={widget} />
            ))}
          </AnimatePresence>

          {Array.from({ length: skeletonCount }).map((_, i) => (
            <motion.div key={`skeleton-${skeletonVariant}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WidgetSkeleton variant={skeletonVariant} />
            </motion.div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/**
 * Structured, responsive layout matching the target design:
 * row 1 — up to 4 KPI metric cards; row 2 — full-width data table(s);
 * row 3 — remaining widgets (checklist, chart, forms) in a 2-up grid.
 * Skeleton placeholders are queued per-section so streamed-in widgets never
 * cause layout shift, and every row collapses to a single column on mobile.
 */
export function GridLayout({ widgets, expectedCount, isStreaming, onReorder }: GridLayoutProps) {
  const metrics = widgets.filter((w) => w.type === METRIC_TYPE);
  const tables = widgets.filter((w) => w.type === TABLE_TYPE);
  const others = widgets.filter((w) => w.type !== METRIC_TYPE && w.type !== TABLE_TYPE);

  const skeletonCount = isStreaming ? Math.max(0, expectedCount - widgets.length) : 0;
  // Backend streams metrics, then table(s), then the remaining widgets — mirror that
  // order so skeleton placeholders land in the section they'll actually resolve into.
  const remainingMetricSlots = Math.max(0, Math.min(skeletonCount, 4 - metrics.length));
  const remainingTableSlots = Math.max(0, Math.min(skeletonCount - remainingMetricSlots, tables.length === 0 ? 1 : 0));
  const remainingOtherSlots = Math.max(0, skeletonCount - remainingMetricSlots - remainingTableSlots);

  const mergeAndReorder = (section: "metrics" | "tables" | "others", next: WidgetSchema[]) => {
    if (section === "metrics") onReorder([...next, ...tables, ...others]);
    else if (section === "tables") onReorder([...metrics, ...next, ...others]);
    else onReorder([...metrics, ...tables, ...next]);
  };

  return (
    <div className="flex flex-col gap-4">
      <WidgetRow
        items={metrics}
        skeletonCount={remainingMetricSlots}
        skeletonVariant="metric"
        className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4"
        onReorder={(next) => mergeAndReorder("metrics", next)}
      />

      <WidgetRow
        items={tables}
        skeletonCount={remainingTableSlots}
        skeletonVariant="table"
        className="flex flex-col gap-4"
        onReorder={(next) => mergeAndReorder("tables", next)}
      />

      <WidgetRow
        items={others}
        skeletonCount={remainingOtherSlots}
        skeletonVariant="form"
        className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2"
        onReorder={(next) => mergeAndReorder("others", next)}
      />
    </div>
  );
}

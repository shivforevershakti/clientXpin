import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Search } from "lucide-react";
import clsx from "clsx";
import { DataTableData, WidgetSchema } from "../../types";
import { PanelHeader } from "./PanelHeader";

const ROW_HEIGHT = 36;
const VISIBLE_ROWS = 8;
const OVERSCAN = 4;

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/15 text-success",
  idle: "bg-warning/15 text-warning",
  degraded: "bg-warning/25 text-warning",
  offline: "bg-danger/15 text-danger",
};

/**
 * Sortable + filterable table with lightweight windowed rendering: only the
 * rows within the scroll viewport (+ overscan) are mounted to the DOM,
 * keeping render cost flat regardless of dataset size.
 */
export function DataTable({ widget }: { widget: WidgetSchema<DataTableData> }) {
  const { columns, rows } = widget.data;
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState("");
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!filter.trim()) return rows;
    const q = filter.toLowerCase();
    return rows.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(q)));
  }, [rows, filter]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalHeight = sorted.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(sorted.length, startIndex + VISIBLE_ROWS + OVERSCAN * 2);
  const visibleRows = sorted.slice(startIndex, endIndex);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex h-full min-h-[280px] flex-col gap-3 rounded-xl border border-border bg-surface-raised p-4 shadow-card"
    >
      <div className="flex items-center justify-between gap-3">
        <PanelHeader title={widget.title} />
        <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1">
          <Search className="h-3.5 w-3.5 text-foreground-muted" aria-hidden="true" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter rows…"
            aria-label={`Filter ${widget.title} rows`}
            className="w-32 bg-transparent text-xs text-foreground outline-none placeholder:text-foreground-muted"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border" role="table" aria-label={widget.title}>
        <div className="grid min-w-[560px] grid-flow-col auto-cols-fr border-b border-border bg-surface-sunken text-xs font-semibold text-foreground-muted" role="row">
          {columns.map((col) => (
            <button
              key={col.key}
              role="columnheader"
              aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : col.sortable ? "none" : undefined}
              onClick={() => col.sortable && toggleSort(col.key)}
              className={clsx(
                "flex items-center gap-1 px-3 py-2 text-left",
                col.sortable && "cursor-pointer hover:text-foreground"
              )}
            >
              {col.label}
              {col.sortable && <ArrowUpDown className="h-3 w-3 opacity-60" aria-hidden="true" />}
            </button>
          ))}
        </div>

        <div
          ref={containerRef}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          className="max-h-[240px] min-w-[560px] overflow-y-auto"
          role="rowgroup"
        >
          <div style={{ height: totalHeight, position: "relative" }}>
            {visibleRows.map((row, i) => (
              <div
                key={String(row.id ?? startIndex + i)}
                role="row"
                className="grid grid-flow-col auto-cols-fr items-center border-b border-border/60 px-0 text-xs text-foreground hover:bg-surface-sunken"
                style={{ height: ROW_HEIGHT, position: "absolute", top: (startIndex + i) * ROW_HEIGHT, left: 0, right: 0 }}
              >
                {columns.map((col) => (
                  <div key={col.key} role="cell" className="truncate px-3">
                    {col.key === "status" ? (
                      <span className={clsx("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_STYLES[String(row[col.key])])}>
                        {row[col.key]}
                      </span>
                    ) : (
                      String(row[col.key])
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-foreground-muted" aria-live="polite">
        {sorted.length} of {rows.length} rows{filter ? " (filtered)" : ""} — windowed rendering keeps DOM nodes constant.
      </p>
    </motion.div>
  );
}

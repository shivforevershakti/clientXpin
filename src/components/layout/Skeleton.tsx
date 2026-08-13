/** Fixed-height skeleton drivers that reserve layout space to prevent CLS while widgets stream in. */

export type SkeletonVariant = "metric" | "table" | "form";

export function WidgetSkeleton({ variant = "metric" }: { variant?: SkeletonVariant }) {
  if (variant === "table") {
    return (
      <div role="status" aria-label="Loading widget" className="flex h-full min-h-[280px] flex-col gap-3 rounded-xl border border-border bg-surface-raised p-4">
        <div className="skeleton-shimmer h-4 w-1/3 animate-shimmer rounded" />
        <div className="skeleton-shimmer h-8 w-full animate-shimmer rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-7 w-full animate-shimmer rounded" />
        ))}
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div role="status" aria-label="Loading widget" className="flex h-full min-h-[280px] flex-col gap-4 rounded-xl border border-border bg-surface-raised p-4">
        <div className="skeleton-shimmer h-4 w-1/2 animate-shimmer rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="skeleton-shimmer h-3 w-1/3 animate-shimmer rounded" />
            <div className="skeleton-shimmer h-8 w-full animate-shimmer rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div role="status" aria-label="Loading widget" className="flex h-[110px] flex-col gap-3 rounded-lg border border-border bg-surface-raised p-4">
      <div className="skeleton-shimmer h-3 w-2/3 animate-shimmer rounded" />
      <div className="skeleton-shimmer h-8 w-1/2 animate-shimmer rounded" />
      <div className="skeleton-shimmer h-10 w-full animate-shimmer rounded" />
    </div>
  );
}

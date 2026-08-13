import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";
import clsx from "clsx";
import { useToastStore } from "../store/toastStore";

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };

export function ToastViewport() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.variant];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={clsx(
                "pointer-events-auto flex items-start gap-2 rounded-xl border p-3 shadow-card backdrop-blur",
                t.variant === "success" && "border-success/30 bg-success/10 text-success",
                t.variant === "error" && "border-danger/30 bg-danger/10 text-danger",
                t.variant === "info" && "border-border bg-surface-raised text-foreground"
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p className="flex-1 text-xs font-medium leading-snug">{t.message}</p>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="opacity-60 hover:opacity-100">
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

import { useId, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Loader2, Send } from "lucide-react";
import { DynamicFormData, FormField, WidgetSchema } from "../../types";
import { useDashboardStore } from "../../store/dashboardStore";

function fieldInitialValues(fields: FormField[]) {
  return fields.reduce<Record<string, string | number | boolean>>((acc, f) => {
    acc[f.name] = f.default;
    return acc;
  }, {});
}

function validate(fields: FormField[], values: Record<string, string | number | boolean>) {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (f.required && (values[f.name] === "" || values[f.name] === undefined)) {
      errors[f.name] = `${f.label} is required`;
    }
    if (f.type === "slider" && typeof values[f.name] === "number") {
      const v = values[f.name] as number;
      if (f.min !== undefined && v < f.min) errors[f.name] = `Must be ≥ ${f.min}`;
      if (f.max !== undefined && v > f.max) errors[f.name] = `Must be ≤ ${f.max}`;
    }
  }
  return errors;
}

/** Compact label + switch pair, reused inline in the header and stacked in the field list. */
function ToggleSwitch({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-accent" : "bg-surface-sunken")}
    >
      <motion.span
        layout
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
        animate={{ left: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export function DynamicForm({ widget }: { widget: WidgetSchema<DynamicFormData & { submitLabel?: string }> }) {
  const { fields, actionEndpoint, submitLabel } = widget.data;
  const [values, setValues] = useState(() => fieldInitialValues(fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const applyWidgetAction = useDashboardStore((s) => s.applyWidgetAction);
  const formId = useId();

  const setValue = (name: string, value: string | number | boolean) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(fields, values);
    if (Object.keys(nextErrors).some((k) => nextErrors[k])) {
      setErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    await applyWidgetAction(actionEndpoint, widget.id, "submit_form", values, (w) => w);
    setSubmitting(false);
  };

  // Toggles move into the header (top-right, next to the title) instead of the
  // vertical field stack, keeping widget height in line with sibling widgets.
  const toggleFields = fields.filter((f) => f.type === "toggle");
  const bodyFields = fields.filter((f) => f.type !== "toggle");

  return (
    <motion.form
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onSubmit={handleSubmit}
      aria-labelledby={`${formId}-title`}
      className="flex h-full min-h-[280px] flex-col gap-4 rounded-xl border border-border bg-surface-raised p-4 shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <p id={`${formId}-title`} className="text-sm font-semibold text-foreground">{widget.title}</p>
        {toggleFields.length > 0 && (
          <div className="flex shrink-0 flex-col items-end gap-2">
            {toggleFields.map((field) => {
              const fieldId = `${formId}-${field.name}`;
              return (
                <div key={field.name} className="flex items-center gap-2">
                  <label htmlFor={fieldId} className="text-xs font-medium text-foreground-muted">
                    {field.label}
                  </label>
                  <ToggleSwitch
                    id={fieldId}
                    label={field.label}
                    checked={Boolean(values[field.name])}
                    onChange={(v) => setValue(field.name, v)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4">
        {bodyFields.map((field) => {
          const fieldId = `${formId}-${field.name}`;
          const errorId = `${fieldId}-error`;
          const hasError = Boolean(errors[field.name]);
          return (
          <div key={field.name} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor={fieldId} className="text-xs font-medium text-foreground-muted">{field.label}</label>
              {field.type === "slider" && <span className="text-xs font-semibold text-foreground">{values[field.name]}</span>}
            </div>

            {field.type === "slider" && (
              <input
                id={fieldId}
                type="range"
                min={field.min}
                max={field.max}
                // Fall back to a fine-grained step (100 increments across the range) when the
                // schema omits one, instead of a coarse default of 1 that rounds fractional defaults.
                step={field.step ?? Math.max(((field.max ?? 100) - (field.min ?? 0)) / 100, 0.001)}
                value={Number(values[field.name])}
                aria-valuetext={String(values[field.name])}
                onChange={(e) => setValue(field.name, Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-sunken accent-accent"
              />
            )}

            {field.type === "select" && (
              <select
                id={fieldId}
                value={String(values[field.name])}
                onChange={(e) => setValue(field.name, e.target.value)}
                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
              >
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {field.type === "text" && (
              <input
                id={fieldId}
                type="text"
                value={String(values[field.name])}
                onChange={(e) => setValue(field.name, e.target.value)}
                aria-invalid={hasError}
                aria-describedby={hasError ? errorId : undefined}
                aria-required={field.required}
                className={clsx(
                  "rounded-lg border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent",
                  hasError ? "border-danger" : "border-border"
                )}
              />
            )}

            {hasError && (
              <p id={errorId} role="alert" className="text-[11px] text-danger">
                {errors[field.name]}
              </p>
            )}
          </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
        {submitLabel ?? "Apply Changes"}
      </button>
    </motion.form>
  );
}

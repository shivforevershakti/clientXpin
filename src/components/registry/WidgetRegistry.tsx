import { ComponentType } from "react";
import { WidgetSchema } from "../../types";
import { MetricCard } from "../widgets/MetricCard";
import { DataTable } from "../widgets/DataTable";
import { DynamicForm } from "../widgets/DynamicForm";
import { Checklist } from "../widgets/Checklist";
import { BarChartWidget } from "../widgets/BarChartWidget";
import { PieChartWidget } from "../widgets/PieChartWidget";
import { UnknownWidget } from "../widgets/UnknownWidget";
import { WidgetErrorBoundary } from "./ErrorBoundary";

/**
 * Dynamic Component Registry: maps a widget schema `type` to its React
 * renderer at runtime. Adding a new widget archetype only requires a new
 * entry here — no changes to the layout/orchestration code.
 */
const REGISTRY: Record<string, ComponentType<{ widget: WidgetSchema<any> }>> = {
  METRIC_CARD: MetricCard,
  DATA_TABLE: DataTable,
  DYNAMIC_FORM: DynamicForm,
  COMMAND_PANEL: DynamicForm,
  CHECKLIST: Checklist,
  BAR_CHART: BarChartWidget,
  PIE_CHART: PieChartWidget,
};

function isValidWidget(widget: WidgetSchema | null | undefined): widget is WidgetSchema {
  return Boolean(widget && widget.id && widget.type && widget.title && widget.data);
}

export function resolveWidget(widget: WidgetSchema) {
  if (!isValidWidget(widget)) return UnknownWidget;
  return REGISTRY[widget.type] ?? UnknownWidget;
}

export function WidgetRenderer({ widget }: { widget: WidgetSchema }) {
  const Renderer = resolveWidget(widget);
  return (
    <WidgetErrorBoundary widgetTitle={widget?.title}>
      <Renderer widget={widget} />
    </WidgetErrorBoundary>
  );
}

/** Shared schema contract for LLM-generated dashboard widgets. */

export type WidgetStatus = "success" | "warning" | "danger" | "neutral";

export interface MetricCardData {
  value: string;
  unit: string;
  trend: string;
  status: WidgetStatus;
  sparkline: number[];
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
}

export interface DataTableData {
  columns: TableColumn[];
  rows: Record<string, string | number>[];
}

export type FieldType = "slider" | "toggle" | "select" | "text";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  required?: boolean;
  default: string | number | boolean;
}

export interface DynamicFormData {
  fields: FormField[];
  actionEndpoint: string;
  submitLabel?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface ChecklistData {
  items: ChecklistItem[];
  actionEndpoint: string;
}

export interface BarChartBar {
  label: string;
  value: number;
}

export interface BarChartData {
  bars: BarChartBar[];
}

export interface PieChartSlice {
  label: string;
  value: number;
}

export interface PieChartData {
  slices: PieChartSlice[];
}

export type WidgetType =
  | "METRIC_CARD"
  | "DATA_TABLE"
  | "DYNAMIC_FORM"
  | "COMMAND_PANEL"
  | "CHECKLIST"
  | "BAR_CHART"
  | "PIE_CHART";

export interface WidgetSchema<TData = unknown> {
  id: string;
  type: WidgetType | string; // string fallback lets us exercise "unknown type" handling
  title: string;
  data: TData;
}

export interface DashboardSummary {
  headline: string;
  subtext: string;
  badges: string[];
}

export interface DashboardMeta {
  dashboardId: string;
  layout: string;
  theme: "dark" | "light" | "high-contrast";
  totalWidgets?: number;
  summary?: DashboardSummary;
}

export interface DashboardPayload extends DashboardMeta {
  widgets: WidgetSchema[];
}

export type StreamChunk =
  | ({ kind: "meta" } & DashboardMeta)
  | { kind: "widget"; widget: WidgetSchema }
  | { kind: "done"; dashboardId: string };

export interface WidgetActionResponse {
  ok: boolean;
  widgetId?: string;
  action?: string;
  appliedPayload?: unknown;
  appliedAt?: string;
  error?: string;
}

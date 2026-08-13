import { create } from "zustand";
import { streamDashboard, postWidgetAction } from "../api/client";
import { DashboardMeta, DashboardSummary, WidgetSchema } from "../types";
import { useToastStore } from "./toastStore";
import { useThemeStore, ThemeMode } from "./themeStore";
import { nanoid } from "../utils/nanoid";

export interface HistoryEntry {
  id: string;
  prompt: string;
  timestamp: string;
}

interface DashboardState {
  meta: DashboardMeta | null;
  summary: DashboardSummary | null;
  widgets: WidgetSchema[];
  expectedWidgetCount: number;
  isStreaming: boolean;
  error: string | null;
  history: HistoryEntry[];
  activeLabel: string;
  generate: (prompt: string, label?: string) => Promise<void>;
  /**
   * Applies a widget mutation optimistically: updates local state immediately,
   * fires the API call in the background, and rolls back + toasts on failure.
   */
  applyWidgetAction: (
    endpoint: string,
    widgetId: string,
    action: string,
    payload: unknown,
    optimisticPatch: (widget: WidgetSchema) => WidgetSchema
  ) => Promise<void>;
  /**
   * Persists a drag-and-drop widget reorder optimistically: applies the new
   * order instantly, fires a background persistence call, and rolls back to
   * the previous order + toasts if it fails.
   */
  reorderWidgets: (next: WidgetSchema[]) => Promise<void>;
}

let activeController: AbortController | null = null;
const VALID_THEMES: ThemeMode[] = ["dark", "light", "high-contrast"];

export const useDashboardStore = create<DashboardState>((set, get) => ({
  meta: null,
  summary: null,
  widgets: [],
  expectedWidgetCount: 0,
  isStreaming: false,
  error: null,
  history: [],
  activeLabel: "High Risk Accounts Review",

  generate: async (prompt: string, label?: string) => {
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;

    set((s) => ({
      isStreaming: true,
      error: null,
      widgets: [],
      meta: null,
      summary: null,
      // Keep the previous widget count as a provisional skeleton-slot estimate
      // (corrected once the real "meta" chunk arrives) so the grid doesn't
      // collapse to zero height for the brief gap before that chunk lands.
      expectedWidgetCount: s.expectedWidgetCount || s.widgets.length,
      activeLabel: label ?? prompt,
      history: [{ id: nanoid(), prompt, timestamp: new Date().toISOString() }, ...s.history].slice(0, 20),
    }));

    try {
      await streamDashboard(
        prompt,
        (chunk) => {
          if (chunk.kind === "meta") {
            set({
              meta: { dashboardId: chunk.dashboardId, layout: chunk.layout, theme: chunk.theme },
              summary: chunk.summary ?? null,
              expectedWidgetCount: chunk.totalWidgets ?? 0,
            });
            // The generated dashboard dictates its own theme (e.g. an LLM response tagged "high-contrast") — apply it.
            if (VALID_THEMES.includes(chunk.theme as ThemeMode)) {
              useThemeStore.getState().setTheme(chunk.theme as ThemeMode);
            }
          } else if (chunk.kind === "widget") {
            set((s) => ({ widgets: [...s.widgets, chunk.widget] }));
          } else if (chunk.kind === "done") {
            set({ isStreaming: false });
          }
        },
        controller.signal
      );
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        set({ error: (err as Error).message, isStreaming: false });
        useToastStore.getState().push((err as Error).message, "error");
      }
    } finally {
      set({ isStreaming: false });
    }
  },

  applyWidgetAction: async (endpoint, widgetId, action, payload, optimisticPatch) => {
    const previousWidgets = get().widgets;
    const previousWidget = previousWidgets.find((w) => w.id === widgetId);
    if (!previousWidget) return;

    // 1. Optimistic update — instant feedback.
    set((s) => ({
      widgets: s.widgets.map((w) => (w.id === widgetId ? optimisticPatch(w) : w)),
    }));

    try {
      await postWidgetAction(endpoint, { widgetId, action, payload });
      useToastStore.getState().push("Update applied", "success");
    } catch (err) {
      // 2. Rollback on failure + non-intrusive notification.
      set((s) => ({
        widgets: s.widgets.map((w) => (w.id === widgetId ? previousWidget : w)),
      }));
      useToastStore.getState().push((err as Error).message || "Action failed, rolled back", "error");
    }
  },

  reorderWidgets: async (next) => {
    const previousOrder = get().widgets;

    // 1. Optimistic update — instant reorder feedback.
    set({ widgets: next });

    try {
      await postWidgetAction("/api/widget-action", {
        widgetId: "layout",
        action: "reorder_layout",
        payload: { order: next.map((w) => w.id) },
      });
    } catch (err) {
      // 2. Rollback on failure + non-intrusive notification.
      set({ widgets: previousOrder });
      useToastStore.getState().push((err as Error).message || "Reorder failed, rolled back", "error");
    }
  },
}));

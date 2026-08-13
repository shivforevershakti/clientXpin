import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  widgetTitle?: string;
}

interface State {
  hasError: boolean;
  message?: string;
}

/**
 * Isolates a single widget's render failure so one broken schema/component
 * never takes down the rest of the dashboard grid.
 */
export class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[WidgetErrorBoundary] ${this.props.widgetTitle ?? "widget"} crashed:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border border-danger/40 bg-danger/5 p-6 text-center"
        >
          <AlertTriangle className="h-6 w-6 text-danger" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">
            {this.props.widgetTitle ?? "This widget"} failed to render
          </p>
          <p className="max-w-[240px] text-xs text-foreground-muted">{this.state.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

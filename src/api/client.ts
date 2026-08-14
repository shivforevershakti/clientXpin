import { StreamChunk, WidgetActionResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "";
const BASE = API_URL ? `${API_URL}/api` : "/api";

/**
 * Streams a dashboard generation request. Reads the NDJSON response body
 * incrementally and invokes `onChunk` for every parsed line as soon as it
 * arrives, allowing the UI to progressively mount widgets.
 */
export async function streamDashboard(
  prompt: string,
  onChunk: (chunk: StreamChunk) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${BASE}/generate-dashboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, stream: true }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Failed to generate dashboard (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;

    while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);

      if (!line) continue;

      try {
        onChunk(JSON.parse(line) as StreamChunk);
      } catch {
        // Ignore malformed lines rather than aborting the whole stream.
      }
    }
  }
}

export async function postWidgetAction(
  endpoint: string,
  body: { widgetId: string; action: string; payload: unknown }
): Promise<WidgetActionResponse> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : endpoint.startsWith("/api")
      ? `${API_URL}${endpoint}`
      : `${BASE}${endpoint}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as WidgetActionResponse;

  if (!res.ok) {
    throw new Error(json.error || `Widget action failed (${res.status})`);
  }

  return json;
}
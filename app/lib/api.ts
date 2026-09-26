const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export type GuideResponse = {
  title: string;
  summary: string;
  cultural_significance?: string | null;
  historical_context?: string | null;
  confidence: "high" | "medium" | "low";
  source_ids: string[];
  nearby: string[];
  safety_tip?: string | null;
  suggested_questions: string[];
};

type JsonObject = Record<string, unknown>;

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text();

  let data: unknown = null;
  if (contentType.includes("application/json") && body) {
    try {
      data = JSON.parse(body);
    } catch {
      throw new Error("The backend returned invalid JSON.");
    }
  }

  if (!response.ok) {
    const detail = isJsonObject(data) && typeof data.detail === "string"
      ? data.detail
      : isJsonObject(data) && typeof data.error === "string"
        ? data.error
        : null;
    throw new Error(
      detail || `Backend request failed (${response.status}).`,
    );
  }

  if (!contentType.includes("application/json")) {
    throw new Error(
      "The assistant backend returned HTML instead of JSON. Check that FastAPI is running and NEXT_PUBLIC_API_BASE is correct.",
    );
  }

  return data as T;
}

export const api = {
  guideChat: (body: Record<string, unknown>) =>
    requestJson<GuideResponse>("/api/guide/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  analyzeImage: (formData: FormData) =>
    requestJson<GuideResponse>("/api/guide/analyze-image", {
      method: "POST",
      body: formData,
    }),

  health: () => requestJson<{ status: string }>("/api/health"),
};

export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
}

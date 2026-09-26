const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export const api = {
  guideChat: (body: any) =>
    fetch(`${API_BASE}/api/guide/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  analyzeImage: (formData: FormData) =>
    fetch(`${API_BASE}/api/guide/analyze-image`, {
      method: "POST",
      body: formData,
    }).then((r) => r.json()),

  health: () => fetch(`${API_BASE}/api/health`).then((r) => r.json()),
};

export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
}
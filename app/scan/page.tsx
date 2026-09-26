"use client";

import { useEffect, useRef, useState } from "react";

export default function ScanPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camera, setCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  async function askText(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/guide/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), language: "en" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Guide unavailable");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function askImage(file: File) {
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append("image", file);
    fd.append("language", "en");
    try {
      const res = await fetch("/api/guide/analyze-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not analyze image");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(s);
      setCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch {
      // Fall back to file upload if camera is unavailable.
      fileRef.current?.click();
    }
  }

  function capture() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) askImage(new File([blob], "capture.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.8);
  }

  function stopCamera() {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCamera(false);
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 px-5 pb-28 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Scan</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Camera + text in one place.
          </p>
        </div>
        {camera && (
          <button
            onClick={stopCamera}
            className="text-sm font-medium text-zinc-500"
          >
            Close
          </button>
        )}
      </div>

      {/* Camera view */}
      {camera ? (
        <div className="mt-5 relative">
          <video
            ref={videoRef}
            playsInline
            className="w-full rounded-2xl bg-zinc-900 aspect-video object-cover"
          />
          <button
            onClick={capture}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full bg-white border-4 border-zinc-200 shadow-lg active:scale-95 transition-transform"
            aria-label="Capture photo"
          />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={startCamera}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-6 text-white active:scale-95 transition-transform"
          >
            <span className="text-2xl">📷</span>
            <span className="text-sm font-semibold">Open camera</span>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-zinc-300 py-6 active:scale-95 transition-transform"
          >
            <span className="text-2xl">🖼️</span>
            <span className="text-sm font-semibold">Upload image</span>
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) askImage(f);
        }}
      />

      {/* Text ask */}
      <form onSubmit={askText} className="mt-5 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about a place, object, or food…"
          className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>

      {loading && (
        <div className="mt-6 flex items-center gap-3 text-sm text-zinc-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
          Thinking…
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-6 rounded-2xl border border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {result.title || "Answer"}
            </h2>
            <span className="text-xs font-medium text-zinc-500">
              {result.confidence || "n/a"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-700">
            {result.summary}
          </p>
          {result.suggested_questions?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {result.suggested_questions.map((q: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setQuestion(q)}
                  className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700"
                >
                  {q}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
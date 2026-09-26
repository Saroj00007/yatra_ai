"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ImagePlus,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import BottomNav from "../components/bottom-nav";
import { api, type GuideResponse } from "../lib/api";

export default function ScanPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<GuideResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camera, setCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [stream]);

  async function askText(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setResult(await api.guideChat({ question: question.trim(), language: "en" }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
      setResult(await api.analyzeImage(fd));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function startCamera() {
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      setStream(nextStream);
      setCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = nextStream;
        await videoRef.current.play();
      }
    } catch {
      fileRef.current?.click();
    }
  }

  function capture() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) askImage(new File([blob], "capture.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.8);
  }

  function stopCamera() {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setCamera(false);
  }

  return (
    <div className="app-shell page-shell">
      <header className="page-topbar">
        <Link href="/" className="back-link" aria-label="Back to home">
          <ArrowLeft size={17} strokeWidth={2.1} />
        </Link>
        <div className="page-heading">
          <h1>Look closer</h1>
          <p>Use a photo or ask in your own words.</p>
        </div>
        {camera && (
          <button onClick={stopCamera} className="back-link ml-auto" aria-label="Close camera">
            <X size={17} strokeWidth={2.1} />
          </button>
        )}
      </header>

      {camera ? (
        <div className="camera-stage">
          <video ref={videoRef} playsInline aria-label="Camera preview" />
          <span className="camera-stage__corners" aria-hidden="true" />
          <button onClick={capture} className="capture-button" aria-label="Capture photo" />
        </div>
      ) : (
        <div className="capture-grid">
          <button onClick={startCamera} className="capture-option capture-option--primary pressable">
            <span className="capture-option__icon" aria-hidden="true"><Camera size={17} /></span>
            <span className="capture-option__title">Open camera</span>
          </button>
          <button onClick={() => fileRef.current?.click()} className="capture-option pressable">
            <span className="capture-option__icon" aria-hidden="true"><ImagePlus size={17} /></span>
            <span className="capture-option__title">Choose a photo</span>
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) askImage(file); }} />

      <form onSubmit={askText} className="question-box">
        <MessageCircle size={16} className="text-river" aria-hidden="true" />
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about a place, object, or food" aria-label="Ask a question" />
        <button type="submit" disabled={loading || !question.trim()} aria-label="Send question">
          <Send size={15} strokeWidth={2.2} />
        </button>
      </form>

      {loading && <div className="status-line"><Sparkles size={16} className="text-river" /><span>Putting the pieces together…</span></div>}
      {error && <p className="result-block result-block--warm mt-4 text-xs text-red-800">{error}</p>}

      {result && (
        <section className="result-card" aria-live="polite">
          <div className="result-card__header">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-river"><CheckCircle2 size={14} /> Guide note</div>
              <h2 className="mt-2">{result.title || "Your answer"}</h2>
            </div>
            <span className="result-card__confidence">{result.confidence || "Ready"}</span>
          </div>
          <p className="result-card__summary">{result.summary}</p>
          {result.cultural_significance ? <div className="result-block result-block--warm"><h3>Cultural significance</h3><p>{result.cultural_significance}</p></div> : null}
          {result.historical_context ? <div className="result-block"><h3>Historical context</h3><p>{result.historical_context}</p></div> : null}
          {result.suggested_questions?.length ? <div className="suggested-questions">{result.suggested_questions.map((suggestion: string, index: number) => <button key={index} onClick={() => setQuestion(suggestion)}>{suggestion}</button>)}</div> : null}
        </section>
      )}

      <div className="info-card">
        <div className="info-card__header"><h2>Good to know</h2><MapPin size={18} className="text-river" /></div>
        <p>YatraAI is built for the moments when a place is unfamiliar and you want a useful answer without a long search.</p>
      </div>

      <BottomNav />
    </div>
  );
}

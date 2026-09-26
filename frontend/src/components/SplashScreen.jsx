import { useEffect, useState } from "react";

/**
 * Splash screen aplikasi Tracer Study.
 * Tampil singkat saat boot, lalu fade-out. Durasi & pesan disesuaikan.
 */
const MESSAGES = [
  "Menyiapkan data tracer study...",
  "Menghubungkan ke data warehouse...",
  "Memuat dashboard OLAP...",
  "Hampir siap...",
];

export default function SplashScreen({ duration = 1900 }) {
  const [leaving, setLeaving] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const stepTimer = window.setInterval(() => {
      setStep((s) => (s + 1) % MESSAGES.length);
    }, Math.max(400, duration / MESSAGES.length));

    const leaveTimer = window.setTimeout(() => setLeaving(true), duration);
    const hideTimer = window.setTimeout(() => setHidden(true), duration + 600);

    return () => {
      window.clearInterval(stepTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, [duration]);

  if (hidden) return null;

  return (
    <div
      className={`splash ${leaving ? "splash--leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Memuat aplikasi Tracer Study"
    >
      <span className="splash__blob splash__blob--1" />
      <span className="splash__blob splash__blob--2" />

      <div className="splash__logo">
        <span className="splash__ring" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-12 w-12 text-white"
          aria-hidden="true"
        >
          <path
            d="M12 3 2 8l10 5 10-5-10-5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M5 10.5V16c0 1.7 3.1 3 7 3s7-1.3 7-3v-5.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="8" r="1.6" fill="currentColor" />
        </svg>
      </div>

      <h1 className="splash__title mt-6 text-2xl font-bold tracking-tight text-white">
        Portal Tracer Study
      </h1>

      <p className="splash__subtitle mt-2 text-sm text-blue-100/80">
        Smart Career Matching Alumni
      </p>

      <div className="splash__dots mt-6 flex items-center gap-1.5">
        <span className="splash__dot" />
        <span className="splash__dot" style={{ animationDelay: "0.15s" }} />
        <span className="splash__dot" style={{ animationDelay: "0.3s" }} />
      </div>

      <div className="splash__bar mt-5 h-1 w-56 overflow-hidden rounded-full bg-white/15">
        <div className="splash__bar-fill h-full w-full rounded-full bg-gradient-to-r from-sky-300 via-white to-amber-300" />
      </div>

      <p className="mt-3 text-xs text-blue-100/70">{MESSAGES[step]}</p>
    </div>
  );
}

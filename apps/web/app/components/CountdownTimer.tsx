"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const LAUNCH_DATE = new Date("2026-09-01T00:00:00Z");

function getTimeLeft(): TimeLeft {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const UNITS: { key: keyof TimeLeft; label: string }[] = [
  { key: "days",    label: "Days"  },
  { key: "hours",   label: "Hrs"   },
  { key: "minutes", label: "Min"   },
  { key: "seconds", label: "Sec"   },
];

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) {
    return (
      <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{
          fontFamily: "var(--mono)", fontWeight: 300,
          fontSize: 13, letterSpacing: "0.2em", color: "var(--warm)", opacity: 0.5,
        }}>
          — · — · — · —
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
      {UNITS.map(({ key, label }, i) => (
        <div key={key} style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 72 }}>
            <span style={{
              fontFamily: "var(--serif)", fontWeight: 300,
              fontSize: "clamp(40px, 6vw, 60px)",
              lineHeight: 1, color: "var(--ink)",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.02em",
            }}>
              {String(timeLeft[key]).padStart(2, "0")}
            </span>
            <span style={{
              fontFamily: "var(--mono)", fontWeight: 300,
              fontSize: 9, letterSpacing: "0.16em",
              textTransform: "uppercase", color: "var(--warm)",
            }}>
              {label}
            </span>
          </div>
          {i < UNITS.length - 1 && (
            <span aria-hidden style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(32px, 5vw, 48px)",
              lineHeight: 1,
              color: "var(--gold)",
              opacity: 0.5,
              margin: "4px 4px 0",
              userSelect: "none",
            }}>
              ·
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState, FormEvent } from "react";

type Status = "idle" | "loading" | "success";

export default function EmailSignup() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 900));
    setStatus("success");
    setEmail("");
  }

  if (status === "success") {
    return (
      <div style={{
        height: 52, display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px solid var(--hairline)", borderRadius: 100,
        background: "rgba(184,145,58,0.07)",
      }}>
        <span style={{
          fontFamily: "var(--mono)", fontWeight: 300, fontSize: 12,
          letterSpacing: "0.08em", color: "var(--gold)",
        }}>
          ↳ You&apos;re on the list.
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex", width: "100%",
        border: "1px solid var(--hairline)",
        borderRadius: 100,
        overflow: "hidden",
        background: "rgba(255,255,255,0.03)",
        transition: "border-color 0.2s",
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        style={{
          flex: 1,
          padding: "14px 22px",
          fontFamily: "var(--mono)", fontWeight: 300,
          fontSize: 13, letterSpacing: "0.03em",
          color: "var(--ink)",
          background: "transparent",
          border: "none", outline: "none",
        }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          margin: 4,
          padding: "10px 22px",
          fontFamily: "var(--mono)", fontWeight: 300,
          fontSize: 11, letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#f5f0e8",
          background: status === "loading"
            ? "rgba(200,169,94,0.5)"
            : "var(--gold)",
          border: "none",
          borderRadius: 100,
          cursor: status === "loading" ? "default" : "pointer",
          transition: "background 0.2s, opacity 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        {status === "loading" ? "…" : "Notify me"}
      </button>
    </form>
  );
}

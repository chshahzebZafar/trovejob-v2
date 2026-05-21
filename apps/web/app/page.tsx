import CountdownTimer from "./components/CountdownTimer";
import EmailSignup from "./components/EmailSignup";

const STATS = [
  { num: "1,200+", label: "Jobs Curated" },
  { num: "340+",   label: "Companies"    },
  { num: "40+",    label: "Industries"   },
];

function Logomark() {
  return (
    <svg width="30" height="30" viewBox="0 0 38 38" fill="none" aria-label="TroveJob">
      <rect x="1" y="1" width="36" height="36" stroke="var(--ink)" strokeWidth="0.8" rx="1" opacity="0.5" />
      <line x1="9" y1="12" x2="29" y2="12" stroke="var(--ink)"  strokeWidth="0.8" opacity="0.4" />
      <line x1="9" y1="19" x2="29" y2="19" stroke="var(--gold)" strokeWidth="1.5" />
      <line x1="9" y1="26" x2="29" y2="26" stroke="var(--ink)"  strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

function AmbientGlow() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{
        position: "absolute",
        width: "80vw", height: "80vw",
        maxWidth: 1000, maxHeight: 1000,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(184,145,58,0.12) 0%, transparent 60%)",
        top: "-35%", left: "-20%",
        filter: "blur(80px)",
      }} />
      <div style={{
        position: "absolute",
        width: "55vw", height: "55vw",
        maxWidth: 700, maxHeight: 700,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(184,145,58,0.08) 0%, transparent 60%)",
        bottom: "-25%", right: "-10%",
        filter: "blur(80px)",
      }} />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <AmbientGlow />

      {/* Top edge line */}
      <div aria-hidden style={{ position: "fixed", top: 0, left: 0, right: 0, height: "1px", background: "var(--hairline)", zIndex: 10 }} />

      <div style={{
        position: "relative", zIndex: 1,
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "96px 24px 72px",
      }}>

        {/* Wordmark */}
        <div className="fu d1" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
          <Logomark />
          <div style={{ width: "1px", height: 22, background: "var(--hairline)" }} />
          <span style={{
            fontFamily: "var(--mono)", fontSize: 10,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "var(--warm)",
          }}>
            TroveJob
          </span>
        </div>

        {/* Badge */}
        <div className="fu d2" style={{ marginBottom: 40 }}>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 9,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--gold)",
            border: "1px solid var(--hairline)",
            borderRadius: 100,
            padding: "7px 18px",
            background: "rgba(184,145,58,0.07)",
          }}>
            Launching Autumn 2026
          </span>
        </div>

        {/* Headline */}
        <h1 className="fu d3" style={{
          fontFamily: "var(--serif)", fontWeight: 300,
          fontSize: "clamp(54px, 10vw, 104px)",
          lineHeight: 0.93, letterSpacing: "-0.025em",
          color: "var(--ink)", textAlign: "center",
          maxWidth: 860, marginBottom: 28,
        }}>
          The place where<br />
          great work{" "}
          <em style={{ fontStyle: "italic", color: "var(--gold)" }}>finds</em>
          <br />
          great people.
        </h1>

        {/* Subtitle */}
        <p className="fu d4" style={{
          fontFamily: "var(--serif)", fontStyle: "italic",
          fontSize: "clamp(15px, 1.8vw, 18px)", lineHeight: 1.65,
          color: "var(--warm)", textAlign: "center",
          maxWidth: 420, marginBottom: 64,
        }}>
          A curated job board for people who take their craft seriously.
        </p>

        {/* Countdown */}
        <div className="fu d5" style={{ marginBottom: 56, textAlign: "center" }}>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 9,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "var(--warm)", display: "block", marginBottom: 20,
          }}>
            Launching in
          </span>
          <CountdownTimer />
        </div>

        {/* Divider */}
        <div className="fu d5" style={{ width: "100%", maxWidth: 500, height: "1px", background: "var(--hairline)", marginBottom: 44 }} />

        {/* Email */}
        <div className="fu d6" style={{ width: "100%", maxWidth: 500, marginBottom: 16 }}>
          <EmailSignup />
        </div>
        <div className="fu d6" style={{ marginBottom: 72 }}>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 10,
            letterSpacing: "0.05em", color: "var(--warm)", opacity: 0.4,
          }}>
            No spam. One email when we launch.
          </span>
        </div>

        {/* Stats */}
        <div className="fu d7" style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
          {STATS.map(({ num, label }, i) => (
            <div key={label} style={{ display: "flex", alignItems: "stretch" }}>
              <div style={{ textAlign: "center", paddingRight: 36 }}>
                <div style={{
                  fontFamily: "var(--serif)", fontWeight: 300,
                  fontSize: "clamp(22px, 3.2vw, 30px)", lineHeight: 1,
                  color: "var(--ink)", marginBottom: 6,
                }}>
                  {num}
                </div>
                <div style={{
                  fontFamily: "var(--mono)", fontSize: 9,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "var(--warm)",
                }}>
                  {label}
                </div>
              </div>
              {i < STATS.length - 1 && (
                <div style={{ width: "1px", background: "var(--hairline)", marginRight: 36, alignSelf: "stretch" }} />
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Footer */}
      <footer className="fu d8" style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid var(--hairline)",
        padding: "18px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{
          fontFamily: "var(--mono)", fontSize: 9,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: "var(--warm)", opacity: 0.35,
        }}>
          © {new Date().getFullYear()} TroveJob
        </span>
        <div style={{ display: "flex", gap: 28 }}>
          {["Twitter", "LinkedIn"].map((s) => (
            <a key={s} href="#" style={{
              fontFamily: "var(--mono)", fontSize: 9,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: "var(--warm)", opacity: 0.35, textDecoration: "none",
            }}>
              {s}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}

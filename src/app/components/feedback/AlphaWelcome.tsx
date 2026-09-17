import { useState } from "react";
export function AlphaWelcome({ userKey }: { userKey: string }) {
  const key = `irys.alphaWelcome.v1.${userKey}`;
  const [dismissed, setDismissed] = useState(() => { try { return localStorage.getItem(key) === "seen"; } catch { return false; } });
  if (dismissed) return null;
  return <aside className="rounded-2xl p-4 mx-6 mb-5" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--cream)" }}>
    <h2 style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--gold)" }}>HELP US IMPROVE IRYS</h2>
    <p className="mt-2" style={{ fontSize: 13 }}>Tell us where the current experience becomes confusing: “I tried to accomplish…” and “I got confused or stuck when…”</p>
    <p className="mt-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Feature ideas are reviewed separately. Find us at My DNA → Give Feedback.</p>
    <button className="mt-3 py-2 px-4 rounded-xl" style={{ background: "var(--gold)", color: "var(--charcoal)" }} onClick={() => { try { localStorage.setItem(key, "seen"); } catch {} setDismissed(true); }}>Got it</button>
  </aside>;
}

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../../lib/supabase";

const inputStyle = { background: "var(--surface)", color: "var(--cream)", border: "1px solid var(--border)", fontSize: 16 };

export function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function request(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/recovery` });
      if (error) throw error;
      setSent(true);
    } catch { setError("We couldn’t request a reset right now. Please wait a moment and try again."); }
    finally { setBusy(false); }
  }
  return <div className="px-6 py-8" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
    <button onClick={onBack} className="py-3" style={{ color: "var(--gold)" }}>← Sign in</button>
    <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32 }}>Reset your password</h1>
    {sent ? <p role="status" className="mt-5">If an account uses that email, you’ll receive a reset link. Check your inbox and spam folder. Open the link in this browser.</p> : <form onSubmit={request} className="flex flex-col gap-4 mt-5">
      <label>Email<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-xl mt-2" style={inputStyle} /></label>
      {error && <p role="alert">{error}</p>}
      <button disabled={busy} className="rounded-xl py-3 disabled:opacity-50" style={{ background: "var(--gold)", color: "var(--charcoal)" }}>{busy ? "Sending…" : "Send reset link"}</button>
    </form>}
  </div>;
}

// Deduplicate the one-use token exchange across React StrictMode effect mounts.
let recoveryExchange: Promise<boolean> | undefined;
function verifyRecovery() {
  if (!recoveryExchange) recoveryExchange = (async () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const hash = url.searchParams.get("token_hash");
    try {
      if (url.searchParams.has("error") || (!code && !hash)) return false;
      const result = hash && url.searchParams.get("type") === "recovery"
        ? await supabase.auth.verifyOtp({ token_hash: hash, type: "recovery" })
        : code ? await supabase.auth.exchangeCodeForSession(code) : null;
      return !!result && !result.error && !!result.data.session;
    } catch { return false; }
    finally { window.history.replaceState({}, "", "/auth/recovery"); }
  })();
  return recoveryExchange;
}

export function PasswordRecovery() {
  const [state, setState] = useState<"checking" | "ready" | "invalid" | "done">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [requestNew, setRequestNew] = useState(false);
  useEffect(() => {
    let active = true;
    verifyRecovery().then(valid => { if (active) setState(valid ? "ready" : "invalid"); });
    return () => { active = false; };
  }, []);
  async function save(event: FormEvent) {
    event.preventDefault(); setError("");
    if (password !== confirm) { setError("The passwords don’t match. Please try again."); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword(""); setConfirm(""); setState("done");
    } catch { setError("We couldn’t update your password. Try another password or request a fresh link."); }
    finally { setBusy(false); }
  }
  async function signIn() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
      window.location.assign("/");
    } catch { setError("Please try returning to sign in again."); setBusy(false); }
  }
  if (requestNew) return <ForgotPassword onBack={() => window.location.assign("/")} />;
  return <main className="min-h-dvh px-6 py-10 max-w-md mx-auto" style={{ background: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}>
    <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32 }}>Set a new password</h1>
    {state === "checking" && <p role="status" className="mt-5">Checking your reset link…</p>}
    {state === "invalid" && <div className="mt-5"><p>This reset link has expired, was already used, or couldn’t be verified in this browser.</p><button className="py-3" style={{ color: "var(--gold)" }} onClick={() => setRequestNew(true)}>Request a new reset link</button></div>}
    {state === "ready" && <form onSubmit={save} className="flex flex-col gap-4 mt-5">
      <p style={{ fontSize: 13 }}>Use at least 8 characters.</p>
      <label>New password<input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl p-3 mt-2" style={inputStyle} /></label>
      <label>Confirm new password<input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full rounded-xl p-3 mt-2" style={inputStyle} /></label>
      <button disabled={busy} className="rounded-xl py-3 disabled:opacity-50" style={{ background: "var(--gold)", color: "var(--charcoal)" }}>{busy ? "Saving…" : "Save new password"}</button>
      <button type="button" disabled={busy} onClick={() => setRequestNew(true)} style={{ color: "var(--gold)" }}>Request a fresh link</button>
    </form>}
    {state === "done" && <div role="status" className="mt-5"><p>Your password has been updated. You can sign in with it now.</p><button disabled={busy} onClick={signIn} className="w-full rounded-xl py-3 mt-5" style={{ background: "var(--gold)", color: "var(--charcoal)" }}>Return to sign in</button></div>}
    {error && <p role="alert" className="mt-4">{error}</p>}
  </main>;
}

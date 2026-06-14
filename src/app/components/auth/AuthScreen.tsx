import { useState } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { supabase } from "../../../lib/supabase";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
import { IrysAppIcon } from "../ui/IrysLogo";

const SERVER = `https://${projectId}.supabase.co/functions/v1/make-server-7dbc8ff8`;
const PROD_URL = "https://www.irysstyle.com";

interface AuthScreenProps {
  onAuth: (accessToken: string) => void;
}

type Mode = "signin" | "signup";

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google OAuth — always redirect back to irysstyle.com
  const handleGoogle = async () => {
    const redirectTo = window.location.hostname === "localhost"
      ? `http://localhost:${window.location.port || 5173}`
      : PROD_URL;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (oauthError) setError(oauthError.message);
  };

  // Email sign-in / sign-up
  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch(`${SERVER}/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Sign up failed. Please try again.");
          return;
        }
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // onAuthStateChange in App.tsx will also catch this,
      // but calling onAuth directly ensures instant navigation.
      onAuth(data.session.access_token);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !email || !password || (mode === "signup" && !name);

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--background)", fontFamily: "var(--font-body)" }}>

      {/* Editorial header */}
      <div
        className="flex flex-col items-center justify-center pt-10 pb-8 px-8"
        style={{
          background: "linear-gradient(180deg, rgba(201,169,110,0.06) 0%, transparent 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <IrysAppIcon size={60} />
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "48px", fontWeight: 400, letterSpacing: "-0.04em", lineHeight: 1, fontStyle: "italic", marginTop: 12, marginBottom: 6 }}>
          Irys
        </h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: "13px", letterSpacing: "0.02em" }}>
          Your stylist. Your style.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col px-6 pt-8 pb-10 overflow-y-auto">

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-3 mb-5 transition-all active:scale-95"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          <span style={{ color: "var(--cream)", fontSize: "14px", fontWeight: 500 }}>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          <span style={{ color: "var(--muted-foreground)", fontSize: "11px", letterSpacing: "0.1em" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl p-1 mb-5" style={{ background: "var(--surface)" }}>
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className="flex-1 py-2.5 rounded-lg transition-all"
              style={{
                background: mode === m ? "var(--gold)" : "transparent",
                color: mode === m ? "var(--charcoal)" : "var(--muted-foreground)",
                fontSize: "13px", fontWeight: 500, letterSpacing: "0.06em",
                border: "none", cursor: "pointer",
              }}
            >
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {mode === "signup" && (
            <Field label="Your Name" value={name} onChange={setName} placeholder="First name" />
          )}
          <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
          <div>
            <label style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && !isDisabled && handleSubmit()}
                className="w-full px-4 py-3 rounded-xl outline-none pr-12"
                style={{ background: "var(--surface-2)", color: "var(--cream)", border: "1px solid var(--border)", fontSize: "15px" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
              <button
                onClick={() => setShowPassword((v) => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 0 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl" style={{ background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.3)" }}>
            <p style={{ color: "#e07070", fontSize: "13px", lineHeight: 1.5 }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className="mt-6 w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{
            background: isDisabled ? "var(--surface-2)" : "var(--gold)",
            color: isDisabled ? "var(--muted-foreground)" : "var(--charcoal)",
            fontWeight: 600, border: "none",
            cursor: isDisabled ? "not-allowed" : "pointer",
            fontSize: "14px", letterSpacing: "0.04em",
          }}
        >
          {loading ? "One moment..." : mode === "signin" ? "Sign In" : "Create My Account"}
          {!loading && <ChevronRight size={18} />}
        </button>

        <p style={{ color: "var(--muted-foreground)", fontSize: "11px", textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
          Your style data is private and never shared.
        </p>

        <div className="flex items-center gap-3 mt-5">
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          <span style={{ color: "var(--muted-foreground)", fontSize: "11px", letterSpacing: "0.1em" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        </div>

        <button
          onClick={() => onAuth("guest")}
          className="mt-4 w-full py-3.5 rounded-2xl transition-all active:scale-95"
          style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: "13px", cursor: "pointer", letterSpacing: "0.04em" }}
        >
          Explore as Guest
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <div>
      <label style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl outline-none"
        style={{ background: "var(--surface-2)", color: "var(--cream)", border: "1px solid var(--border)", fontSize: "15px" }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
      />
    </div>
  );
}

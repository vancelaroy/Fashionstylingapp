import { useState, type FormEvent } from "react";
import { projectId } from "/utils/supabase/info";

export function FeedbackScreen({ accessToken, onBack }: { accessToken?: string | null; onBack: () => void }) {
  const [fields, setFields] = useState({ trying: "", stuck: "", expected: "", idea: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [submissionId] = useState(() => crypto.randomUUID());
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (status === "sending") return;
    if (!accessToken) { setError("Please sign in again to send feedback. Your text is still here."); return; }
    setStatus("sending"); setError("");
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/irys-api/feedback`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ ...fields, submissionId }),
      });
      if (!response.ok) throw new Error("submission failed");
      setStatus("sent");
    } catch { setStatus("idle"); setError("We couldn’t send that just yet. Your feedback is still here—please try again."); }
  }
  return <div className="h-full overflow-y-auto px-6 pt-8 pb-10" style={{ background: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}>
    <button onClick={onBack} disabled={status === "sending"} className="py-3 mb-3" style={{ color: "var(--gold)" }}>← My DNA</button>
    <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32 }}>Give Feedback</h1>
    {status === "sent" ? <div role="status" className="py-8">
      <p>Thank you. Your feedback is saved and helps us improve IRYS.</p>
      <button onClick={onBack} className="w-full rounded-2xl py-3 mt-6" style={{ background: "var(--gold)", color: "var(--charcoal)" }}>Back to My DNA</button>
    </div> : <form onSubmit={submit} className="flex flex-col gap-5 mt-5">
      {([{ key: "trying", label: "What were you trying to do?", placeholder: "I tried to accomplish…", required: true }, { key: "stuck", label: "Where did you get stuck or confused?", placeholder: "I got confused when…", required: true }, { key: "expected", label: "What did you expect to happen?", placeholder: "Optional", required: false }] as const).map(field => <label key={field.key} className="block" style={{ fontSize: 14 }}>{field.label}
        <textarea required={field.required} maxLength={4000} rows={3} placeholder={field.placeholder} value={fields[field.key]} onChange={e => setFields({ ...fields, [field.key]: e.target.value })} className="w-full rounded-xl p-3 mt-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", fontSize: 16 }} />
      </label>)}
      <details style={{ color: "var(--muted-foreground)", fontSize: 13 }}><summary className="py-2 cursor-pointer">Have an idea for later?</summary>
        <p className="py-2">We’re focused on improving what IRYS already does before adding new features, but you can save an idea here for us to review later.</p>
        <label>Idea for later<textarea maxLength={4000} rows={3} value={fields.idea} onChange={e => setFields({ ...fields, idea: e.target.value })} className="w-full rounded-xl p-3 mt-2" style={{ background: "var(--surface)", color: "var(--cream)", fontSize: 16 }} /></label>
      </details>
      {error && <p role="alert" style={{ color: "var(--rose)" }}>{error}</p>}
      <button disabled={status === "sending" || !fields.trying.trim() || !fields.stuck.trim()} className="w-full rounded-2xl py-3 disabled:opacity-50" style={{ background: "var(--gold)", color: "var(--charcoal)", fontWeight: 600 }}>{status === "sending" ? "Sending…" : "Send feedback"}</button>
    </form>}
  </div>;
}

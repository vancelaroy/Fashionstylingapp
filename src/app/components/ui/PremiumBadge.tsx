import { Sparkles } from "lucide-react";

interface PremiumBadgeProps {
  size?: "sm" | "md";
  label?: string;
}

export function PremiumBadge({ size = "sm", label = "Premium" }: PremiumBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full"
      style={{
        background: "linear-gradient(135deg, rgba(201,169,110,0.2) 0%, rgba(212,165,181,0.15) 100%)",
        border: "1px solid rgba(201,169,110,0.4)",
        padding: size === "sm" ? "2px 8px" : "4px 12px",
        fontSize: size === "sm" ? "9px" : "11px",
        color: "var(--gold)",
        letterSpacing: "0.08em",
        fontWeight: 600,
        textTransform: "uppercase",
      }}
    >
      <Sparkles size={size === "sm" ? 9 : 11} />
      {label}
    </span>
  );
}

interface PremiumGateProps {
  children: React.ReactNode;
  feature: string;
  betaFree?: boolean;
}

export function PremiumGate({ children, feature, betaFree = true }: PremiumGateProps) {
  // During beta, everything is free — just show the badge, don't block
  if (betaFree) return <>{children}</>;
  return (
    <div className="relative">
      <div style={{ opacity: 0.4, pointerEvents: "none" }}>{children}</div>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl gap-2"
        style={{ background: "rgba(14,13,12,0.85)", backdropFilter: "blur(4px)" }}
      >
        <Sparkles size={24} style={{ color: "var(--gold)" }} />
        <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 600 }}>Premium Feature</p>
        <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>{feature}</p>
        <button
          className="mt-2 px-4 py-2 rounded-full"
          style={{ background: "var(--gold)", color: "var(--charcoal)", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}
        >
          Upgrade ✦
        </button>
      </div>
    </div>
  );
}

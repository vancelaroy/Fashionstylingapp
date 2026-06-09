import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";

interface CaseStudyScreenProps {
  onBack?: () => void;
}

interface Section {
  id: string;
  emoji: string;
  title: string;
  content: React.ReactNode;
}

function Accordion({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        overflow: "hidden",
        marginBottom: "12px",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: "18px" }}>{section.emoji}</span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--cream)",
              fontSize: "15px",
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            {section.title}
          </span>
        </div>
        {open ? (
          <ChevronUp size={16} style={{ color: "var(--gold)", flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
        )}
      </button>

      {open && (
        <div
          className="px-5 pb-5"
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "16px",
            fontFamily: "var(--font-body)",
            color: "var(--muted-foreground)",
            fontSize: "14px",
            lineHeight: "1.75",
          }}
        >
          {section.content}
        </div>
      )}
    </div>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: "var(--gold)", fontWeight: 500 }}>{children}</span>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col items-center" style={{ flex: 1 }}>
      <span
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--gold)",
          fontSize: "22px",
          fontWeight: 600,
          lineHeight: 1.1,
        }}
      >
        {number}
      </span>
      <span
        style={{
          color: "var(--muted-foreground)",
          fontSize: "11px",
          textAlign: "center",
          marginTop: "4px",
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
    </div>
  );
}

const SECTIONS: Section[] = [
  {
    id: "hook",
    emoji: "🪞",
    title: "The Moment That Started It",
    content: (
      <p>
        You have a job interview in two hours. You open your closet and stare. Nothing feels right — too casual, too dressy, too "try-hard." You text a friend who doesn't respond. You Google "what to wear to an interview" and get a wall of generic advice written for someone who looks nothing like you. You end up picking the safe outfit — the beige blazer you always default to — and spend the whole commute second-guessing yourself.{" "}
        <Highlight>That moment of doubt costs people more than just confidence.</Highlight> It costs promotions, first impressions, and the quiet joy of knowing you showed up exactly right.
      </p>
    ),
  },
  {
    id: "problem",
    emoji: "🔓",
    title: "The Problem: Styling Is Gatekept",
    content: (
      <div className="flex flex-col gap-3">
        <p>
          A personal stylist runs <Highlight>$150–$500 per session</Highlight> — and that's before you buy a single item. For most people, that's simply not accessible. And the free alternatives (fashion magazines, Pinterest boards, influencer feeds) are designed to sell product, not solve your specific situation.
        </p>
        <p>
          The gap is especially sharp for:
        </p>
        <ul className="flex flex-col gap-2 pl-1">
          {[
            "Men who were never taught the vocabulary of dressing well",
            "People entering the workforce for the first time",
            "Anyone navigating a major life transition — new job, first date, graduation, loss",
            "Non-binary and gender-fluid individuals whose bodies and style don't fit the binary racks",
          ].map((item, i) => (
            <li key={i} className="flex gap-2">
              <span style={{ color: "var(--gold)", marginTop: "2px" }}>◆</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          Style advice, at its core, is about <Highlight>feeling seen</Highlight>. And most tools don't see you.
        </p>
      </div>
    ),
  },
  {
    id: "solution",
    emoji: "✦",
    title: "IRYS: The Solution",
    content: (
      <div className="flex flex-col gap-3">
        <p>
          IRYS is a mobile-first personal styling app that meets you exactly where you are — your body, your life moments, your budget, your wardrobe. Built for every gender, every occasion, and every person who ever stood in front of a closet feeling lost.
        </p>
        <p>The core system:</p>
        <ul className="flex flex-col gap-2 pl-1">
          {[
            "Style DNA onboarding — body type, face shape, color season, measurements — collected progressively, not as a wall of forms",
            "Iris, an AI chat stylist — gives contextual outfit advice, occasion-specific guidance, and even makes you a getting-ready playlist",
            "Virtual Closet — a Clueless-inspired digital wardrobe builder where you can construct and save full looks",
            "Scent Guide — fragrance families matched to your color season and personality",
            "Eyeglass Frame Finder — face-shape guidance for men, women, and non-binary users",
            "Daily Style Feed — outfit inspiration filtered to your exact DNA, with a 12-sign horoscope style forecast",
            "Freemium foundation — full experience free in beta; premium tier ready to unlock AI scans, stylist matching, and order import",
          ].map((item, i) => (
            <li key={i} className="flex gap-2">
              <span style={{ color: "var(--gold)", marginTop: "2px" }}>◆</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "design",
    emoji: "🎨",
    title: "Design Decisions",
    content: (
      <div className="flex flex-col gap-3">
        <p>
          Every design choice came back to one question: <Highlight>does this make someone feel welcome, not judged?</Highlight>
        </p>
        <ul className="flex flex-col gap-2 pl-1">
          {[
            "Dark editorial palette — gold, rose, cream on near-black. Luxe without exclusivity. Confident without being loud.",
            "Playfair Display + DM Sans — the warmth of a high-fashion editorial, readable at every weight.",
            "Gender-inclusive by architecture — men's body types, measurements (chest/inseam vs bust/hips), and copy are distinct paths, never afterthoughts.",
            "Progressive disclosure — we ask for 4 measurements in onboarding, not 12. Detailed fields unlock only when the user is ready.",
            "Iris, not a chatbot — she has a name, a personality, a voice. Because people open up more to a person than a form.",
            "Playlist feature — because getting dressed is a full sensory experience. Music is part of the ritual.",
            "PremiumBadge foundation — every locked feature is visible and explained, never hidden. Users know what's coming and why.",
          ].map((item, i) => (
            <li key={i} className="flex gap-2">
              <span style={{ color: "var(--rose)", marginTop: "2px" }}>◆</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "workflow",
    emoji: "⚡",
    title: "How We Built It: The Figma Make Workflow",
    content: (
      <div className="flex flex-col gap-3">
        <p>
          IRYS was built entirely inside <Highlight>Figma Make</Highlight> during the Config Makeathon. The design-to-code pipeline was:
        </p>
        <ol className="flex flex-col gap-3 pl-1">
          {[
            { step: "01", text: "Concept → prompt in Figma Make. The initial app skeleton — onboarding flow, navigation, home screen — was generated from a natural-language description of the vision." },
            { step: "02", text: "Iterative prompting for each feature: virtual closet (Clueless-inspired), scent guide, eyeglass frame finder, horoscope style feed. Each feature prompted individually, then refined in the editor." },
            { step: "03", text: "Design system tokens built directly in theme.css — no Figma file needed. Color palette, typography, and spacing established as CSS custom properties and applied globally." },
            { step: "04", text: "Gender-inclusive architecture added through targeted prompts: 'Add men's body types as a separate list', 'Change men's measurements to chest/inseam instead of bust/hips'." },
            { step: "05", text: "Iris chat engine built with a pattern-matching response system — occasion detection, gender-aware advice, playlist generation by vibe — all within the Make environment." },
            { step: "06", text: "Freemium scaffolding added last: PremiumBadge + PremiumGate components, betaFree flag defaulting to open access. Built for tomorrow's upgrade without blocking today's demo." },
          ].map(({ step, text }) => (
            <li key={step} className="flex gap-3">
              <span
                style={{
                  color: "var(--gold)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "13px",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                {step}
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    id: "impact",
    emoji: "🌍",
    title: "Impact Vision",
    content: (
      <div className="flex flex-col gap-3">
        <p>
          IRYS is built for the people who have never been the target audience of a fashion app.
        </p>
        <div
          className="rounded-xl p-4 my-2"
          style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)" }}
        >
          <p style={{ color: "var(--cream)", fontStyle: "italic", fontSize: "15px", lineHeight: 1.7 }}>
            "Leave the styling to us."
          </p>
        </div>
        <p>
          The goal isn't to sell more clothes. It's to remove the <Highlight>cognitive and emotional tax</Highlight> of getting dressed for moments that matter. Job interviews. First dates. Graduations. Funerals. Work presentations. The days when you need to walk in feeling like yourself — and your best self.
        </p>
        <p>
          When Iris is powered by a live AI model (the next step), users will be able to have real, nuanced conversations about style — the way they would with a trusted friend who happens to have a fashion degree.
        </p>
        <p>
          Style confidence isn't a luxury. <Highlight>IRYS is making it standard.</Highlight>
        </p>
      </div>
    ),
  },
];

export function CaseStudyScreen({ onBack }: CaseStudyScreenProps) {
  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--background)", fontFamily: "var(--font-body)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 pt-12 pb-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 0 }}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <p style={{ color: "var(--gold)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Config Makeathon 2026
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--cream)",
              fontSize: "22px",
              fontWeight: 600,
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            IRYS — Case Study
          </h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: "4px" }}>
            Building with Purpose Award submission
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Tagline */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{
            background: "linear-gradient(135deg, rgba(201,169,110,0.12) 0%, rgba(212,165,181,0.08) 100%)",
            border: "1px solid rgba(201,169,110,0.2)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--cream)",
              fontSize: "17px",
              fontStyle: "italic",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            "What do I wear?" is the question behind every important moment in someone's life. IRYS answers it — for everyone.
          </p>
        </div>

        {/* Stats row */}
        <div
          className="flex rounded-xl p-4 mb-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <Stat number="8" label="onboarding steps" />
          <div style={{ width: "1px", background: "var(--border)", margin: "0 12px" }} />
          <Stat number="6" label="core features" />
          <div style={{ width: "1px", background: "var(--border)", margin: "0 12px" }} />
          <Stat number="3" label="genders served" />
          <div style={{ width: "1px", background: "var(--border)", margin: "0 12px" }} />
          <Stat number="0" label="gatekeeping" />
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <Accordion key={section.id} section={section} />
        ))}

        {/* Footer */}
        <div
          className="rounded-xl p-5 mt-2 mb-8"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", textAlign: "center" }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--gold)",
              fontSize: "20px",
              fontStyle: "italic",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            IRYS
          </p>
          <p style={{ color: "var(--muted-foreground)", fontSize: "13px", lineHeight: 1.6 }}>
            Built with Figma Make · Config Makeathon 2026
          </p>
          <p style={{ color: "var(--muted-foreground)", fontSize: "12px", marginTop: "4px" }}>
            #ConfigMakeathon · @figma
          </p>
        </div>
      </div>
    </div>
  );
}

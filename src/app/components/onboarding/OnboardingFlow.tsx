import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Check, Camera } from "lucide-react";
import { IrysAppIcon } from "../ui/IrysLogo";

// ── Style Profile ─────────────────────────────────────────────────────────────

export interface StyleProfile {
  name: string;
  gender: "woman" | "man" | "nonbinary";
  bodyType: string;
  faceShape: string;
  colorSeason: string;
  stylePersonality: string[];
  measurements: { height: string; bust: string; waist: string; hips: string; inseam?: string };
  // Discovery fields
  lifestyle?: string;
  activities?: string[];
  dressingFrequency?: string;
  styleConfidence?: string;
  currentStyle?: string;
  silhouettePreference?: string;
  styleGoals?: string[];
}

interface OnboardingFlowProps {
  onComplete: (profile: StyleProfile) => void;
}

// ── Step types ────────────────────────────────────────────────────────────────

type Step =
  | "welcome"
  | "ch1-intro" | "lifestyle" | "activities" | "dressing"
  | "insight-1"
  | "ch2-intro" | "current-style" | "confidence" | "aesthetic"
  | "insight-2"
  | "ch3-intro" | "name" | "gender" | "body-type" | "color-season" | "measurements"
  | "ch4-intro" | "goals"
  | "dna-building"
  | "results";

const STEP_ORDER: Step[] = [
  "welcome",
  "ch1-intro", "lifestyle", "activities", "dressing",
  "insight-1",
  "ch2-intro", "current-style", "confidence", "aesthetic",
  "insight-2",
  "ch3-intro", "name", "gender", "body-type", "color-season", "measurements",
  "ch4-intro", "goals",
  "dna-building",
  "results",
];

// ── Data ──────────────────────────────────────────────────────────────────────

const BODY_TYPES: Record<"woman" | "man" | "nonbinary", string[]> = {
  woman: ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle", "Petite"],
  man: ["Athletic", "Rectangle", "Trapezoid", "Oval", "Triangle", "Slim"],
  nonbinary: ["Straight", "Curvy", "Athletic", "Petite", "Full", "Lean"],
};

const COLOR_SEASONS = ["Spring", "Summer", "Autumn", "Winter"];

const LIFESTYLE_OPTIONS = [
  { id: "corporate", label: "Corporate / Office", emoji: "🏢" },
  { id: "creative", label: "Creative Professional", emoji: "🎨" },
  { id: "entrepreneur", label: "Entrepreneur", emoji: "⚡" },
  { id: "student", label: "Student", emoji: "📚" },
  { id: "parent", label: "Parent / Family life", emoji: "🏠" },
  { id: "remote", label: "Remote / Freelance", emoji: "💻" },
];

const ACTIVITY_OPTIONS = [
  "Client-facing work", "Office meetings", "Creative studio",
  "Travel regularly", "Active / outdoors", "Evening social events",
  "Casual weekends", "Special occasions",
];

const DRESSING_OPTIONS = [
  { id: "mostly-casual", label: "Mostly casual — comfort first" },
  { id: "mix", label: "Mix of casual and put-together" },
  { id: "mostly-dressed", label: "Mostly dressed up — presentation matters" },
  { id: "varies", label: "It varies a lot day to day" },
];

const CURRENT_STYLE_OPTIONS = [
  { id: "classic", label: "Classic & Timeless", desc: "Clean lines, quality basics, built to last" },
  { id: "minimal", label: "Minimalist", desc: "Less is more. Understated, refined" },
  { id: "editorial", label: "Fashion-forward", desc: "Trend-aware, bold, expressive" },
  { id: "casual", label: "Casual & Relaxed", desc: "Easy-going, comfortable, effortless" },
  { id: "professional", label: "Business Professional", desc: "Polished, authoritative, sharp" },
  { id: "discovering", label: "Still discovering", desc: "I'm figuring out what feels right" },
];

const CONFIDENCE_OPTIONS = [
  { id: "low", label: "Still figuring it out", sub: "I'd love some real guidance" },
  { id: "medium", label: "Know what I like", sub: "But I want to do more with it" },
  { id: "high", label: "Very confident", sub: "I want to refine and elevate" },
];

const AESTHETIC_OPTIONS = [
  { id: "quiet-luxury", label: "Quiet Luxury", example: "The Row, Loro Piana" },
  { id: "parisian", label: "Parisian Chic", example: "Sézane, Isabel Marant" },
  { id: "streetwear", label: "Contemporary Street", example: "Palace, Stüssy, Off-White" },
  { id: "old-money", label: "Old Money", example: "Ralph Lauren, Brooks Brothers" },
  { id: "maximalist", label: "Bold & Maximalist", example: "Versace, Dolce & Gabbana" },
  { id: "indie", label: "Indie / Eclectic", example: "Vintage, thrifted, unexpected" },
];

const SILHOUETTE_OPTIONS_WOMEN = [
  "Fitted throughout", "Fitted top, relaxed bottom",
  "Relaxed top, fitted bottom", "Relaxed throughout", "Structured & tailored",
];
const SILHOUETTE_OPTIONS_MEN = [
  "Slim fit throughout", "Regular/straight fit", "Relaxed throughout",
  "Tailored & structured", "Athletic cut",
];

const GOAL_OPTIONS = [
  { id: "confidence", label: "Build confidence", emoji: "✨" },
  { id: "professional", label: "Professional wardrobe", emoji: "💼" },
  { id: "dating", label: "Dating & social", emoji: "🌹" },
  { id: "travel", label: "Travel capsule", emoji: "✈️" },
  { id: "everyday", label: "Everyday style", emoji: "🌅" },
  { id: "smarter", label: "Shop smarter", emoji: "🎯" },
  { id: "personal", label: "Find my personal style", emoji: "🔍" },
  { id: "occasions", label: "Special occasions", emoji: "🥂" },
];

const DNA_STEPS = [
  "Understanding your lifestyle",
  "Identifying your aesthetic",
  "Matching color harmony",
  "Learning your fit preferences",
  "Building your Style DNA",
  "Preparing your personal stylist",
];

// ── Insight generator ─────────────────────────────────────────────────────────

function generateInsight1(profile: Partial<StyleProfile>): { headline: string; body: string } {
  const { lifestyle, dressingFrequency, activities = [] } = profile;
  if (dressingFrequency === "mostly-casual") {
    return {
      headline: "You prioritize comfort — and that's a strength.",
      body: "People who dress for themselves first tend to develop the most authentic personal style. Iris will help you look intentional without sacrificing ease.",
    };
  }
  if (lifestyle === "corporate" || lifestyle === "entrepreneur") {
    return {
      headline: "Your appearance is part of your professional identity.",
      body: "Based on your lifestyle, building a versatile wardrobe that transitions from boardroom to social effortlessly will have the biggest impact for you.",
    };
  }
  if (activities.includes("Travel regularly")) {
    return {
      headline: "You live a life that requires your wardrobe to keep up.",
      body: "A well-curated travel capsule could eliminate decision fatigue entirely. We're already thinking about how to make that happen for you.",
    };
  }
  return {
    headline: "We're already seeing something interesting...",
    body: "Based on your lifestyle, you need a wardrobe that works hard across different contexts — and that's exactly what Iris specializes in.",
  };
}

function generateInsight2(profile: Partial<StyleProfile>): { headline: string; body: string } {
  const { styleConfidence, currentStyle } = profile;
  if (styleConfidence === "low") {
    return {
      headline: "The fact that you're here is already a step forward.",
      body: "Most people never seek help with their style — they just keep wearing the same things and wondering why they don't feel confident. You're already different.",
    };
  }
  if (currentStyle === "discovering") {
    return {
      headline: "Not knowing is the most honest answer.",
      body: "Many of our users who say they're 'still figuring it out' end up having the most distinct personal style after working with Iris. Curiosity is the real starting point.",
    };
  }
  if (currentStyle === "classic" || currentStyle === "minimal") {
    return {
      headline: "You lean toward pieces that last — not trends.",
      body: "This tells us you likely spend more thoughtfully but want to spend even more intentionally. Iris will help you build a wardrobe where every piece earns its place.",
    };
  }
  return {
    headline: "Your style identity is more formed than you think.",
    body: "The preferences you've shared already tell us a great deal about what will work for you. Your Style DNA is starting to take shape.",
  };
}

function generateDNAPersona(profile: Partial<StyleProfile>): { name: string; desc: string; colors: string[] } {
  const style = profile.currentStyle;
  const aesthetic = profile.stylePersonality?.[0] ?? "";

  if (style === "classic" || aesthetic === "quiet-luxury" || aesthetic === "old-money") {
    return { name: "The Considered Classic", desc: "Timeless, intentional, built to last. You choose quality over quantity and wear it like a quiet statement.", colors: ["#C7B38B", "#F5F2EC", "#2E2E2E", "#8F7E6A"] };
  }
  if (style === "minimal") {
    return { name: "The Refined Minimalist", desc: "Less, but better. You understand that true style is often about what you remove, not what you add.", colors: ["#161616", "#F5F2EC", "#8F88A8", "#C7B38B"] };
  }
  if (style === "editorial" || aesthetic === "maximalist") {
    return { name: "The Bold Expressionist", desc: "Fashion-forward and unapologetic. You use clothing as a form of communication and wear confidence like a second skin.", colors: ["#8F88A8", "#C7B38B", "#161616", "#4A3C5C"] };
  }
  if (style === "professional") {
    return { name: "The Authority Dresser", desc: "Sharp, polished, and intentional. Your wardrobe is an extension of how you show up in the world — and people notice.", colors: ["#2E2E2E", "#C7B38B", "#F5F2EC", "#5A5A6A"] };
  }
  return { name: "The Style Explorer", desc: "You're on a journey of discovery, and that open-minded curiosity is exactly what leads to the most authentic personal style.", colors: ["#C7B38B", "#8F88A8", "#F5F2EC", "#3A3A4A"] };
}

// ── Main component ────────────────────────────────────────────────────────────

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [profile, setProfile] = useState<Partial<StyleProfile>>({
    activities: [],
    stylePersonality: [],
    styleGoals: [],
    measurements: { height: "", bust: "", waist: "", hips: "", inseam: "" },
  });

  const step = STEP_ORDER[stepIndex];

  const advance = () => {
    setDirection(1);
    setStepIndex((i) => Math.min(i + 1, STEP_ORDER.length - 1));
  };

  const back = () => {
    setDirection(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const update = (patch: Partial<StyleProfile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  };

  const finish = () => {
    onComplete({
      name: profile.name || "Friend",
      gender: profile.gender || "woman",
      bodyType: profile.bodyType || "Rectangle",
      faceShape: profile.faceShape || "Oval",
      colorSeason: profile.colorSeason || "Autumn",
      stylePersonality: profile.stylePersonality?.length ? profile.stylePersonality : [profile.currentStyle ?? "Classic"],
      measurements: profile.measurements || { height: "", bust: "", waist: "", hips: "" },
      lifestyle: profile.lifestyle,
      activities: profile.activities,
      dressingFrequency: profile.dressingFrequency,
      styleConfidence: profile.styleConfidence,
      currentStyle: profile.currentStyle,
      silhouettePreference: profile.silhouettePreference,
      styleGoals: profile.styleGoals,
    });
  };

  const insight1 = generateInsight1(profile);
  const insight2 = generateInsight2(profile);
  const persona = generateDNAPersona(profile);

  // Progress (exclude intros/insights/special screens from count)
  const questionSteps = STEP_ORDER.filter(s => !s.includes("intro") && !s.includes("insight") && s !== "welcome" && s !== "dna-building" && s !== "results");
  const currentQuestionIndex = questionSteps.indexOf(step);
  const progress = currentQuestionIndex >= 0 ? (currentQuestionIndex + 1) / questionSteps.length : null;

  return (
    <div className="flex flex-col h-full" style={{ background: "#161616", fontFamily: "var(--font-body)", overflow: "hidden" }}>

      {/* Progress bar */}
      {progress !== null && (
        <div className="h-0.5 w-full" style={{ background: "rgba(199,179,139,0.15)" }}>
          <motion.div
            className="h-full"
            style={{ background: "var(--gold)" }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="flex-1 overflow-y-auto"
        >
          {step === "welcome" && <WelcomeScreen onNext={advance} />}

          {step === "ch1-intro" && (
            <ChapterIntro chapter={1} title="Your Lifestyle" tagline="Style begins with how you live." onNext={advance} />
          )}
          {step === "lifestyle" && (
            <ChoiceScreen
              question="What best describes your daily life?"
              options={LIFESTYLE_OPTIONS.map(o => ({ id: o.id, label: o.label, prefix: o.emoji }))}
              selected={profile.lifestyle ? [profile.lifestyle] : []}
              multi={false}
              onSelect={(v) => { update({ lifestyle: v[0] }); advance(); }}
              onBack={back}
            />
          )}
          {step === "activities" && (
            <MultiChoiceScreen
              question="Which activities are regular parts of your life?"
              sub="Select all that apply."
              options={ACTIVITY_OPTIONS}
              selected={profile.activities ?? []}
              onSelect={(v) => update({ activities: v })}
              onNext={() => { if ((profile.activities?.length ?? 0) > 0) advance(); }}
              onBack={back}
            />
          )}
          {step === "dressing" && (
            <ChoiceScreen
              question="How often do you dress with intention?"
              options={DRESSING_OPTIONS.map(o => ({ id: o.id, label: o.label }))}
              selected={profile.dressingFrequency ? [profile.dressingFrequency] : []}
              multi={false}
              onSelect={(v) => { update({ dressingFrequency: v[0] }); advance(); }}
              onBack={back}
            />
          )}

          {step === "insight-1" && (
            <InsightScreen insight={insight1} ctaLabel="Continue" onNext={advance} />
          )}

          {step === "ch2-intro" && (
            <ChapterIntro chapter={2} title="Your Style Identity" tagline="Let's discover what naturally resonates with you." onNext={advance} />
          )}
          {step === "current-style" && (
            <ChoiceScreen
              question="How would you describe your style right now?"
              options={CURRENT_STYLE_OPTIONS.map(o => ({ id: o.id, label: o.label, sub: o.desc }))}
              selected={profile.currentStyle ? [profile.currentStyle] : []}
              multi={false}
              onSelect={(v) => { update({ currentStyle: v[0] }); advance(); }}
              onBack={back}
            />
          )}
          {step === "confidence" && (
            <ChoiceScreen
              question="How would you rate your style confidence?"
              options={CONFIDENCE_OPTIONS.map(o => ({ id: o.id, label: o.label, sub: o.sub }))}
              selected={profile.styleConfidence ? [profile.styleConfidence] : []}
              multi={false}
              onSelect={(v) => { update({ styleConfidence: v[0] }); advance(); }}
              onBack={back}
            />
          )}
          {step === "aesthetic" && (
            <ChoiceScreen
              question="Which aesthetic draws you in most?"
              options={AESTHETIC_OPTIONS.map(o => ({ id: o.id, label: o.label, sub: o.example }))}
              selected={profile.stylePersonality ?? []}
              multi={false}
              onSelect={(v) => { update({ stylePersonality: v }); advance(); }}
              onBack={back}
            />
          )}

          {step === "insight-2" && (
            <InsightScreen insight={insight2} ctaLabel="Continue" onNext={advance} />
          )}

          {step === "ch3-intro" && (
            <ChapterIntro chapter={3} title="Your Fit" tagline="Great style starts with understanding your proportions." onNext={advance} />
          )}
          {step === "name" && (
            <NameScreen value={profile.name ?? ""} onChange={(v) => update({ name: v })} onNext={advance} onBack={back} />
          )}
          {step === "gender" && (
            <GenderScreen selected={profile.gender} onSelect={(v) => { update({ gender: v }); advance(); }} onBack={back} />
          )}
          {step === "body-type" && (
            <ChoiceScreen
              question="Which best describes your body shape?"
              options={(BODY_TYPES[profile.gender ?? "woman"]).map(v => ({ id: v.toLowerCase(), label: v }))}
              selected={profile.bodyType ? [profile.bodyType.toLowerCase()] : []}
              multi={false}
              onSelect={(v) => { update({ bodyType: v[0] }); advance(); }}
              onBack={back}
            />
          )}
          {step === "color-season" && (
            <ColorSeasonScreen selected={profile.colorSeason} onSelect={(v) => { update({ colorSeason: v }); advance(); }} onBack={back} />
          )}
          {step === "measurements" && (
            <MeasurementsScreen gender={profile.gender ?? "woman"} measurements={profile.measurements!} onChange={(m) => update({ measurements: m })} onNext={advance} onBack={back} />
          )}

          {step === "ch4-intro" && (
            <ChapterIntro chapter={4} title="Your Goals" tagline="Where do you want your style to take you?" onNext={advance} />
          )}
          {step === "goals" && (
            <MultiChoiceScreen
              question="What do you want Iris to help you with?"
              sub="Choose everything that matters to you."
              options={GOAL_OPTIONS.map(o => `${o.emoji} ${o.label}`)}
              selected={(profile.styleGoals ?? []).map(g => {
                const opt = GOAL_OPTIONS.find(o => o.id === g);
                return opt ? `${opt.emoji} ${opt.label}` : g;
              })}
              onSelect={(v) => update({ styleGoals: v.map(label => GOAL_OPTIONS.find(o => `${o.emoji} ${o.label}` === label)?.id ?? label) })}
              onNext={() => { if ((profile.styleGoals?.length ?? 0) > 0) advance(); }}
              onBack={back}
            />
          )}

          {step === "dna-building" && (
            <DNABuildingScreen onComplete={advance} />
          )}

          {step === "results" && (
            <ResultsScreen persona={persona} profile={profile} onFinish={finish} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Shared UI components ──────────────────────────────────────────────────────

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: "13px", padding: "0 0 20px 0", display: "flex", alignItems: "center", gap: 4 }}>
      ← Back
    </button>
  );
}

function Btn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
      style={{ background: disabled ? "var(--surface-2)" : "var(--gold)", color: disabled ? "var(--muted-foreground)" : "#161616", fontWeight: 600, fontSize: "14px", border: "none", cursor: disabled ? "not-allowed" : "pointer", letterSpacing: "0.04em" }}
    >
      {label} {!disabled && <ChevronRight size={16} />}
    </button>
  );
}

// ── Screen components ─────────────────────────────────────────────────────────

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col h-full px-6 pt-16 pb-10 justify-between">
      <div className="flex flex-col items-center text-center gap-6 mt-8">
        <IrysAppIcon size={80} />
        <div>
          <p style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12 }}>
            Welcome to
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "52px", fontWeight: 400, letterSpacing: "-0.04em", lineHeight: 1, fontStyle: "italic", marginBottom: 16 }}>
            Irys
          </h1>
          <p style={{ color: "var(--muted-foreground)", fontSize: "15px", lineHeight: 1.7, maxWidth: 300, margin: "0 auto" }}>
            Your personal style platform. Before making recommendations, Iris takes the time to truly understand who you are.
          </p>
        </div>

        <div className="w-full rounded-2xl p-5 mt-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p style={{ color: "var(--muted-foreground)", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            What to expect
          </p>
          {[
            { label: "4 short chapters", sub: "About your life, style, fit & goals" },
            { label: "Micro-insights", sub: "Real discoveries along the way" },
            { label: "Your Style DNA", sub: "A personalized profile built around you" },
          ].map(({ label, sub }) => (
            <div key={label} className="flex items-start gap-3 mb-3 last:mb-0">
              <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--gold)" }} />
              <div>
                <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 500 }}>{label}</p>
                <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 mt-8"
        style={{ background: "var(--gold)", color: "#161616", fontWeight: 600, fontSize: "16px", border: "none", cursor: "pointer", letterSpacing: "0.02em" }}
      >
        Begin Your Style Discovery <ChevronRight size={18} />
      </button>
    </div>
  );
}

function ChapterIntro({ chapter, title, tagline, onNext }: { chapter: number; title: string; tagline: string; onNext: () => void }) {
  return (
    <div className="flex flex-col h-full px-6 justify-center pb-16">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16 }}>
          Chapter {chapter}
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "44px", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
          {title}
        </h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: "16px", fontStyle: "italic", lineHeight: 1.6, maxWidth: 280 }}>
          "{tagline}"
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        onClick={onNext}
        className="mt-12 w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--cream)", fontWeight: 500, fontSize: "14px", cursor: "pointer" }}
      >
        Let's go <ChevronRight size={16} />
      </motion.button>
    </div>
  );
}

function InsightScreen({ insight, ctaLabel, onNext }: { insight: { headline: string; body: string }; ctaLabel: string; onNext: () => void }) {
  return (
    <div className="flex flex-col h-full px-6 justify-center pb-16">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <div className="rounded-2xl p-6 mb-6" style={{ background: "linear-gradient(135deg, rgba(199,179,139,0.1) 0%, rgba(143,136,168,0.08) 100%)", border: "1px solid rgba(199,179,139,0.25)" }}>
          <p style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
            ✦ Early Insight
          </p>
          <h3 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "26px", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
            {insight.headline}
          </h3>
          <p style={{ color: "var(--muted-foreground)", fontSize: "14px", lineHeight: 1.7 }}>
            {insight.body}
          </p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <Btn label={ctaLabel} onClick={onNext} />
      </motion.div>
    </div>
  );
}

interface ChoiceOption { id: string; label: string; sub?: string; prefix?: string }

function ChoiceScreen({ question, options, selected, multi, onSelect, onBack }: {
  question: string; options: ChoiceOption[]; selected: string[]; multi: boolean;
  onSelect: (v: string[]) => void; onBack: () => void;
}) {
  const toggle = (id: string) => {
    if (multi) {
      onSelect(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    } else {
      onSelect([id]);
    }
  };

  return (
    <div className="flex flex-col px-6 pt-8 pb-10">
      <BackButton onBack={onBack} />
      <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "30px", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 24 }}>
        {question}
      </h2>
      <div className="flex flex-col gap-2.5">
        {options.map(({ id, label, sub, prefix }) => {
          const isSelected = selected.includes(id);
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-all active:scale-98"
              style={{
                background: isSelected ? "rgba(199,179,139,0.12)" : "var(--surface)",
                border: `1px solid ${isSelected ? "var(--gold)" : "var(--border)"}`,
                cursor: "pointer",
              }}
            >
              {prefix && <span style={{ fontSize: "18px", flexShrink: 0 }}>{prefix}</span>}
              <div className="flex-1">
                <p style={{ color: isSelected ? "var(--gold)" : "var(--cream)", fontSize: "14px", fontWeight: isSelected ? 500 : 400 }}>{label}</p>
                {sub && <p style={{ color: "var(--muted-foreground)", fontSize: "12px", marginTop: 2 }}>{sub}</p>}
              </div>
              {isSelected && <Check size={14} style={{ color: "var(--gold)", flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiChoiceScreen({ question, sub, options, selected, onSelect, onNext, onBack }: {
  question: string; sub?: string; options: string[]; selected: string[];
  onSelect: (v: string[]) => void; onNext: () => void; onBack: () => void;
}) {
  const toggle = (opt: string) => {
    onSelect(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt]);
  };

  return (
    <div className="flex flex-col px-6 pt-8 pb-10">
      <BackButton onBack={onBack} />
      <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "30px", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 6 }}>
        {question}
      </h2>
      {sub && <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginBottom: 20 }}>{sub}</p>}
      <div className="flex flex-wrap gap-2 mb-8">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button key={opt} onClick={() => toggle(opt)}
              className="px-4 py-2.5 rounded-full transition-all active:scale-95"
              style={{ background: isSelected ? "rgba(199,179,139,0.15)" : "var(--surface)", border: `1px solid ${isSelected ? "var(--gold)" : "var(--border)"}`, color: isSelected ? "var(--gold)" : "var(--muted-foreground)", fontSize: "13px", fontWeight: isSelected ? 500 : 400, cursor: "pointer" }}>
              {opt}
            </button>
          );
        })}
      </div>
      <Btn label={`Continue (${selected.length} selected)`} onClick={onNext} disabled={selected.length === 0} />
    </div>
  );
}

function NameScreen({ value, onChange, onNext, onBack }: { value: string; onChange: (v: string) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col px-6 pt-8 pb-10">
      <BackButton onBack={onBack} />
      <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "34px", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 8 }}>
        What should we call you?
      </h2>
      <p style={{ color: "var(--muted-foreground)", fontSize: "14px", marginBottom: 32 }}>
        Iris likes to make things personal.
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your first name"
        autoFocus
        className="w-full px-4 py-4 rounded-xl outline-none mb-8"
        style={{ background: "var(--surface-2)", color: "var(--cream)", border: "1px solid var(--border)", fontSize: "18px", fontFamily: "var(--font-body)" }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
        onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) onNext(); }}
      />
      <Btn label="Continue" onClick={onNext} disabled={!value.trim()} />
    </div>
  );
}

function GenderScreen({ selected, onSelect, onBack }: { selected?: string; onSelect: (v: "woman" | "man" | "nonbinary") => void; onBack: () => void }) {
  const options: { id: "woman" | "man" | "nonbinary"; label: string; sub: string }[] = [
    { id: "woman", label: "Woman", sub: "Style recommendations for women's fashion" },
    { id: "man", label: "Man", sub: "Style recommendations for men's fashion" },
    { id: "nonbinary", label: "Non-binary / Other", sub: "Gender-inclusive styling for everyone" },
  ];
  return (
    <div className="flex flex-col px-6 pt-8 pb-10">
      <BackButton onBack={onBack} />
      <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "34px", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 8 }}>
        How do you identify your style?
      </h2>
      <p style={{ color: "var(--muted-foreground)", fontSize: "14px", marginBottom: 24 }}>
        This shapes your body type options, vocabulary, and recommendations.
      </p>
      <div className="flex flex-col gap-3">
        {options.map(({ id, label, sub }) => {
          const isSelected = selected === id;
          return (
            <button key={id} onClick={() => onSelect(id)}
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-all"
              style={{ background: isSelected ? "rgba(199,179,139,0.12)" : "var(--surface)", border: `1px solid ${isSelected ? "var(--gold)" : "var(--border)"}`, cursor: "pointer" }}>
              <div className="flex-1">
                <p style={{ color: isSelected ? "var(--gold)" : "var(--cream)", fontSize: "15px", fontWeight: isSelected ? 500 : 400 }}>{label}</p>
                <p style={{ color: "var(--muted-foreground)", fontSize: "12px", marginTop: 2 }}>{sub}</p>
              </div>
              {isSelected && <Check size={14} style={{ color: "var(--gold)" }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColorSeasonScreen({ selected, onSelect, onBack }: { selected?: string; onSelect: (v: string) => void; onBack: () => void }) {
  const descriptions: Record<string, string> = {
    Spring: "Warm, clear, light — golden undertones",
    Summer: "Cool, muted, light — dusty and soft",
    Autumn: "Warm, rich, earthy — deep and muted",
    Winter: "Cool, clear, intense — high contrast",
  };
  return (
    <div className="flex flex-col px-6 pt-8 pb-10">
      <BackButton onBack={onBack} />
      <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "34px", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 8 }}>
        Which season matches your natural coloring?
      </h2>
      <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginBottom: 24, lineHeight: 1.5 }}>
        Think about your skin undertone, hair, and eye color together.
      </p>
      <div className="flex flex-col gap-3">
        {COLOR_SEASONS.map((season) => {
          const isSelected = selected?.toLowerCase() === season.toLowerCase();
          return (
            <button key={season} onClick={() => onSelect(season.toLowerCase())}
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-all"
              style={{ background: isSelected ? "rgba(199,179,139,0.12)" : "var(--surface)", border: `1px solid ${isSelected ? "var(--gold)" : "var(--border)"}`, cursor: "pointer" }}>
              <div className="flex-1">
                <p style={{ color: isSelected ? "var(--gold)" : "var(--cream)", fontSize: "15px", fontWeight: isSelected ? 500 : 400 }}>{season}</p>
                <p style={{ color: "var(--muted-foreground)", fontSize: "12px", marginTop: 2 }}>{descriptions[season]}</p>
              </div>
              {isSelected && <Check size={14} style={{ color: "var(--gold)" }} />}
            </button>
          );
        })}
      </div>
      <p style={{ color: "var(--muted-foreground)", fontSize: "11px", marginTop: 16, textAlign: "center" }}>
        Not sure? Iris will refine this over time.
      </p>
    </div>
  );
}

function MeasurementsScreen({ gender, measurements, onChange, onNext, onBack }: {
  gender: string;
  measurements: { height: string; bust: string; waist: string; hips: string; inseam?: string };
  onChange: (m: { height: string; bust: string; waist: string; hips: string; inseam?: string }) => void;
  onNext: () => void; onBack: () => void;
}) {
  const fields = gender === "man"
    ? [
        { key: "height" as const, label: "Height", placeholder: "e.g. 6'1\" or 185cm" },
        { key: "bust" as const, label: "Chest", placeholder: "e.g. 40\" or 101cm" },
        { key: "waist" as const, label: "Waist", placeholder: "e.g. 32\" or 81cm" },
        { key: "inseam" as const, label: "Inseam", placeholder: "e.g. 32\" or 81cm" },
      ]
    : gender === "nonbinary"
    ? [
        { key: "height" as const, label: "Height", placeholder: "e.g. 5'9\" or 175cm" },
        { key: "bust" as const, label: "Chest / Bust", placeholder: "e.g. 36\" or 91cm" },
        { key: "waist" as const, label: "Waist", placeholder: "e.g. 30\" or 76cm" },
        { key: "inseam" as const, label: "Inseam", placeholder: "e.g. 30\" or 76cm" },
      ]
    : [
        { key: "height" as const, label: "Height", placeholder: "e.g. 5'6\" or 168cm" },
        { key: "bust" as const, label: "Bust", placeholder: "e.g. 36\" or 91cm" },
        { key: "waist" as const, label: "Waist", placeholder: "e.g. 28\" or 71cm" },
        { key: "hips" as const, label: "Hips", placeholder: "e.g. 38\" or 96cm" },
      ];

  return (
    <div className="flex flex-col px-6 pt-8 pb-10">
      <BackButton onBack={onBack} />
      <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "34px", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 8 }}>
        Your measurements
      </h2>
      <p style={{ color: "var(--muted-foreground)", fontSize: "14px", marginBottom: 8 }}>
        Optional — but the more Iris knows, the more precise she gets.
      </p>
      <div className="rounded-xl px-4 py-3 mb-6 flex items-center gap-3" style={{ background: "rgba(199,179,139,0.06)", border: "1px solid var(--border)" }}>
        <Camera size={14} style={{ color: "var(--gold)", flexShrink: 0 }} />
        <p style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>AI body scan coming soon — skip for now and fill in later</p>
      </div>
      <div className="flex flex-col gap-4 mb-8">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
            <input
              type="text"
              value={(measurements as Record<string, string>)[key] ?? ""}
              onChange={(e) => onChange({ ...measurements, [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={{ background: "var(--surface-2)", color: "var(--cream)", border: "1px solid var(--border)", fontSize: "14px" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            />
          </div>
        ))}
      </div>
      <Btn label="Build My Style DNA" onClick={onNext} />
      <button onClick={onNext} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: "13px", textAlign: "center", marginTop: 12 }}>
        Skip for now
      </button>
    </div>
  );
}

function DNABuildingScreen({ onComplete }: { onComplete: () => void }) {
  const [completed, setCompleted] = useState<number[]>([]);

  useState(() => {
    DNA_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setCompleted(prev => [...prev, i]);
        if (i === DNA_STEPS.length - 1) {
          setTimeout(onComplete, 800);
        }
      }, 700 + i * 900);
    });
  });

  return (
    <div className="flex flex-col h-full items-center justify-center px-8 pb-16">
      <div className="mb-10 text-center">
        <IrysAppIcon size={72} />
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "28px", fontWeight: 400, letterSpacing: "-0.02em", marginTop: 16, marginBottom: 6 }}>
          Building Your Style DNA
        </h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>
          This only takes a moment.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        {DNA_STEPS.map((step, i) => {
          const isDone = completed.includes(i);
          const isActive = !isDone && completed.length === i;
          return (
            <motion.div
              key={step}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: isDone || isActive ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4"
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ background: isDone ? "var(--gold)" : isActive ? "rgba(199,179,139,0.2)" : "var(--surface-2)", border: isDone ? "none" : "1px solid var(--border)", transition: "all 0.3s" }}>
                {isDone ? <Check size={12} style={{ color: "#161616" }} /> : (
                  isActive ? <div className="w-2 h-2 rounded-full" style={{ background: "var(--gold)", animation: "pulse 1s ease-in-out infinite" }} /> : null
                )}
              </div>
              <p style={{ color: isDone ? "var(--cream)" : isActive ? "var(--cream)" : "var(--muted-foreground)", fontSize: "14px", fontWeight: isDone ? 500 : 400, transition: "all 0.3s" }}>
                {step}
                {i === DNA_STEPS.length - 1 && isDone && <span style={{ color: "var(--gold)" }}> ✦</span>}
              </p>
            </motion.div>
          );
        })}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
    </div>
  );
}

function ResultsScreen({ persona, profile, onFinish }: { persona: { name: string; desc: string; colors: string[] }; profile: Partial<StyleProfile>; onFinish: () => void }) {
  return (
    <div className="flex flex-col px-6 pt-10 pb-10">
      <div className="text-center mb-8">
        <p style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12 }}>
          Your Style DNA
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "36px", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 10 }}>
          {persona.name}
        </h2>
        <p style={{ color: "var(--muted-foreground)", fontSize: "14px", lineHeight: 1.7, maxWidth: 300, margin: "0 auto" }}>
          {persona.desc}
        </p>
      </div>

      {/* Color direction */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <p style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Color Direction</p>
        <div className="flex gap-3">
          {persona.colors.map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-xl" style={{ background: c }} />
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { label: "Primary Aesthetic", value: profile.stylePersonality?.[0]?.replace(/-/g, " ") ?? "Classic" },
          { label: "Style Confidence", value: profile.styleConfidence === "high" ? "High" : profile.styleConfidence === "medium" ? "Growing" : "Building" },
          { label: "Color Season", value: profile.colorSeason ? profile.colorSeason.charAt(0).toUpperCase() + profile.colorSeason.slice(1) : "Autumn" },
          { label: "Goals Set", value: `${profile.styleGoals?.length ?? 0} selected` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
            <p style={{ color: "var(--gold)", fontSize: "14px", fontWeight: 500, textTransform: "capitalize" }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4 mb-6" style={{ background: "rgba(199,179,139,0.06)", border: "1px solid rgba(199,179,139,0.2)" }}>
        <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.6 }}>
          <span style={{ color: "var(--cream)" }}>Iris is ready for you.</span> Your full style analysis, personalized outfit recommendations, and wardrobe guidance are waiting inside.
        </p>
      </div>

      <button
        onClick={onFinish}
        className="w-full py-5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{ background: "var(--gold)", color: "#161616", fontWeight: 600, fontSize: "16px", border: "none", cursor: "pointer", letterSpacing: "0.02em" }}
      >
        Meet Iris <ChevronRight size={18} />
      </button>
    </div>
  );
}

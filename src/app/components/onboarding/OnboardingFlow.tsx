import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, ChevronRight, Check, Sparkles, Ruler, Palette, Upload, Info, X } from "lucide-react";
import { PremiumBadge } from "../ui/PremiumBadge";
import { IrysAppIcon } from "../ui/IrysLogo";

interface OnboardingFlowProps {
  onComplete: (profile: StyleProfile) => void;
}

export interface StyleProfile {
  name: string;
  gender: "woman" | "man" | "nonbinary";
  bodyType: string;
  faceShape: string;
  colorSeason: string;
  stylePersonality: string[];
  measurements: { height: string; bust: string; waist: string; hips: string; inseam?: string };
}

const BODY_TYPES_WOMEN = [
  { id: "hourglass", label: "Hourglass", desc: "Balanced bust & hips, defined waist", icon: "⧖" },
  { id: "pear", label: "Pear", desc: "Hips wider than shoulders", icon: "🍐" },
  { id: "apple", label: "Apple", desc: "Broader midsection, slender legs", icon: "🍎" },
  { id: "rectangle", label: "Rectangle", desc: "Shoulders, waist & hips similar", icon: "▬" },
  { id: "inverted-triangle", label: "Inverted Triangle", desc: "Broad shoulders, narrow hips", icon: "▽" },
  { id: "petite", label: "Petite", desc: "Smaller frame, under 5'4\"", icon: "✦" },
];

const BODY_TYPES_MEN = [
  { id: "athletic", label: "Athletic", desc: "Broad shoulders, defined waist, muscular", icon: "▽" },
  { id: "rectangle", label: "Rectangle", desc: "Consistent width shoulder to hip", icon: "▬" },
  { id: "trapezoid", label: "Trapezoid", desc: "Broad shoulders, slight waist taper", icon: "⌂" },
  { id: "oval", label: "Oval", desc: "Broader midsection, narrower shoulders", icon: "◯" },
  { id: "triangle", label: "Triangle", desc: "Narrower shoulders, wider hips", icon: "△" },
  { id: "slim", label: "Slim", desc: "Lean frame with minimal curves", icon: "∣" },
];

const FACE_SHAPES = [
  { id: "oval", label: "Oval", desc: "Balanced, slightly longer than wide" },
  { id: "round", label: "Round", desc: "Equal width and length, soft angles" },
  { id: "square", label: "Square", desc: "Strong jaw, angular features" },
  { id: "heart", label: "Heart", desc: "Wider forehead, pointed chin" },
  { id: "diamond", label: "Diamond", desc: "High cheekbones, narrow chin" },
  { id: "oblong", label: "Oblong", desc: "Long and narrow with straight sides" },
];

const COLOR_SEASONS = [
  { id: "spring", label: "Spring", desc: "Warm, clear, light undertones", palette: ["#FFD4A3", "#FF8C69", "#FFC1CC", "#FFFACD"], temp: "Warm" },
  { id: "summer", label: "Summer", desc: "Cool, muted, light undertones", palette: ["#B0C4DE", "#DDA0DD", "#F0E6FF", "#C9E4DE"], temp: "Cool" },
  { id: "autumn", label: "Autumn", desc: "Warm, muted, deep undertones", palette: ["#CD853F", "#8B4513", "#6B8E23", "#D2691E"], temp: "Warm" },
  { id: "winter", label: "Winter", desc: "Cool, clear, deep undertones", palette: ["#1C1C2E", "#DC143C", "#4169E1", "#FFFFFF"], temp: "Cool" },
];

const STYLE_PERSONALITIES_WOMEN = [
  "Classic", "Romantic", "Casual Chic", "Bohemian", "Minimalist",
  "Edgy", "Preppy", "Athleisure", "Maximalist", "Cottagecore",
];

const STYLE_PERSONALITIES_MEN = [
  "Classic", "Streetwear", "Smart Casual", "Minimalist", "Workwear",
  "Preppy", "Rugged", "Athleisure", "Avant-Garde", "Coastal",
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<StyleProfile>>({
    gender: undefined,
    stylePersonality: [],
    measurements: { height: "", bust: "", waist: "", hips: "" },
  });
  const [direction, setDirection] = useState(1);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const totalSteps = 8; // welcome, name, gender, body, face, color, style, measurements, complete
  const advance = () => { setDirection(1); setStep((s) => s + 1); };
  const back = () => { setDirection(-1); setStep((s) => s - 1); };

  const bodyTypes = profile.gender === "man" ? BODY_TYPES_MEN : BODY_TYPES_WOMEN;
  const stylePersonalities = profile.gender === "man" ? STYLE_PERSONALITIES_MEN : STYLE_PERSONALITIES_WOMEN;

  const togglePersonality = (p: string) => {
    setProfile((prev) => {
      const current = prev.stylePersonality || [];
      return {
        ...prev,
        stylePersonality: current.includes(p)
          ? current.filter((x) => x !== p)
          : current.length < 3 ? [...current, p] : current,
      };
    });
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  const stepProgress = Math.max(0, step - 1);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
      {/* Progress */}
      {step > 0 && step < totalSteps && (
        <div className="px-6 pt-12 pb-4 flex gap-1.5">
          {Array.from({ length: totalSteps - 2 }).map((_, i) => (
            <div
              key={i}
              className="h-0.5 flex-1 rounded-full transition-all duration-500"
              style={{ background: i < stepProgress ? "var(--gold)" : "var(--surface-2)" }}
            />
          ))}
        </div>
      )}

      {/* Tooltip overlay */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center px-8"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setTooltip(null)}
          >
            <div className="rounded-2xl p-6 w-full" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between mb-3">
                <p style={{ color: "var(--gold)", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}>What's this?</p>
                <X size={16} style={{ color: "var(--muted-foreground)" }} />
              </div>
              <p style={{ color: "var(--cream)", fontSize: "14px", lineHeight: 1.6 }}>{tooltip}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 overflow-y-auto"
          >
            {step === 0 && <WelcomeStep onNext={advance} />}
            {step === 1 && (
              <NameStep
                value={profile.name || ""}
                onChange={(name) => setProfile((p) => ({ ...p, name }))}
                onNext={advance} onBack={back}
              />
            )}
            {step === 2 && (
              <GenderStep
                selected={profile.gender}
                onSelect={(gender) => {
                  setProfile((p) => ({ ...p, gender, bodyType: undefined, stylePersonality: [] }));
                }}
                onNext={advance} onBack={back}
                name={profile.name}
              />
            )}
            {step === 3 && (
              <BodyTypeStep
                bodyTypes={bodyTypes}
                selected={profile.bodyType}
                gender={profile.gender || "woman"}
                onSelect={(bodyType) => setProfile((p) => ({ ...p, bodyType }))}
                onNext={advance} onBack={back}
                onTooltip={setTooltip}
              />
            )}
            {step === 4 && (
              <FaceShapeStep
                selected={profile.faceShape}
                onSelect={(faceShape) => setProfile((p) => ({ ...p, faceShape }))}
                onNext={advance} onBack={back}
                onTooltip={setTooltip}
              />
            )}
            {step === 5 && (
              <ColorSeasonStep
                selected={profile.colorSeason}
                onSelect={(colorSeason) => setProfile((p) => ({ ...p, colorSeason }))}
                onNext={advance} onBack={back}
                onTooltip={setTooltip}
              />
            )}
            {step === 6 && (
              <StylePersonalityStep
                personalities={stylePersonalities}
                selected={profile.stylePersonality || []}
                onToggle={togglePersonality}
                onNext={advance} onBack={back}
              />
            )}
            {step === 7 && (
              <MeasurementsStep
                gender={profile.gender || "woman"}
                measurements={profile.measurements || { height: "", bust: "", waist: "", hips: "" }}
                onChange={(measurements) => setProfile((p) => ({ ...p, measurements }))}
                onNext={advance} onBack={back}
              />
            )}
            {step === 8 && (
              <CompleteStep profile={profile} onFinish={() => onComplete(profile as StyleProfile)} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Step: Welcome ─────────────────────────────────────────── */
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col h-full px-6 pt-16 pb-10">
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <img
              src="https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?w=600&h=800&fit=crop&auto=format"
              alt="Fashion editorial"
              className="w-full rounded-2xl object-cover"
              style={{ height: 300 }}
            />
          </div>
          <p style={{ color: "var(--gold)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            Your personal stylist
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "42px", lineHeight: 1.05, fontWeight: 400, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Style is <em style={{ color: "var(--gold)" }}>who</em> you are.
          </h1>
          <p style={{ color: "var(--muted-foreground)", lineHeight: 1.6, fontSize: "14px", marginBottom: 32 }}>
            3-minute setup. AI-powered analysis. Whether you're new to fashion or a seasoned dresser — we've got you.
          </p>
          <div className="flex gap-4 mb-8">
            {["Color Analysis", "Body Type", "Scent Match"].map((f) => (
              <div key={f} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(201,169,110,0.15)" }}>
                  <Sparkles size={13} style={{ color: "var(--gold)" }} />
                </div>
                <span style={{ fontSize: "10px", color: "var(--muted-foreground)", textAlign: "center" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={onNext}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98"
          style={{ background: "var(--gold)", color: "var(--charcoal)", fontWeight: 600, border: "none", cursor: "pointer" }}
        >
          Begin Your Style Journey <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

/* ─── Step: Name ─────────────────────────────────────────────── */
function NameStep({ value, onChange, onNext, onBack }: { value: string; onChange: (v: string) => void; onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col px-6 pt-8 pb-10 h-full">
      <BackButton onBack={onBack} />
      <div className="flex-1">
        <StepLabel step="1 of 7" />
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "34px", lineHeight: 1.1, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 8 }}>
          What should we call you?
        </h2>
        <p style={{ color: "var(--muted-foreground)", marginBottom: 40, fontSize: "14px" }}>Your stylist needs a name to personalize your experience.</p>
        <input
          type="text" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="Your first name" autoFocus
          className="w-full px-4 py-4 rounded-xl outline-none"
          style={{ background: "var(--surface-2)", color: "var(--cream)", border: "1px solid var(--border)", fontSize: "18px", fontFamily: "var(--font-body)" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
      </div>
      <ContinueButton onNext={onNext} disabled={!value.trim()} />
    </div>
  );
}

/* ─── Step: Gender ───────────────────────────────────────────── */
function GenderStep({ selected, onSelect, onNext, onBack, name }: {
  selected?: string; onSelect: (g: "woman" | "man" | "nonbinary") => void;
  onNext: () => void; onBack: () => void; name?: string;
}) {
  const options: { id: "woman" | "man" | "nonbinary"; label: string; emoji: string; desc: string }[] = [
    { id: "woman", label: "Woman", emoji: "✦", desc: "Style recommendations for women's fashion" },
    { id: "man", label: "Man", emoji: "◈", desc: "Style recommendations for men's fashion" },
    { id: "nonbinary", label: "Non-binary / Other", emoji: "◇", desc: "Gender-inclusive styling for everyone" },
  ];

  return (
    <div className="flex flex-col px-6 pt-8 pb-10">
      <BackButton onBack={onBack} />
      <StepLabel step="2 of 7" />
      <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "34px", lineHeight: 1.1, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 6 }}>
        {name ? `${name}, how do` : "How do"} you<br />identify your style?
      </h2>
      <p style={{ color: "var(--muted-foreground)", marginBottom: 32, fontSize: "14px", lineHeight: 1.5 }}>
        This shapes your body type options, vocabulary, and recommendations. You can update this anytime.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className="flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-200"
              style={{
                background: isSelected ? "rgba(201,169,110,0.1)" : "var(--surface)",
                border: `1.5px solid ${isSelected ? "var(--gold)" : "var(--border)"}`,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "24px", color: "var(--gold)" }}>{opt.emoji}</span>
              <div className="flex-1">
                <p style={{ color: isSelected ? "var(--gold)" : "var(--cream)", fontWeight: 600, fontSize: "16px", marginBottom: 2 }}>
                  {opt.label}
                </p>
                <p style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>{opt.desc}</p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--gold)" }}>
                  <Check size={11} style={{ color: "var(--charcoal)" }} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <ContinueButton onNext={onNext} disabled={!selected} />
    </div>
  );
}

/* ─── Step: Body Type ────────────────────────────────────────── */
function BodyTypeStep({ bodyTypes, selected, gender, onSelect, onNext, onBack, onTooltip }: {
  bodyTypes: typeof BODY_TYPES_WOMEN;
  selected?: string; gender: string;
  onSelect: (id: string) => void; onNext: () => void; onBack: () => void;
  onTooltip: (msg: string) => void;
}) {
  const [scanMode, setScanMode] = useState<null | "camera" | "upload">(null);

  const tooltipText = gender === "man"
    ? "Body type helps us recommend fits and silhouettes that flatter your natural shape. For example, Athletic types look great in slim-fit trousers that taper at the ankle. Rectangle types can add definition with structured blazers."
    : "Body type helps us recommend cuts and silhouettes that celebrate your shape. For example, Pear shapes look stunning in A-line skirts and wide-leg trousers. Hourglass figures can wear almost any silhouette!";

  return (
    <div className="flex flex-col px-6 pt-8 pb-10">
      <BackButton onBack={onBack} />
      <div className="flex items-center gap-2 mb-1">
        <StepLabel step="3 of 7" />
        <button onClick={() => onTooltip(tooltipText)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <Info size={13} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "34px", lineHeight: 1.1, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 6 }}>
        Your body type
      </h2>
      <p style={{ color: "var(--muted-foreground)", marginBottom: 20, fontSize: "13px" }}>
        Not sure? Use our AI scan — or browse the options below.
      </p>

      {/* AI scan / upload options */}
      <div className="flex gap-2 mb-6">
        {[
          { mode: "camera" as const, icon: <Camera size={14} />, label: "AI Body Scan" },
          { mode: "upload" as const, icon: <Upload size={14} />, label: "Upload Photo" },
        ].map(({ mode, icon, label }) => (
          <button
            key={mode}
            onClick={() => setScanMode(scanMode === mode ? null : mode)}
            className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
            style={{
              background: scanMode === mode ? "rgba(201,169,110,0.12)" : "var(--surface)",
              border: `1px solid ${scanMode === mode ? "var(--gold)" : "var(--border)"}`,
              color: scanMode === mode ? "var(--gold)" : "var(--muted-foreground)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            {icon}
            <span className="flex-1 text-left">{label}</span>
            <PremiumBadge />
          </button>
        ))}
      </div>

      {/* Scan/Upload panel */}
      <AnimatePresence>
        {scanMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-5"
          >
            <div
              className="rounded-2xl flex flex-col items-center justify-center gap-3 py-10"
              style={{ background: "var(--surface)", border: "2px dashed rgba(201,169,110,0.3)" }}
            >
              {scanMode === "camera" ? (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(201,169,110,0.12)" }}>
                    <Camera size={28} style={{ color: "var(--gold)" }} />
                  </div>
                  <p style={{ color: "var(--cream)", fontSize: "14px", fontWeight: 500 }}>Take a full-body photo</p>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "12px", textAlign: "center", maxWidth: 220 }}>
                    Stand 6 feet from camera in fitted clothing. AI will detect your body type instantly.
                  </p>
                  <button className="px-5 py-2.5 rounded-xl" style={{ background: "var(--gold)", color: "var(--charcoal)", fontWeight: 600, fontSize: "13px", border: "none", cursor: "pointer" }}>
                    Open Camera
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(201,169,110,0.12)" }}>
                    <Upload size={28} style={{ color: "var(--gold)" }} />
                  </div>
                  <p style={{ color: "var(--cream)", fontSize: "14px", fontWeight: 500 }}>Upload a full-body photo</p>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "12px", textAlign: "center", maxWidth: 220 }}>
                    A clear photo in fitted clothing works best. Analysed privately on your device.
                  </p>
                  <button className="px-5 py-2.5 rounded-xl" style={{ background: "var(--gold)", color: "var(--charcoal)", fontWeight: 600, fontSize: "13px", border: "none", cursor: "pointer" }}>
                    Choose Photo
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p style={{ color: "var(--muted-foreground)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
        Or select manually
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {bodyTypes.map((item) => {
          const isSelected = selected === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="text-left p-4 rounded-xl transition-all duration-200"
              style={{
                background: isSelected ? "rgba(201,169,110,0.12)" : "var(--surface)",
                border: `1px solid ${isSelected ? "var(--gold)" : "var(--border)"}`,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "20px", display: "block", marginBottom: 8 }}>{item.icon}</span>
              <p style={{ color: isSelected ? "var(--gold)" : "var(--cream)", fontWeight: 500, marginBottom: 2, fontSize: "13px" }}>{item.label}</p>
              <p style={{ color: "var(--muted-foreground)", fontSize: "11px", lineHeight: 1.4 }}>{item.desc}</p>
            </button>
          );
        })}
      </div>

      <ContinueButton onNext={onNext} disabled={!selected} />
    </div>
  );
}

/* ─── Step: Face Shape ───────────────────────────────────────── */
function FaceShapeStep({ selected, onSelect, onNext, onBack, onTooltip }: {
  selected?: string; onSelect: (id: string) => void;
  onNext: () => void; onBack: () => void; onTooltip: (msg: string) => void;
}) {
  const [scanMode, setScanMode] = useState<null | "camera" | "upload">(null);

  return (
    <div className="flex flex-col px-6 pt-8 pb-10">
      <BackButton onBack={onBack} />
      <div className="flex items-center gap-2 mb-1">
        <StepLabel step="4 of 7" />
        <button onClick={() => onTooltip("Face shape determines which glasses frames, hairstyles, and jewelry shapes complement your features best. Oval faces are balanced — almost any style works. Square faces benefit from softer, rounded shapes to contrast the jawline.")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <Info size={13} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "34px", lineHeight: 1.1, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 6 }}>
        Your face shape
      </h2>
      <p style={{ color: "var(--muted-foreground)", marginBottom: 20, fontSize: "13px" }}>
        Helps match glasses frames, accessories & more.
      </p>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setScanMode(scanMode === "camera" ? null : "camera")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all"
          style={{
            background: scanMode === "camera" ? "rgba(212,165,181,0.12)" : "var(--surface)",
            border: `1px solid ${scanMode === "camera" ? "var(--rose)" : "var(--border)"}`,
            color: scanMode === "camera" ? "var(--rose)" : "var(--muted-foreground)",
            cursor: "pointer", fontSize: "12px", fontWeight: 500,
          }}
        >
          <Camera size={15} /> AI Face Scan <PremiumBadge />
        </button>
        <button
          onClick={() => setScanMode(scanMode === "upload" ? null : "upload")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all"
          style={{
            background: scanMode === "upload" ? "rgba(212,165,181,0.12)" : "var(--surface)",
            border: `1px solid ${scanMode === "upload" ? "var(--rose)" : "var(--border)"}`,
            color: scanMode === "upload" ? "var(--rose)" : "var(--muted-foreground)",
            cursor: "pointer", fontSize: "12px", fontWeight: 500,
          }}
        >
          <Upload size={15} /> Upload Photo <PremiumBadge />
        </button>
      </div>

      <AnimatePresence>
        {scanMode && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-5">
            <div className="rounded-2xl flex flex-col items-center justify-center gap-3 py-8" style={{ background: "var(--surface)", border: "2px dashed rgba(212,165,181,0.3)" }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(212,165,181,0.12)" }}>
                {scanMode === "camera" ? <Camera size={24} style={{ color: "var(--rose)" }} /> : <Upload size={24} style={{ color: "var(--rose)" }} />}
              </div>
              <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 500 }}>
                {scanMode === "camera" ? "Take a selfie, face forward" : "Upload a front-facing portrait"}
              </p>
              <p style={{ color: "var(--muted-foreground)", fontSize: "11px", textAlign: "center", maxWidth: 200 }}>
                Good lighting, neutral expression. We'll detect your face shape in seconds.
              </p>
              <button className="px-5 py-2 rounded-xl" style={{ background: "var(--rose)", color: "var(--charcoal)", fontWeight: 600, fontSize: "12px", border: "none", cursor: "pointer" }}>
                {scanMode === "camera" ? "Open Camera" : "Choose Photo"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p style={{ color: "var(--muted-foreground)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Or select manually</p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {FACE_SHAPES.map((shape) => {
          const isSelected = selected === shape.id;
          return (
            <button key={shape.id} onClick={() => onSelect(shape.id)} className="text-left p-4 rounded-xl transition-all duration-200"
              style={{ background: isSelected ? "rgba(212,165,181,0.1)" : "var(--surface)", border: `1px solid ${isSelected ? "var(--rose)" : "var(--border)"}`, cursor: "pointer" }}>
              <p style={{ color: isSelected ? "var(--rose)" : "var(--cream)", fontWeight: 500, marginBottom: 2, fontSize: "13px" }}>{shape.label}</p>
              <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>{shape.desc}</p>
            </button>
          );
        })}
      </div>

      <ContinueButton onNext={onNext} disabled={!selected} />
    </div>
  );
}

/* ─── Step: Color Season ─────────────────────────────────────── */
function ColorSeasonStep({ selected, onSelect, onNext, onBack, onTooltip }: {
  selected?: string; onSelect: (id: string) => void;
  onNext: () => void; onBack: () => void; onTooltip: (msg: string) => void;
}) {
  const [scanMode, setScanMode] = useState<null | "camera" | "upload">(null);

  return (
    <div className="flex flex-col px-6 pt-8 pb-10">
      <BackButton onBack={onBack} />
      <div className="flex items-center gap-2 mb-1">
        <StepLabel step="5 of 7" />
        <button onClick={() => onTooltip("Color season analysis (also called Personal Color Analysis) identifies which colour palette makes your natural colouring — skin, eyes, hair — look its most vibrant. It originated from Johannes Itten's colour theory and was popularised in the 1980s. Your 'season' tells you whether warm or cool, light or deep tones suit you best.")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <Info size={13} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "34px", lineHeight: 1.1, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 6 }}>
        Your color season
      </h2>
      <p style={{ color: "var(--muted-foreground)", marginBottom: 20, fontSize: "13px" }}>
        Your skin, hair & eye tones determine which colours make you glow.
      </p>

      {/* AR / Upload */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setScanMode(scanMode === "camera" ? null : "camera")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all"
          style={{
            background: scanMode === "camera" ? "rgba(201,169,110,0.12)" : "var(--surface)",
            border: `1px solid ${scanMode === "camera" ? "var(--gold)" : "var(--border)"}`,
            color: scanMode === "camera" ? "var(--gold)" : "var(--muted-foreground)",
            cursor: "pointer", fontSize: "12px", fontWeight: 500,
          }}
        >
          <Camera size={15} /> AR Analysis <PremiumBadge />
        </button>
        <button
          onClick={() => setScanMode(scanMode === "upload" ? null : "upload")}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all"
          style={{
            background: scanMode === "upload" ? "rgba(201,169,110,0.12)" : "var(--surface)",
            border: `1px solid ${scanMode === "upload" ? "var(--gold)" : "var(--border)"}`,
            color: scanMode === "upload" ? "var(--gold)" : "var(--muted-foreground)",
            cursor: "pointer", fontSize: "12px", fontWeight: 500,
          }}
        >
          <Upload size={15} /> Upload Selfie <PremiumBadge />
        </button>
      </div>

      <AnimatePresence>
        {scanMode && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-5">
            <div className="rounded-2xl flex flex-col items-center justify-center gap-3 py-8" style={{ background: "var(--surface)", border: "2px dashed rgba(201,169,110,0.3)" }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(201,169,110,0.12)" }}>
                <Palette size={24} style={{ color: "var(--gold)" }} />
              </div>
              <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 500 }}>
                {scanMode === "camera" ? "Live AR colour analysis" : "Upload a natural-light selfie"}
              </p>
              <p style={{ color: "var(--muted-foreground)", fontSize: "11px", textAlign: "center", maxWidth: 220, lineHeight: 1.5 }}>
                Natural lighting, no filters, no makeup if possible. We analyse skin undertone, eye contrast & hair depth.
              </p>
              <button className="px-5 py-2 rounded-xl" style={{ background: "var(--gold)", color: "var(--charcoal)", fontWeight: 600, fontSize: "12px", border: "none", cursor: "pointer" }}>
                {scanMode === "camera" ? "Start AR Scan" : "Choose Photo"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p style={{ color: "var(--muted-foreground)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Or identify your season</p>

      <div className="flex flex-col gap-3 mb-8">
        {COLOR_SEASONS.map((season) => {
          const isSelected = selected === season.id;
          return (
            <button key={season.id} onClick={() => onSelect(season.id)}
              className="text-left p-4 rounded-xl flex items-center gap-4"
              style={{ background: isSelected ? "rgba(201,169,110,0.08)" : "var(--surface)", border: `1px solid ${isSelected ? "var(--gold)" : "var(--border)"}`, cursor: "pointer" }}>
              <div className="flex gap-1.5 shrink-0">
                {season.palette.map((color, i) => <div key={i} className="w-5 h-5 rounded-full" style={{ background: color }} />)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p style={{ color: isSelected ? "var(--gold)" : "var(--cream)", fontWeight: 500, fontSize: "14px" }}>{season.label}</p>
                  <span className="px-2 py-0.5 rounded-full" style={{ background: season.temp === "Warm" ? "rgba(201,169,110,0.15)" : "rgba(100,149,237,0.15)", color: season.temp === "Warm" ? "var(--gold)" : "#6495ED", fontSize: "10px" }}>{season.temp}</span>
                </div>
                <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>{season.desc}</p>
              </div>
              {isSelected && <Check size={16} style={{ color: "var(--gold)" }} />}
            </button>
          );
        })}
      </div>

      <ContinueButton onNext={onNext} disabled={!selected} />
    </div>
  );
}

/* ─── Step: Style Personality ────────────────────────────────── */
function StylePersonalityStep({ personalities, selected, onToggle, onNext, onBack }: {
  personalities: string[]; selected: string[];
  onToggle: (p: string) => void; onNext: () => void; onBack: () => void;
}) {
  return (
    <div className="flex flex-col px-6 pt-8 pb-10">
      <BackButton onBack={onBack} />
      <StepLabel step="6 of 7" />
      <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "34px", lineHeight: 1.1, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 6 }}>
        Your style personality
      </h2>
      <p style={{ color: "var(--muted-foreground)", marginBottom: 28, fontSize: "13px" }}>
        Pick up to 3 — these shape your daily outfit suggestions.
        <span style={{ color: "var(--gold)", marginLeft: 6 }}>{selected.length}/3</span>
      </p>
      <div className="flex flex-wrap gap-2 mb-8">
        {personalities.map((p) => {
          const isSelected = selected.includes(p);
          const isDisabled = selected.length >= 3 && !isSelected;
          return (
            <button key={p} onClick={() => !isDisabled && onToggle(p)} className="px-4 py-2 rounded-full transition-all"
              style={{
                background: isSelected ? "var(--gold)" : "var(--surface)",
                color: isSelected ? "var(--charcoal)" : isDisabled ? "var(--surface-2)" : "var(--cream)",
                border: `1px solid ${isSelected ? "var(--gold)" : isDisabled ? "var(--surface-2)" : "var(--border)"}`,
                cursor: isDisabled ? "not-allowed" : "pointer",
                fontWeight: isSelected ? 600 : 400, fontSize: "13px",
              }}
            >{p}</button>
          );
        })}
      </div>
      <ContinueButton onNext={onNext} disabled={selected.length === 0} />
    </div>
  );
}

/* ─── Step: Measurements ─────────────────────────────────────── */
function MeasurementsStep({ gender, measurements, onChange, onNext, onBack }: {
  gender: string;
  measurements: { height: string; bust: string; waist: string; hips: string; inseam?: string };
  onChange: (m: { height: string; bust: string; waist: string; hips: string; inseam?: string }) => void;
  onNext: () => void; onBack: () => void;
}) {
  const fields = gender === "man"
    ? [
        { key: "height" as const, label: "Height", placeholder: "e.g. 6'1\" or 185cm", tip: "Stand straight, measure from floor to top of head" },
        { key: "bust" as const, label: "Chest", placeholder: "e.g. 40\" or 101cm", tip: "Measure around the fullest part of your chest, arms relaxed" },
        { key: "waist" as const, label: "Waist", placeholder: "e.g. 32\" or 81cm", tip: "Measure around your natural waist — usually 1\" above your navel" },
        { key: "inseam" as const, label: "Inseam", placeholder: "e.g. 32\" or 81cm", tip: "Inside leg from crotch seam to ankle — or check your best-fitting trousers" },
      ]
    : gender === "nonbinary"
    ? [
        { key: "height" as const, label: "Height", placeholder: "e.g. 5'9\" or 175cm", tip: "Stand straight, measure from floor to top of head" },
        { key: "bust" as const, label: "Chest / Bust", placeholder: "e.g. 36\" or 91cm", tip: "Measure around the fullest part of your chest" },
        { key: "waist" as const, label: "Waist", placeholder: "e.g. 30\" or 76cm", tip: "Measure around your natural waist, usually the narrowest point" },
        { key: "inseam" as const, label: "Inseam", placeholder: "e.g. 30\" or 76cm", tip: "Inside leg from crotch seam to ankle — key for unisex and androgynous bottoms" },
      ]
    : [
        { key: "height" as const, label: "Height", placeholder: "e.g. 5'6\" or 168cm", tip: "Stand straight, measure from floor to top of head" },
        { key: "bust" as const, label: "Bust", placeholder: "e.g. 36\" or 91cm", tip: "Measure around the fullest part of your chest" },
        { key: "waist" as const, label: "Waist", placeholder: "e.g. 28\" or 71cm", tip: "Measure around your natural waist, usually the narrowest point" },
        { key: "hips" as const, label: "Hips", placeholder: "e.g. 38\" or 96cm", tip: "Measure around the fullest part of your hips and seat" },
      ];

  return (
    <div className="flex flex-col px-6 pt-8 pb-10">
      <BackButton onBack={onBack} />
      <div className="flex items-center gap-2 mb-1">
        <StepLabel step="7 of 7" />
        <PremiumBadge label="AI Scan Available" />
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "34px", lineHeight: 1.1, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 6 }}>
        Your measurements
      </h2>
      <p style={{ color: "var(--muted-foreground)", marginBottom: 8, fontSize: "13px" }}>
        Optional but powerful — sizing gets exact. Always private.
      </p>

      <div className="rounded-xl p-3 mb-8 flex items-center gap-3" style={{ background: "rgba(201,169,110,0.06)", border: "1px solid var(--border)" }}>
        <Camera size={15} style={{ color: "var(--gold)" }} />
        <p style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>Skip the tape — use AI body scan for instant measurements</p>
        <button className="ml-auto px-3 py-1.5 rounded-lg shrink-0" style={{ background: "var(--surface-2)", color: "var(--gold)", fontSize: "11px", fontWeight: 600, border: "1px solid var(--border)", cursor: "pointer" }}>
          Scan
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {fields.map(({ key, label, placeholder, tip }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <label style={{ color: "var(--muted-foreground)", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
              {key === "inseam" && (gender === "man" || gender === "nonbinary") && (
                <span style={{ color: "var(--gold)", fontSize: "9px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Key for bottoms fit ✦
                </span>
              )}
            </div>
            <input
              type="text"
              value={(measurements as Record<string, string>)[key] ?? ""}
              onChange={(e) => onChange({ ...measurements, [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={{ background: "var(--surface-2)", color: "var(--cream)", border: "1px solid var(--border)", fontSize: "14px", fontFamily: "var(--font-body)" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            />
            <p style={{ color: "var(--muted-foreground)", fontSize: "11px", marginTop: 4, lineHeight: 1.4 }}>{tip}</p>
          </div>
        ))}
      </div>

      {/* Progressive disclosure hint */}
      {(gender === "man" || gender === "nonbinary") && (
        <div className="rounded-xl px-4 py-3 mb-6 flex items-start gap-2"
          style={{ background: "rgba(201,169,110,0.05)", border: "1px solid var(--border)" }}>
          <span style={{ color: "var(--gold)", fontSize: "13px", marginTop: 1 }}>✦</span>
          <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.5 }}>
            {gender === "man"
              ? <>These 4 cover everyday retail sizing. Once you're set up, you can unlock <span style={{ color: "var(--gold)" }}>detailed tailoring measurements</span> (neck, shoulders, sleeve, seat) in your profile — for when you want truly bespoke recommendations.</>
              : <>These cover everyday retail and unisex sizing. Unlock <span style={{ color: "var(--gold)" }}>full tailoring measurements</span> in your profile whenever you're ready — no pressure.</>
            }
          </p>
        </div>
      )}

      <button onClick={onNext} className="w-full py-4 rounded-2xl" style={{ background: "var(--gold)", color: "var(--charcoal)", fontWeight: 600, border: "none", cursor: "pointer" }}>
        Build My Style DNA ✦
      </button>
    </div>
  );
}

/* ─── Step: Complete ─────────────────────────────────────────── */
function CompleteStep({ profile, onFinish }: { profile: Partial<StyleProfile>; onFinish: () => void }) {
  return (
    <div className="flex flex-col px-6 pt-16 pb-10 items-center text-center h-full justify-between">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <IrysAppIcon size={96} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "30px", lineHeight: 1.2, marginBottom: 12 }}>
            {profile.name ? `${profile.name}'s` : "Your"} style<br />
            <em style={{ color: "var(--gold)" }}>DNA is ready.</em>
          </h2>
          <p style={{ color: "var(--muted-foreground)", lineHeight: 1.6, fontSize: "14px", maxWidth: 280 }}>
            Your personalised style profile is built. Daily outfit suggestions, colour guidance & scent matches — all curated for you.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mt-8 w-full rounded-2xl p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { label: "Style", value: profile.gender === "man" ? "Men's Fashion" : "Women's Fashion" },
              { label: "Body Type", value: profile.bodyType || "—" },
              { label: "Color Season", value: profile.colorSeason || "—" },
              { label: "Aesthetic", value: (profile.stylePersonality || []).slice(0, 1).join(", ") || "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ color: "var(--muted-foreground)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{label}</p>
                <p style={{ color: "var(--gold)", fontSize: "13px", fontWeight: 500, textTransform: "capitalize" }}>{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      <motion.button
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        onClick={onFinish}
        className="w-full py-4 rounded-2xl mt-8"
        style={{ background: "var(--gold)", color: "var(--charcoal)", fontWeight: 600, border: "none", cursor: "pointer", fontSize: "16px" }}
      >
        Enter My Closet ✦
      </motion.button>
    </div>
  );
}

/* ─── Shared sub-components ──────────────────────────────────── */
function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button onClick={onBack} style={{ color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer", alignSelf: "flex-start", marginBottom: 24, fontSize: "14px" }}>
      ← Back
    </button>
  );
}

function StepLabel({ step }: { step: string }) {
  return (
    <p style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10, fontFamily: "var(--font-body)", fontWeight: 500 }}>
      {step}
    </p>
  );
}

function ContinueButton({ onNext, disabled }: { onNext: () => void; disabled: boolean }) {
  return (
    <button onClick={onNext} disabled={disabled} className="w-full py-4 rounded-2xl transition-all"
      style={{ background: disabled ? "var(--surface-2)" : "var(--gold)", color: disabled ? "var(--muted-foreground)" : "var(--charcoal)", fontWeight: 600, border: "none", cursor: disabled ? "not-allowed" : "pointer" }}>
      Continue
    </button>
  );
}

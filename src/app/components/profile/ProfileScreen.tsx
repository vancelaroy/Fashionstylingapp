import { useEffect, useState } from "react";
import { Settings, Edit3, Share2, ChevronRight, Star, Palette, Ruler, Glasses, Sparkles, BookOpen, LogOut, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { StyleProfile } from "../onboarding/OnboardingFlow";
import { CaseStudyScreen } from "../case-study/CaseStudyScreen";

interface ProfileScreenProps {
  profile: StyleProfile;
  onProfileUpdate?: (profile: StyleProfile) => void;
  onReset: () => void;
  onPreview?: () => void;
  onSignOut?: () => void;
  isLoggedIn?: boolean;
}

const COLOR_SEASON_DATA: Record<string, { palette: string[]; desc: string; avoid: string }> = {
  spring: { palette: ["#FFD4A3", "#FF8C69", "#FFC1CC", "#FFFACD", "#98FB98"], desc: "Warm, clear, and light. Your best colors have golden undertones.", avoid: "Black, cool greys, and icy pastels" },
  summer: { palette: ["#B0C4DE", "#DDA0DD", "#F0E6FF", "#C9E4DE", "#E8C5E5"], desc: "Cool, muted, and light. Dusty pinks and lavenders are your power colors.", avoid: "Warm oranges, yellows, and earthy browns" },
  autumn: { palette: ["#CD853F", "#8B4513", "#6B8E23", "#D2691E", "#C7B38B"], desc: "Warm, rich, and earthy. You glow in muted, warm tones.", avoid: "Icy colours, fuchsia, and stark black" },
  winter: { palette: ["#1C1C2E", "#DC143C", "#4169E1", "#FFFFFF", "#800080"], desc: "Cool, clear, and intense. High contrast looks best on you.", avoid: "Muted, earthy tones and warm yellows" },
};

const FACE_GLASSES: Record<string, { best: string[]; avoid: string[]; tip: string }> = {
  oval: { best: ["Any style suits you", "Oversized frames", "Geometric shapes"], avoid: ["Frames narrower than face"], tip: "Lucky you — almost any frame works. Go bold or geometric!" },
  round: { best: ["Rectangular", "Square", "Angular frames"], avoid: ["Round frames", "Small frames"], tip: "Angular frames elongate and add definition to your soft features." },
  square: { best: ["Round frames", "Oval", "Cat-eye"], avoid: ["Boxy rectangles", "Angular geometrics"], tip: "Soft curves balance your strong jawline beautifully." },
  heart: { best: ["Cat-eye", "Oval", "Rimless"], avoid: ["Top-heavy frames", "Decorative browlines"], tip: "Light frames balanced on the lower half keep the focus on your eyes." },
  diamond: { best: ["Cat-eye", "Oval", "Rimless"], avoid: ["Narrow frames", "Square"], tip: "Frames with detail on top draw attention to your striking cheekbones." },
  oblong: { best: ["Oversized round", "Deep frames", "Decorative temples"], avoid: ["Narrow frames", "Rimless"], tip: "Wide frames and depth add width and break up the length of your face." },
};

const STYLE_INSIGHTS = [
  { label: "Wardrobe Score", value: "84/100", icon: Star, color: "var(--gold)", desc: "Your wardrobe is well-rounded" },
  { label: "Color Harmony", value: "High", icon: Palette, color: "#6B8F71", desc: "Your pieces work well together" },
  { label: "Style Consistency", value: "92%", icon: Sparkles, color: "var(--rose)", desc: "Strong personal aesthetic" },
];

export function ProfileScreen({ profile, onProfileUpdate, onReset, onPreview, onSignOut, isLoggedIn }: ProfileScreenProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showCaseStudy, setShowCaseStudy] = useState(false);
  const [isEditingRetailMeasurements, setIsEditingRetailMeasurements] = useState(false);
  const [measurementDraft, setMeasurementDraft] = useState<StyleProfile["measurements"]>(profile.measurements || {});

  useEffect(() => {
    setMeasurementDraft(profile.measurements || {});
  }, [profile.measurements]);

  if (showCaseStudy) {
    return <CaseStudyScreen onBack={() => setShowCaseStudy(false)} />;
  }

  const colorData = COLOR_SEASON_DATA[profile.colorSeason?.toLowerCase()] || COLOR_SEASON_DATA.autumn;
  const glassesData = FACE_GLASSES[profile.faceShape?.toLowerCase()] || FACE_GLASSES.oval;
  const retailMeasurementFields = profile.gender === "man"
    ? [
        { key: "height", label: "Height", placeholder: "5'11 / 179cm" },
        { key: "waist", label: "Waist", placeholder: "28" },
        { key: "hips", label: "Hips", placeholder: "29" },
        { key: "coatSize", label: "Coat Size", placeholder: "36", highlight: true },
        { key: "shirtSize", label: "Shirt", placeholder: "S" },
        { key: "shoeSize", label: "Shoes", placeholder: "10.5 US / 43-44.5 EU" },
      ]
    : [
        { key: "height", label: "Height", placeholder: `5'7 / 170cm` },
        { key: "bust", label: profile.gender === "nonbinary" ? "Chest / Bust" : "Bust", placeholder: "30 A / 76cm" },
        { key: "waist", label: "Waist", placeholder: "22 / 56cm" },
        { key: "hips", label: "Hips", placeholder: "32 / 81cm" },
        { key: "dressSize", label: "Dress", placeholder: "0-2 US", highlight: true },
        { key: "shoeSize", label: "Shoes", placeholder: "7 US" },
      ];

  const saveRetailMeasurements = () => {
    onProfileUpdate?.({ ...profile, measurements: { ...(profile.measurements || {}), ...measurementDraft } });
    setIsEditingRetailMeasurements(false);
  };

  const seasonDisplay = profile.colorSeason
    ? profile.colorSeason.charAt(0).toUpperCase() + profile.colorSeason.slice(1)
    : "Autumn";

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: "var(--charcoal)", fontFamily: "var(--font-body)" }}
    >
      {/* Header */}
      <div className="px-6 pt-14 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "var(--font-body)", fontWeight: 500 }}>Your Identity</p>
            <h1 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "36px", lineHeight: 1.05, fontWeight: 400, letterSpacing: "-0.03em", marginTop: 2 }}>
              Style DNA
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface)", border: "none", cursor: "pointer" }}
            >
              <Share2 size={16} style={{ color: "var(--muted-foreground)" }} />
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface)", border: "none", cursor: "pointer" }}
            >
              <Settings size={16} style={{ color: "var(--muted-foreground)" }} />
            </button>
          </div>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "rgba(199,179,139,0.15)", border: "2px solid var(--gold)" }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--gold)" }}>
              {profile.name ? profile.name[0].toUpperCase() : "A"}
            </span>
          </div>
          <div>
            <p style={{ color: "var(--cream)", fontSize: "18px", fontFamily: "var(--font-display)", fontWeight: 500 }}>
              {profile.name || "Your Name"}
            </p>
            <div className="flex gap-1.5 mt-1">
              {(profile.stylePersonality || ["Classic"]).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(199,179,139,0.12)", color: "var(--gold)", fontSize: "10px" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {STYLE_INSIGHTS.map(({ label, value, icon: Icon, color, desc }) => (
            <div
              key={label}
              className="rounded-xl p-3 text-center"
              style={{ background: "var(--surface)" }}
            >
              <Icon size={14} style={{ color, margin: "0 auto 4px" }} />
              <p style={{ color, fontSize: "14px", fontWeight: 700 }}>{value}</p>
              <p style={{ color: "var(--muted-foreground)", fontSize: "9px", letterSpacing: "0.05em" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DNA Sections */}
      <div className="px-6 pt-6 pb-24 flex flex-col gap-4">

        {/* Body Type */}
        <ProfileSection
          label="Body Type"
          value={profile.bodyType ? profile.bodyType.replace("-", " ") : "Not set"}
          icon="⧖"
          isOpen={activeSection === "body"}
          onToggle={() => setActiveSection(activeSection === "body" ? null : "body")}
        >
          <div className="pt-4">
            <p style={{ color: "var(--muted-foreground)", fontSize: "13px", lineHeight: 1.6, marginBottom: 12 }}>
              Your silhouette recommendations are tailored to celebrate your natural proportions.
            </p>
            <p style={{ color: "var(--cream)", fontSize: "12px", fontWeight: 500, marginBottom: 8 }}>Best silhouettes for you:</p>
            {["A-line skirts", "Wrap dresses", "Fitted bodices", "Bootcut or flared jeans"].map((tip) => (
              <div key={tip} className="flex items-center gap-2 mb-2">
                <div className="w-1 h-1 rounded-full" style={{ background: "var(--gold)" }} />
                <span style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>{tip}</span>
              </div>
            ))}
          </div>
        </ProfileSection>

        {/* Face Shape + Glasses */}
        <ProfileSection
          label="Face Shape"
          value={profile.faceShape ? profile.faceShape.charAt(0).toUpperCase() + profile.faceShape.slice(1) : "Not set"}
          icon="◇"
          isOpen={activeSection === "face"}
          onToggle={() => setActiveSection(activeSection === "face" ? null : "face")}
        >
          <div className="pt-4">
            <div
              className="rounded-xl p-3 mb-4 flex items-start gap-2"
              style={{ background: "rgba(199,179,139,0.06)", border: "1px solid var(--border)" }}
            >
              <Glasses size={14} style={{ color: "var(--gold)", marginTop: 2 }} />
              <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.5 }}>
                {glassesData.tip}
              </p>
            </div>
            <p style={{ color: "var(--cream)", fontSize: "12px", fontWeight: 500, marginBottom: 8 }}>Best frame shapes:</p>
            {glassesData.best.map((tip) => (
              <div key={tip} className="flex items-center gap-2 mb-2">
                <div className="w-1 h-1 rounded-full" style={{ background: "var(--gold)" }} />
                <span style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>{tip}</span>
              </div>
            ))}
          </div>
        </ProfileSection>

        {/* Color Season */}
        <ProfileSection
          label="Color Season"
          value={seasonDisplay}
          icon="◐"
          isOpen={activeSection === "color"}
          onToggle={() => setActiveSection(activeSection === "color" ? null : "color")}
        >
          <div className="pt-4">
            <div className="flex gap-2 mb-4">
              {colorData.palette.map((color, i) => (
                <div
                  key={i}
                  className="flex-1 h-10 rounded-lg"
                  style={{ background: color }}
                />
              ))}
            </div>
            <p style={{ color: "var(--muted-foreground)", fontSize: "13px", lineHeight: 1.6, marginBottom: 12 }}>
              {colorData.desc}
            </p>
            <p style={{ color: "var(--cream)", fontSize: "12px", fontWeight: 500, marginBottom: 4 }}>Avoid:</p>
            <p style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>{colorData.avoid}</p>
          </div>
        </ProfileSection>

        {/* Measurements */}
        <ProfileSection
          label="Measurements"
          value={profile.measurements?.height || "Not set"}
          icon="↕"
          isOpen={activeSection === "measurements"}
          onToggle={() => setActiveSection(activeSection === "measurements" ? null : "measurements")}
        >
          <div className="pt-4">
            {/* Core measurements grid */}
            <div className="flex items-center justify-between mb-3">
              <p style={{ color: "var(--muted-foreground)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Everyday Retail Sizing
              </p>
              {onProfileUpdate && (
                <button
                  onClick={isEditingRetailMeasurements ? saveRetailMeasurements : () => setIsEditingRetailMeasurements(true)}
                  className="px-3 py-1.5 rounded-full transition-all active:scale-95"
                  style={{
                    background: isEditingRetailMeasurements ? "var(--gold)" : "rgba(199,179,139,0.08)",
                    border: isEditingRetailMeasurements ? "none" : "1px solid rgba(199,179,139,0.2)",
                    color: isEditingRetailMeasurements ? "var(--charcoal)" : "var(--gold)",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {isEditingRetailMeasurements ? "Save" : "Edit"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
            {retailMeasurementFields.map(({ key, label, placeholder, highlight }) => {
              const value = profile.measurements?.[key] || "—";
              return (
              <div
                key={label}
                className="rounded-xl p-3"
                style={{ background: highlight ? "rgba(199,179,139,0.08)" : "var(--surface-2)", border: highlight ? "1px solid rgba(199,179,139,0.2)" : "none" }}
              >
                <p style={{ color: "var(--muted-foreground)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</p>
                {isEditingRetailMeasurements ? (
                  <input
                    type="text"
                    value={measurementDraft?.[key] || ""}
                    onChange={(e) => setMeasurementDraft((draft) => ({ ...(draft || {}), [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full outline-none"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--cream)",
                      fontSize: "16px",
                      fontFamily: "var(--font-display)",
                    }}
                    onFocus={(e) => e.currentTarget.select()}
                  />
                ) : (
                  <p style={{ color: value === "—" ? "var(--muted-foreground)" : "var(--gold)", fontSize: "16px", fontFamily: "var(--font-display)" }}>{value}</p>
                )}
              </div>
            );
            })}
            </div>

            {profile.gender === "man" ? (
              <DetailedMeasurements
                measurements={profile.measurements || {}}
                onSave={(measurements) => onProfileUpdate?.({ ...profile, measurements })}
                fields={TAILORING_FIELDS_MEN}
                title="Detailed Tailoring Measurements"
                description="These unlock stronger suit, shirt, trouser, shoe, and alteration recommendations — the numbers a stylist or tailor would ask for first. Add as many or as few as you like."
              />
            ) : (
              <DetailedMeasurements
                measurements={profile.measurements || {}}
                onSave={(measurements) => onProfileUpdate?.({ ...profile, measurements })}
                fields={TAILORING_FIELDS_WOMEN}
                title={profile.gender === "nonbinary" ? "Detailed Fit Measurements" : "Detailed Womenswear Measurements"}
                description="These unlock stronger dress, denim, jacket, tailoring, and alteration recommendations — especially when fit varies between brands. Add only what feels useful."
              />
            )}
          </div>
        </ProfileSection>

        {/* Case Study link */}
        <button
          onClick={() => setShowCaseStudy(true)}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-2 transition-all active:scale-95"
          style={{ background: "rgba(199,179,139,0.08)", border: "1px solid rgba(199,179,139,0.25)", cursor: "pointer" }}
        >
          <BookOpen size={15} style={{ color: "var(--gold)" }} />
          <span style={{ color: "var(--gold)", fontSize: "13px" }}>Read the IRYS Case Study</span>
        </button>

        {/* Assessment options */}
        {isLoggedIn ? (
          <div className="mt-2 flex flex-col gap-2">
            <button onClick={onPreview} className="w-full py-3.5 rounded-2xl flex items-center gap-3 px-4 transition-all active:scale-95" style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}>
              <Eye size={15} style={{ color: "var(--slate, #8F88A8)" }} />
              <div className="text-left">
                <span style={{ color: "var(--cream)", fontSize: "13px", display: "block" }}>Preview as Different Style</span>
                <span style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>Test any gender — won't change your saved profile</span>
              </div>
            </button>
            <button onClick={onReset} className="w-full py-3.5 rounded-2xl flex items-center gap-3 px-4 transition-all active:scale-95" style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}>
              <Edit3 size={15} style={{ color: "var(--muted-foreground)" }} />
              <div className="text-left">
                <span style={{ color: "var(--muted-foreground)", fontSize: "13px", display: "block" }}>Update My Profile</span>
                <span style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>Redo assessment and save permanently</span>
              </div>
            </button>
          </div>
        ) : (
          <button onClick={onReset} className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-2 transition-all active:scale-95" style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}>
            <Edit3 size={15} style={{ color: "var(--muted-foreground)" }} />
            <span style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>Redo Style Assessment</span>
          </button>
        )}

        {/* Sign out */}
        {onSignOut && (
          <button onClick={onSignOut} className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-2 mb-6 transition-all active:scale-95" style={{ background: "transparent", border: "1px solid rgba(192,57,43,0.25)", cursor: "pointer" }}>
            <LogOut size={15} style={{ color: "#c0392b" }} />
            <span style={{ color: "#c0392b", fontSize: "13px" }}>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
}

const TAILORING_FIELDS_MEN: Array<{ key: string; label: string; placeholder: string; tip: string }> = [
  { key: "bust", label: "Chest", placeholder: "e.g. 38", tip: "Useful for shirts, knits, jackets, and suit sizing" },
  { key: "neck", label: "Neck", placeholder: "e.g. 15.5", tip: "Collar size found on dress shirt labels" },
  { key: "sleeve", label: "Sleeve", placeholder: "e.g. 33", tip: "Dress shirt sleeve size" },
  { key: "overArm", label: "Over Arm", placeholder: "e.g. 43", tip: "Helps estimate jacket fit when sizing suiting" },
  { key: "coatInseam", label: "Coat Length", placeholder: "e.g. 17.5", tip: "Jacket or coat length measurement" },
  { key: "inseam", label: "Trouser Inseam", placeholder: "e.g. 30", tip: "Inside leg length for trousers and denim" },
  { key: "outseam", label: "Outseam", placeholder: "e.g. 41", tip: "Outside leg length for tailoring and trouser alterations" },
  { key: "shoulder", label: "Shoulder Width", placeholder: "e.g. 18 or 46cm", tip: "Across the back from shoulder point to shoulder point" },
  { key: "seat", label: "Seat", placeholder: "e.g. 38", tip: "Fullest part of the seat, used by tailors and suit trousers" },
  { key: "thigh", label: "Thigh", placeholder: "e.g. 24", tip: "Around the fullest part of the upper leg" },
];

const TAILORING_FIELDS_WOMEN: Array<{ key: string; label: string; placeholder: string; tip: string }> = [
  { key: "underbust", label: "Underbust", placeholder: "e.g. 28 or 71cm", tip: "Helpful for bra, bodice, corset, and swim sizing" },
  { key: "shoulder", label: "Shoulder Width", placeholder: "e.g. 15 or 38cm", tip: "Across the back for blazers, coats, and structured tops" },
  { key: "sleeve", label: "Sleeve", placeholder: "e.g. 31", tip: "Useful for jackets, coats, and long-sleeve tops" },
  { key: "inseam", label: "Inseam", placeholder: "e.g. 29", tip: "Inside leg length for denim, trousers, and jumpsuits" },
  { key: "outseam", label: "Outseam", placeholder: "e.g. 39", tip: "Outside leg length for tailoring and alterations" },
  { key: "torso", label: "Torso Length", placeholder: "e.g. 24", tip: "Helpful for dresses, bodysuits, jumpsuits, and one-piece swim" },
];

function DetailedMeasurements({
  measurements,
  onSave,
  fields,
  title,
  description,
}: {
  measurements: StyleProfile["measurements"];
  onSave: (measurements: StyleProfile["measurements"]) => void;
  fields: Array<{ key: string; label: string; placeholder: string; tip: string }>;
  title: string;
  description: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<StyleProfile["measurements"]>(measurements);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValues(measurements);
  }, [measurements]);

  const handleSave = () => {
    onSave(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all"
        style={{ background: isOpen ? "rgba(199,179,139,0.08)" : "var(--surface-2)", border: `1px solid ${isOpen ? "rgba(199,179,139,0.25)" : "transparent"}`, cursor: "pointer" }}
      >
        <div className="flex items-center gap-2">
          <Ruler size={13} style={{ color: "var(--gold)" }} />
          <span style={{ color: "var(--cream)", fontSize: "12px", fontWeight: 500 }}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>For bespoke fit</span>
          <ChevronRight size={13} style={{ color: "var(--muted-foreground)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 flex flex-col gap-3">
              <p style={{ color: "var(--muted-foreground)", fontSize: "11px", lineHeight: 1.5 }}>
                {description}
              </p>
              {fields.map(({ key, label, placeholder, tip }) => (
                <div key={key}>
                  <label style={{ color: "var(--muted-foreground)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>
                    {label}
                  </label>
                  <input
                    type="text"
                    value={values[key] || ""}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={{ background: "var(--surface-2)", color: "var(--cream)", border: "1px solid var(--border)", fontSize: "13px", fontFamily: "var(--font-body)" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                  />
                  <p style={{ color: "var(--muted-foreground)", fontSize: "10px", marginTop: 3 }}>{tip}</p>
                </div>
              ))}
              <button
                onClick={handleSave}
                className="w-full py-3 rounded-xl mt-1 transition-all"
                style={{ background: saved ? "rgba(107,143,113,0.2)" : "var(--gold)", color: saved ? "#6B8F71" : "var(--charcoal)", fontWeight: 600, fontSize: "13px", border: saved ? "1px solid #6B8F71" : "none", cursor: "pointer" }}
              >
                {saved ? "Saved ✓" : "Save Tailoring Measurements"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileSection({
  label, value, icon, isOpen, onToggle, children,
}: {
  label: string;
  value: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{ background: "var(--surface)", border: `1px solid ${isOpen ? "rgba(199,179,139,0.3)" : "var(--border)"}` }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: "18px", color: "var(--gold)" }}>{icon}</span>
          <div className="text-left">
            <p style={{ color: "var(--muted-foreground)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
            <p style={{ color: "var(--cream)", fontSize: "15px", fontWeight: 500, textTransform: "capitalize", marginTop: 1 }}>{value}</p>
          </div>
        </div>
        <ChevronRight
          size={16}
          style={{
            color: "var(--muted-foreground)",
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

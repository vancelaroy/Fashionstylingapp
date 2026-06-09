import { useState } from "react";
import { motion } from "motion/react";
import { Heart, Share2, Bookmark, Star, ChevronRight, Sparkles, Sun, Moon } from "lucide-react";
import type { StyleProfile } from "../onboarding/OnboardingFlow";

interface HomeScreenProps {
  profile: StyleProfile;
}

const HOROSCOPE_STYLES: Record<string, { sign: string; emoji: string; style: string; colors: string[]; advice: string }> = {
  Aries: { sign: "Aries", emoji: "♈", style: "Bold statement pieces", colors: ["#DC143C", "#FF6347", "#FF4500"], advice: "Channel your fire energy with power dressing today. Red is your power color." },
  Taurus: { sign: "Taurus", emoji: "♉", style: "Luxe textures, earthy tones", colors: ["#8B7355", "#A0845C", "#D4AF91"], advice: "Reach for cashmere and silk. Earthy greens and warm browns align with your energy." },
  Gemini: { sign: "Gemini", emoji: "♊", style: "Mixed prints, playful layers", colors: ["#FFD700", "#FFA500", "#FFFFE0"], advice: "Play with contrasts today. A surprising pattern mix will reflect your dual nature." },
  Cancer: { sign: "Cancer", emoji: "♋", style: "Soft silhouettes, pearls", colors: ["#E0E0F8", "#B0C4DE", "#F0F8FF"], advice: "Wrap yourself in comfort. Soft blues and silvers reflect your lunar nature." },
  Leo: { sign: "Leo", emoji: "♌", style: "Drama and shine", colors: ["#FFD700", "#FFA500", "#FF8C00"], advice: "Gold is your birthright. Dress to be seen — the spotlight follows you." },
  Virgo: { sign: "Virgo", emoji: "♍", style: "Tailored classics, clean lines", colors: ["#6B8E23", "#808000", "#BDB76B"], advice: "Crisp, clean, and perfectly tailored. Your refined taste speaks volumes today." },
  Libra: { sign: "Libra", emoji: "♎", style: "Romantic, balanced, elegant", colors: ["#FFB6C1", "#FF69B4", "#DB7093"], advice: "Rose tones and delicate fabrics align with your Venus energy. Balance is beauty." },
  Scorpio: { sign: "Scorpio", emoji: "♏", style: "Dark, intense, magnetic", colors: ["#800000", "#4B0082", "#2F4F4F"], advice: "Deep burgundy and black exude your mysterious allure today. Own the room." },
  Sagittarius: { sign: "Sagittarius", emoji: "♐", style: "Bohemian, global textures", colors: ["#8B4513", "#A0522D", "#D2691E"], advice: "Embrace your wanderer spirit with earthy tones and eclectic accessories." },
  Capricorn: { sign: "Capricorn", emoji: "♑", style: "Sharp suiting, authority", colors: ["#2F4F4F", "#708090", "#A9A9A9"], advice: "Charcoal and slate grey amplify your natural authority. Dress for the job you want." },
  Aquarius: { sign: "Aquarius", emoji: "♒", style: "Avant-garde, unexpected", colors: ["#00BFFF", "#1E90FF", "#87CEEB"], advice: "Electric blue and unexpected silhouettes channel your visionary energy." },
  Pisces: { sign: "Pisces", emoji: "♓", style: "Ethereal, flowy, dreamy", colors: ["#9370DB", "#8A2BE2", "#DDA0DD"], advice: "Lavender and seafoam green. Let your layers flow like water today." },
};

const ZODIAC_SIGNS = Object.keys(HOROSCOPE_STYLES);

const OUTFIT_SUGGESTIONS = [
  {
    id: 1,
    title: "Autumn Gala",
    occasion: "Evening Out",
    items: ["Silk midi dress", "Block heel mules", "Gold chain bag", "Chandelier earrings"],
    image: "https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=400&h=600&fit=crop&auto=format",
    confidence: 97,
    tags: ["Romantic", "Evening"],
  },
  {
    id: 2,
    title: "Editorial Monday",
    occasion: "Work Meeting",
    items: ["Tailored blazer", "Wide-leg trousers", "Leather loafers", "Minimal gold jewelry"],
    image: "https://images.unsplash.com/photo-1533392151650-269f96231f65?w=400&h=600&fit=crop&auto=format",
    confidence: 94,
    tags: ["Classic", "Professional"],
  },
];

const COLOR_OF_DAY = {
  name: "Champagne Dusk",
  hex: "#C9A96E",
  desc: "A warm golden hue that flatters your Autumn color season beautifully.",
  pairsWith: ["Deep burgundy", "Ivory cream", "Forest green"],
};

export function HomeScreen({ profile }: HomeScreenProps) {
  const [savedOutfits, setSavedOutfits] = useState<number[]>([]);
  const [likedOutfits, setLikedOutfits] = useState<number[]>([]);
  const [selectedSign, setSelectedSign] = useState<string>("Leo");
  const [activeOutfit, setActiveOutfit] = useState(0);

  const horoscope = HOROSCOPE_STYLES[selectedSign];
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  const toggleSave = (id: number) =>
    setSavedOutfits((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleLike = (id: number) =>
    setLikedOutfits((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: "var(--charcoal)", fontFamily: "var(--font-body)" }}
    >
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "var(--font-body)", fontWeight: 500 }}>
              {greeting}{profile.name ? `, ${profile.name}` : ""}
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "36px", lineHeight: 1.05, fontWeight: 400, letterSpacing: "-0.03em", marginTop: 2 }}>
              Today's Edit
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface)" }}
            >
              <Sun size={16} style={{ color: "var(--gold)" }} />
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface)", border: "1.5px solid var(--gold)" }}
            >
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--gold)" }}>
                {profile.name ? profile.name[0].toUpperCase() : "A"}
              </span>
            </div>
          </div>
        </div>

        {/* Style tags */}
        <div className="flex gap-2 mt-3">
          {(profile.stylePersonality || ["Classic", "Romantic"]).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full"
              style={{ background: "rgba(201,169,110,0.1)", color: "var(--gold)", fontSize: "11px", border: "1px solid rgba(201,169,110,0.2)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Outfit Cards */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 500 }}>Curated For You</p>
          <div className="flex gap-1">
            {OUTFIT_SUGGESTIONS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveOutfit(i)}
                className="w-6 h-1 rounded-full transition-all duration-200"
                style={{ background: i === activeOutfit ? "var(--gold)" : "var(--surface-2)", border: "none", cursor: "pointer" }}
              />
            ))}
          </div>
        </div>

        {OUTFIT_SUGGESTIONS.map((outfit, i) => (
          <motion.div
            key={outfit.id}
            initial={false}
            animate={{ opacity: i === activeOutfit ? 1 : 0, x: i === activeOutfit ? 0 : 20 }}
            style={{ display: i === activeOutfit ? "block" : "none" }}
          >
            <div
              className="rounded-2xl overflow-hidden relative"
              style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
            >
              <div className="relative">
                <img
                  src={outfit.image}
                  alt={outfit.title}
                  className="w-full object-cover"
                  style={{ height: 320 }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(14,13,12,0.95) 0%, rgba(14,13,12,0.3) 50%, transparent 100%)",
                  }}
                />
                {/* Confidence badge */}
                <div
                  className="absolute top-3 left-3 px-3 py-1 rounded-full flex items-center gap-1"
                  style={{ background: "rgba(14,13,12,0.7)", backdropFilter: "blur(8px)" }}
                >
                  <Sparkles size={10} style={{ color: "var(--gold)" }} />
                  <span style={{ color: "var(--gold)", fontSize: "11px", fontWeight: 600 }}>{outfit.confidence}% match</span>
                </div>
                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <button
                    onClick={() => toggleLike(outfit.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                    style={{ background: "rgba(14,13,12,0.7)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer" }}
                  >
                    <Heart
                      size={16}
                      style={{ color: likedOutfits.includes(outfit.id) ? "#D4A5B5" : "var(--cream)" }}
                      fill={likedOutfits.includes(outfit.id) ? "#D4A5B5" : "none"}
                    />
                  </button>
                  <button
                    onClick={() => toggleSave(outfit.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                    style={{ background: "rgba(14,13,12,0.7)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer" }}
                  >
                    <Bookmark
                      size={16}
                      style={{ color: savedOutfits.includes(outfit.id) ? "var(--gold)" : "var(--cream)" }}
                      fill={savedOutfits.includes(outfit.id) ? "var(--gold)" : "none"}
                    />
                  </button>
                </div>
                {/* Outfit info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(201,169,110,0.2)", color: "var(--gold)", fontSize: "10px", letterSpacing: "0.08em" }}
                    >
                      {outfit.occasion}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "20px", marginBottom: 8 }}>
                    {outfit.title}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {outfit.items.map((item) => (
                      <span
                        key={item}
                        className="px-2 py-1 rounded-lg"
                        style={{ background: "rgba(245,240,232,0.08)", color: "var(--muted-foreground)", fontSize: "11px" }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Swipe hint */}
        <div className="flex justify-center gap-4 mt-3">
          {OUTFIT_SUGGESTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveOutfit(i)}
              className="px-4 py-1.5 rounded-full transition-all"
              style={{
                background: i === activeOutfit ? "rgba(201,169,110,0.15)" : "transparent",
                border: `1px solid ${i === activeOutfit ? "var(--gold)" : "var(--border)"}`,
                color: i === activeOutfit ? "var(--gold)" : "var(--muted-foreground)",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              Look {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Color of the Day */}
      <div className="px-6 mb-6">
        <p style={{ color: "var(--muted-foreground)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          Today's Color
        </p>
        <div
          className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="w-16 h-16 rounded-xl shrink-0"
            style={{ background: COLOR_OF_DAY.hex, boxShadow: `0 8px 24px ${COLOR_OF_DAY.hex}40` }}
          />
          <div className="flex-1 min-w-0">
            <p style={{ color: "var(--cream)", fontWeight: 500, marginBottom: 2, fontSize: "14px" }}>{COLOR_OF_DAY.name}</p>
            <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.4, marginBottom: 8 }}>{COLOR_OF_DAY.desc}</p>
            <div className="flex gap-1">
              {COLOR_OF_DAY.pairsWith.map((c) => (
                <span key={c} style={{ color: "var(--muted-foreground)", fontSize: "10px", background: "var(--surface-2)", padding: "2px 8px", borderRadius: 99 }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Horoscope Style */}
      <div className="px-6 mb-6">
        <p style={{ color: "var(--muted-foreground)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          Style Forecast ✦ Astrology
        </p>

        {/* Sign picker */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4" style={{ scrollbarWidth: "none" }}>
          {ZODIAC_SIGNS.map((sign) => (
            <button
              key={sign}
              onClick={() => setSelectedSign(sign)}
              className="px-3 py-2 rounded-xl shrink-0 transition-all duration-200"
              style={{
                background: selectedSign === sign ? "rgba(201,169,110,0.15)" : "var(--surface)",
                border: `1px solid ${selectedSign === sign ? "var(--gold)" : "var(--border)"}`,
                color: selectedSign === sign ? "var(--gold)" : "var(--muted-foreground)",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              {HOROSCOPE_STYLES[sign].emoji} {sign}
            </button>
          ))}
        </div>

        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ background: "rgba(201,169,110,0.1)" }}
            >
              {horoscope.emoji}
            </div>
            <div>
              <p style={{ color: "var(--cream)", fontWeight: 500, fontSize: "15px" }}>{horoscope.sign}</p>
              <p style={{ color: "var(--gold)", fontSize: "12px", fontStyle: "italic" }}>{horoscope.style}</p>
            </div>
          </div>

          <p style={{ color: "var(--muted-foreground)", fontSize: "13px", lineHeight: 1.6, marginBottom: 16 }}>
            {horoscope.advice}
          </p>

          <div>
            <p style={{ color: "var(--muted-foreground)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Your Power Colors Today
            </p>
            <div className="flex gap-2">
              {horoscope.colors.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full" style={{ background: color }} />
                  <span style={{ fontSize: "9px", color: "var(--muted-foreground)" }}>{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick access */}
      <div className="px-6 mb-24">
        <p style={{ color: "var(--muted-foreground)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Find My Glasses", icon: "👓", desc: "Frame matching by face shape" },
            { label: "Color Analysis", icon: "🎨", desc: "Discover your season" },
            { label: "Stylist Match", icon: "✨", desc: "Connect with a real stylist" },
            { label: "Get The Look", icon: "🛍️", desc: "Shop any outfit" },
          ].map((action) => (
            <button
              key={action.label}
              className="p-4 rounded-xl text-left transition-all duration-200 active:scale-95"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}
            >
              <span style={{ fontSize: "22px", display: "block", marginBottom: 6 }}>{action.icon}</span>
              <p style={{ color: "var(--cream)", fontSize: "12px", fontWeight: 500, marginBottom: 2 }}>{action.label}</p>
              <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>{action.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

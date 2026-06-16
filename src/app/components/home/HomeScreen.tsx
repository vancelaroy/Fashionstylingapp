import { useState } from "react";
import { motion } from "motion/react";
import { Heart, Bookmark, Star, Sparkles, Sun } from "lucide-react";
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

// Gender-specific outfit data
const OUTFITS_WOMEN = [
  {
    id: 1,
    title: "Autumn Gala",
    occasion: "Evening Out",
    items: ["Silk midi dress", "Block heel mules", "Gold chain bag", "Chandelier earrings"],
    image: "https://images.unsplash.com/photo-1662532577856-e8ee8b138a8b?w=400&h=600&fit=crop&auto=format",
    confidence: 97,
    tags: ["Romantic", "Evening"],
  },
  {
    id: 2,
    title: "Editorial Monday",
    occasion: "Work Meeting",
    items: ["Tailored blazer", "Wide-leg trousers", "Leather loafers", "Minimal gold jewelry"],
    image: "https://images.unsplash.com/photo-1612731486606-2614b4d74921?w=400&h=600&fit=crop&auto=format",
    confidence: 94,
    tags: ["Classic", "Professional"],
  },
  {
    id: 3,
    title: "Sunday Brunch",
    occasion: "Casual",
    items: ["Linen co-ord", "Flat sandals", "Woven tote", "Stacked bracelets"],
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=600&fit=crop&auto=format",
    confidence: 91,
    tags: ["Casual", "Classic"],
  },
];

const OUTFITS_MEN = [
  {
    id: 1,
    title: "Sharp & Decisive",
    occasion: "Job Interview",
    items: ["Charcoal slim suit", "White dress shirt", "Burgundy tie", "Oxford brogues"],
    image: "https://images.unsplash.com/photo-1619603364937-8d7af41ef206?w=400&h=600&fit=crop&auto=format",
    confidence: 97,
    tags: ["Classic", "Professional"],
  },
  {
    id: 2,
    title: "Smart Casual",
    occasion: "Date Night",
    items: ["Navy chinos", "Slim-fit white shirt", "Clean white sneakers", "Leather watch"],
    image: "https://images.unsplash.com/photo-1532332248682-206cc786359f?w=400&h=600&fit=crop&auto=format",
    confidence: 94,
    tags: ["Classic", "Evening"],
  },
  {
    id: 3,
    title: "Weekend Edit",
    occasion: "Casual",
    items: ["Dark wash jeans", "Camel coat", "Crew-neck tee", "Chelsea boots"],
    image: "https://images.unsplash.com/photo-1666932521131-d990bd263a2c?w=400&h=600&fit=crop&auto=format",
    confidence: 92,
    tags: ["Casual", "Classic"],
  },
];

const OUTFITS_NONBINARY = [
  {
    id: 1,
    title: "Structured Edge",
    occasion: "Work / Creative",
    items: ["Oversized blazer", "Wide-leg trousers", "Clean white tee", "Chunky loafers"],
    image: "https://images.unsplash.com/photo-1550995694-3f5f4a7e1bd2?w=400&h=600&fit=crop&auto=format",
    confidence: 96,
    tags: ["Androgynous", "Classic"],
  },
  {
    id: 2,
    title: "Minimal Statement",
    occasion: "Evening Out",
    items: ["Monochrome co-ord", "Square-toe boots", "Silver ring stack", "Mini crossbody"],
    image: "https://images.unsplash.com/photo-1619603364904-c0498317e145?w=400&h=600&fit=crop&auto=format",
    confidence: 93,
    tags: ["Minimalist", "Evening"],
  },
];

const COLOR_OF_DAY = {
  name: "Champagne Dusk",
  hex: "#C7B38B",
  desc: "A warm golden hue that flatters your Autumn color season beautifully.",
  pairsWith: ["Deep burgundy", "Ivory cream", "Forest green"],
};

export function HomeScreen({ profile }: HomeScreenProps) {
  const [savedOutfits, setSavedOutfits] = useState<number[]>([]);
  const [likedOutfits, setLikedOutfits] = useState<number[]>([]);
  const [selectedSign, setSelectedSign] = useState<string>("Leo");

  const outfits = profile.gender === "man" ? OUTFITS_MEN
    : profile.gender === "nonbinary" ? OUTFITS_NONBINARY
    : OUTFITS_WOMEN;

  const horoscope = HOROSCOPE_STYLES[selectedSign];
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  const toggleSave = (id: number) =>
    setSavedOutfits((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleLike = (id: number) =>
    setLikedOutfits((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const bodyLabel = profile.gender === "man" ? "Athletic build"
    : profile.gender === "nonbinary" ? "Your build"
    : "Hourglass";

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "var(--charcoal)", fontFamily: "var(--font-body)" }}>

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
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--surface)" }}>
              <Sun size={16} style={{ color: "var(--gold)" }} />
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--surface)", border: "1.5px solid var(--gold)" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--gold)" }}>
                {profile.name ? profile.name[0].toUpperCase() : "A"}
              </span>
            </div>
          </div>
        </div>

        {/* Style tags */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {(profile.stylePersonality || ["Classic", "Romantic"]).map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full" style={{ background: "rgba(199,179,139,0.1)", color: "var(--gold)", fontSize: "11px", border: "1px solid rgba(199,179,139,0.2)" }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Outfit Cards */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 500 }}>Curated for you</p>
          <p style={{ color: "var(--gold)", fontSize: "11px" }}>Based on your DNA ✦</p>
        </div>

        <div className="flex flex-col gap-4">
          {outfits.map((outfit, i) => (
            <motion.div
              key={outfit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="relative">
                <img src={outfit.image} alt={outfit.title} className="w-full object-cover" style={{ height: 280 }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(14,13,12,0.95) 0%, rgba(14,13,12,0.2) 50%, transparent 100%)" }} />

                {/* Top badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <div className="px-2 py-1 rounded-full" style={{ background: "rgba(14,13,12,0.75)", backdropFilter: "blur(6px)" }}>
                    <span style={{ color: "var(--gold)", fontSize: "10px", fontWeight: 600 }}>{outfit.confidence}% match ✦</span>
                  </div>
                </div>
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <button onClick={() => toggleLike(outfit.id)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(14,13,12,0.75)", backdropFilter: "blur(6px)", border: "none", cursor: "pointer" }}>
                    <Heart size={13} style={{ color: likedOutfits.includes(outfit.id) ? "#8F88A8" : "var(--cream)" }} fill={likedOutfits.includes(outfit.id) ? "#8F88A8" : "none"} />
                  </button>
                  <button onClick={() => toggleSave(outfit.id)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(14,13,12,0.75)", backdropFilter: "blur(6px)", border: "none", cursor: "pointer" }}>
                    <Bookmark size={13} style={{ color: savedOutfits.includes(outfit.id) ? "var(--gold)" : "var(--cream)" }} fill={savedOutfits.includes(outfit.id) ? "var(--gold)" : "none"} />
                  </button>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex gap-1.5 mb-2">
                    {outfit.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full" style={{ background: "rgba(199,179,139,0.2)", color: "var(--gold)", fontSize: "10px", backdropFilter: "blur(4px)" }}>{tag}</span>
                    ))}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "22px", fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.1, marginBottom: 2 }}>
                    {outfit.title}
                  </h3>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{outfit.occasion}</p>
                </div>
              </div>

              {/* Items list */}
              <div className="px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {outfit.items.map((item) => (
                    <span key={item} className="px-3 py-1.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--muted-foreground)", fontSize: "11px", border: "1px solid var(--border)" }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Color of the Day */}
      <div className="px-6 mb-6">
        <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full shrink-0" style={{ background: COLOR_OF_DAY.hex }} />
            <div>
              <p style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Color of the Day</p>
              <p style={{ color: "var(--cream)", fontSize: "14px", fontWeight: 500, fontFamily: "var(--font-display)" }}>{COLOR_OF_DAY.name}</p>
            </div>
          </div>
          <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.5, marginBottom: 10 }}>{COLOR_OF_DAY.desc}</p>
          <div className="flex gap-2">
            {COLOR_OF_DAY.pairsWith.map((c) => (
              <span key={c} className="px-2 py-1 rounded-full" style={{ background: "var(--surface-2)", color: "var(--muted-foreground)", fontSize: "10px" }}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Style Horoscope */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 500 }}>Style Horoscope</p>
          <Sparkles size={14} style={{ color: "var(--gold)" }} />
        </div>

        {/* Sign picker */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
          {ZODIAC_SIGNS.map((sign) => (
            <button
              key={sign}
              onClick={() => setSelectedSign(sign)}
              className="shrink-0 px-3 py-2 rounded-full flex items-center gap-1.5 transition-all"
              style={{
                background: selectedSign === sign ? "var(--gold)" : "var(--surface)",
                color: selectedSign === sign ? "var(--charcoal)" : "var(--muted-foreground)",
                border: `1px solid ${selectedSign === sign ? "var(--gold)" : "var(--border)"}`,
                fontSize: "11px",
                fontWeight: selectedSign === sign ? 600 : 400,
                cursor: "pointer",
              }}
            >
              <span>{HOROSCOPE_STYLES[sign].emoji}</span>
              <span>{sign}</span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-3">
            <span style={{ fontSize: "28px" }}>{horoscope.emoji}</span>
            <div>
              <p style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "18px", fontWeight: 400, letterSpacing: "-0.01em" }}>{horoscope.sign}</p>
              <p style={{ color: "var(--gold)", fontSize: "11px", fontStyle: "italic" }}>{horoscope.style}</p>
            </div>
          </div>
          <p style={{ color: "var(--muted-foreground)", fontSize: "13px", lineHeight: 1.6, marginBottom: 12 }}>{horoscope.advice}</p>
          <div className="flex gap-2">
            {horoscope.colors.map((c) => (
              <div key={c} className="w-6 h-6 rounded-full" style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}

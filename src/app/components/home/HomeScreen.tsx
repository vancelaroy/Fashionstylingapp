import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CalendarDays, Camera, CheckCircle2, CloudSun, Shirt, Sparkles, Sun } from "lucide-react";
import type { StyleProfile } from "../onboarding/OnboardingFlow";
import type { WardrobeItem } from "../wardrobe/WardrobeUpload";
import { projectId } from "/utils/supabase/info";

const SERVER = `https://${projectId}.supabase.co/functions/v1/irys-api`;

interface HomeScreenProps {
  profile: StyleProfile;
  accessToken?: string | null;
  onAskIris?: (prompt: string) => void;
  onOpenWardrobe?: () => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  tops: "👕", bottoms: "👖", outerwear: "🧥", shoes: "👟",
  accessories: "💍", dresses: "👗", suits: "🤵", bags: "👜",
};

const SEASON_COLORS: Record<string, { name: string; hex: string; pairsWith: string[]; desc: string }> = {
  spring: { name: "Warm Coral", hex: "#E98B73", pairsWith: ["Ivory", "Camel", "Soft denim"], desc: "Bright, warm, and easy near the face." },
  summer: { name: "Dusty Blue", hex: "#8FA3B1", pairsWith: ["Soft white", "Charcoal", "Lavender"], desc: "Cool and muted without feeling flat." },
  autumn: { name: "Champagne Dusk", hex: "#C7B38B", pairsWith: ["Burgundy", "Cream", "Forest green"], desc: "Warm and grounded, perfect for your palette." },
  winter: { name: "Deep Cobalt", hex: "#244C9A", pairsWith: ["Black", "White", "Silver"], desc: "Crisp contrast that brings polish fast." },
};

function isPersistentImage(src: string | undefined): src is string {
  return !!src && !src.startsWith("blob:");
}

function pickFirst(items: WardrobeItem[], categories: string[], used: string[] = []) {
  return items.find((item) => categories.includes(item.category) && !used.includes(item.id)) ?? null;
}

function buildDailyLook(items: WardrobeItem[]) {
  const top = pickFirst(items, ["tops", "dresses"]);
  const used = top ? [top.id] : [];
  const bottom = top?.category === "dresses" ? null : pickFirst(items, ["bottoms"], used);
  if (bottom) used.push(bottom.id);
  const outer = pickFirst(items, ["outerwear", "suits"], used);
  if (outer) used.push(outer.id);
  const shoes = pickFirst(items, ["shoes"], used);
  if (shoes) used.push(shoes.id);
  const bag = pickFirst(items, ["bags"], used);
  if (bag) used.push(bag.id);
  const accessory = pickFirst(items, ["accessories"], used);

  return [top, bottom, outer, shoes, bag, accessory].filter(Boolean) as WardrobeItem[];
}

function buildGapList(items: WardrobeItem[]) {
  const counts = {
    tops: items.filter((item) => item.category === "tops" || item.category === "dresses").length,
    bottoms: items.filter((item) => item.category === "bottoms").length,
    outerwear: items.filter((item) => item.category === "outerwear" || item.category === "suits").length,
    shoes: items.filter((item) => item.category === "shoes").length,
    bags: items.filter((item) => item.category === "bags").length,
    accessories: items.filter((item) => item.category === "accessories").length,
  };

  const gaps = [
    counts.shoes === 0 ? "Add one versatile shoe to complete more outfits." : null,
    counts.bottoms === 0 ? "Add a bottom so Iris can build fuller looks." : null,
    counts.outerwear === 0 ? "Add an outerwear layer for polished outfits." : null,
    counts.bags === 0 ? "Add a bag to finish daytime and evening looks." : null,
    counts.tops < 2 ? "Add another top to give Iris more combinations." : null,
  ].filter(Boolean) as string[];

  return { counts, gaps };
}

function buildAskIrisPrompt(profile: StyleProfile, look: WardrobeItem[]) {
  const pieces = look.map((item) => `${item.name}${item.brand ? ` by ${item.brand}` : ""} (${item.category}, ${item.color}${item.fit ? `, ${item.fit} fit` : ""})`).join("\n");
  return `Help me get dressed today using my wardrobe and Style DNA.\n\nMy suggested pieces are:\n${pieces || "I do not have a complete closet look selected yet."}\n\nMy style profile: ${profile.colorSeason || "unknown"} color season, ${profile.bodyType || "unknown"} body type, ${profile.stylePersonality?.join(", ") || "classic"} style personality.\n\nPlease tell me what to wear today, why it works, what to add or swap, and one confidence note.`;
}

export function HomeScreen({ profile, accessToken, onAskIris, onOpenWardrobe }: HomeScreenProps) {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    fetch(`${SERVER}/wardrobe/items`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.items)) setWardrobeItems(data.items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const dailyLook = useMemo(() => buildDailyLook(wardrobeItems), [wardrobeItems]);
  const { counts, gaps } = useMemo(() => buildGapList(wardrobeItems), [wardrobeItems]);
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const color = SEASON_COLORS[(profile.colorSeason || "autumn").toLowerCase()] ?? SEASON_COLORS.autumn;
  const savedLooksCount = (() => {
    try {
      const saved = window.localStorage.getItem("irys.savedOutfits.v1");
      return saved ? JSON.parse(saved).length ?? 0 : 0;
    } catch {
      return 0;
    }
  })();

  return (
    <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden" style={{ background: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}>
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
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--gold)" }}>{profile.name ? profile.name[0].toUpperCase() : "I"}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          {(profile.stylePersonality || ["Classic"]).slice(0, 3).map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full" style={{ background: "rgba(199,179,139,0.1)", color: "var(--gold)", fontSize: "11px", border: "1px solid rgba(199,179,139,0.2)" }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 mb-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid rgba(199,179,139,0.28)" }}>
          <div className="p-4 flex items-start justify-between gap-3">
            <div>
              <p style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5 }}>
                Closet-based suggestion
              </p>
              <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "25px", lineHeight: 1.08, fontWeight: 400 }}>
                {wardrobeItems.length > 0 ? "Wear this today" : "Start your closet"}
              </h2>
            </div>
            <div className="px-2.5 py-1 rounded-full" style={{ background: "rgba(199,179,139,0.12)", color: "var(--gold)", fontSize: "10px", fontWeight: 700 }}>
              {loading ? "Loading" : `${wardrobeItems.length} pieces`}
            </div>
          </div>

          {dailyLook.length > 0 ? (
            <>
              <div className="flex overflow-x-auto" style={{ scrollbarWidth: "none", overscrollBehaviorX: "contain", touchAction: "pan-x" }}>
                {dailyLook.map((item) => (
                  <div key={item.id} className="relative flex items-center justify-center shrink-0" style={{ width: 116, height: 132, background: "var(--surface-2)", borderRight: "1px solid rgba(22,22,22,0.6)" }}>
                    {isPersistentImage(item.image) ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ fontSize: "30px" }}>{CATEGORY_EMOJI[item.category] ?? "👔"}</span>
                    )}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(14,13,12,0.72), transparent 58%)" }} />
                    <p className="absolute bottom-2 left-2 right-2" style={{ color: "var(--cream)", fontSize: "9px", lineHeight: 1.25, textAlign: "center", textShadow: "0 1px 4px rgba(0,0,0,0.8)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.name}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-4">
                <p style={{ color: "var(--lavender)", fontSize: "12px", lineHeight: 1.55, marginBottom: 13 }}>
                  Iris pulled together {dailyLook.length} piece{dailyLook.length === 1 ? "" : "s"} from what you own. Use this as your starting point, then ask Iris for swaps if the day changes.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => onAskIris?.(buildAskIrisPrompt(profile, dailyLook))} className="py-3 rounded-xl flex items-center justify-center gap-2"
                    style={{ background: "var(--gold)", color: "var(--charcoal)", border: "none", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                    <Sparkles size={14} /> Ask Iris
                  </button>
                  <button onClick={onOpenWardrobe} className="py-3 rounded-xl flex items-center justify-center gap-2"
                    style={{ background: "var(--surface-2)", color: "var(--cream)", border: "1px solid var(--border)", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                    Edit look <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 pt-0">
              <div className="rounded-xl p-4 mb-3 flex items-center gap-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <Camera size={18} style={{ color: "var(--gold)" }} />
                <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.5 }}>
                  Add a few pieces and this space becomes a real daily outfit recommendation.
                </p>
              </div>
              <button onClick={onOpenWardrobe} className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
                style={{ background: "var(--gold)", color: "var(--charcoal)", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                <Camera size={15} /> Add wardrobe pieces
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <div className="px-6 mb-5 grid grid-cols-3 gap-2">
        {[
          { label: "Pieces", value: wardrobeItems.length, icon: Shirt },
          { label: "Saved", value: savedLooksCount, icon: CheckCircle2 },
          { label: "Gaps", value: gaps.length, icon: CalendarDays },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl p-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <Icon size={15} style={{ color: "var(--gold)", marginBottom: 8 }} />
            <p style={{ color: "var(--cream)", fontSize: "18px", fontWeight: 700, lineHeight: 1 }}>{value}</p>
            <p style={{ color: "var(--muted-foreground)", fontSize: "10px", marginTop: 4 }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="px-6 mb-5">
        <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase" }}>Closet read</p>
              <h3 style={{ color: "var(--cream)", fontSize: "14px", fontWeight: 700, marginTop: 2 }}>What Iris notices</h3>
            </div>
            <CloudSun size={17} style={{ color: "var(--gold)" }} />
          </div>
          {gaps.length > 0 ? (
            <div className="flex flex-col gap-2">
              {gaps.slice(0, 3).map((gap) => (
                <p key={gap} style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.45 }}>✦ {gap}</p>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.5 }}>
              Your closet has enough range for full outfit building. Start saving looks so Iris can learn your favorites.
            </p>
          )}
        </div>
      </div>

      <div className="px-6 mb-5">
        <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full shrink-0" style={{ background: color.hex }} />
            <div>
              <p style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Color move</p>
              <p style={{ color: "var(--cream)", fontSize: "15px", fontWeight: 600 }}>{color.name}</p>
            </div>
          </div>
          <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.5, marginBottom: 10 }}>{color.desc}</p>
          <div className="flex gap-2 flex-wrap">
            {color.pairsWith.map((pair) => (
              <span key={pair} className="px-2 py-1 rounded-full" style={{ background: "var(--surface-2)", color: "var(--muted-foreground)", fontSize: "10px" }}>{pair}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 mb-8">
        <div className="rounded-2xl p-4" style={{ background: "rgba(199,179,139,0.08)", border: "1px solid rgba(199,179,139,0.22)" }}>
          <p style={{ color: "var(--gold)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Today’s focus</p>
          <p style={{ color: "var(--cream)", fontFamily: "var(--font-display)", fontSize: "22px", lineHeight: 1.15, fontWeight: 400 }}>
            Dress for ease first. Polish comes second.
          </p>
          <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.55, marginTop: 10 }}>
            The best outfit today is the one that gets you out the door feeling clear, comfortable, and like yourself.
          </p>
        </div>
      </div>
    </div>
  );
}

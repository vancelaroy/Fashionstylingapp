import type { WardrobeItem } from "../components/wardrobe/WardrobeUpload";

export type WardrobeGapCategory = "tops" | "bottoms" | "outerwear" | "shoes" | "bags" | "accessories";
export type WardrobeGapSeverity = "high" | "medium" | "low";

export interface WardrobeGapInsight {
  id: string;
  category: WardrobeGapCategory | null;
  title: string;
  body: string;
  prompt: string;
  actionLabel: string;
  severity: WardrobeGapSeverity;
  score: number;
}

export interface WardrobeGapOptions {
  season?: string;
  styleTags?: string[];
  max?: number;
}

export interface WardrobeCategoryCounts {
  tops: number;
  bottoms: number;
  dresses: number;
  outerwear: number;
  suits: number;
  shoes: number;
  bags: number;
  accessories: number;
  total: number;
}

const CATEGORY_LABELS: Record<WardrobeGapCategory, string> = {
  tops: "tops",
  bottoms: "bottoms",
  outerwear: "layers",
  shoes: "shoes",
  bags: "bags",
  accessories: "accessories",
};

const SEASON_LABELS: Record<string, string> = {
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  autumn: "Fall",
  winter: "Winter",
  "year-round": "Year-round",
};

function normalize(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function normalizeSeason(value?: string | null) {
  const season = normalize(value);
  if (season === "autumn") return "fall";
  return season;
}

function formatSeason(season: string) {
  return SEASON_LABELS[season] ?? season;
}

function normalizeCategory(category?: string | null): WardrobeGapCategory | null {
  const value = normalize(category);
  if (!value) return null;
  if (value.includes("dress") || value.includes("top") || value.includes("shirt") || value.includes("tee") || value.includes("blouse") || value.includes("sweater") || value.includes("knit")) return "tops";
  if (value.includes("bottom") || value.includes("pant") || value.includes("trouser") || value.includes("jean") || value.includes("short") || value.includes("skirt")) return "bottoms";
  if (value.includes("outer") || value.includes("coat") || value.includes("jacket") || value.includes("blazer") || value.includes("suit") || value.includes("layer")) return "outerwear";
  if (value.includes("shoe") || value.includes("sneaker") || value.includes("boot") || value.includes("loafer") || value.includes("heel") || value.includes("sandal")) return "shoes";
  if (value.includes("bag") || value.includes("tote") || value.includes("duffel") || value.includes("backpack") || value.includes("purse")) return "bags";
  if (value.includes("access") || value.includes("jewel") || value.includes("watch") || value.includes("belt") || value.includes("glasses") || value.includes("sunglasses") || value.includes("ring") || value.includes("scarf") || value.includes("hat")) return "accessories";
  return null;
}

function categoryPrompt(category: WardrobeGapCategory | null, title: string) {
  if (!category) return `Help me understand this wardrobe pattern: ${title}.`;
  return `Help me choose one ${CATEGORY_LABELS[category]} move that would make my wardrobe more useful.`;
}

function styleDirection(styleTags?: string[]) {
  const tags = (styleTags ?? []).filter(Boolean).slice(0, 2);
  if (tags.length === 0) return "";
  return ` Keep it aligned with my ${tags.join(" and ")} style direction.`;
}

function itemSeasons(item: WardrobeItem) {
  return (item.seasons ?? []).map(normalizeSeason).filter(Boolean);
}

function seasonMatches(item: WardrobeItem, season?: string) {
  const activeSeason = normalizeSeason(season);
  if (!activeSeason) return true;
  const seasons = itemSeasons(item);
  return seasons.length === 0 || seasons.includes("year-round") || seasons.includes(activeSeason);
}

function colorKey(item: WardrobeItem) {
  return normalize(item.color || item.secondaryColor || "unknown") || "unknown";
}

export function getWardrobeCategoryCounts(items: WardrobeItem[]): WardrobeCategoryCounts {
  const counts: WardrobeCategoryCounts = {
    tops: 0,
    bottoms: 0,
    dresses: 0,
    outerwear: 0,
    suits: 0,
    shoes: 0,
    bags: 0,
    accessories: 0,
    total: items.length,
  };

  items.forEach((item) => {
    const raw = normalize(item.category);
    if (raw.includes("dress")) counts.dresses += 1;
    if (raw.includes("suit")) counts.suits += 1;

    const category = normalizeCategory(item.category);
    if (category) counts[category] += 1;
  });

  return counts;
}

export function analyzeWardrobeGaps(items: WardrobeItem[], options: WardrobeGapOptions = {}): WardrobeGapInsight[] {
  if (items.length === 0) return [];

  const counts = getWardrobeCategoryCounts(items);
  const insights: WardrobeGapInsight[] = [];
  const used = new Set<string>();
  const styleLine = styleDirection(options.styleTags);

  const addInsight = (
    id: string,
    category: WardrobeGapCategory | null,
    title: string,
    body: string,
    score: number,
    severity: WardrobeGapSeverity = "medium",
  ) => {
    if (used.has(id)) return;
    used.add(id);
    insights.push({
      id,
      category,
      title,
      body,
      score,
      severity,
      actionLabel: category ? `Find ${CATEGORY_LABELS[category]}` : "Ask Iris",
      prompt: `${categoryPrompt(category, title)} ${body}${styleLine}`,
    });
  };

  const outfitBaseCount = counts.tops + counts.dresses + counts.suits;

  if (counts.shoes === 0) addInsight("missing-shoes", "shoes", "Add one dependable shoe", "A shoe with range changes the read of almost everything else you own.", 100, "high");
  if (counts.bottoms === 0 && counts.dresses + counts.suits <= 1) addInsight("missing-bottoms", "bottoms", "Add one reliable bottom", "Iris needs at least one bottom to build fuller outfit formulas.", 96, "high");
  if (outfitBaseCount === 0) addInsight("missing-tops", "tops", "Add one flexible top", "A top gives Iris the first anchor for real outfit planning.", 94, "high");
  if (counts.outerwear === 0 && counts.total >= 8) addInsight("missing-outerwear", "outerwear", "Add one intentional layer", "A layer can make simple outfits feel finished without buying a full new look.", 82);
  if (counts.accessories === 0 && counts.total >= 10) addInsight("missing-accessories", "accessories", "Add one finishing detail", "Small pieces create personality without requiring a whole new outfit.", 78);
  if (counts.bags === 0 && counts.total >= 12) addInsight("missing-bags", "bags", "Add one useful bag", "A bag helps daily looks feel complete and practical.", 70, "low");

  if (counts.tops > 0 && counts.tops < 3 && counts.total >= 5) addInsight("weak-tops", "tops", "Build more top rotation", "A few more tops would make the same bottoms feel less repetitive.", 74);
  if (counts.bottoms > 0 && counts.bottoms < 2 && counts.total >= 6) addInsight("weak-bottoms", "bottoms", "Add another bottom shape", "One more bottom would unlock more outfit variety with the tops you already own.", 76);
  if (counts.shoes > 0 && counts.shoes < 2 && counts.total >= 10) addInsight("weak-shoes", "shoes", "Add a second shoe lane", "One extra shoe option would keep Iris from repeating the same finish too often.", 80);
  if (counts.outerwear > 0 && counts.outerwear < 2 && counts.total >= 16) addInsight("weak-outerwear", "outerwear", "Round out your layers", "Another layer would help Iris shift outfits between casual, polished, and weather-ready.", 68, "low");
  if (counts.accessories > 0 && counts.accessories < 2 && counts.total >= 16) addInsight("weak-accessories", "accessories", "Add a second finishing detail", "Another accessory gives Iris more ways to personalize outfits without changing the clothes.", 64, "low");

  const activeSeason = normalizeSeason(options.season);
  if (activeSeason && activeSeason !== "year-round" && counts.total >= 12) {
    const seasonalCount = items.filter((item) => seasonMatches(item, activeSeason)).length;
    const target = Math.min(5, Math.ceil(counts.total * 0.25));
    if (seasonalCount < target) {
      const seasonalCategory: WardrobeGapCategory = activeSeason === "winter" || activeSeason === "fall" ? "outerwear" : "tops";
      addInsight(
        `season-${activeSeason}`,
        seasonalCategory,
        `Round out your ${formatSeason(activeSeason)} rotation`,
        `Only ${seasonalCount} pieces are tagged for ${formatSeason(activeSeason)}. Iris may repeat the same pieces until this season has more range.`,
        72,
      );
    }
  }

  const byCategoryAndColor = new Map<string, { count: number; category: WardrobeGapCategory; color: string }>();
  items.forEach((item) => {
    const category = normalizeCategory(item.category);
    if (!category) return;
    const color = colorKey(item);
    const key = `${category}:${color}`;
    const current = byCategoryAndColor.get(key) ?? { count: 0, category, color };
    current.count += 1;
    byCategoryAndColor.set(key, current);
  });

  Array.from(byCategoryAndColor.values())
    .filter((entry) => entry.count >= 4 && entry.color !== "unknown")
    .sort((a, b) => b.count - a.count)
    .slice(0, 1)
    .forEach((entry) => {
      addInsight(
        `duplicate-${entry.category}-${entry.color}`,
        entry.category,
        `Strong run of ${entry.color} ${CATEGORY_LABELS[entry.category]}`,
        "That can be a signature, but the next buy should add range or clearly replace one piece.",
        62,
        "low",
      );
    });

  (Object.keys(CATEGORY_LABELS) as WardrobeGapCategory[]).forEach((category) => {
    const count = counts[category];
    if (counts.total >= 14 && count / counts.total >= 0.45) {
      addInsight(
        `overbuilt-${category}`,
        category,
        `Heavy on ${CATEGORY_LABELS[category]}`,
        "This is a strength, not a problem. New buys here should be upgrades while other categories may unlock more outfits.",
        58,
        "low",
      );
    }
  });

  if (counts.tops >= 3 && counts.bottoms >= 2 && counts.accessories === 0) {
    addInsight("opportunity-accessories", "accessories", "Finish the outfits you can already build", "Your base pieces are ready. Accessories would make those outfits feel more intentional.", 69);
  }
  if (counts.tops >= 3 && counts.bottoms >= 2 && counts.shoes === 1) {
    addInsight("opportunity-shoes", "shoes", "Change the mood with shoes", "You have enough clothing range that one more shoe style would create meaningfully different outfits.", 67);
  }
  if (counts.tops >= 4 && counts.bottoms >= 2 && counts.bags === 0) {
    addInsight("opportunity-bags", "bags", "Complete your daily carry", "Your outfits can work harder with a bag that fits your real day.", 61, "low");
  }

  return insights
    .sort((a, b) => b.score - a.score)
    .slice(0, options.max ?? 6);
}

export function getWardrobeNeedCategories(insights: WardrobeGapInsight[]) {
  return Array.from(new Set(insights.map((insight) => insight.category).filter(Boolean))) as WardrobeGapCategory[];
}

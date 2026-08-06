import type { WardrobeItem } from "../components/wardrobe/WardrobeUpload";
import type { OutfitSlotKey, SavedOutfit } from "./savedOutfits";

export type OutfitSlots = Record<OutfitSlotKey, WardrobeItem | null>;

export interface OutfitSuggestion {
  name: string;
  note: string;
  slots: OutfitSlots;
}

type ConceptKey = "power-edit" | "weekend-soft" | "evening-clean";

interface ConceptProfile {
  name: string;
  note: string;
  occasions: string[];
  anchors: string[];
  rewards: RegExp[];
  penalties: RegExp[];
  colors: string[];
  outerwearMode: "required" | "optional" | "weather-only";
  edgyOuterwearAllowance: "low" | "medium" | "high";
}

const EMPTY_SLOTS: OutfitSlots = {
  top: null,
  bottom: null,
  outer: null,
  shoes: null,
  bag: null,
  accessory: null,
};

const CLOSET_SEASONS = ["spring", "summer", "fall", "winter", "year-round"];

const CONCEPTS: Record<ConceptKey, ConceptProfile> = {
  "power-edit": {
    name: "The Power Edit",
    note: "Sharp, pulled together, and easy to wear.",
    occasions: ["work", "interview", "event"],
    anchors: ["tops", "dresses", "suits"],
    rewards: [
      /tailored|structured|crisp|polished|button|oxford|dress shirt|blazer|suit|trouser|pleated|loafer|oxford|watch/,
      /navy|black|charcoal|white|cream|gray|grey|camel/,
    ],
    penalties: [/distressed|gym|sleep|beach|too casual|worn|novelty/],
    colors: ["navy", "black", "charcoal", "white", "cream", "gray", "grey", "camel"],
    outerwearMode: "optional",
    edgyOuterwearAllowance: "low",
  },
  "weekend-soft": {
    name: "Weekend Soft",
    note: "Relaxed pieces with enough polish to leave the house confidently.",
    occasions: ["weekend", "casual", "errands", "travel"],
    anchors: ["tops", "dresses", "bottoms"],
    rewards: [
      /soft|relaxed|flowy|easy|knit|cotton|linen|tee|t-shirt|denim|canvas|sneaker|bucket|drawstring|cardigan/,
      /cream|taupe|sage|olive|tan|camel|blue|denim|dusty|soft/,
    ],
    penalties: [/moto|leather|structured|formal|suit|sharp|stiff|office|interview/],
    colors: ["cream", "taupe", "sage", "olive", "tan", "camel", "blue", "denim", "white"],
    outerwearMode: "optional",
    edgyOuterwearAllowance: "low",
  },
  "evening-clean": {
    name: "Evening Clean",
    note: "A simple after-dark formula using what is already in your closet.",
    occasions: ["evening", "dinner", "date", "event"],
    anchors: ["tops", "dresses"],
    rewards: [
      /sleek|clean|silk|black|navy|dress|button|blazer|jacket|boot|loafer|watch|minimal/,
      /black|navy|white|cream|charcoal|silver|burgundy/,
    ],
    penalties: [/gym|sleep|beach|worn|loud|too casual/],
    colors: ["black", "navy", "white", "cream", "charcoal", "silver", "burgundy"],
    outerwearMode: "optional",
    edgyOuterwearAllowance: "medium",
  },
};

function normalizeSeasons(seasons?: string[]) {
  const normalized = (seasons ?? [])
    .map((season) => season.trim().toLowerCase())
    .map((season) => season === "autumn" ? "fall" : season)
    .filter((season) => CLOSET_SEASONS.includes(season));

  if (normalized.length === 0 || normalized.includes("year-round")) return ["year-round"];
  return Array.from(new Set(normalized));
}

function getCalendarSeason() {
  const month = new Date().getMonth();
  if (month <= 1 || month === 11) return "winter";
  if (month <= 4) return "spring";
  if (month <= 7) return "summer";
  return "fall";
}

function isItemInSeason(item: WardrobeItem, season: string) {
  const seasons = normalizeSeasons(item.seasons);
  return seasons.includes("year-round") || seasons.includes(season);
}

function itemText(item: WardrobeItem) {
  return [
    item.name,
    item.brand,
    item.category,
    item.color,
    item.secondaryColor,
    item.fit,
    ...(item.occasions ?? []),
    ...(item.seasons ?? []),
    item.styleNote,
  ].filter(Boolean).join(" ").toLowerCase();
}

function isOuterwearLike(item: WardrobeItem) {
  return item.category === "outerwear" || item.category === "suits";
}

function isEdgyOuterwear(item: WardrobeItem) {
  if (!isOuterwearLike(item)) return false;
  return /moto|biker|leather|racer|motorcycle/.test(itemText(item));
}

function edgyOuterwearPenalty(item: WardrobeItem, concept: Pick<ConceptProfile, "edgyOuterwearAllowance">) {
  if (!isEdgyOuterwear(item)) return 0;
  if (concept.edgyOuterwearAllowance === "high") return 0;
  if (concept.edgyOuterwearAllowance === "medium") return -6;
  return -16;
}

function scoreItem(item: WardrobeItem, concept: ConceptProfile, selected: WardrobeItem[], recentIds: Set<string>, season: string) {
  const text = itemText(item);
  let score = 0;

  if (concept.anchors.includes(item.category)) score += 5;
  if ((item.occasions ?? []).some((occasion) => concept.occasions.includes(occasion))) score += 8;
  if (isItemInSeason(item, season)) score += 7;

  concept.rewards.forEach((rule) => {
    if (rule.test(text)) score += 5;
  });

  concept.penalties.forEach((rule) => {
    if (rule.test(text)) score -= 7;
  });

  if (concept.colors.some((color) => text.includes(color))) score += 3;

  const selectedColors = selected.flatMap((piece) => [piece.color, piece.secondaryColor]).filter(Boolean).map((color) => String(color).toLowerCase());
  if (selectedColors.includes((item.color ?? "").toLowerCase())) score -= 2;
  if (recentIds.has(item.id)) score -= isOuterwearLike(item) ? 18 : 9;
  score += edgyOuterwearPenalty(item, concept);

  return score;
}

function pickBest(
  items: WardrobeItem[],
  categories: string[],
  concept: ConceptProfile,
  selected: WardrobeItem[],
  recentIds: Set<string>,
  season: string,
  requireSeason = false,
) {
  const selectedIds = new Set(selected.map((item) => item.id));
  const candidates = items
    .filter((item) => categories.includes(item.category) && !selectedIds.has(item.id))
    .filter((item) => !requireSeason || isItemInSeason(item, season))
    .map((item, index) => ({ item, score: scoreItem(item, concept, selected, recentIds, season), index }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  return candidates[0] ?? null;
}

export function getRecentOutfitItemIds(outfits: SavedOutfit[], limit = 8) {
  return outfits
    .slice(0, limit)
    .flatMap((outfit) => Object.values(outfit.slotItemIds ?? {}))
    .filter((id): id is string => typeof id === "string" && id.length > 0);
}

export function buildConceptOutfitSuggestion(
  items: WardrobeItem[],
  conceptKey: ConceptKey,
  options: { recentItemIds?: string[]; season?: string } = {},
): OutfitSuggestion {
  const concept = CONCEPTS[conceptKey];
  const season = options.season ?? getCalendarSeason();
  const recentIds = new Set(options.recentItemIds ?? []);
  const selected: WardrobeItem[] = [];

  const topPick = pickBest(items, ["tops", "dresses", "suits"], concept, selected, recentIds, season);
  const top = topPick?.item ?? null;
  if (top) selected.push(top);

  const isDress = top?.category === "dresses";
  const bottomPick = isDress ? null : pickBest(items, ["bottoms"], concept, selected, recentIds, season);
  const bottom = bottomPick?.item ?? null;
  if (bottom) selected.push(bottom);

  const outerPick = pickBest(items, ["outerwear", "suits"], concept, selected, recentIds, season, concept.outerwearMode === "weather-only");
  const outerThreshold = concept.outerwearMode === "required" ? 4 : 10;
  const outer = outerPick && (concept.outerwearMode === "required" || outerPick.score >= outerThreshold) ? outerPick.item : null;
  if (outer) selected.push(outer);

  const shoesPick = pickBest(items, ["shoes"], concept, selected, recentIds, season);
  const shoes = shoesPick?.item ?? null;
  if (shoes) selected.push(shoes);

  const bagPick = pickBest(items, ["bags"], concept, selected, recentIds, season);
  const bag = bagPick?.item ?? null;
  if (bag) selected.push(bag);

  const accessoryPick = pickBest(items, ["accessories"], concept, selected, recentIds, season);
  const accessory = accessoryPick?.item ?? null;

  return {
    name: concept.name,
    note: concept.note,
    slots: { ...EMPTY_SLOTS, top, bottom, outer, shoes, bag, accessory },
  };
}

function dailyConcept(): ConceptProfile {
  return {
    name: "Daily",
    note: "A wearable daily look.",
    occasions: ["casual", "weekend", "errands", "travel", "work", "dinner"],
    anchors: ["tops", "dresses", "bottoms", "shoes"],
    rewards: [
      /easy|comfortable|soft|clean|classic|minimal|streetwear|polished|denim|cotton|knit|button|sneaker|loafer|boot/,
      /cream|white|black|navy|gray|grey|camel|tan|olive|sage|denim|brown/,
    ],
    penalties: [/sleep|gym|beach|worn|costume|formal-only/],
    colors: ["cream", "white", "black", "navy", "gray", "grey", "camel", "tan", "olive", "sage", "denim", "brown"],
    outerwearMode: "weather-only",
    edgyOuterwearAllowance: "low",
  };
}

function parseTemp(temp?: string) {
  const value = Number(String(temp ?? "").replace(/[^\d-]/g, ""));
  return Number.isNaN(value) ? null : value;
}

function shouldIncludeOuterwear(season: string, temp?: string, condition?: string) {
  const value = parseTemp(temp);
  const lowerCondition = String(condition ?? "").toLowerCase();
  if (value !== null) return value <= 58 || /rain|wind|cold|overcast/.test(lowerCondition);
  if (/rain|wind|cold/.test(lowerCondition)) return true;
  return season === "winter" && /overcast|snow|storm/.test(lowerCondition);
}

function pickRanked(
  items: WardrobeItem[],
  categories: string[],
  concept: ConceptProfile,
  selected: WardrobeItem[],
  recentIds: Set<string>,
  season: string,
  seed: number,
  variant: number,
  offset: number,
  requireSeason = false,
) {
  const selectedIds = new Set(selected.map((item) => item.id));
  const candidates = items
    .filter((item) => categories.includes(item.category) && !selectedIds.has(item.id))
    .filter((item) => !requireSeason || isItemInSeason(item, season))
    .map((item, index) => ({ item, score: scoreItem(item, concept, selected, recentIds, season), index }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  if (candidates.length === 0) return null;
  const windowed = candidates.slice(0, Math.min(4, candidates.length));
  const pickIndex = Math.abs((seed + variant * 17 + offset * 31) % windowed.length);
  return windowed[pickIndex] ?? null;
}

export function buildDailyOutfit(
  items: WardrobeItem[],
  seed: number,
  variant: number,
  season: string,
  options: { recentItemIds?: string[]; weatherTemp?: string; weatherCondition?: string } = {},
) {
  const concept = dailyConcept();
  const recentIds = new Set(options.recentItemIds ?? []);
  const selected: WardrobeItem[] = [];

  const topPick = pickRanked(items, ["tops", "dresses"], concept, selected, recentIds, season, seed, variant, 1);
  const top = topPick?.item ?? null;
  if (top) selected.push(top);

  const bottomPick = top?.category === "dresses" ? null : pickRanked(items, ["bottoms"], concept, selected, recentIds, season, seed, variant, 2);
  const bottom = bottomPick?.item ?? null;
  if (bottom) selected.push(bottom);

  const shoesPick = pickRanked(items, ["shoes"], concept, selected, recentIds, season, seed, variant, 3);
  const shoes = shoesPick?.item ?? null;
  if (shoes) selected.push(shoes);

  const bagPick = pickRanked(items, ["bags"], concept, selected, recentIds, season, seed, variant, 4);
  const bag = bagPick?.item ?? null;
  if (bag) selected.push(bag);

  const accessoryPick = pickRanked(items, ["accessories"], concept, selected, recentIds, season, seed, variant, 5);
  const accessory = accessoryPick?.item ?? null;
  if (accessory) selected.push(accessory);

  const needsLayer = shouldIncludeOuterwear(season, options.weatherTemp, options.weatherCondition);
  const outerPick = needsLayer ? pickRanked(items, ["outerwear", "suits"], concept, selected, recentIds, season, seed, variant, 6, true) : null;
  const outer = outerPick && outerPick.score >= 4 ? outerPick.item : null;

  return [top, bottom, shoes, bag, accessory, outer].filter(Boolean) as WardrobeItem[];
}

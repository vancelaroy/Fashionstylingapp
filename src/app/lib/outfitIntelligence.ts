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
  optionalOuterwear: boolean;
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
    anchors: ["tops", "dresses", "suits", "outerwear"],
    rewards: [
      /tailored|structured|crisp|polished|button|oxford|dress shirt|blazer|suit|trouser|pleated|loafer|oxford|watch/,
      /navy|black|charcoal|white|cream|gray|grey|camel/,
    ],
    penalties: [/distressed|gym|sleep|beach|too casual|worn|novelty/],
    colors: ["navy", "black", "charcoal", "white", "cream", "gray", "grey", "camel"],
    optionalOuterwear: false,
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
    optionalOuterwear: true,
  },
  "evening-clean": {
    name: "Evening Clean",
    note: "A simple after-dark formula using what is already in your closet.",
    occasions: ["evening", "dinner", "date", "event"],
    anchors: ["tops", "dresses", "outerwear"],
    rewards: [
      /sleek|clean|silk|black|navy|leather|dress|button|blazer|jacket|boot|loafer|watch|minimal/,
      /black|navy|white|cream|charcoal|silver|burgundy/,
    ],
    penalties: [/gym|sleep|beach|worn|loud|too casual/],
    colors: ["black", "navy", "white", "cream", "charcoal", "silver", "burgundy"],
    optionalOuterwear: false,
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
  if (recentIds.has(item.id)) score -= 9;

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

  const outerPick = pickBest(items, ["outerwear", "suits"], concept, selected, recentIds, season, concept.optionalOuterwear);
  const outer = outerPick && (!concept.optionalOuterwear || outerPick.score >= 6) ? outerPick.item : null;
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

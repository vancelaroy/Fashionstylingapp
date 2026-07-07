import { useEffect, useMemo, useState } from "react";
import { Heart, ShoppingBag, Star, ChevronRight, Glasses, Scissors, Sparkles, Shirt, Plus, Wand2 } from "lucide-react";
import { motion } from "motion/react";
import { ScentScreen } from "./ScentScreen";
import type { StyleProfile } from "../onboarding/OnboardingFlow";
import type { WardrobeItem } from "../wardrobe/WardrobeUpload";
import { projectId } from "/utils/supabase/info";
import productCatalogSeed from "./productCatalog.json";

const SERVER = `https://${projectId}.supabase.co/functions/v1/irys-api`;

type ProductGender = "men" | "women" | "unisex";
type PriceTier = "budget" | "mid" | "premium";

interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  retailer: string;
  category: string;
  gender: ProductGender;
  priceTier: PriceTier;
  approximatePrice: string;
  styleTags: string[];
  occasionTags: string[];
  colorTags: string[];
  colorSeasonFit: string[];
  fitTags: string[];
  whyIrysRecommendsIt: string;
  pairsWellWith: string[];
  affiliateReady: boolean;
  productUrl: string;
  imageUrl: string;
  notes: string;
}

interface ProductVerdict {
  label: "Fills Gap" | "Possible Duplicate" | "Upgrade Pick" | "Completes Looks";
  tone: "gold" | "red" | "lavender" | "slate";
  reason: string;
  similarItems: WardrobeItem[];
}

const PRODUCT_CATALOG = productCatalogSeed as CatalogProduct[];

// ── Product data — gender split ───────────────────────────────────────────────

const SHOP_WOMEN = [
  { id: 1, name: "Silk Charmeuse Blouse", brand: "Vince", price: "$295", match: 96, category: "Tops", image: "https://images.unsplash.com/photo-1611367540736-b1b38aff784b?w=400&h=500&fit=crop&auto=format" },
  { id: 2, name: "Wide Leg Wool Trouser", brand: "Theory", price: "$345", match: 92, category: "Bottoms", image: "https://images.unsplash.com/photo-1662532577856-e8ee8b138a8b?w=400&h=500&fit=crop&auto=format" },
  { id: 3, name: "Gold Statement Earrings", brand: "Mejuri", price: "$98", match: 98, category: "Jewelry", image: "https://images.unsplash.com/photo-1549439602-43ebca2327af?w=400&h=500&fit=crop&auto=format" },
  { id: 4, name: "Leather Mule Heels", brand: "Aeyde", price: "$285", match: 94, category: "Shoes", image: "https://images.unsplash.com/photo-1569388330292-79cc1ec67270?w=400&h=500&fit=crop&auto=format" },
  { id: 5, name: "Merino Knit Dress", brand: "& Other Stories", price: "$175", match: 91, category: "Dresses", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=500&fit=crop&auto=format" },
  { id: 6, name: "Structured Tote", brand: "Polène", price: "$395", match: 89, category: "Bags", image: "https://images.unsplash.com/photo-1589363358751-ab05797e5629?w=400&h=500&fit=crop&auto=format" },
];

const SHOP_MEN = [
  { id: 101, name: "Slim Oxford Shirt", brand: "COS", price: "$95", match: 97, category: "Tops", image: "https://images.unsplash.com/photo-1532332248682-206cc786359f?w=400&h=500&fit=crop&auto=format" },
  { id: 102, name: "Tapered Chinos", brand: "Reiss", price: "$175", match: 94, category: "Bottoms", image: "https://images.unsplash.com/photo-1619603364937-8d7af41ef206?w=400&h=500&fit=crop&auto=format" },
  { id: 103, name: "Camel Wool Overcoat", brand: "Arket", price: "$425", match: 96, category: "Outerwear", image: "https://images.unsplash.com/photo-1666932521131-d990bd263a2c?w=400&h=500&fit=crop&auto=format" },
  { id: 104, name: "Leather Chelsea Boots", brand: "Thursday Boot Co.", price: "$199", match: 95, category: "Shoes", image: "https://images.unsplash.com/photo-1619603364904-c0498317e145?w=400&h=500&fit=crop&auto=format" },
  { id: 105, name: "Minimalist Watch", brand: "Nomos Glashütte", price: "$1,290", match: 92, category: "Accessories", image: "https://images.unsplash.com/photo-1550995694-3f5f4a7e1bd2?w=400&h=500&fit=crop&auto=format" },
  { id: 106, name: "Navy Slim Blazer", brand: "Suitsupply", price: "$449", match: 98, category: "Suiting", image: "https://images.unsplash.com/photo-1656695230389-01185e6fbff8?w=400&h=500&fit=crop&auto=format" },
];

const SHOP_NB = [
  { id: 201, name: "Oversized Wool Blazer", brand: "Totême", price: "$595", match: 97, category: "Outerwear", image: "https://images.unsplash.com/photo-1612731486606-2614b4d74921?w=400&h=500&fit=crop&auto=format" },
  { id: 202, name: "Wide Leg Trousers", brand: "COS", price: "$149", match: 95, category: "Bottoms", image: "https://images.unsplash.com/photo-1550995694-3f5f4a7e1bd2?w=400&h=500&fit=crop&auto=format" },
  { id: 203, name: "Unisex Crew Tee", brand: "Uniqlo U", price: "$30", match: 93, category: "Tops", image: "https://images.unsplash.com/photo-1532332248682-206cc786359f?w=400&h=500&fit=crop&auto=format" },
  { id: 204, name: "Chunky Derby Shoes", brand: "Dr. Martens", price: "$180", match: 91, category: "Shoes", image: "https://images.unsplash.com/photo-1619603364937-8d7af41ef206?w=400&h=500&fit=crop&auto=format" },
];

// ── Get The Look data — gender split ─────────────────────────────────────────

const LOOKS_WOMEN = [
  {
    id: 1,
    title: "The Power Interview",
    occasion: "Job Interview",
    image: "https://images.unsplash.com/photo-1612731486606-2614b4d74921?w=600&h=800&fit=crop&auto=format",
    pieces: [
      { label: "Blazer", item: "Structured double-breasted blazer", brand: "Theory", price: "$595" },
      { label: "Trousers", item: "Tapered high-rise trousers", brand: "Banana Republic", price: "$135" },
      { label: "Shoes", item: "Pointed-toe block heel", brand: "Steve Madden", price: "$89" },
      { label: "Bag", item: "Structured top-handle bag", brand: "Polène", price: "$395" },
      { label: "Jewelry", item: "Gold stud earrings", brand: "Mejuri", price: "$75" },
    ],
  },
  {
    id: 2,
    title: "The Soft Evening",
    occasion: "Date Night",
    image: "https://images.unsplash.com/photo-1662532577856-e8ee8b138a8b?w=600&h=800&fit=crop&auto=format",
    pieces: [
      { label: "Dress", item: "Silk slip midi dress", brand: "Reformation", price: "$248" },
      { label: "Shoes", item: "Strappy heeled sandal", brand: "Tony Bianco", price: "$189" },
      { label: "Bag", item: "Satin evening clutch", brand: "CULT GAIA", price: "$178" },
      { label: "Jewelry", item: "Gold chain necklace", brand: "Mejuri", price: "$128" },
    ],
  },
];

const LOOKS_MEN = [
  {
    id: 1,
    title: "The Power Interview",
    occasion: "Job Interview",
    image: "https://images.unsplash.com/photo-1619603364937-8d7af41ef206?w=600&h=800&fit=crop&auto=format",
    pieces: [
      { label: "Suit", item: "Charcoal slim-fit suit", brand: "Suitsupply", price: "$599" },
      { label: "Shirt", item: "White poplin dress shirt", brand: "COS", price: "$95" },
      { label: "Tie", item: "Burgundy silk tie", brand: "Drake's London", price: "$145" },
      { label: "Shoes", item: "Oxford brogue in tan", brand: "Thursday Boot Co.", price: "$199" },
      { label: "Belt", item: "Leather dress belt", brand: "Fossil", price: "$60" },
    ],
  },
  {
    id: 2,
    title: "Smart Date Night",
    occasion: "Date Night",
    image: "https://images.unsplash.com/photo-1532332248682-206cc786359f?w=600&h=800&fit=crop&auto=format",
    pieces: [
      { label: "Trousers", item: "Navy slim chinos", brand: "Reiss", price: "$175" },
      { label: "Shirt", item: "Linen button-down", brand: "Uniqlo", price: "$40" },
      { label: "Shoes", item: "White leather sneakers", brand: "Common Projects", price: "$455" },
      { label: "Watch", item: "Minimalist dress watch", brand: "Nomos", price: "$1,290" },
    ],
  },
];

const LOOKS_NB = [
  {
    id: 1,
    title: "Androgynous Power",
    occasion: "Work / Creative",
    image: "https://images.unsplash.com/photo-1550995694-3f5f4a7e1bd2?w=600&h=800&fit=crop&auto=format",
    pieces: [
      { label: "Blazer", item: "Oversized structured blazer", brand: "Totême", price: "$595" },
      { label: "Trousers", item: "Wide-leg tailored trousers", brand: "COS", price: "$149" },
      { label: "Shoes", item: "Chunky platform loafer", brand: "Vagabond", price: "$150" },
      { label: "Bag", item: "Boxy leather tote", brand: "Aesther Ekme", price: "$360" },
    ],
  },
];

// ── Glasses data — face-shape aware ──────────────────────────────────────────

const GLASSES_BY_FACE: Record<string, {
  tip: string;
  avoid: string;
  frames: { name: string; brand: string; shape: string; price: string; image: string; why: string }[];
}> = {
  oval: {
    tip: "Lucky you — almost any frame works. Go bold or geometric to make a statement.",
    avoid: "Frames narrower than your face width",
    frames: [
      { name: "Bold Acetate Square", brand: "Warby Parker", shape: "Square", price: "$145", image: "https://images.unsplash.com/photo-1556306510-31ca015374b0?w=400&h=300&fit=crop&auto=format", why: "Adds structure to your balanced face" },
      { name: "Oversized Round", brand: "Gentle Monster", shape: "Round", price: "$325", image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400&h=300&fit=crop&auto=format", why: "Classic look that complements every feature" },
      { name: "Thin Metal Rectangle", brand: "Ray-Ban", shape: "Rectangle", price: "$189", image: "https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=400&h=300&fit=crop&auto=format", why: "Sleek and minimal — never goes out of style" },
    ],
  },
  heart: {
    tip: "Balance a wider forehead with frames that sit lighter on top — cat-eye, rimless, or oval.",
    avoid: "Heavy browline frames, top-heavy decorative styles",
    frames: [
      { name: "Cat-Eye Gold", brand: "Ray-Ban", shape: "Cat-Eye", price: "$189", image: "https://images.unsplash.com/photo-1524255684952-d7185b509571?w=400&h=300&fit=crop&auto=format", why: "Lifts and balances your face beautifully" },
      { name: "Rimless Oval", brand: "Silhouette", shape: "Rimless", price: "$385", image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=300&fit=crop&auto=format", why: "Almost invisible — lets your features shine" },
      { name: "Light Oval Acetate", brand: "Warby Parker", shape: "Oval", price: "$145", image: "https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=400&h=300&fit=crop&auto=format", why: "Soft shape mirrors your natural contours" },
    ],
  },
  round: {
    tip: "Angular frames add definition and elongate your soft features.",
    avoid: "Round or small frames that echo your face shape",
    frames: [
      { name: "Bold Rectangle", brand: "Tom Ford", shape: "Rectangle", price: "$395", image: "https://images.unsplash.com/photo-1556306510-31ca015374b0?w=400&h=300&fit=crop&auto=format", why: "Strong lines create contrast and definition" },
      { name: "Square Acetate", brand: "Warby Parker", shape: "Square", price: "$145", image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400&h=300&fit=crop&auto=format", why: "Adds sharp angles to soften the roundness" },
      { name: "Geometric Angular", brand: "Gentle Monster", shape: "Geometric", price: "$295", image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=300&fit=crop&auto=format", why: "Unexpected angles make a confident statement" },
    ],
  },
  square: {
    tip: "Soft curves balance your strong jawline. Round and oval frames are your best friends.",
    avoid: "Boxy rectangles and sharp angular geometrics",
    frames: [
      { name: "Round Tortoise", brand: "Garrett Leight", shape: "Round", price: "$325", image: "https://images.unsplash.com/photo-1524255684952-d7185b509571?w=400&h=300&fit=crop&auto=format", why: "Softens your jawline with gentle curves" },
      { name: "Oval Metal", brand: "Ray-Ban", shape: "Oval", price: "$189", image: "https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=400&h=300&fit=crop&auto=format", why: "Classic oval balances angular features" },
      { name: "Cat-Eye Acetate", brand: "Warby Parker", shape: "Cat-Eye", price: "$145", image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400&h=300&fit=crop&auto=format", why: "Curves up and away from a strong jaw" },
    ],
  },
  diamond: {
    tip: "Draw attention to your striking cheekbones with frames that have detail on top.",
    avoid: "Narrow frames that emphasize width at the cheeks",
    frames: [
      { name: "Cat-Eye Gold", brand: "Ray-Ban", shape: "Cat-Eye", price: "$189", image: "https://images.unsplash.com/photo-1524255684952-d7185b509571?w=400&h=300&fit=crop&auto=format", why: "Top detail highlights your beautiful cheekbones" },
      { name: "Oval Rimless", brand: "Silhouette", shape: "Oval/Rimless", price: "$385", image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=300&fit=crop&auto=format", why: "Minimal frame lets your face structure speak" },
      { name: "Browline Classic", brand: "Persol", shape: "Browline", price: "$265", image: "https://images.unsplash.com/photo-1556306510-31ca015374b0?w=400&h=300&fit=crop&auto=format", why: "Top frame detail emphasizes the brow and eye" },
    ],
  },
  oblong: {
    tip: "Deep, wide frames add width and break up the length of your face beautifully.",
    avoid: "Narrow or rimless frames that emphasize length",
    frames: [
      { name: "Oversized Round", brand: "Gentle Monster", shape: "Round", price: "$325", image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400&h=300&fit=crop&auto=format", why: "Adds width and softness to an elongated face" },
      { name: "Wide Acetate Square", brand: "Tom Ford", shape: "Square", price: "$395", image: "https://images.unsplash.com/photo-1556306510-31ca015374b0?w=400&h=300&fit=crop&auto=format", why: "Maximum width creates beautiful balance" },
      { name: "Decorative Temple Detail", brand: "Warby Parker", shape: "Rectangle", price: "$145", image: "https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=400&h=300&fit=crop&auto=format", why: "Side detail draws the eye outward" },
    ],
  },
};

// ── Stylists & Tailors ────────────────────────────────────────────────────────

const STYLISTS = [
  {
    id: 1, name: "Amara Osei", type: "stylist",
    specialty: "Editorial & Evening Wear",
    rating: 4.9, reviews: 142, price: "from $85/session",
    bio: "10 years in NYC fashion. Former Vogue editorial stylist now working with private clients on wardrobe strategy and event dressing.",
    tags: ["Romantic", "Classic", "Evening"],
    image: "https://images.unsplash.com/photo-1753162657110-753418a3840b?w=200&h=200&fit=crop&auto=format",
    available: true,
    badge: "Top Rated",
  },
  {
    id: 2, name: "Marcus Delacroix", type: "tailor",
    specialty: "Bespoke Menswear & Alterations",
    rating: 4.9, reviews: 203, price: "from $60/alteration",
    bio: "Master tailor trained in London's Savile Row tradition. Specializes in suit alterations, custom shirts, and trouser tapering for the modern man.",
    tags: ["Suiting", "Alterations", "Bespoke"],
    image: "https://images.unsplash.com/photo-1705970268643-ee5981567df5?w=200&h=200&fit=crop&auto=format",
    available: true,
    badge: "Savile Row Trained",
  },
  {
    id: 3, name: "Sofia Marchetti", type: "stylist",
    specialty: "Capsule Wardrobe & Minimalism",
    rating: 4.8, reviews: 98, price: "from $65/session",
    bio: "Milan-trained, Paris-based. Helps clients build a perfectly edited wardrobe that does more with less. Capsule wardrobe specialist.",
    tags: ["Minimalist", "Classic", "Work"],
    image: "https://images.unsplash.com/photo-1753162657110-9181a3bd206b?w=200&h=200&fit=crop&auto=format",
    available: true,
    badge: null,
  },
  {
    id: 4, name: "Priya Nair", type: "tailor",
    specialty: "Women's Alterations & Bridal",
    rating: 4.8, reviews: 176, price: "from $45/alteration",
    bio: "Precision alterations for everyday wear and special occasions. Expert in dress hemming, waist taking-in, and bridal tailoring.",
    tags: ["Alterations", "Bridal", "Dresses"],
    image: "https://images.unsplash.com/photo-1673201230274-c4dbd20c3f79?w=200&h=200&fit=crop&auto=format",
    available: false,
    badge: null,
  },
];

interface DiscoverScreenProps {
  profile: StyleProfile;
  accessToken?: string | null;
  onAskIris?: (prompt: string) => void;
  onOpenWardrobe?: () => void;
}

const DISCOVER_TABS = ["For You", "Get The Look", "Glasses", "Stylists & Tailors", "Scent"];
const OCCASION_FILTERS = ["All", "Work", "Date Night", "Casual", "Weekend", "Travel", "Formal"];
const PRICE_FILTERS: { label: string; value: "all" | PriceTier }[] = [
  { label: "All prices", value: "all" },
  { label: "Budget", value: "budget" },
  { label: "Mid", value: "mid" },
  { label: "Premium", value: "premium" },
];

const PRODUCT_CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  tops: { label: "Top", icon: "Shirt" },
  bottoms: { label: "Bottom", icon: "Trouser" },
  dresses: { label: "Dress", icon: "Dress" },
  outerwear: { label: "Layer", icon: "Coat" },
  suits: { label: "Suiting", icon: "Suit" },
  shoes: { label: "Shoe", icon: "Shoe" },
  bags: { label: "Bag", icon: "Bag" },
  accessories: { label: "Accessory", icon: "Detail" },
  glasses: { label: "Frame", icon: "Frame" },
  fragrance: { label: "Scent", icon: "Scent" },
};

const CATEGORY_COPY: Record<string, { label: string; reason: string; prompt: string }> = {
  tops: {
    label: "Top",
    reason: "More tops create the most new outfit combinations.",
    prompt: "Help me choose one versatile top that fits my Style DNA and works with my current closet.",
  },
  bottoms: {
    label: "Bottom",
    reason: "A strong bottom unlocks repeatable casual, work, and evening looks.",
    prompt: "Help me choose one versatile bottom that would unlock more outfits in my closet.",
  },
  outerwear: {
    label: "Layer",
    reason: "Outerwear makes simple outfits look intentional fast.",
    prompt: "Help me choose one outerwear layer that would make my closet feel more polished.",
  },
  shoes: {
    label: "Shoe",
    reason: "Shoes change the read of everything else you own.",
    prompt: "Help me choose one shoe that would complete the most outfits in my closet.",
  },
  bags: {
    label: "Bag",
    reason: "A finishing piece makes outfits feel complete instead of accidental.",
    prompt: "Help me choose one bag that works with my wardrobe and daily life.",
  },
  accessories: {
    label: "Accessory",
    reason: "Small details add personality without requiring a whole new outfit.",
    prompt: "Help me choose one accessory that would make my current wardrobe feel more styled.",
  },
};

function getWardrobeCounts(items: WardrobeItem[]) {
  return {
    tops: items.filter((item) => item.category === "tops" || item.category === "dresses").length,
    bottoms: items.filter((item) => item.category === "bottoms").length,
    outerwear: items.filter((item) => item.category === "outerwear" || item.category === "suits").length,
    shoes: items.filter((item) => item.category === "shoes").length,
    bags: items.filter((item) => item.category === "bags").length,
    accessories: items.filter((item) => item.category === "accessories").length,
  };
}

function getClosetNeeds(items: WardrobeItem[]) {
  const counts = getWardrobeCounts(items);
  return [
    counts.shoes === 0 ? "shoes" : null,
    counts.bottoms === 0 ? "bottoms" : null,
    counts.outerwear === 0 ? "outerwear" : null,
    counts.bags === 0 ? "bags" : null,
    counts.accessories === 0 ? "accessories" : null,
    counts.tops < 2 ? "tops" : null,
  ].filter(Boolean) as string[];
}

function getProductNeedCategory(category: string) {
  const value = category.toLowerCase();
  if (value.includes("top") || value.includes("shirt")) return "tops";
  if (value.includes("bottom") || value.includes("trouser") || value.includes("pant")) return "bottoms";
  if (value.includes("outer") || value.includes("coat") || value.includes("suit")) return "outerwear";
  if (value.includes("shoe")) return "shoes";
  if (value.includes("bag")) return "bags";
  return "accessories";
}

function normalizeTag(value: string) {
  return value.toLowerCase().trim();
}

function genderMatches(profileGender: string | undefined, productGender: ProductGender) {
  if (productGender === "unisex") return true;
  if (profileGender === "man") return productGender === "men";
  if (profileGender === "woman") return productGender === "women";
  return true;
}

function scoreProduct(
  product: CatalogProduct,
  profile: StyleProfile,
  closetNeeds: string[],
  selectedOccasion: string,
) {
  const productNeedCategory = getProductNeedCategory(product.category);
  const styleTags = product.styleTags.map(normalizeTag);
  const profileStyles = (profile.stylePersonality || []).map(normalizeTag);
  const season = normalizeTag(profile.colorSeason || "");
  const occasion = normalizeTag(selectedOccasion);
  let score = 50;

  if (closetNeeds.includes(productNeedCategory)) score += 32;
  if (genderMatches(profile.gender, product.gender)) score += 18;
  score += profileStyles.filter((style) => styleTags.includes(style)).length * 10;
  if (product.colorSeasonFit.includes("all") || product.colorSeasonFit.map(normalizeTag).includes(season)) score += 9;
  if (occasion !== "all" && product.occasionTags.map(normalizeTag).includes(occasion)) score += 18;
  if (product.priceTier === "mid") score += 4;
  if (product.affiliateReady) score += 2;

  return score;
}

function getMatchReason(product: CatalogProduct, profile: StyleProfile, closetNeeds: string[], selectedOccasion: string) {
  const productNeedCategory = getProductNeedCategory(product.category);
  const profileStyles = (profile.stylePersonality || []).map(normalizeTag);
  const styleHit = product.styleTags.find((tag) => profileStyles.includes(normalizeTag(tag)));
  const occasionHit = selectedOccasion !== "All" && product.occasionTags.map(normalizeTag).includes(normalizeTag(selectedOccasion));

  if (closetNeeds.includes(productNeedCategory)) return CATEGORY_COPY[productNeedCategory]?.reason || product.whyIrysRecommendsIt;
  if (occasionHit) return `Strong for ${selectedOccasion.toLowerCase()} without fighting your closet.`;
  if (styleHit) return `Matches your ${styleHit} style direction.`;
  return product.whyIrysRecommendsIt;
}

function getCatalogStats(products: CatalogProduct[]) {
  return {
    total: products.length,
    retailers: new Set(products.map((product) => product.retailer)).size,
  };
}

function wordSet(value: string) {
  return new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2));
}

function countOverlap(a: string[], b: string[]) {
  const bSet = new Set(b.map(normalizeTag));
  return a.map(normalizeTag).filter((value) => bSet.has(value)).length;
}

function getSimilarClosetItems(product: CatalogProduct, wardrobeItems: WardrobeItem[]) {
  const productNeedCategory = getProductNeedCategory(product.category);
  const productWords = wordSet(`${product.name} ${product.brand} ${product.category} ${product.styleTags.join(" ")} ${product.fitTags.join(" ")}`);
  const productColors = product.colorTags.map(normalizeTag);

  return wardrobeItems
    .map((item) => {
      const itemNeedCategory = getProductNeedCategory(item.category);
      const itemWords = wordSet(`${item.name} ${item.brand ?? ""} ${item.category} ${item.fit ?? ""} ${item.styleNote}`);
      const wordOverlap = [...productWords].filter((word) => itemWords.has(word)).length;
      const colorMatch = productColors.includes(normalizeTag(item.color)) || productColors.includes(normalizeTag(item.secondaryColor ?? ""));
      const sameCategory = itemNeedCategory === productNeedCategory;
      const score = (sameCategory ? 4 : 0) + wordOverlap + (colorMatch ? 2 : 0);
      return { item, score, sameCategory };
    })
    .filter((match) => match.sameCategory && match.score >= 5)
    .sort((a, b) => b.score - a.score)
    .map((match) => match.item)
    .slice(0, 3);
}

function getProductVerdict(product: CatalogProduct, wardrobeItems: WardrobeItem[], closetNeeds: string[]): ProductVerdict {
  const needCategory = getProductNeedCategory(product.category);
  const similarItems = getSimilarClosetItems(product, wardrobeItems);

  if (closetNeeds.includes(needCategory)) {
    return {
      label: "Fills Gap",
      tone: "gold",
      reason: CATEGORY_COPY[needCategory]?.reason || "This fills a missing role in your closet.",
      similarItems,
    };
  }

  if (similarItems.length >= 2) {
    return {
      label: "Possible Duplicate",
      tone: "red",
      reason: `You already own similar ${CATEGORY_COPY[needCategory]?.label.toLowerCase() || "pieces"} like ${similarItems.slice(0, 2).map((item) => item.name).join(" and ")}.`,
      similarItems,
    };
  }

  if (similarItems.length === 1) {
    return {
      label: "Upgrade Pick",
      tone: "lavender",
      reason: `This may be a cleaner upgrade or alternate to ${similarItems[0].name}, not a brand-new closet role.`,
      similarItems,
    };
  }

  return {
    label: "Completes Looks",
    tone: "slate",
    reason: product.pairsWellWith.length > 0
      ? `This could work with ${product.pairsWellWith.slice(0, 2).join(" and ")}.`
      : "This adds range without duplicating an obvious closet piece.",
    similarItems,
  };
}

function getVerdictStyle(tone: ProductVerdict["tone"]) {
  if (tone === "red") return { background: "rgba(192,57,43,0.24)", color: "#ff9a9a", border: "1px solid rgba(192,57,43,0.35)" };
  if (tone === "lavender") return { background: "rgba(143,136,168,0.24)", color: "var(--lavender)", border: "1px solid rgba(143,136,168,0.35)" };
  if (tone === "slate") return { background: "rgba(143,163,177,0.20)", color: "var(--slate)", border: "1px solid rgba(143,163,177,0.32)" };
  return { background: "rgba(199,179,139,0.24)", color: "var(--gold)", border: "1px solid rgba(199,179,139,0.36)" };
}

function buildShoppingPrompt(profile: StyleProfile, item: CatalogProduct, wardrobeItems: WardrobeItem[], verdict?: ProductVerdict) {
  const closetSummary = wardrobeItems.slice(0, 18).map((piece) => `${piece.name} (${piece.category}, ${piece.color}${piece.fit ? `, ${piece.fit}` : ""})`).join("\n");
  const verdictContext = verdict
    ? `\nIRYS pre-check: ${verdict.label}. ${verdict.reason}${verdict.similarItems.length > 0 ? ` Similar owned items: ${verdict.similarItems.map((piece) => piece.name).join(", ")}.` : ""}\n`
    : "";
  return `I'm considering this addition for my wardrobe:\n\n${item.name} by ${item.brand} from ${item.retailer}\nCategory: ${item.category}\nPrice: ${item.approximatePrice} (${item.priceTier})\nOccasions: ${item.occasionTags.join(", ")}\nStyle tags: ${item.styleTags.join(", ")}\n${verdictContext}\nMy Style DNA: ${profile.colorSeason || "unknown"} color season, ${profile.bodyType || "unknown"} body type, ${profile.stylePersonality?.join(", ") || "classic"} style personality.\n\nMy current closet includes:\n${closetSummary || "No closet items loaded yet."}\n\nGive me a clear verdict first: BUY, SKIP, or REPLACE. Then explain whether this fills a real gap, duplicates something I already own, or upgrades an existing piece. Be honest and protective of my money.`;
}

function buildLookPrompt(profile: StyleProfile, look: { title: string; occasion: string }, wardrobeItems: WardrobeItem[]) {
  const closetSummary = wardrobeItems.slice(0, 20).map((piece) => `${piece.name} (${piece.category}, ${piece.color}${piece.fit ? `, ${piece.fit}` : ""})`).join("\n");
  return `Build me a version of "${look.title}" for ${look.occasion} using my real closet first.\n\nMy Style DNA: ${profile.colorSeason || "unknown"} color season, ${profile.bodyType || "unknown"} body type, ${profile.stylePersonality?.join(", ") || "classic"}.\n\nMy closet:\n${closetSummary || "No closet items loaded yet."}\n\nUse what I own, then tell me only the missing piece if something would make the look stronger.`;
}

function ProductVisual({ item }: { item: CatalogProduct }) {
  const meta = PRODUCT_CATEGORY_LABELS[item.category] || { label: item.category, icon: "Piece" };

  if (item.imageUrl) {
    return <img src={item.imageUrl} alt={item.name} className="w-full object-cover" style={{ height: 190 }} />;
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: 190,
        background: "linear-gradient(135deg, rgba(199,179,139,0.16), rgba(143,136,168,0.13) 48%, rgba(22,22,22,0.92))",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          opacity: 0.55,
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-between p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p style={{ color: "var(--gold)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
              Catalog pick
            </p>
            <p style={{ color: "var(--cream)", fontSize: 11, marginTop: 3, textTransform: "capitalize" }}>
              {meta.label}
            </p>
          </div>
          <div
            className="rounded-full flex items-center justify-center"
            style={{ width: 44, height: 44, background: "rgba(14,13,12,0.52)", border: "1px solid rgba(199,179,139,0.28)" }}
          >
            <span style={{ color: "var(--gold)", fontSize: 10, fontWeight: 700 }}>{meta.icon}</span>
          </div>
        </div>
        <div>
          <p style={{ color: "var(--cream)", fontSize: 17, lineHeight: 1.15, fontFamily: "var(--font-display)", marginBottom: 5 }}>
            {item.retailer}
          </p>
          <p style={{ color: "var(--muted-foreground)", fontSize: 10, lineHeight: 1.35 }}>
            Product image pending. Iris is ranking this from the curated starter catalog.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DiscoverScreen({ profile, accessToken, onAskIris, onOpenWardrobe }: DiscoverScreenProps) {
  const [activeTab, setActiveTab] = useState("For You");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [expandedLook, setExpandedLook] = useState<number | null>(1);
  const [stylistFilter, setStylistFilter] = useState<"all" | "stylist" | "tailor">("all");
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loadingWardrobe, setLoadingWardrobe] = useState(true);
  const [selectedOccasion, setSelectedOccasion] = useState("All");
  const [selectedPriceTier, setSelectedPriceTier] = useState<"all" | PriceTier>("all");

  useEffect(() => {
    if (!accessToken) {
      setLoadingWardrobe(false);
      return;
    }

    setLoadingWardrobe(true);
    fetch(`${SERVER}/wardrobe/items`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.items)) setWardrobeItems(data.items);
      })
      .catch(() => {})
      .finally(() => setLoadingWardrobe(false));
  }, [accessToken]);

  const toggleWishlist = (id: string) =>
    setWishlist((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const looks = profile.gender === "man" ? LOOKS_MEN
    : profile.gender === "nonbinary" ? LOOKS_NB
    : LOOKS_WOMEN;

  const faceKey = (profile.faceShape || "oval").toLowerCase() as keyof typeof GLASSES_BY_FACE;
  const glassesData = GLASSES_BY_FACE[faceKey] || GLASSES_BY_FACE.oval;

  const filteredStylists = stylistFilter === "all" ? STYLISTS
    : STYLISTS.filter((s) => s.type === stylistFilter);

  const closetNeeds = useMemo(() => getClosetNeeds(wardrobeItems), [wardrobeItems]);
  const discoveryItems = useMemo(() => {
    return PRODUCT_CATALOG
      .filter((product) => genderMatches(profile.gender, product.gender))
      .filter((product) => selectedPriceTier === "all" || product.priceTier === selectedPriceTier)
      .filter((product) => selectedOccasion === "All" || product.occasionTags.map(normalizeTag).includes(normalizeTag(selectedOccasion)))
      .map((product) => ({ product, score: scoreProduct(product, profile, closetNeeds, selectedOccasion) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [closetNeeds, profile, selectedOccasion, selectedPriceTier]);

  const catalogStats = useMemo(() => getCatalogStats(PRODUCT_CATALOG), []);

  const genderLabel = profile.gender === "man" ? "men's"
    : profile.gender === "nonbinary" ? "unisex"
    : "women's";

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-3">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}>Personalized for you</p>
            <h1 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "36px", lineHeight: 1.05, fontWeight: 400, letterSpacing: "-0.03em", marginTop: 2 }}>
              Discover
            </h1>
          </div>
          <div className="relative mt-1">
            <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--surface)", border: "none", cursor: "pointer" }}>
              <ShoppingBag size={18} style={{ color: "var(--cream)" }} />
            </button>
            {wishlist.length > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "var(--gold)" }}>
                <span style={{ fontSize: "9px", color: "var(--charcoal)", fontWeight: 700 }}>{wishlist.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {DISCOVER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="shrink-0 px-3.5 py-2 rounded-full transition-all"
              style={{
                background: activeTab === tab ? "var(--gold)" : "var(--surface)",
                color: activeTab === tab ? "var(--charcoal)" : "var(--muted-foreground)",
                border: `1px solid ${activeTab === tab ? "var(--gold)" : "var(--border)"}`,
                fontSize: "12px", fontWeight: activeTab === tab ? 600 : 400, cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">

        {/* ── For You ── */}
        {activeTab === "For You" && (
          <div className="px-6">
            <div className="rounded-2xl p-4 mb-4 flex items-start gap-3" style={{ background: "rgba(199,179,139,0.08)", border: "1px solid rgba(199,179,139,0.2)" }}>
              <Wand2 size={18} style={{ color: "var(--gold)", marginTop: 2 }} />
              <div className="flex-1">
                <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 600 }}>Closet-aware discovery</p>
                <p style={{ color: "var(--muted-foreground)", fontSize: "11px", lineHeight: 1.5, marginTop: 3 }}>
                  {catalogStats.total} starter picks across {catalogStats.retailers} retailers, ranked by your Style DNA and what would make your real closet more useful.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { label: "Pieces", value: loadingWardrobe ? "..." : wardrobeItems.length, icon: Shirt },
                { label: "Needs", value: loadingWardrobe ? "..." : closetNeeds.length, icon: Sparkles },
                { label: "Saved", value: wishlist.length, icon: Heart },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl p-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <Icon size={14} style={{ color: "var(--gold)", marginBottom: 8 }} />
                  <p style={{ color: "var(--cream)", fontSize: "18px", fontWeight: 700, lineHeight: 1 }}>{value}</p>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "10px", marginTop: 4 }}>{label}</p>
                </div>
              ))}
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    Next best additions
                  </p>
                  <h2 style={{ color: "var(--cream)", fontSize: "18px", fontFamily: "var(--font-display)", fontWeight: 400 }}>
                    What would unlock more outfits
                  </h2>
                </div>
                <button onClick={onOpenWardrobe} className="px-3 py-2 rounded-full flex items-center gap-1"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--gold)", fontSize: 11 }}>
                  <Plus size={12} /> Closet
                </button>
              </div>

              {loadingWardrobe ? (
                <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <p style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Reading your closet...</p>
                </div>
              ) : closetNeeds.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {closetNeeds.slice(0, 5).map((need) => {
                    const copy = CATEGORY_COPY[need];
                    return (
                      <button key={need} onClick={() => onAskIris?.(`${copy.prompt}\n\nUse my saved closet and Style DNA. Keep the recommendation practical and avoid suggesting duplicates.`)}
                        className="shrink-0 rounded-2xl p-4 text-left"
                        style={{ width: 220, background: "var(--surface)", border: "1px solid rgba(199,179,139,0.24)", cursor: "pointer" }}>
                        <p style={{ color: "var(--gold)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                          {copy.label} need
                        </p>
                        <p style={{ color: "var(--cream)", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                          Add one strong {copy.label.toLowerCase()}
                        </p>
                        <p style={{ color: "var(--muted-foreground)", fontSize: 12, lineHeight: 1.45 }}>
                          {copy.reason}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <p style={{ color: "var(--cream)", fontSize: 13, fontWeight: 600 }}>Your closet has range.</p>
                  <p style={{ color: "var(--muted-foreground)", fontSize: 12, lineHeight: 1.5, marginTop: 5 }}>
                    Discovery will focus on upgrades, replacements, and pieces that sharpen your existing style instead of filling basic gaps.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-end justify-between mb-3">
              <div>
                <p style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase" }}>Smart shopping ideas</p>
                <h2 style={{ color: "var(--cream)", fontSize: "18px", fontFamily: "var(--font-display)", fontWeight: 400 }}>Ask before you buy</h2>
              </div>
              <p style={{ color: "var(--muted-foreground)", fontSize: 10 }}>{genderLabel} edit</p>
            </div>

            <div className="mb-3">
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {OCCASION_FILTERS.map((occasion) => (
                  <button
                    key={occasion}
                    onClick={() => setSelectedOccasion(occasion)}
                    className="shrink-0 px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background: selectedOccasion === occasion ? "var(--gold)" : "var(--surface)",
                      color: selectedOccasion === occasion ? "var(--charcoal)" : "var(--muted-foreground)",
                      border: `1px solid ${selectedOccasion === occasion ? "var(--gold)" : "var(--border)"}`,
                      fontSize: 10,
                      fontWeight: selectedOccasion === occasion ? 700 : 500,
                      cursor: "pointer",
                    }}
                  >
                    {occasion}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {PRICE_FILTERS.map((price) => (
                  <button
                    key={price.value}
                    onClick={() => setSelectedPriceTier(price.value)}
                    className="shrink-0 px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background: selectedPriceTier === price.value ? "rgba(143,136,168,0.18)" : "var(--surface)",
                      color: selectedPriceTier === price.value ? "var(--lavender)" : "var(--muted-foreground)",
                      border: `1px solid ${selectedPriceTier === price.value ? "rgba(143,136,168,0.36)" : "var(--border)"}`,
                      fontSize: 10,
                      fontWeight: selectedPriceTier === price.value ? 700 : 500,
                      cursor: "pointer",
                    }}
                  >
                    {price.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {discoveryItems.map(({ product: item, score }, i) => {
                const needCategory = getProductNeedCategory(item.category);
                const needCopy = CATEGORY_COPY[needCategory];
                const fillsNeed = closetNeeds.includes(needCategory);
                const matchReason = getMatchReason(item, profile, closetNeeds, selectedOccasion);
                const verdict = getProductVerdict(item, wardrobeItems, closetNeeds);
                const verdictStyle = getVerdictStyle(verdict.tone);
                return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="relative">
                    <ProductVisual item={item} />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(14,13,12,0.7) 0%, transparent 60%)" }} />
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-full" style={{ background: "rgba(14,13,12,0.75)", backdropFilter: "blur(6px)" }}>
                      <span style={{ color: "var(--gold)", fontSize: "10px", fontWeight: 600 }}>{fillsNeed ? "Closet need" : `${Math.min(99, score)}% ✦`}</span>
                    </div>
                    <button onClick={() => toggleWishlist(item.id)} className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(14,13,12,0.75)", backdropFilter: "blur(6px)", border: "none", cursor: "pointer" }}>
                      <Heart size={12} style={{ color: wishlist.includes(item.id) ? "#8F88A8" : "var(--cream)" }} fill={wishlist.includes(item.id) ? "#8F88A8" : "none"} />
                    </button>
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1 flex-wrap">
                      <span style={{ color: "var(--cream)", fontSize: 9, background: "rgba(14,13,12,0.72)", padding: "2px 6px", borderRadius: 99, textTransform: "capitalize" }}>
                        {item.priceTier}
                      </span>
                      {item.occasionTags.slice(0, 1).map((tag) => (
                        <span key={tag} style={{ color: "var(--cream)", fontSize: 9, background: "rgba(14,13,12,0.72)", padding: "2px 6px", borderRadius: 99, textTransform: "capitalize" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="inline-flex px-2 py-1 rounded-full mb-2" style={verdictStyle}>
                      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase" }}>{verdict.label}</span>
                    </div>
                    <p style={{ color: "var(--cream)", fontSize: "12px", fontWeight: 500, marginBottom: 1 }}>{item.name}</p>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "10px", marginBottom: 8 }}>{item.brand} · {item.retailer}</p>
                    <p style={{ color: "var(--lavender)", fontSize: "10px", lineHeight: 1.35, marginBottom: 10 }}>
                      {fillsNeed ? needCopy.reason : matchReason}
                    </p>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "9px", lineHeight: 1.35, marginBottom: 10 }}>
                      {verdict.reason}
                    </p>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "9px", lineHeight: 1.35, marginBottom: 10 }}>
                      Pairs with {item.pairsWellWith.slice(0, 2).join(" + ")}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span style={{ color: "var(--gold)", fontSize: "13px", fontWeight: 600 }}>{item.approximatePrice}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => onAskIris?.(buildShoppingPrompt(profile, item, wardrobeItems, verdict))} className="px-2.5 py-1.5 rounded-lg transition-all"
                          style={{ background: "var(--surface-2)", color: "var(--muted-foreground)", border: "none", fontSize: "10px", fontWeight: 600, cursor: "pointer" }}>
                          Ask
                        </button>
                        {item.productUrl && (
                          <button onClick={() => window.open(item.productUrl, "_blank", "noopener,noreferrer")} className="px-2.5 py-1.5 rounded-lg transition-all"
                            style={{ background: "var(--gold)", color: "var(--charcoal)", border: "none", fontSize: "10px", fontWeight: 700, cursor: "pointer" }}>
                            Shop
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );})}
            </div>
          </div>
        )}

        {/* ── Get The Look ── */}
        {activeTab === "Get The Look" && (
          <div className="px-6 flex flex-col gap-5">
            <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(143,163,177,0.08)", border: "1px solid rgba(143,163,177,0.2)" }}>
              <Sparkles size={16} style={{ color: "var(--slate)" }} />
              <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.5 }}>
                Outfit formulas you can recreate from your closet first, then improve only where something is missing.
              </p>
            </div>

            {looks.map((look, i) => (
              <motion.div key={look.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                {/* Hero image */}
                <div className="relative cursor-pointer" onClick={() => setExpandedLook(expandedLook === look.id ? null : look.id)}>
                  <img src={look.image} alt={look.title} className="w-full object-cover" style={{ height: 260 }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(14,13,12,0.95) 0%, transparent 55%)" }} />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{look.occasion}</p>
                    <h3 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "24px", fontWeight: 400, letterSpacing: "-0.02em" }}>{look.title}</h3>
                  </div>
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full" style={{ background: "rgba(14,13,12,0.8)", backdropFilter: "blur(8px)" }}>
                    <span style={{ color: "var(--gold)", fontSize: "11px", fontWeight: 500 }}>
                      {expandedLook === look.id ? "▲ Hide" : "▼ Shop Look"}
                    </span>
                  </div>
                </div>

                {/* Pieces breakdown */}
                {expandedLook === look.id && (
                  <div className="p-4">
                    <p style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>
                      The Pieces
                    </p>
                    <div className="flex flex-col gap-3">
                      {look.pieces.map((piece) => (
                        <div key={piece.label} className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                          <div className="flex items-center gap-3">
                            <span style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", minWidth: 60 }}>{piece.label}</span>
                            <div>
                              <p style={{ color: "var(--cream)", fontSize: "12px", fontWeight: 500 }}>{piece.item}</p>
                              <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>{piece.brand}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span style={{ color: "var(--gold)", fontSize: "12px", fontWeight: 600 }}>{piece.price}</span>
                            <button className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                              style={{ background: "var(--gold)", border: "none", cursor: "pointer" }}>
                              <ShoppingBag size={11} style={{ color: "var(--charcoal)" }} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => onAskIris?.(buildLookPrompt(profile, look, wardrobeItems))}
                      className="w-full mt-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{ background: "var(--gold)", color: "var(--charcoal)", fontWeight: 600, fontSize: "13px", border: "none", cursor: "pointer" }}>
                      Build from my closet <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Glasses ── */}
        {activeTab === "Glasses" && (
          <div className="px-6">
            {/* Face shape card */}
            <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(199,179,139,0.06)", border: "1px solid rgba(199,179,139,0.3)" }}>
              <div className="flex items-center gap-3 mb-3">
                <Glasses size={20} style={{ color: "var(--gold)" }} />
                <div>
                  <p style={{ color: "var(--cream)", fontSize: "14px", fontWeight: 600 }}>
                    {profile.faceShape ? profile.faceShape.charAt(0).toUpperCase() + profile.faceShape.slice(1) : "Oval"} Face
                  </p>
                  <p style={{ color: "var(--gold)", fontSize: "11px", fontStyle: "italic" }}>Your personalized frame guide</p>
                </div>
              </div>
              <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.6, marginBottom: 8 }}>
                {glassesData.tip}
              </p>
              <div className="flex items-center gap-2">
                <span style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Avoid:</span>
                <span style={{ color: "var(--muted-foreground)", fontSize: "11px", fontStyle: "italic" }}>{glassesData.avoid}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {glassesData.frames.map((frame, i) => (
                <motion.div key={frame.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: i === 0 ? "1px solid rgba(199,179,139,0.4)" : "1px solid var(--border)" }}>
                  {i === 0 && (
                    <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(199,179,139,0.1)", borderBottom: "1px solid rgba(199,179,139,0.2)" }}>
                      <Star size={11} style={{ color: "var(--gold)" }} fill="var(--gold)" />
                      <span style={{ color: "var(--gold)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em" }}>BEST FOR YOUR FACE SHAPE</span>
                    </div>
                  )}
                  <img src={frame.image} alt={frame.name} className="w-full object-cover" style={{ height: 170 }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p style={{ color: "var(--cream)", fontWeight: 500, fontSize: "14px" }}>{frame.name}</p>
                        <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>{frame.brand} · {frame.shape}</p>
                      </div>
                      <p style={{ color: "var(--gold)", fontWeight: 600, fontSize: "15px" }}>{frame.price}</p>
                    </div>
                    <p style={{ color: "var(--slate)", fontSize: "12px", fontStyle: "italic", marginBottom: 12, lineHeight: 1.5 }}>
                      ✦ {frame.why}
                    </p>
                    <button className="w-full py-2.5 rounded-xl transition-all active:scale-95"
                      style={{ background: "var(--gold)", color: "var(--charcoal)", fontWeight: 600, fontSize: "13px", border: "none", cursor: "pointer" }}>
                      Shop Frame
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Stylists & Tailors ── */}
        {activeTab === "Stylists & Tailors" && (
          <div className="px-6">
            {/* Filter tabs */}
            <div className="flex gap-2 mb-5">
              {(["all", "stylist", "tailor"] as const).map((f) => (
                <button key={f} onClick={() => setStylistFilter(f)}
                  className="px-4 py-2 rounded-full transition-all capitalize"
                  style={{ background: stylistFilter === f ? "var(--gold)" : "var(--surface)", color: stylistFilter === f ? "var(--charcoal)" : "var(--muted-foreground)", border: `1px solid ${stylistFilter === f ? "var(--gold)" : "var(--border)"}`, fontSize: "12px", fontWeight: stylistFilter === f ? 600 : 400, cursor: "pointer" }}>
                  {f === "all" ? "Everyone" : f === "stylist" ? "Stylists" : "Tailors"}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {filteredStylists.map((person, i) => (
                <motion.div key={person.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  {/* Type banner */}
                  <div className="px-4 py-2 flex items-center gap-2" style={{ background: person.type === "tailor" ? "rgba(143,163,177,0.1)" : "rgba(143,136,168,0.1)", borderBottom: "1px solid var(--border)" }}>
                    {person.type === "tailor" ? <Scissors size={11} style={{ color: "var(--slate)" }} /> : <Sparkles size={11} style={{ color: "var(--rose)" }} />}
                    <span style={{ color: person.type === "tailor" ? "var(--slate)" : "var(--rose)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {person.type === "tailor" ? "Tailor & Alterations" : "Personal Stylist"}
                    </span>
                    {person.badge && (
                      <span className="ml-auto px-2 py-0.5 rounded-full" style={{ background: "rgba(199,179,139,0.15)", color: "var(--gold)", fontSize: "9px", fontWeight: 600 }}>
                        {person.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex gap-3 mb-3">
                      <div className="relative">
                        <img src={person.image} alt={person.name} className="w-14 h-14 rounded-2xl object-cover shrink-0" />
                        {person.available && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full" style={{ background: "#6B8F71", border: "2px solid var(--surface)" }} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p style={{ color: "var(--cream)", fontWeight: 600, fontSize: "14px" }}>{person.name}</p>
                            <p style={{ color: "var(--gold)", fontSize: "11px", fontStyle: "italic" }}>{person.specialty}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star size={11} style={{ color: "var(--gold)" }} fill="var(--gold)" />
                            <span style={{ color: "var(--gold)", fontSize: "12px", fontWeight: 600 }}>{person.rating}</span>
                            <span style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>({person.reviews})</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.6, marginBottom: 10 }}>{person.bio}</p>

                    <div className="flex gap-1.5 mb-4 flex-wrap">
                      {person.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 rounded-full" style={{ background: "var(--surface-2)", color: "var(--muted-foreground)", fontSize: "10px" }}>{tag}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span style={{ color: "var(--cream)", fontSize: "12px" }}>{person.price}</span>
                      <button className="px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                        style={{ background: person.available ? "var(--gold)" : "var(--surface-2)", color: person.available ? "var(--charcoal)" : "var(--muted-foreground)", border: "none", fontSize: "12px", fontWeight: 600, cursor: person.available ? "pointer" : "not-allowed" }}>
                        {person.available ? (person.type === "tailor" ? "Book Fitting" : "Book Session") : "Join Waitlist"}
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Scent ── */}
        {activeTab === "Scent" && (
          <div className="h-full">
            <ScentScreen gender={profile.gender || "woman"} colorSeason={profile.colorSeason} stylePersonality={profile.stylePersonality} />
          </div>
        )}
      </div>
    </div>
  );
}

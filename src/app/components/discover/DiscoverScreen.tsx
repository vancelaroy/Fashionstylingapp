import { useState } from "react";
import { Heart, ShoppingBag, Star, ChevronRight, Glasses, Scissors, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { ScentScreen } from "./ScentScreen";
import type { StyleProfile } from "../onboarding/OnboardingFlow";

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
}

const DISCOVER_TABS = ["For You", "Get The Look", "Glasses", "Stylists & Tailors", "Scent"];

export function DiscoverScreen({ profile }: DiscoverScreenProps) {
  const [activeTab, setActiveTab] = useState("For You");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cart, setCart] = useState<number[]>([]);
  const [expandedLook, setExpandedLook] = useState<number | null>(1);
  const [stylistFilter, setStylistFilter] = useState<"all" | "stylist" | "tailor">("all");

  const toggleWishlist = (id: number) =>
    setWishlist((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleCart = (id: number) =>
    setCart((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const shopItems = profile.gender === "man" ? SHOP_MEN
    : profile.gender === "nonbinary" ? SHOP_NB
    : SHOP_WOMEN;

  const looks = profile.gender === "man" ? LOOKS_MEN
    : profile.gender === "nonbinary" ? LOOKS_NB
    : LOOKS_WOMEN;

  const faceKey = (profile.faceShape || "oval").toLowerCase() as keyof typeof GLASSES_BY_FACE;
  const glassesData = GLASSES_BY_FACE[faceKey] || GLASSES_BY_FACE.oval;

  const filteredStylists = stylistFilter === "all" ? STYLISTS
    : STYLISTS.filter((s) => s.type === stylistFilter);

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
            {cart.length > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "var(--gold)" }}>
                <span style={{ fontSize: "9px", color: "var(--charcoal)", fontWeight: 700 }}>{cart.length}</span>
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
            <div className="rounded-2xl p-4 mb-5 flex items-center gap-3" style={{ background: "rgba(199,179,139,0.08)", border: "1px solid rgba(199,179,139,0.2)" }}>
              <span style={{ fontSize: "18px" }}>✦</span>
              <div className="flex-1">
                <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 500 }}>Curated from your Style DNA</p>
                <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>
                  Matching your {profile.colorSeason || "autumn"} palette · {genderLabel} sizing
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {shopItems.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="relative">
                    <img src={item.image} alt={item.name} className="w-full object-cover" style={{ height: 190 }} />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(14,13,12,0.7) 0%, transparent 60%)" }} />
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-full" style={{ background: "rgba(14,13,12,0.75)", backdropFilter: "blur(6px)" }}>
                      <span style={{ color: "var(--gold)", fontSize: "10px", fontWeight: 600 }}>{item.match}% ✦</span>
                    </div>
                    <button onClick={() => toggleWishlist(item.id)} className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(14,13,12,0.75)", backdropFilter: "blur(6px)", border: "none", cursor: "pointer" }}>
                      <Heart size={12} style={{ color: wishlist.includes(item.id) ? "#8F88A8" : "var(--cream)" }} fill={wishlist.includes(item.id) ? "#8F88A8" : "none"} />
                    </button>
                  </div>
                  <div className="p-3">
                    <p style={{ color: "var(--cream)", fontSize: "12px", fontWeight: 500, marginBottom: 1 }}>{item.name}</p>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "10px", marginBottom: 8 }}>{item.brand} · {item.category}</p>
                    <div className="flex items-center justify-between">
                      <span style={{ color: "var(--gold)", fontSize: "13px", fontWeight: 600 }}>{item.price}</span>
                      <button onClick={() => toggleCart(item.id)} className="px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: cart.includes(item.id) ? "var(--gold)" : "var(--surface-2)", color: cart.includes(item.id) ? "var(--charcoal)" : "var(--muted-foreground)", border: "none", fontSize: "10px", fontWeight: 600, cursor: "pointer" }}>
                        {cart.includes(item.id) ? "Added ✓" : "Add"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Get The Look ── */}
        {activeTab === "Get The Look" && (
          <div className="px-6 flex flex-col gap-5">
            <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(143,163,177,0.08)", border: "1px solid rgba(143,163,177,0.2)" }}>
              <Sparkles size={16} style={{ color: "var(--slate)" }} />
              <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.5 }}>
                Complete looks broken down piece by piece — with every item shoppable.
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
                    <button className="w-full mt-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{ background: "var(--gold)", color: "var(--charcoal)", fontWeight: 600, fontSize: "13px", border: "none", cursor: "pointer" }}>
                      Shop Complete Look <ChevronRight size={14} />
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

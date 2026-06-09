import { useState } from "react";
import { Heart, ShoppingBag, Star, ChevronRight, Glasses } from "lucide-react";
import { motion } from "motion/react";
import { ScentScreen } from "./ScentScreen";
import type { StyleProfile } from "../onboarding/OnboardingFlow";

const DISCOVER_TABS = ["For You", "Shop Looks", "Stylists", "Glasses", "Scent"];

const SHOP_ITEMS = [
  {
    id: 1,
    name: "Silk Charmeuse Blouse",
    brand: "Vince",
    price: "$295",
    match: 96,
    category: "Tops",
    image: "https://images.unsplash.com/photo-1611367540736-b1b38aff784b?w=400&h=500&fit=crop&auto=format",
  },
  {
    id: 2,
    name: "Wide Leg Wool Trouser",
    brand: "Theory",
    price: "$345",
    match: 92,
    category: "Bottoms",
    image: "https://images.unsplash.com/photo-1533392151650-269f96231f65?w=400&h=500&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Chain-Link Shoulder Bag",
    brand: "Mango",
    price: "$129",
    match: 89,
    category: "Bags",
    image: "https://images.unsplash.com/photo-1589363358751-ab05797e5629?w=400&h=500&fit=crop&auto=format",
  },
  {
    id: 4,
    name: "Gold Statement Earrings",
    brand: "Mejuri",
    price: "$98",
    match: 98,
    category: "Jewelry",
    image: "https://images.unsplash.com/photo-1549439602-43ebca2327af?w=400&h=500&fit=crop&auto=format",
  },
  {
    id: 5,
    name: "Leather Mule Heels",
    brand: "Aeyde",
    price: "$285",
    match: 94,
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1569388330292-79cc1ec67270?w=400&h=500&fit=crop&auto=format",
  },
  {
    id: 6,
    name: "Merino Knit Dress",
    brand: "& Other Stories",
    price: "$175",
    match: 91,
    category: "Dresses",
    image: "https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=400&h=500&fit=crop&auto=format",
  },
];

const STYLISTS = [
  {
    id: 1,
    name: "Amara Osei",
    specialty: "Editorial & Evening",
    rating: 4.9,
    reviews: 142,
    price: "from $85/session",
    bio: "10 years in NYC fashion. Former Vogue editorial stylist now working with private clients.",
    tags: ["Romantic", "Classic", "Evening"],
    avatar: "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?w=200&h=200&fit=crop&auto=format",
    available: true,
  },
  {
    id: 2,
    name: "Sofia Marchetti",
    specialty: "Minimalist & Work",
    rating: 4.8,
    reviews: 98,
    price: "from $65/session",
    bio: "Milan-trained, Paris-based. Capsule wardrobe expert and personal shopping specialist.",
    tags: ["Minimalist", "Classic", "Work"],
    avatar: "https://images.unsplash.com/photo-1533392151650-269f96231f65?w=200&h=200&fit=crop&auto=format",
    available: true,
  },
  {
    id: 3,
    name: "Jade Williams",
    specialty: "Bohemian & Festival",
    rating: 4.7,
    reviews: 215,
    price: "from $55/session",
    bio: "Self-taught color & texture maven. Loves eclectic layering and sustainable fashion.",
    tags: ["Bohemian", "Maximalist", "Casual"],
    avatar: "https://images.unsplash.com/photo-1703074907714-4cd6a222fc39?w=200&h=200&fit=crop&auto=format",
    available: false,
  },
];

const GLASSES_FRAMES = [
  { id: 1, name: "Oval Acetate", brand: "Warby Parker", shape: "Oval", faceMatch: ["Oval", "Heart", "Diamond"], price: "$145", image: "https://images.unsplash.com/photo-1603578119639-798b8413d8d7?w=400&h=300&fit=crop&auto=format", recommended: true },
  { id: 2, name: "Round Tortoise", brand: "Gentle Monster", shape: "Round", faceMatch: ["Square", "Oblong", "Diamond"], price: "$325", image: "https://images.unsplash.com/photo-1524255684952-d7185b509571?w=400&h=300&fit=crop&auto=format", recommended: false },
  { id: 3, name: "Cat-Eye Gold", brand: "Ray-Ban", shape: "Cat-Eye", faceMatch: ["Round", "Square", "Oval"], price: "$189", image: "https://images.unsplash.com/photo-1581915649317-41fc6eb9597d?w=400&h=300&fit=crop&auto=format", recommended: true },
];

interface DiscoverScreenProps {
  profile: StyleProfile;
}

export function DiscoverScreen({ profile }: DiscoverScreenProps) {
  const [activeTab, setActiveTab] = useState("For You");
  const [wishlist, setWishlist] = useState<number[]>([4]);
  const [cart, setCart] = useState<number[]>([]);

  const toggleWishlist = (id: number) =>
    setWishlist((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleCart = (id: number) =>
    setCart((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--charcoal)", fontFamily: "var(--font-body)" }}
    >
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p style={{ color: "var(--muted-foreground)", fontSize: "12px", letterSpacing: "0.06em" }}>Personalized for you</p>
            <h1 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "26px", lineHeight: 1.2, marginTop: 2 }}>
              Discover
            </h1>
          </div>
          <div className="relative">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface)", border: "none", cursor: "pointer" }}
            >
              <ShoppingBag size={18} style={{ color: "var(--cream)" }} />
            </button>
            {cart.length > 0 && (
              <div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "var(--gold)" }}
              >
                <span style={{ fontSize: "9px", color: "var(--charcoal)", fontWeight: 700 }}>{cart.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {DISCOVER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="shrink-0 px-4 py-2 rounded-full transition-all duration-200"
              style={{
                background: activeTab === tab ? "var(--gold)" : "var(--surface)",
                color: activeTab === tab ? "var(--charcoal)" : "var(--muted-foreground)",
                border: `1px solid ${activeTab === tab ? "var(--gold)" : "var(--border)"}`,
                fontSize: "12px",
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {(activeTab === "For You" || activeTab === "Shop Looks") && (
          <div className="px-6">
            {activeTab === "For You" && (
              <div
                className="rounded-2xl p-4 mb-5 flex items-center gap-3"
                style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)" }}
              >
                <span style={{ fontSize: "20px" }}>✦</span>
                <div className="flex-1">
                  <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 500 }}>Curated from your Style DNA</p>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>Matching your Autumn palette & Hourglass shape</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {SHOP_ITEMS.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full object-cover"
                      style={{ height: 190 }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(14,13,12,0.8) 0%, transparent 60%)" }}
                    />
                    {/* Match badge */}
                    <div
                      className="absolute top-2 left-2 px-2 py-1 rounded-full"
                      style={{ background: "rgba(14,13,12,0.75)", backdropFilter: "blur(6px)" }}
                    >
                      <span style={{ color: "var(--gold)", fontSize: "10px", fontWeight: 600 }}>{item.match}% ✦</span>
                    </div>
                    {/* Wishlist */}
                    <button
                      onClick={() => toggleWishlist(item.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(14,13,12,0.75)", backdropFilter: "blur(6px)", border: "none", cursor: "pointer" }}
                    >
                      <Heart
                        size={12}
                        style={{ color: wishlist.includes(item.id) ? "#D4A5B5" : "var(--cream)" }}
                        fill={wishlist.includes(item.id) ? "#D4A5B5" : "none"}
                      />
                    </button>
                  </div>
                  <div className="p-3">
                    <p style={{ color: "var(--cream)", fontSize: "12px", fontWeight: 500, marginBottom: 1 }}>{item.name}</p>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "10px", marginBottom: 8 }}>{item.brand}</p>
                    <div className="flex items-center justify-between">
                      <span style={{ color: "var(--gold)", fontSize: "13px", fontWeight: 600 }}>{item.price}</span>
                      <button
                        onClick={() => toggleCart(item.id)}
                        className="px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          background: cart.includes(item.id) ? "var(--gold)" : "var(--surface-2)",
                          color: cart.includes(item.id) ? "var(--charcoal)" : "var(--muted-foreground)",
                          border: "none",
                          fontSize: "10px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {cart.includes(item.id) ? "Added ✓" : "Add"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Stylists" && (
          <div className="px-6 flex flex-col gap-4">
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: "rgba(212,165,181,0.08)", border: "1px solid rgba(212,165,181,0.2)" }}
            >
              <span style={{ fontSize: "18px" }}>✨</span>
              <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.5 }}>
                Matched to stylists who specialize in <span style={{ color: "var(--rose)" }}>Classic & Romantic</span> aesthetics for your body type.
              </p>
            </div>

            {STYLISTS.map((stylist, i) => (
              <motion.div
                key={stylist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="p-4">
                  <div className="flex gap-3 mb-4">
                    <div className="relative">
                      <img
                        src={stylist.avatar}
                        alt={stylist.name}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0"
                      />
                      {stylist.available && (
                        <div
                          className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full"
                          style={{ background: "#6B8F71", border: "2px solid var(--surface)" }}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p style={{ color: "var(--cream)", fontWeight: 600, fontSize: "14px" }}>{stylist.name}</p>
                          <p style={{ color: "var(--gold)", fontSize: "11px", fontStyle: "italic" }}>{stylist.specialty}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={11} style={{ color: "var(--gold)" }} fill="var(--gold)" />
                          <span style={{ color: "var(--gold)", fontSize: "12px", fontWeight: 600 }}>{stylist.rating}</span>
                          <span style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>({stylist.reviews})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.5, marginBottom: 12 }}>
                    {stylist.bio}
                  </p>

                  <div className="flex gap-1.5 mb-4 flex-wrap">
                    {stylist.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full"
                        style={{ background: "var(--surface-2)", color: "var(--muted-foreground)", fontSize: "10px" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span style={{ color: "var(--cream)", fontSize: "12px" }}>{stylist.price}</span>
                    <button
                      className="px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                      style={{
                        background: stylist.available ? "var(--gold)" : "var(--surface-2)",
                        color: stylist.available ? "var(--charcoal)" : "var(--muted-foreground)",
                        border: "none",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: stylist.available ? "pointer" : "not-allowed",
                      }}
                    >
                      {stylist.available ? "Book Session" : "Waitlist"}
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "Glasses" && (
          <div className="px-6">
            <div
              className="rounded-2xl p-4 mb-5 flex items-center gap-3"
              style={{ background: "rgba(201,169,110,0.06)", border: "1px solid var(--border)" }}
            >
              <Glasses size={20} style={{ color: "var(--gold)" }} />
              <div>
                <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 500 }}>Face Shape: Heart</p>
                <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>Best frames: Cat-eye, Oval, Rimless</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {GLASSES_FRAMES.map((frame, i) => (
                <motion.div
                  key={frame.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "var(--surface)", border: `1px solid ${frame.recommended ? "rgba(201,169,110,0.4)" : "var(--border)"}` }}
                >
                  {frame.recommended && (
                    <div
                      className="px-4 py-2 flex items-center gap-2"
                      style={{ background: "rgba(201,169,110,0.1)", borderBottom: "1px solid rgba(201,169,110,0.2)" }}
                    >
                      <Star size={11} style={{ color: "var(--gold)" }} fill="var(--gold)" />
                      <span style={{ color: "var(--gold)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em" }}>
                        RECOMMENDED FOR YOUR FACE SHAPE
                      </span>
                    </div>
                  )}
                  <div className="relative">
                    <img
                      src={frame.image}
                      alt={frame.name}
                      className="w-full object-cover"
                      style={{ height: 180 }}
                    />
                    <button
                      className="absolute bottom-3 right-3 px-3 py-2 rounded-xl flex items-center gap-1.5"
                      style={{ background: "rgba(14,13,12,0.8)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer" }}
                    >
                      <span style={{ fontSize: "11px", color: "var(--cream)" }}>Try On ✦</span>
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p style={{ color: "var(--cream)", fontWeight: 500, fontSize: "14px" }}>{frame.name}</p>
                        <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>{frame.brand} · {frame.shape}</p>
                      </div>
                      <p style={{ color: "var(--gold)", fontWeight: 600, fontSize: "15px" }}>{frame.price}</p>
                    </div>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "11px", marginBottom: 12 }}>
                      Works best for: {frame.faceMatch.join(", ")}
                    </p>
                    <button
                      className="w-full py-2.5 rounded-xl transition-all active:scale-95"
                      style={{ background: "var(--gold)", color: "var(--charcoal)", fontWeight: 600, fontSize: "13px", border: "none", cursor: "pointer" }}
                    >
                      Shop Frame
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Scent" && (
          <div className="h-full">
            <ScentScreen
              gender={profile.gender || "woman"}
              colorSeason={profile.colorSeason}
              stylePersonality={profile.stylePersonality}
            />
          </div>
        )}
      </div>
    </div>
  );
}

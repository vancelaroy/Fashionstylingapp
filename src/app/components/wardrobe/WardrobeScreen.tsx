import { useState } from "react";
import { Plus, Search, Tag, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VirtualCloset } from "./VirtualCloset";

const CATEGORIES = ["All", "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories"];

const WARDROBE_ITEMS = [
  { id: 1, name: "Silk Slip Dress", brand: "Reformation", category: "Dresses", color: "#8F88A8", season: "All", favorite: true, image: "https://images.unsplash.com/photo-1611367540736-b1b38aff784b?w=400&h=500&fit=crop&auto=format", occasions: ["Evening", "Casual"] },
  { id: 2, name: "Wool Blazer", brand: "Theory", category: "Outerwear", color: "#2F4F4F", season: "Fall/Winter", favorite: false, image: "https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=400&h=500&fit=crop&auto=format", occasions: ["Work", "Evening"] },
  { id: 3, name: "Wide Leg Trousers", brand: "Arket", category: "Bottoms", color: "#8B7355", season: "All", favorite: true, image: "https://images.unsplash.com/photo-1533392151650-269f96231f65?w=400&h=500&fit=crop&auto=format", occasions: ["Work", "Casual"] },
  { id: 4, name: "Leather Loafers", brand: "Toteme", category: "Shoes", color: "#3B2314", season: "All", favorite: false, image: "https://images.unsplash.com/photo-1549439602-43ebca2327af?w=400&h=500&fit=crop&auto=format", occasions: ["Work", "Casual"] },
  { id: 5, name: "Cashmere Turtleneck", brand: "Everlane", category: "Tops", color: "#F5F0E8", season: "Fall/Winter", favorite: true, image: "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?w=400&h=500&fit=crop&auto=format", occasions: ["Casual", "Work"] },
  { id: 6, name: "Gold Chain Bag", brand: "Mango", category: "Accessories", color: "#C7B38B", season: "All", favorite: false, image: "https://images.unsplash.com/photo-1589363358751-ab05797e5629?w=400&h=500&fit=crop&auto=format", occasions: ["Evening", "Casual"] },
  { id: 7, name: "Linen Midi Skirt", brand: "& Other Stories", category: "Bottoms", color: "#DDD5C4", season: "Spring/Summer", favorite: false, image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=500&fit=crop&auto=format", occasions: ["Casual"] },
  { id: 8, name: "Strappy Heels", brand: "Sam Edelman", category: "Shoes", color: "#C7B38B", season: "Spring/Summer", favorite: true, image: "https://images.unsplash.com/photo-1569388330292-79cc1ec67270?w=400&h=500&fit=crop&auto=format", occasions: ["Evening"] },
];

const OUTFIT_IDEAS = [
  { id: 1, name: "Work Chic", items: [1, 2, 3], rating: 4.8 },
  { id: 2, name: "Weekend Edit", items: [5, 7, 4], rating: 4.6 },
  { id: 3, name: "Evening Glam", items: [1, 8, 6], rating: 4.9 },
];

export function WardrobeScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"items" | "outfits" | "closet">("closet");
  const [favorites, setFavorites] = useState<number[]>([1, 3, 5, 8]);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredItems = WARDROBE_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (id: number) =>
    setFavorites((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--charcoal)", fontFamily: "var(--font-body)" }}
    >
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p style={{ color: "var(--muted-foreground)", fontSize: "12px", letterSpacing: "0.06em" }}>
              {WARDROBE_ITEMS.length} pieces
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "26px", lineHeight: 1.2, marginTop: 2 }}>
              My Wardrobe
            </h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: "var(--gold)", border: "none", cursor: "pointer" }}
          >
            <Plus size={20} style={{ color: "var(--charcoal)" }} />
          </button>
        </div>

        {/* View toggle */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-4"
          style={{ background: "var(--surface)" }}
        >
          {(["closet", "items", "outfits"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex-1 py-2 rounded-lg transition-all duration-200"
              style={{
                background: view === v ? "var(--gold)" : "transparent",
                color: view === v ? "var(--charcoal)" : "var(--muted-foreground)",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: view === v ? 600 : 400,
              }}
            >
              {v === "closet" ? "✦ Closet" : v === "items" ? "Clothing" : "Outfits"}
            </button>
          ))}
        </div>

        {/* Search */}
        {view === "items" && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <Search size={16} style={{ color: "var(--muted-foreground)" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pieces..."
              className="flex-1 outline-none"
              style={{
                background: "transparent",
                color: "var(--cream)",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
                border: "none",
              }}
            />
          </div>
        )}

        {/* Category filter */}
        {view === "items" && (
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="shrink-0 px-3 py-1.5 rounded-full transition-all duration-200"
                style={{
                  background: activeCategory === cat ? "var(--gold)" : "var(--surface)",
                  color: activeCategory === cat ? "var(--charcoal)" : "var(--muted-foreground)",
                  border: `1px solid ${activeCategory === cat ? "var(--gold)" : "var(--border)"}`,
                  fontSize: "12px",
                  fontWeight: activeCategory === cat ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden pb-24">
        {view === "closet" && (
          <div className="h-full overflow-y-auto">
            <VirtualCloset />
          </div>
        )}
        {view !== "closet" && <div className="h-full overflow-y-auto px-6">
        {view === "items" ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item, i) => (
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
                    style={{ height: 180 }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(14,13,12,0.7) 0%, transparent 60%)" }}
                  />
                  {/* Color swatch */}
                  <div
                    className="absolute top-2 left-2 w-4 h-4 rounded-full"
                    style={{ background: item.color, border: "1px solid rgba(255,255,255,0.3)" }}
                  />
                  {/* Favorite */}
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(14,13,12,0.6)", backdropFilter: "blur(4px)", border: "none", cursor: "pointer" }}
                  >
                    <Star
                      size={12}
                      style={{ color: favorites.includes(item.id) ? "var(--gold)" : "var(--cream)" }}
                      fill={favorites.includes(item.id) ? "var(--gold)" : "none"}
                    />
                  </button>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex gap-1 flex-wrap">
                      {item.occasions.map((o) => (
                        <span
                          key={o}
                          style={{ fontSize: "9px", color: "var(--cream)", background: "rgba(255,255,255,0.15)", padding: "1px 6px", borderRadius: 99, backdropFilter: "blur(4px)" }}
                        >
                          {o}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p style={{ color: "var(--cream)", fontSize: "12px", fontWeight: 500, marginBottom: 1 }}>{item.name}</p>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>{item.brand}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      style={{
                        fontSize: "9px",
                        color: "var(--gold)",
                        background: "rgba(199,179,139,0.1)",
                        padding: "2px 6px",
                        borderRadius: 99,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {item.season}
                    </span>
                    <Tag size={10} style={{ color: "var(--muted-foreground)" }} />
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Add item card */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: filteredItems.length * 0.05 }}
              onClick={() => setShowAddModal(true)}
              className="rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200 active:scale-95"
              style={{
                background: "transparent",
                border: `2px dashed var(--border)`,
                height: 240,
                cursor: "pointer",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "rgba(199,179,139,0.1)" }}
              >
                <Plus size={20} style={{ color: "var(--gold)" }} />
              </div>
              <p style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>Add piece</p>
            </motion.button>
          </div>
        ) : (
          /* Outfit builder view */
          <div className="flex flex-col gap-4">
            {OUTFIT_IDEAS.map((outfit, i) => {
              const outfitItems = outfit.items.map((id) => WARDROBE_ITEMS.find((w) => w.id === id)!).filter(Boolean);
              return (
                <motion.div
                  key={outfit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="flex">
                    {outfitItems.map((item, j) => (
                      <div key={item.id} className="flex-1 relative" style={{ height: 140 }}>
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        {j < outfitItems.length - 1 && (
                          <div className="absolute right-0 top-0 bottom-0 w-px" style={{ background: "var(--charcoal)" }} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p style={{ color: "var(--cream)", fontWeight: 500, fontSize: "14px" }}>{outfit.name}</p>
                      <p style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>{outfitItems.length} pieces</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={12} style={{ color: "var(--gold)" }} fill="var(--gold)" />
                      <span style={{ color: "var(--gold)", fontSize: "12px", fontWeight: 600 }}>{outfit.rating}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Create outfit card */}
            <button
              className="rounded-2xl flex flex-col items-center justify-center gap-3 py-10 transition-all duration-200"
              style={{ background: "transparent", border: "2px dashed var(--border)", cursor: "pointer" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(199,179,139,0.1)" }}
              >
                <Plus size={22} style={{ color: "var(--gold)" }} />
              </div>
              <div className="text-center">
                <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 500 }}>Create New Outfit</p>
                <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>Mix & match from your wardrobe</p>
              </div>
            </button>
          </div>
        )}
        </div>}
      </div>

      {/* Add item modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full rounded-t-3xl p-6 pb-10"
              style={{ background: "var(--surface)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "var(--border)" }} />
              <h3 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "22px", marginBottom: 20 }}>
                Add to Wardrobe
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Take Photo", icon: "📷", desc: "AI identifies your piece" },
                  { label: "Upload Image", icon: "🖼️", desc: "From your camera roll" },
                  { label: "Scan Barcode", icon: "📱", desc: "Add from any store" },
                  { label: "Enter Manually", icon: "✏️", desc: "Type the details" },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setShowAddModal(false)}
                    className="p-4 rounded-xl text-left transition-all active:scale-95"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer" }}
                  >
                    <span style={{ fontSize: "24px", display: "block", marginBottom: 6 }}>{opt.icon}</span>
                    <p style={{ color: "var(--cream)", fontSize: "12px", fontWeight: 500 }}>{opt.label}</p>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

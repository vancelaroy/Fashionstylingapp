import { useState, useEffect } from "react";
import { Plus, Search, Star, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VirtualCloset } from "./VirtualCloset";
import { WardrobeUpload, type WardrobeItem } from "./WardrobeUpload";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const SERVER = `https://${projectId}.supabase.co/functions/v1/irys-api`;

const CATEGORIES = ["All", "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories", "Bags", "Suits"];

const CATEGORY_EMOJI: Record<string, string> = {
  tops: "👕", bottoms: "👖", outerwear: "🧥", shoes: "👟",
  accessories: "💍", dresses: "👗", suits: "🤵", bags: "👜",
};

function isPersistentImage(src: string | undefined): src is string {
  return !!src && !src.startsWith("blob:");
}

interface WardrobeScreenProps {
  accessToken?: string | null;
}

export function WardrobeScreen({ accessToken }: WardrobeScreenProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"closet" | "items" | "outfits">("closet");
  const [showUpload, setShowUpload] = useState(false);
  const [myItems, setMyItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wardrobe from server on mount
  useEffect(() => {
    const token = accessToken ?? publicAnonKey;
    if (!accessToken) { setLoading(false); return; }

    fetch(`${SERVER}/wardrobe/items`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.items)) setMyItems(data.items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const saveToServer = async (items: WardrobeItem[]) => {
    if (!accessToken) return;
    try {
      await fetch(`${SERVER}/wardrobe/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ items }),
      });
    } catch { /* silent fail */ }
  };

  const handleItemAdded = (item: WardrobeItem) => {
    const updated = [item, ...myItems];
    setMyItems(updated);
    saveToServer(updated);
    // Brief delay then close so user sees the success state
    setTimeout(() => setShowUpload(false), 1800);
  };

  const filteredItems = myItems.filter((item) => {
    const cat = activeCategory.toLowerCase();
    const matchesCategory = activeCategory === "All" || item.category === cat;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--charcoal)", fontFamily: "var(--font-body)" }}>

      {/* Upload flow — full screen overlay */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50"
          >
            <WardrobeUpload
              accessToken={accessToken}
              onItemAdded={handleItemAdded}
              onClose={() => setShowUpload(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}>
              {myItems.length} {myItems.length === 1 ? "piece" : "pieces"} catalogued
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "36px", lineHeight: 1.05, fontWeight: 400, letterSpacing: "-0.03em", marginTop: 2 }}>
              My Wardrobe
            </h1>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: "var(--gold)", border: "none", cursor: "pointer" }}
          >
            <Plus size={20} style={{ color: "#161616" }} />
          </button>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: "var(--surface)" }}>
          {(["closet", "items", "outfits"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex-1 py-2 rounded-lg transition-all"
              style={{
                background: view === v ? "var(--gold)" : "transparent",
                color: view === v ? "#161616" : "var(--muted-foreground)",
                border: "none", cursor: "pointer",
                fontSize: "11px", fontWeight: view === v ? 600 : 400,
              }}
            >
              {v === "closet" ? "✦ Closet" : v === "items" ? "My Pieces" : "Outfits"}
            </button>
          ))}
        </div>

        {/* Search + filter for items view */}
        {view === "items" && (
          <>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <Search size={16} style={{ color: "var(--muted-foreground)" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your closet..."
                className="flex-1 outline-none"
                style={{ background: "transparent", color: "var(--cream)", fontSize: "13px", fontFamily: "var(--font-body)", border: "none" }}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className="shrink-0 px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: activeCategory === cat ? "var(--gold)" : "var(--surface)",
                    color: activeCategory === cat ? "#161616" : "var(--muted-foreground)",
                    border: `1px solid ${activeCategory === cat ? "var(--gold)" : "var(--border)"}`,
                    fontSize: "11px", fontWeight: activeCategory === cat ? 600 : 400, cursor: "pointer",
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">

        {/* ── Virtual Closet ── */}
        {view === "closet" && <VirtualCloset />}

        {/* ── My Pieces ── */}
        {view === "items" && (
          <div className="px-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <p style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>Loading your wardrobe...</p>
              </div>
            ) : myItems.length === 0 ? (
              /* Empty state */
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 gap-5 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(199,179,139,0.1)", border: "1px solid var(--border)" }}>
                  <Camera size={28} style={{ color: "var(--gold)" }} />
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "22px", fontWeight: 400, letterSpacing: "-0.01em" }}>
                    Your closet is empty
                  </h3>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: 6, lineHeight: 1.6, maxWidth: 260, margin: "6px auto 0" }}>
                    Add your first piece and Iris will start making personalized recommendations from what you actually own.
                  </p>
                </div>
                <button
                  onClick={() => setShowUpload(true)}
                  className="px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all active:scale-95"
                  style={{ background: "var(--gold)", color: "#161616", fontWeight: 600, fontSize: "14px", border: "none", cursor: "pointer" }}
                >
                  <Camera size={16} /> Add Your First Piece
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredItems.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="relative">
                      {isPersistentImage(item.image) ? (
                        <img src={item.image} alt={item.name} className="w-full object-cover" style={{ height: 180 }} />
                      ) : (
                        <div className="w-full flex items-center justify-center" style={{ height: 180, background: "rgba(199,179,139,0.08)" }}>
                          <span style={{ fontSize: "32px" }}>{CATEGORY_EMOJI[item.category] ?? "👔"}</span>
                        </div>
                      )}
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(22,22,22,0.8) 0%, transparent 55%)" }} />
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-full" style={{ background: "rgba(22,22,22,0.8)", backdropFilter: "blur(6px)" }}>
                        <span style={{ fontSize: "11px" }}>{CATEGORY_EMOJI[item.category] ?? "👔"}</span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex gap-1 flex-wrap">
                          {item.occasions.slice(0, 2).map((o) => (
                            <span key={o} style={{ fontSize: "9px", color: "var(--cream)", background: "rgba(255,255,255,0.15)", padding: "1px 6px", borderRadius: 99, backdropFilter: "blur(4px)", textTransform: "capitalize" }}>
                              {o}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <p style={{ color: "var(--cream)", fontSize: "12px", fontWeight: 500, marginBottom: 1 }}>{item.name}</p>
                      {item.brand && <p style={{ color: "var(--muted-foreground)", fontSize: "10px", marginBottom: 4 }}>{item.brand}</p>}
                      <p style={{ color: "var(--lavender)", fontSize: "10px", fontStyle: "italic", lineHeight: 1.4 }}>{item.styleNote}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Add more card */}
                <button onClick={() => setShowUpload(true)}
                  className="rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
                  style={{ background: "transparent", border: "2px dashed var(--border)", minHeight: 220, cursor: "pointer" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(199,179,139,0.1)" }}>
                    <Plus size={20} style={{ color: "var(--gold)" }} />
                  </div>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>Add piece</p>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Outfits ── */}
        {view === "outfits" && (
          <div className="px-6 flex flex-col items-center justify-center py-16 gap-5 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(199,179,139,0.1)", border: "1px solid var(--border)" }}>
              <Star size={28} style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "22px", fontWeight: 400, letterSpacing: "-0.01em" }}>
                Outfit builder
              </h3>
              <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: 6, lineHeight: 1.6 }}>
                Add pieces to your closet and Iris will start suggesting complete outfits from what you own.
              </p>
            </div>
            {myItems.length === 0 && (
              <button onClick={() => { setView("items"); setShowUpload(true); }}
                className="px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all active:scale-95"
                style={{ background: "var(--gold)", color: "#161616", fontWeight: 600, fontSize: "14px", border: "none", cursor: "pointer" }}>
                <Camera size={16} /> Start adding pieces
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

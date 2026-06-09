import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Sparkles, RotateCcw, Share2, Heart, ShoppingBag, Link } from "lucide-react";
import { PremiumBadge } from "../ui/PremiumBadge";

export interface ClosetItem {
  id: number;
  name: string;
  brand: string;
  category: "top" | "bottom" | "dress" | "outerwear" | "shoes" | "bag" | "accessory";
  color: string;
  colorName: string;
  image: string;
  source?: "purchased" | "uploaded" | "wishlisted";
  purchaseUrl?: string;
}

const CLOSET_ITEMS: ClosetItem[] = [
  { id: 1, name: "Silk Slip Dress", brand: "Reformation", category: "dress", color: "#D4A5B5", colorName: "Dusty Rose", image: "https://images.unsplash.com/photo-1611367540736-b1b38aff784b?w=300&h=400&fit=crop&auto=format", source: "purchased" },
  { id: 2, name: "Wool Blazer", brand: "Theory", category: "outerwear", color: "#2F4F4F", colorName: "Deep Teal", image: "https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=300&h=400&fit=crop&auto=format", source: "purchased" },
  { id: 3, name: "Wide Leg Trousers", brand: "Arket", category: "bottom", color: "#8B7355", colorName: "Warm Taupe", image: "https://images.unsplash.com/photo-1533392151650-269f96231f65?w=300&h=400&fit=crop&auto=format", source: "uploaded" },
  { id: 4, name: "Cashmere Turtleneck", brand: "Everlane", category: "top", color: "#F5F0E8", colorName: "Cream", image: "https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2?w=300&h=400&fit=crop&auto=format", source: "uploaded" },
  { id: 5, name: "Leather Loafers", brand: "Toteme", category: "shoes", color: "#3B2314", colorName: "Espresso", image: "https://images.unsplash.com/photo-1549439602-43ebca2327af?w=300&h=400&fit=crop&auto=format", source: "purchased" },
  { id: 6, name: "Gold Chain Bag", brand: "Mango", category: "bag", color: "#C9A96E", colorName: "Gold", image: "https://images.unsplash.com/photo-1589363358751-ab05797e5629?w=300&h=400&fit=crop&auto=format", source: "purchased" },
  { id: 7, name: "Strappy Sandals", brand: "Sam Edelman", category: "shoes", color: "#C9A96E", colorName: "Gold", image: "https://images.unsplash.com/photo-1569388330292-79cc1ec67270?w=300&h=400&fit=crop&auto=format", source: "wishlisted" },
  { id: 8, name: "Linen Midi Skirt", brand: "& Other Stories", category: "bottom", color: "#DDD5C4", colorName: "Linen", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&h=400&fit=crop&auto=format", source: "uploaded" },
];

const OUTFIT_SLOTS: { key: keyof OutfitSlots; label: string; accepts: ClosetItem["category"][] }[] = [
  { key: "top", label: "Top / Dress", accepts: ["top", "dress"] },
  { key: "bottom", label: "Bottom", accepts: ["bottom", "dress"] },
  { key: "outer", label: "Outerwear", accepts: ["outerwear"] },
  { key: "shoes", label: "Shoes", accepts: ["shoes"] },
  { key: "bag", label: "Bag", accepts: ["bag"] },
  { key: "accessory", label: "Accessory", accepts: ["accessory"] },
];

interface OutfitSlots {
  top: ClosetItem | null;
  bottom: ClosetItem | null;
  outer: ClosetItem | null;
  shoes: ClosetItem | null;
  bag: ClosetItem | null;
  accessory: ClosetItem | null;
}

const AI_OUTFIT_SUGGESTIONS = [
  { name: "The Power Edit", slots: { top: 4, bottom: 3, outer: 2, shoes: 5, bag: 6, accessory: null } },
  { name: "Weekend Soft", slots: { top: 4, bottom: 8, outer: null, shoes: 7, bag: 6, accessory: null } },
  { name: "Evening Silk", slots: { top: 1, bottom: null, outer: null, shoes: 7, bag: 6, accessory: null } },
];

export function VirtualCloset() {
  const [outfit, setOutfit] = useState<OutfitSlots>({ top: null, bottom: null, outer: null, shoes: null, bag: null, accessory: null });
  const [activeSlot, setActiveSlot] = useState<keyof OutfitSlots | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<{ name: string; slots: OutfitSlots }[]>([]);
  const [outfitName, setOutfitName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [view, setView] = useState<"builder" | "saved">("builder");

  const slot = activeSlot ? OUTFIT_SLOTS.find((s) => s.key === activeSlot) : null;
  const availableItems = slot
    ? CLOSET_ITEMS.filter((item) => slot.accepts.includes(item.category))
    : [];

  const selectItem = (item: ClosetItem) => {
    if (!activeSlot) return;
    // If it's a dress, auto-clear bottom
    if (item.category === "dress") {
      setOutfit((o) => ({ ...o, top: item, bottom: null }));
    } else {
      setOutfit((o) => ({ ...o, [activeSlot]: item }));
    }
    setActiveSlot(null);
  };

  const clearSlot = (key: keyof OutfitSlots) => setOutfit((o) => ({ ...o, [key]: null }));

  const clearAll = () => setOutfit({ top: null, bottom: null, outer: null, shoes: null, bag: null, accessory: null });

  const applyAISuggestion = (suggestion: typeof AI_OUTFIT_SUGGESTIONS[0]) => {
    const resolved: OutfitSlots = {
      top: CLOSET_ITEMS.find((i) => i.id === suggestion.slots.top) || null,
      bottom: CLOSET_ITEMS.find((i) => i.id === suggestion.slots.bottom) || null,
      outer: CLOSET_ITEMS.find((i) => i.id === suggestion.slots.outer) || null,
      shoes: CLOSET_ITEMS.find((i) => i.id === suggestion.slots.shoes) || null,
      bag: CLOSET_ITEMS.find((i) => i.id === suggestion.slots.bag) || null,
      accessory: null,
    };
    setOutfit(resolved);
  };

  const saveOutfit = () => {
    if (outfitName.trim()) {
      setSavedOutfits((prev) => [...prev, { name: outfitName, slots: { ...outfit } }]);
      setOutfitName("");
      setShowSaveModal(false);
    }
  };

  const hasAnyItem = Object.values(outfit).some(Boolean);

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "22px" }}>Virtual Closet</h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>Inspired by Clueless ✦</p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded-full flex items-center gap-1.5"
              style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)", color: "var(--gold)", fontSize: "11px", cursor: "pointer" }}
            >
              <Link size={11} /> Import Orders
              <PremiumBadge />
            </button>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--surface)" }}>
          {(["builder", "saved"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className="flex-1 py-2 rounded-lg capitalize transition-all"
              style={{ background: view === v ? "var(--gold)" : "transparent", color: view === v ? "var(--charcoal)" : "var(--muted-foreground)", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: view === v ? 600 : 400 }}>
              {v === "builder" ? "Outfit Builder" : `Saved (${savedOutfits.length})`}
            </button>
          ))}
        </div>
      </div>

      {view === "builder" ? (
        <div className="flex-1 overflow-y-auto pb-4">
          {/* AI suggestions */}
          <div className="px-6 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={13} style={{ color: "var(--gold)" }} />
              <p style={{ color: "var(--gold)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>AI Outfit Suggestions</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {AI_OUTFIT_SUGGESTIONS.map((s) => (
                <button key={s.name} onClick={() => applyAISuggestion(s)}
                  className="shrink-0 px-4 py-2 rounded-full transition-all active:scale-95"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--cream)", fontSize: "12px", cursor: "pointer" }}>
                  ✦ {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Outfit canvas — the Clueless board */}
          <div className="px-6 mb-5">
            <div
              className="rounded-2xl p-4 relative"
              style={{ background: "var(--surface)", border: `1px solid ${hasAnyItem ? "rgba(201,169,110,0.3)" : "var(--border)"}`, minHeight: 320 }}
            >
              {/* Header of board */}
              <div className="flex items-center justify-between mb-4">
                <p style={{ color: "var(--muted-foreground)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Today's Look
                </p>
                <div className="flex gap-2">
                  {hasAnyItem && (
                    <>
                      <button onClick={clearAll} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "var(--surface-2)", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: "11px" }}>
                        <RotateCcw size={10} /> Clear
                      </button>
                      <button onClick={() => setShowSaveModal(true)} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)", cursor: "pointer", color: "var(--gold)", fontSize: "11px" }}>
                        <Heart size={10} /> Save Look
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Grid of outfit slots */}
              <div className="grid grid-cols-3 gap-2">
                {OUTFIT_SLOTS.map((s) => {
                  const item = outfit[s.key];
                  const isActive = activeSlot === s.key;
                  return (
                    <motion.button
                      key={s.key}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setActiveSlot(isActive ? null : s.key)}
                      className="rounded-xl overflow-hidden relative flex flex-col items-center justify-center transition-all"
                      style={{
                        background: item ? "transparent" : "var(--surface-2)",
                        border: `1.5px solid ${isActive ? "var(--gold)" : item ? "rgba(201,169,110,0.2)" : "var(--border)"}`,
                        height: 100,
                        cursor: "pointer",
                      }}
                    >
                      {item ? (
                        <>
                          <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(14,13,12,0.7) 0%, transparent 50%)" }} />
                          <button
                            onClick={(e) => { e.stopPropagation(); clearSlot(s.key); }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(14,13,12,0.8)", border: "none", cursor: "pointer", fontSize: "10px", color: "var(--cream)" }}
                          >✕</button>
                          <div className="absolute bottom-1 left-1 right-1">
                            <p style={{ color: "var(--cream)", fontSize: "9px", textAlign: "center", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>{item.name}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Plus size={16} style={{ color: isActive ? "var(--gold)" : "var(--muted-foreground)", marginBottom: 4 }} />
                          <p style={{ color: isActive ? "var(--gold)" : "var(--muted-foreground)", fontSize: "9px", textAlign: "center", lineHeight: 1.3 }}>{s.label}</p>
                        </>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {!hasAnyItem && (
                <p style={{ color: "var(--muted-foreground)", fontSize: "12px", textAlign: "center", marginTop: 16 }}>
                  Tap a slot to add pieces, or try an AI suggestion ↑
                </p>
              )}
            </div>
          </div>

          {/* Item picker panel */}
          <AnimatePresence>
            {activeSlot && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="px-6"
              >
                <p style={{ color: "var(--gold)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                  Choose {slot?.label}
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                  {availableItems.length > 0 ? availableItems.map((item) => (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectItem(item)}
                      className="shrink-0 rounded-xl overflow-hidden relative"
                      style={{ width: 90, height: 120, border: "1px solid var(--border)", cursor: "pointer" }}
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(14,13,12,0.8) 0%, transparent 50%)" }} />
                      <div className="absolute bottom-1 left-1 right-1">
                        <p style={{ color: "var(--cream)", fontSize: "9px", textAlign: "center", lineHeight: 1.3 }}>{item.name}</p>
                      </div>
                      {item.source === "wishlisted" && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "rgba(212,165,181,0.9)" }}>
                          <Heart size={8} fill="white" style={{ color: "white" }} />
                        </div>
                      )}
                    </motion.button>
                  )) : (
                    <div className="flex flex-col items-center justify-center w-full py-6 gap-2">
                      <p style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>No {slot?.label.toLowerCase()} in your closet yet</p>
                      <button className="px-4 py-2 rounded-xl flex items-center gap-1.5" style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)", color: "var(--gold)", fontSize: "11px", cursor: "pointer" }}>
                        <Plus size={12} /> Add piece
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Color harmony check */}
          {hasAnyItem && (
            <div className="px-6 mt-5">
              <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 500 }}>Color Harmony</p>
                  <span style={{ color: "#6B8F71", fontSize: "12px", fontWeight: 600 }}>✓ Cohesive</span>
                </div>
                <div className="flex gap-1.5 mb-2">
                  {Object.values(outfit).filter(Boolean).map((item, i) => (
                    <div key={i} className="w-7 h-7 rounded-full" style={{ background: item!.color, border: "1px solid rgba(255,255,255,0.1)" }} />
                  ))}
                </div>
                <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>
                  Your palette is warm-toned and cohesive — perfect for your Autumn colour season.
                </p>
              </div>
            </div>
          )}

          {/* Order import section */}
          <div className="px-6 mt-5">
            <div className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag size={14} style={{ color: "var(--gold)" }} />
                    <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 500 }}>Auto-Import Orders</p>
                    <PremiumBadge />
                  </div>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "11px", lineHeight: 1.5 }}>
                    Connect your email or shopping accounts and we'll automatically add new purchases to your closet.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["ASOS", "Net-a-Porter", "Zara", "Amazon Fashion", "Selfridges"].map((store) => (
                  <span key={store} className="px-3 py-1 rounded-full" style={{ background: "var(--surface-2)", color: "var(--muted-foreground)", fontSize: "10px" }}>
                    {store}
                  </span>
                ))}
              </div>
              <button className="mt-3 w-full py-2.5 rounded-xl" style={{ background: "var(--gold)", color: "var(--charcoal)", fontWeight: 600, fontSize: "12px", border: "none", cursor: "pointer" }}>
                Connect Shopping Accounts ✦
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Saved outfits view */
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {savedOutfits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(201,169,110,0.1)" }}>
                <Heart size={24} style={{ color: "var(--gold)" }} />
              </div>
              <p style={{ color: "var(--cream)", fontSize: "14px", fontWeight: 500 }}>No saved looks yet</p>
              <p style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>Build an outfit and save it as a look</p>
              <button onClick={() => setView("builder")} style={{ color: "var(--gold)", fontSize: "12px", background: "none", border: "none", cursor: "pointer" }}>
                Open builder →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {savedOutfits.map((saved, i) => (
                <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex">
                    {Object.values(saved.slots).filter(Boolean).slice(0, 4).map((item, j) => (
                      <div key={j} className="flex-1 relative" style={{ height: 120 }}>
                        <img src={item!.image} alt={item!.name} className="w-full h-full object-cover" />
                        {j < Object.values(saved.slots).filter(Boolean).slice(0, 4).length - 1 && (
                          <div className="absolute right-0 top-0 bottom-0 w-px" style={{ background: "var(--charcoal)" }} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p style={{ color: "var(--cream)", fontWeight: 500, fontSize: "14px" }}>{saved.name}</p>
                      <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>{Object.values(saved.slots).filter(Boolean).length} pieces</p>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "var(--surface-2)", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: "11px" }}>
                      <Share2 size={11} /> Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Save outfit modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full rounded-t-3xl p-6 pb-10"
              style={{ background: "var(--surface)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "var(--border)" }} />
              <h3 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "20px", marginBottom: 16 }}>Name this look</h3>
              <input
                type="text" value={outfitName} onChange={(e) => setOutfitName(e.target.value)}
                placeholder="e.g. Monday Power Look" autoFocus
                className="w-full px-4 py-3 rounded-xl outline-none mb-4"
                style={{ background: "var(--surface-2)", color: "var(--cream)", border: "1px solid var(--border)", fontSize: "15px", fontFamily: "var(--font-body)" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
              <button
                onClick={saveOutfit} disabled={!outfitName.trim()}
                className="w-full py-3.5 rounded-xl"
                style={{ background: outfitName.trim() ? "var(--gold)" : "var(--surface-2)", color: outfitName.trim() ? "var(--charcoal)" : "var(--muted-foreground)", fontWeight: 600, fontSize: "14px", border: "none", cursor: outfitName.trim() ? "pointer" : "not-allowed" }}
              >
                Save Look ✦
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

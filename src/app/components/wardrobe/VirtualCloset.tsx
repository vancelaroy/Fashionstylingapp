import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Sparkles, RotateCcw, Share2, Heart, Camera, X, Trash2 } from "lucide-react";
import type { WardrobeItem } from "./WardrobeUpload";

type OutfitSlotKey = "top" | "bottom" | "outer" | "shoes" | "bag" | "accessory";

type OutfitSlots = Record<OutfitSlotKey, WardrobeItem | null>;

interface SavedOutfit {
  id: string;
  name: string;
  slotItemIds: Partial<Record<OutfitSlotKey, string>>;
  createdAt: string;
}

interface OutfitSuggestion {
  name: string;
  note: string;
  slots: OutfitSlots;
}

interface VirtualClosetProps {
  items: WardrobeItem[];
  initialView?: "builder" | "saved";
  onAddPiece?: () => void;
}

const EMPTY_SLOTS: OutfitSlots = {
  top: null,
  bottom: null,
  outer: null,
  shoes: null,
  bag: null,
  accessory: null,
};

const OUTFIT_SLOTS: { key: OutfitSlotKey; label: string; accepts: string[] }[] = [
  { key: "top", label: "Top / Dress", accepts: ["tops", "dresses"] },
  { key: "bottom", label: "Bottom", accepts: ["bottoms"] },
  { key: "outer", label: "Outerwear", accepts: ["outerwear", "suits"] },
  { key: "shoes", label: "Shoes", accepts: ["shoes"] },
  { key: "bag", label: "Bag", accepts: ["bags"] },
  { key: "accessory", label: "Accessory", accepts: ["accessories"] },
];

const CATEGORY_EMOJI: Record<string, string> = {
  tops: "👕", bottoms: "👖", outerwear: "🧥", shoes: "👟",
  accessories: "💍", dresses: "👗", suits: "🤵", bags: "👜",
};

function isPersistentImage(src: string | undefined): src is string {
  return !!src && !src.startsWith("blob:");
}

function getSlotForCategory(category: string): OutfitSlotKey | null {
  if (category === "tops" || category === "dresses") return "top";
  if (category === "bottoms") return "bottom";
  if (category === "outerwear" || category === "suits") return "outer";
  if (category === "shoes") return "shoes";
  if (category === "bags") return "bag";
  if (category === "accessories") return "accessory";
  return null;
}

function findFirst(items: WardrobeItem[], categories: string[], rejectIds: string[] = []) {
  return items.find((item) => categories.includes(item.category) && !rejectIds.includes(item.id)) ?? null;
}

function scoreItemForOccasion(item: WardrobeItem, occasion: string) {
  const text = `${item.name} ${item.brand ?? ""} ${item.category} ${item.color} ${item.fit ?? ""} ${item.occasions.join(" ")} ${item.styleNote}`.toLowerCase();
  let score = 0;
  if (text.includes(occasion)) score += 5;
  if (occasion === "work" && /blazer|suit|tailored|structured|trouser|dress shirt|polo/.test(text)) score += 3;
  if (occasion === "weekend" && /casual|relaxed|denim|tee|t-shirt|sneaker|bucket|canvas/.test(text)) score += 3;
  if (occasion === "evening" && /evening|formal|dress|silk|black|heel|blazer|leather/.test(text)) score += 3;
  return score;
}

function pickForOccasion(items: WardrobeItem[], categories: string[], occasion: string, rejectIds: string[] = []) {
  const candidates = items
    .filter((item) => categories.includes(item.category) && !rejectIds.includes(item.id))
    .map((item) => ({ item, score: scoreItemForOccasion(item, occasion) }))
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.item ?? null;
}

function buildSuggestion(items: WardrobeItem[], name: string, occasion: string, note: string): OutfitSuggestion {
  const top = pickForOccasion(items, ["tops", "dresses"], occasion);
  const used = top ? [top.id] : [];
  const isDress = top?.category === "dresses";
  const bottom = isDress ? null : pickForOccasion(items, ["bottoms"], occasion, used);
  if (bottom) used.push(bottom.id);
  const outer = pickForOccasion(items, ["outerwear", "suits"], occasion, used);
  if (outer) used.push(outer.id);
  const shoes = pickForOccasion(items, ["shoes"], occasion, used);
  if (shoes) used.push(shoes.id);
  const bag = pickForOccasion(items, ["bags"], occasion, used);
  if (bag) used.push(bag.id);
  const accessory = pickForOccasion(items, ["accessories"], occasion, used);

  return { name, note, slots: { top, bottom, outer, shoes, bag, accessory } };
}

function getSavedOutfitSlots(saved: SavedOutfit, items: WardrobeItem[]): OutfitSlots {
  return {
    top: items.find((item) => item.id === saved.slotItemIds.top) ?? null,
    bottom: items.find((item) => item.id === saved.slotItemIds.bottom) ?? null,
    outer: items.find((item) => item.id === saved.slotItemIds.outer) ?? null,
    shoes: items.find((item) => item.id === saved.slotItemIds.shoes) ?? null,
    bag: items.find((item) => item.id === saved.slotItemIds.bag) ?? null,
    accessory: items.find((item) => item.id === saved.slotItemIds.accessory) ?? null,
  };
}

function getOutfitItemCount(slots: OutfitSlots) {
  return Object.values(slots).filter(Boolean).length;
}

export function VirtualCloset({ items, initialView = "builder", onAddPiece }: VirtualClosetProps) {
  const [outfit, setOutfit] = useState<OutfitSlots>(EMPTY_SLOTS);
  const [activeSlot, setActiveSlot] = useState<OutfitSlotKey | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [outfitName, setOutfitName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [view, setView] = useState<"builder" | "saved">(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("irys.savedOutfits.v1");
      if (saved) setSavedOutfits(JSON.parse(saved));
    } catch {
      setSavedOutfits([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("irys.savedOutfits.v1", JSON.stringify(savedOutfits));
  }, [savedOutfits]);

  const suggestions = useMemo(() => {
    if (items.length === 0) return [];
    return [
      buildSuggestion(items, "The Power Edit", "work", "Sharp, pulled together, and easy to wear."),
      buildSuggestion(items, "Weekend Soft", "weekend", "Relaxed pieces with enough polish to leave the house confidently."),
      buildSuggestion(items, "Evening Clean", "evening", "A simple after-dark formula using what is already in your closet."),
    ].filter((suggestion) => getOutfitItemCount(suggestion.slots) > 0);
  }, [items]);

  const activeSlotConfig = activeSlot ? OUTFIT_SLOTS.find((slot) => slot.key === activeSlot) : null;
  const availableItems = activeSlotConfig
    ? items.filter((item) => activeSlotConfig.accepts.includes(item.category))
    : [];
  const hasAnyItem = getOutfitItemCount(outfit) > 0;

  const selectItem = (item: WardrobeItem) => {
    if (!activeSlot) return;
    if (item.category === "dresses") {
      setOutfit((current) => ({ ...current, top: item, bottom: null }));
    } else {
      setOutfit((current) => ({ ...current, [activeSlot]: item }));
    }
    setActiveSlot(null);
  };

  const addItemDirectly = (item: WardrobeItem) => {
    const slot = getSlotForCategory(item.category);
    if (!slot) return;
    if (item.category === "dresses") {
      setOutfit((current) => ({ ...current, top: item, bottom: null }));
    } else {
      setOutfit((current) => ({ ...current, [slot]: item }));
    }
    setView("builder");
  };

  const clearSlot = (key: OutfitSlotKey) => {
    setOutfit((current) => ({ ...current, [key]: null }));
  };

  const clearAll = () => {
    setOutfit(EMPTY_SLOTS);
    setActiveSlot(null);
  };

  const applySuggestion = (suggestion: OutfitSuggestion) => {
    setOutfit(suggestion.slots);
    setActiveSlot(null);
    setView("builder");
  };

  const saveOutfit = () => {
    if (!outfitName.trim() || !hasAnyItem) return;

    const slotItemIds = Object.fromEntries(
      Object.entries(outfit)
        .filter(([, item]) => !!item)
        .map(([key, item]) => [key, item!.id])
    ) as SavedOutfit["slotItemIds"];

    setSavedOutfits((current) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name: outfitName.trim(), slotItemIds, createdAt: new Date().toISOString() },
      ...current,
    ]);
    setOutfitName("");
    setShowSaveModal(false);
    setView("saved");
  };

  const deleteSavedOutfit = (id: string) => {
    setSavedOutfits((current) => current.filter((outfit) => outfit.id !== id));
  };

  const loadSavedOutfit = (saved: SavedOutfit) => {
    setOutfit(getSavedOutfitSlots(saved, items));
    setView("builder");
  };

  if (items.length === 0) {
    return (
      <div className="px-6 py-14 flex flex-col items-center justify-center gap-5 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(199,179,139,0.1)", border: "1px solid var(--border)" }}>
          <Camera size={28} style={{ color: "var(--gold)" }} />
        </div>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "24px", fontWeight: 400, letterSpacing: "-0.01em" }}>
            Build your first look
          </h3>
          <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: 8, lineHeight: 1.6 }}>
            Add a few closet pieces first, then Iris can help you mix them into real outfits.
          </p>
        </div>
        <button onClick={onAddPiece} className="px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all active:scale-95"
          style={{ background: "var(--gold)", color: "#161616", fontWeight: 700, fontSize: "14px", border: "none", cursor: "pointer" }}>
          <Camera size={16} /> Add closet pieces
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "22px", fontWeight: 400 }}>Virtual Closet</h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>Build looks from your real pieces</p>
          </div>
          <button onClick={onAddPiece} className="px-3 py-2 rounded-full flex items-center gap-1.5"
            style={{ background: "rgba(199,179,139,0.1)", border: "1px solid rgba(199,179,139,0.22)", color: "var(--gold)", fontSize: "11px", cursor: "pointer" }}>
            <Plus size={12} /> Add Piece
          </button>
        </div>

        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--surface)" }}>
          {(["builder", "saved"] as const).map((mode) => (
            <button key={mode} onClick={() => setView(mode)} className="flex-1 py-2 rounded-lg transition-all"
              style={{ background: view === mode ? "var(--gold)" : "transparent", color: view === mode ? "var(--charcoal)" : "var(--muted-foreground)", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: view === mode ? 700 : 400 }}>
              {mode === "builder" ? "Outfit Builder" : `Saved (${savedOutfits.length})`}
            </button>
          ))}
        </div>
      </div>

      {view === "builder" ? (
        <div className="flex-1 overflow-y-auto pb-6">
          <div className="px-6 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={13} style={{ color: "var(--gold)" }} />
              <p style={{ color: "var(--gold)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Iris outfit starters</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {suggestions.map((suggestion) => (
                <button key={suggestion.name} onClick={() => applySuggestion(suggestion)}
                  className="shrink-0 px-4 py-2 rounded-full transition-all active:scale-95"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--cream)", fontSize: "12px", cursor: "pointer" }}>
                  ✦ {suggestion.name}
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 mb-5">
            <div className="rounded-2xl p-4 relative"
              style={{ background: "var(--surface)", border: `1px solid ${hasAnyItem ? "rgba(199,179,139,0.3)" : "var(--border)"}`, minHeight: 330 }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Today's Look
                  </p>
                  {hasAnyItem && (
                    <p style={{ color: "var(--lavender)", fontSize: "11px", marginTop: 3 }}>
                      {getOutfitItemCount(outfit)} pieces selected
                    </p>
                  )}
                </div>
                {hasAnyItem && (
                  <div className="flex gap-2">
                    <button onClick={clearAll} className="flex items-center gap-1 px-2 py-1 rounded-lg"
                      style={{ background: "var(--surface-2)", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: "11px" }}>
                      <RotateCcw size={10} /> Clear
                    </button>
                    <button onClick={() => setShowSaveModal(true)} className="flex items-center gap-1 px-2 py-1 rounded-lg"
                      style={{ background: "rgba(199,179,139,0.15)", border: "1px solid rgba(199,179,139,0.3)", cursor: "pointer", color: "var(--gold)", fontSize: "11px" }}>
                      <Heart size={10} /> Save
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {OUTFIT_SLOTS.map((slot) => {
                  const item = outfit[slot.key];
                  const isActive = activeSlot === slot.key;
                  return (
                    <motion.button key={slot.key} whileTap={{ scale: 0.96 }} onClick={() => setActiveSlot(isActive ? null : slot.key)}
                      className="rounded-xl overflow-hidden relative flex flex-col items-center justify-center transition-all"
                      style={{ background: item ? "transparent" : "var(--surface-2)", border: `1.5px solid ${isActive ? "var(--gold)" : item ? "rgba(199,179,139,0.25)" : "var(--border)"}`, height: 112, cursor: "pointer" }}>
                      {item ? (
                        <>
                          {isPersistentImage(item.image) ? (
                            <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            <span style={{ fontSize: "30px" }}>{CATEGORY_EMOJI[item.category] ?? "👔"}</span>
                          )}
                          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(14,13,12,0.78) 0%, transparent 58%)" }} />
                          <button onClick={(event) => { event.stopPropagation(); clearSlot(slot.key); }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(14,13,12,0.82)", border: "none", cursor: "pointer", color: "var(--cream)" }}>
                            <X size={10} />
                          </button>
                          <div className="absolute bottom-1 left-1 right-1">
                            <p style={{ color: "var(--cream)", fontSize: "9px", textAlign: "center", lineHeight: 1.25, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>{item.name}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Plus size={17} style={{ color: isActive ? "var(--gold)" : "var(--muted-foreground)", marginBottom: 4 }} />
                          <p style={{ color: isActive ? "var(--gold)" : "var(--muted-foreground)", fontSize: "9px", textAlign: "center", lineHeight: 1.3 }}>{slot.label}</p>
                        </>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {!hasAnyItem && (
                <p style={{ color: "var(--muted-foreground)", fontSize: "12px", textAlign: "center", marginTop: 16 }}>
                  Tap a slot, choose a piece below, or start with Iris.
                </p>
              )}
            </div>
          </div>

          <AnimatePresence>
            {activeSlot && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="px-6 mb-5">
                <p style={{ color: "var(--gold)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                  Choose {activeSlotConfig?.label}
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                  {availableItems.length > 0 ? availableItems.map((item) => (
                    <motion.button key={item.id} whileTap={{ scale: 0.95 }} onClick={() => selectItem(item)}
                      className="shrink-0 rounded-xl overflow-hidden relative"
                      style={{ width: 96, height: 124, border: "1px solid var(--border)", cursor: "pointer", background: "var(--surface)" }}>
                      {isPersistentImage(item.image) ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span style={{ fontSize: "28px" }}>{CATEGORY_EMOJI[item.category] ?? "👔"}</span>
                        </div>
                      )}
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(14,13,12,0.82) 0%, transparent 55%)" }} />
                      <div className="absolute bottom-1 left-1 right-1">
                        <p style={{ color: "var(--cream)", fontSize: "9px", textAlign: "center", lineHeight: 1.25 }}>{item.name}</p>
                      </div>
                    </motion.button>
                  )) : (
                    <div className="flex flex-col items-center justify-center w-full py-6 gap-3">
                      <p style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>No {activeSlotConfig?.label.toLowerCase()} pieces yet</p>
                      <button onClick={onAddPiece} className="px-4 py-2 rounded-xl flex items-center gap-1.5"
                        style={{ background: "rgba(199,179,139,0.1)", border: "1px solid rgba(199,179,139,0.2)", color: "var(--gold)", fontSize: "11px", cursor: "pointer" }}>
                        <Plus size={12} /> Add piece
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-6">
            <p style={{ color: "var(--muted-foreground)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              Quick add from closet
            </p>
            <div className="grid grid-cols-2 gap-2">
              {items.slice(0, 8).map((item) => (
                <button key={item.id} onClick={() => addItemDirectly(item)}
                  className="rounded-xl p-2 flex items-center gap-2 text-left"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}>
                  <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
                    {isPersistentImage(item.image) ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{CATEGORY_EMOJI[item.category] ?? "👔"}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p style={{ color: "var(--cream)", fontSize: "11px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "9px", textTransform: "capitalize" }}>{item.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {savedOutfits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(199,179,139,0.1)", border: "1px solid var(--border)" }}>
                <Heart size={26} style={{ color: "var(--gold)" }} />
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "24px", fontWeight: 400 }}>No saved looks yet</h3>
                <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: 6 }}>Build a look, save it, and it will appear here.</p>
              </div>
              <button onClick={() => setView("builder")} className="px-5 py-3 rounded-2xl"
                style={{ background: "var(--gold)", color: "var(--charcoal)", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>
                Open outfit builder
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {savedOutfits.map((saved) => {
                const slots = getSavedOutfitSlots(saved, items);
                const savedItems = Object.values(slots).filter(Boolean) as WardrobeItem[];
                return (
                  <div key={saved.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <button onClick={() => loadSavedOutfit(saved)} className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.max(savedItems.slice(0, 4).length, 1)}, 1fr)`, border: "none", padding: 0, cursor: "pointer", background: "transparent" }}>
                      {savedItems.slice(0, 4).map((item) => (
                        <div key={item.id} className="relative flex items-center justify-center" style={{ height: 120, background: "var(--surface-2)" }}>
                          {isPersistentImage(item.image) ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span style={{ fontSize: "28px" }}>{CATEGORY_EMOJI[item.category] ?? "👔"}</span>
                          )}
                        </div>
                      ))}
                    </button>
                    <div className="p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p style={{ color: "var(--cream)", fontWeight: 600, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{saved.name}</p>
                        <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>{savedItems.length} pieces</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => loadSavedOutfit(saved)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                          style={{ background: "var(--surface-2)", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: "11px" }}>
                          <Share2 size={11} /> Wear
                        </button>
                        <button onClick={() => deleteSavedOutfit(saved.id)} className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: "var(--surface-2)", border: "none", cursor: "pointer" }}>
                          <Trash2 size={12} style={{ color: "#e07070" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showSaveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowSaveModal(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full rounded-t-3xl p-6 pb-10" style={{ background: "var(--surface)" }} onClick={(event) => event.stopPropagation()}>
              <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "var(--border)" }} />
              <h3 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "22px", fontWeight: 400, marginBottom: 16 }}>Name this look</h3>
              <input type="text" value={outfitName} onChange={(event) => setOutfitName(event.target.value)}
                placeholder="e.g. Monday Power Look" autoFocus
                className="w-full px-4 py-3 rounded-xl outline-none mb-4"
                style={{ background: "var(--surface-2)", color: "var(--cream)", border: "1px solid var(--border)", fontSize: "15px", fontFamily: "var(--font-body)" }}
              />
              <button onClick={saveOutfit} disabled={!outfitName.trim()}
                className="w-full py-3.5 rounded-xl"
                style={{ background: outfitName.trim() ? "var(--gold)" : "var(--surface-2)", color: outfitName.trim() ? "var(--charcoal)" : "var(--muted-foreground)", fontWeight: 700, fontSize: "14px", border: "none", cursor: outfitName.trim() ? "pointer" : "not-allowed" }}>
                Save Look
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

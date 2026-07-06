import { useState, useEffect } from "react";
import { Plus, Search, Star, Camera, X, Trash2, Save, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VirtualCloset } from "./VirtualCloset";
import { WardrobeUpload, type WardrobeItem } from "./WardrobeUpload";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const SERVER = `https://${projectId}.supabase.co/functions/v1/irys-api`;

const CATEGORIES = ["All", "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories", "Bags", "Suits"];
const CATEGORY_VALUES = ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "bags", "suits"];
const FIT_VALUES = ["Slim", "Tailored", "Regular", "Relaxed", "Oversized", "Cropped", "Structured", "Flowy", "Not specified"];

const CATEGORY_EMOJI: Record<string, string> = {
  tops: "👕", bottoms: "👖", outerwear: "🧥", shoes: "👟",
  accessories: "💍", dresses: "👗", suits: "🤵", bags: "👜",
};

function isPersistentImage(src: string | undefined): src is string {
  return !!src && !src.startsWith("blob:");
}

async function compressDetailPhoto(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 900;
      const scale = img.width > MAX ? MAX / img.width : 1;
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };
    img.src = url;
  });
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
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
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

  const handleItemUpdated = (updatedItem: WardrobeItem) => {
    const updated = myItems.map((item) => item.id === updatedItem.id ? updatedItem : item);
    setMyItems(updated);
    setSelectedItem(updatedItem);
    saveToServer(updated);
  };

  const handleItemDeleted = (itemId: string) => {
    const updated = myItems.filter((item) => item.id !== itemId);
    setMyItems(updated);
    setSelectedItem(null);
    saveToServer(updated);
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
        {selectedItem && (
          <WardrobeItemDetail
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onSave={handleItemUpdated}
            onDelete={handleItemDeleted}
          />
        )}

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
                  <motion.button key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedItem(item)}
                    className="rounded-2xl overflow-hidden text-left"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", padding: 0 }}>
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
                      {item.fit && (
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-full" style={{ background: "rgba(22,22,22,0.8)", backdropFilter: "blur(6px)" }}>
                          <span style={{ color: "var(--cream)", fontSize: "9px", textTransform: "capitalize" }}>{item.fit}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p style={{ color: "var(--cream)", fontSize: "12px", fontWeight: 500, marginBottom: 1 }}>{item.name}</p>
                      {item.brand && <p style={{ color: "var(--muted-foreground)", fontSize: "10px", marginBottom: 4 }}>{item.brand}</p>}
                      <p style={{ color: "var(--lavender)", fontSize: "10px", fontStyle: "italic", lineHeight: 1.4 }}>{item.styleNote}</p>
                    </div>
                  </motion.button>
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

function WardrobeItemDetail({ item, onClose, onSave, onDelete }: {
  item: WardrobeItem;
  onClose: () => void;
  onSave: (item: WardrobeItem) => void;
  onDelete: (itemId: string) => void;
}) {
  const [draft, setDraft] = useState<WardrobeItem>({
    ...item,
    photos: item.photos && item.photos.length > 0 ? item.photos : [item.image].filter(Boolean),
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const photos = (draft.photos && draft.photos.length > 0 ? draft.photos : [draft.image]).filter(Boolean);

  const updateDraft = (patch: Partial<WardrobeItem>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const addPhoto = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await compressDetailPhoto(file);
    const nextPhotos = [...photos, dataUrl].slice(0, 6);
    updateDraft({ photos: nextPhotos, image: draft.image || dataUrl });
  };

  const removePhoto = (photo: string) => {
    const nextPhotos = photos.filter((p) => p !== photo);
    updateDraft({ photos: nextPhotos, image: draft.image === photo ? (nextPhotos[0] ?? "") : draft.image });
  };

  const saveDraft = () => {
    const nextPhotos = photos.length > 0 ? photos : [draft.image].filter(Boolean);
    onSave({
      ...draft,
      photos: nextPhotos,
      image: draft.image || nextPhotos[0] || "",
      name: draft.name.trim() || "Unnamed item",
      brand: draft.brand?.trim() || null,
      fit: draft.fit?.trim() || undefined,
      color: draft.color.trim() || "Unknown",
      styleNote: draft.styleNote.trim(),
    });
    onClose();
  };

  return (
    <motion.div
      key="item-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--charcoal)", fontFamily: "var(--font-body)" }}
    >
      <div className="flex items-center justify-between px-6 pt-14 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <p style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>Wardrobe Detail</p>
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "28px", fontWeight: 400, letterSpacing: "-0.02em" }}>
            Edit piece
          </h2>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--surface)", border: "none", cursor: "pointer" }}>
          <X size={16} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 pb-28">
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {isPersistentImage(draft.image) ? (
            <img src={draft.image} alt={draft.name} className="w-full object-cover" style={{ maxHeight: 300 }} />
          ) : (
            <div className="w-full flex items-center justify-center" style={{ height: 220, background: "rgba(199,179,139,0.08)" }}>
              <span style={{ fontSize: "42px" }}>{CATEGORY_EMOJI[draft.category] ?? "👔"}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto mb-5 pb-1" style={{ scrollbarWidth: "none" }}>
          {photos.map((photo, index) => (
            <button key={`${photo}-${index}`} onClick={() => updateDraft({ image: photo })}
              className="relative shrink-0 rounded-xl overflow-hidden"
              style={{ width: 72, height: 72, border: draft.image === photo ? "2px solid var(--gold)" : "1px solid var(--border)", background: "var(--surface)", cursor: "pointer" }}>
              {isPersistentImage(photo) ? (
                <img src={photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span style={{ fontSize: "24px" }}>{CATEGORY_EMOJI[draft.category] ?? "👔"}</span>
              )}
              {photos.length > 1 && (
                <span onClick={(e) => { e.stopPropagation(); removePhoto(photo); }}
                  className="absolute top-1 right-1 rounded-full flex items-center justify-center"
                  style={{ width: 18, height: 18, background: "rgba(22,22,22,0.75)", color: "var(--cream)", fontSize: 10 }}>×</span>
              )}
            </button>
          ))}
          <label className="shrink-0 rounded-xl flex flex-col items-center justify-center gap-1"
            style={{ width: 72, height: 72, border: "1px dashed var(--border)", background: "transparent", cursor: "pointer" }}>
            <ImagePlus size={18} style={{ color: "var(--gold)" }} />
            <span style={{ color: "var(--muted-foreground)", fontSize: 9 }}>Photo</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) addPhoto(e.target.files[0]); }} />
          </label>
        </div>

        <div className="flex flex-col gap-4">
          <EditField label="Item Name" value={draft.name} onChange={(value) => updateDraft({ name: value })} />
          <EditField label="Brand" value={draft.brand ?? ""} onChange={(value) => updateDraft({ brand: value })} placeholder="Add or correct brand" />

          <div className="grid grid-cols-2 gap-3">
            <EditSelect label="Category" value={draft.category} options={CATEGORY_VALUES} onChange={(value) => updateDraft({ category: value })} />
            <EditSelect label="Fit" value={draft.fit || "Not specified"} options={FIT_VALUES} onChange={(value) => updateDraft({ fit: value === "Not specified" ? "" : value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <EditField label="Color" value={draft.color} onChange={(value) => updateDraft({ color: value })} />
            <EditField label="Second Color" value={draft.secondaryColor ?? ""} onChange={(value) => updateDraft({ secondaryColor: value || null })} placeholder="Optional" />
          </div>

          <EditTagField label="Occasions" values={draft.occasions} onChange={(values) => updateDraft({ occasions: values })} placeholder="casual, work, evening" />
          <EditTagField label="Seasons" values={draft.seasons} onChange={(values) => updateDraft({ seasons: values })} placeholder="spring, summer, fall" />

          <div>
            <label style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Iris Styling Note
            </label>
            <textarea
              value={draft.styleNote}
              onChange={(e) => updateDraft({ styleNote: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl outline-none resize-none"
              style={{ background: "var(--surface-2)", color: "var(--cream)", border: "1px solid var(--border)", fontSize: "14px", lineHeight: 1.5 }}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 flex gap-3" style={{ background: "rgba(22,22,22,0.95)", borderTop: "1px solid var(--border)", backdropFilter: "blur(10px)" }}>
        {confirmDelete ? (
          <>
            <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3.5 rounded-2xl" style={{ background: "var(--surface)", color: "var(--cream)", border: "1px solid var(--border)", fontSize: 13 }}>
              Cancel
            </button>
            <button onClick={() => onDelete(item.id)} className="flex-1 py-3.5 rounded-2xl" style={{ background: "rgba(192,57,43,0.18)", color: "#e07070", border: "1px solid rgba(192,57,43,0.35)", fontSize: 13, fontWeight: 600 }}>
              Delete
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setConfirmDelete(true)} className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <Trash2 size={18} style={{ color: "#e07070" }} />
            </button>
            <button onClick={saveDraft} className="flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2" style={{ background: "var(--gold)", color: "#161616", border: "none", fontWeight: 700, fontSize: 14 }}>
              <Save size={17} /> Save Changes
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

function EditField({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl outline-none"
        style={{ background: "var(--surface-2)", color: "var(--cream)", border: "1px solid var(--border)", fontSize: "14px" }}
      />
    </div>
  );
}

function EditSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-3 rounded-xl outline-none"
        style={{ background: "var(--surface-2)", color: "var(--cream)", border: "1px solid var(--border)", fontSize: "13px", textTransform: "capitalize" }}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function EditTagField({ label, values, onChange, placeholder }: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  return (
    <EditField
      label={label}
      value={values.join(", ")}
      placeholder={placeholder}
      onChange={(value) => onChange(value.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean))}
    />
  );
}

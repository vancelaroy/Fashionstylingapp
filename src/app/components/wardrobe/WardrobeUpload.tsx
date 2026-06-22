import { useState, useRef } from "react";
import { Camera, Upload, X, Check, ChevronRight, Loader } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const SERVER = `https://${projectId}.supabase.co/functions/v1/irys-api`;

export interface WardrobeItem {
  id: string;
  image: string;           // compressed base64 thumbnail
  name: string;
  category: string;
  color: string;
  secondaryColor?: string | null;
  occasions: string[];
  seasons: string[];
  styleNote: string;
  brand?: string | null;
  addedAt: string;
}

interface WardrobeUploadProps {
  accessToken?: string | null;
  onItemAdded: (item: WardrobeItem) => void;
  onClose: () => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  tops: "👕", bottoms: "👖", outerwear: "🧥", shoes: "👟",
  accessories: "💍", dresses: "👗", suits: "🤵", bags: "👜",
};

const OCCASION_LABELS: Record<string, string> = {
  casual: "Casual", work: "Work", evening: "Evening",
  formal: "Formal", sport: "Sport", weekend: "Weekend",
};

// Compress image to max 800px wide, JPEG quality 0.8
async function compressImage(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 800;
      const scale = img.width > MAX ? MAX / img.width : 1;
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      URL.revokeObjectURL(url);
      // Strip the data:image/jpeg;base64, prefix
      resolve({ base64: dataUrl.split(",")[1], mediaType: "image/jpeg" });
    };
    img.src = url;
  });
}

type Stage = "idle" | "preview" | "analyzing" | "result" | "saving";

export function WardrobeUpload({ accessToken, onItemAdded, onClose }: WardrobeUploadProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Partial<WardrobeItem> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const previewUrl = URL.createObjectURL(file);
    setImageDataUrl(previewUrl);
    setStage("preview");

    // Analyze immediately after selection
    setTimeout(() => analyzeImage(file), 200);
  };

  const analyzeImage = async (file: File) => {
    setStage("analyzing");
    setError(null);
    try {
      const { base64, mediaType } = await compressImage(file);

      const res = await fetch(`${SERVER}/wardrobe/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken ?? publicAnonKey}`,
        },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });

      const data = await res.json();
      if (!res.ok || !data.item) throw new Error(data.error ?? "Analysis failed");

      setAnalysisResult(data.item);
      setEditName(data.item.name ?? "");
      setStage("result");
    } catch (err) {
      console.log("Analysis error:", err);
      setError("Iris couldn't identify this item. Try a clearer photo.");
      setStage("preview");
    }
  };

  const handleSave = async () => {
    if (!analysisResult || !imageDataUrl) return;
    setStage("saving");

    const newItem: WardrobeItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      image: imageDataUrl,
      name: editName || analysisResult.name || "Unnamed item",
      category: analysisResult.category || "tops",
      color: analysisResult.color || "Unknown",
      secondaryColor: analysisResult.secondaryColor,
      occasions: analysisResult.occasions || [],
      seasons: analysisResult.seasons || [],
      styleNote: analysisResult.styleNote || "",
      brand: analysisResult.brand,
      addedAt: new Date().toISOString(),
    };

    onItemAdded(newItem);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#161616", fontFamily: "var(--font-body)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-14 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <p style={{ color: "var(--gold)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>Add to Closet</p>
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "26px", fontWeight: 400, letterSpacing: "-0.02em" }}>
            {stage === "analyzing" ? "Iris is looking..." : stage === "result" ? "Here's what I see" : "Show me a piece"}
          </h2>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "var(--surface)", border: "none", cursor: "pointer" }}>
          <X size={16} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <AnimatePresence mode="wait">

          {/* ── Idle: choose source ── */}
          {stage === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />

              <div
                className="rounded-2xl p-6 mb-5 text-center"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <p style={{ color: "var(--muted-foreground)", fontSize: "13px", lineHeight: 1.7 }}>
                  Take a photo of any clothing item and Iris will identify it, categorize it, and suggest how to style it — automatically added to your closet.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute("capture");
                      fileInputRef.current.setAttribute("capture", "environment");
                      fileInputRef.current.click();
                    }
                  }}
                  className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                  style={{ background: "var(--gold)", color: "#161616", fontWeight: 600, fontSize: "15px", border: "none", cursor: "pointer" }}
                >
                  <Camera size={20} />
                  Take Photo
                </button>

                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute("capture");
                      fileInputRef.current.click();
                    }
                  }}
                  className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                  style={{ background: "var(--surface)", color: "var(--cream)", fontWeight: 500, fontSize: "15px", border: "1px solid var(--border)", cursor: "pointer" }}
                >
                  <Upload size={20} />
                  Choose from Library
                </button>
              </div>

              <p style={{ color: "var(--muted-foreground)", fontSize: "11px", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
                Lay the item flat on a clean surface for best results. Iris can identify color, category, and occasion from a clear photo.
              </p>
            </motion.div>
          )}

          {/* ── Preview + Analyzing ── */}
          {(stage === "preview" || stage === "analyzing") && imageDataUrl && (
            <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl overflow-hidden mb-5 relative" style={{ border: "1px solid var(--border)" }}>
                <img src={imageDataUrl} alt="Uploaded item" className="w-full object-cover" style={{ maxHeight: 320 }} />
                {stage === "analyzing" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: "rgba(22,22,22,0.75)", backdropFilter: "blur(4px)" }}>
                    <Loader size={28} style={{ color: "var(--gold)", animation: "spin 1s linear infinite" }} />
                    <p style={{ color: "var(--cream)", fontSize: "14px", fontWeight: 500 }}>Iris is analyzing...</p>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "12px" }}>Identifying category, color & occasions</p>
                    <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 mb-4" style={{ background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.3)" }}>
                  <p style={{ color: "#e07070", fontSize: "13px" }}>{error}</p>
                </div>
              )}

              {stage === "preview" && (
                <button onClick={() => setStage("idle")} className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}>
                  <X size={14} style={{ color: "var(--muted-foreground)" }} />
                  <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>Try a different photo</span>
                </button>
              )}
            </motion.div>
          )}

          {/* ── Result ── */}
          {stage === "result" && analysisResult && imageDataUrl && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">

              {/* Image + category badge */}
              <div className="rounded-2xl overflow-hidden relative" style={{ border: "1px solid var(--border)" }}>
                <img src={imageDataUrl} alt="Analyzed item" className="w-full object-cover" style={{ maxHeight: 240 }} />
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full" style={{ background: "rgba(22,22,22,0.85)", backdropFilter: "blur(8px)" }}>
                  <span style={{ color: "var(--gold)", fontSize: "12px", fontWeight: 600 }}>
                    {CATEGORY_EMOJI[analysisResult.category ?? "tops"]} {analysisResult.category}
                  </span>
                </div>
              </div>

              {/* Iris verdict banner */}
              <div className="rounded-2xl p-4" style={{ background: "rgba(199,179,139,0.08)", border: "1px solid rgba(199,179,139,0.2)" }}>
                <p style={{ color: "var(--muted-foreground)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Iris says</p>
                <p style={{ color: "var(--cream)", fontSize: "13px", lineHeight: 1.6, fontStyle: "italic" }}>"{analysisResult.styleNote}"</p>
              </div>

              {/* Editable name */}
              <div>
                <label style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  Item Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ background: "var(--surface-2)", color: "var(--cream)", border: "1px solid var(--border)", fontSize: "15px" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                />
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <Detail label="Color" value={`${analysisResult.color}${analysisResult.secondaryColor ? ` · ${analysisResult.secondaryColor}` : ""}`} />
                {analysisResult.brand && <Detail label="Brand" value={analysisResult.brand} />}
                <Detail label="Seasons" value={(analysisResult.seasons ?? []).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")} />
              </div>

              {/* Occasion tags */}
              {(analysisResult.occasions ?? []).length > 0 && (
                <div>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Occasions</p>
                  <div className="flex gap-2 flex-wrap">
                    {(analysisResult.occasions ?? []).map((occ) => (
                      <span key={occ} className="px-3 py-1.5 rounded-full" style={{ background: "var(--surface)", color: "var(--cream)", fontSize: "12px", border: "1px solid var(--border)" }}>
                        {OCCASION_LABELS[occ] ?? occ}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Save button */}
              <button
                onClick={handleSave}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-2 transition-all active:scale-95"
                style={{ background: "var(--gold)", color: "#161616", fontWeight: 600, fontSize: "15px", border: "none", cursor: "pointer" }}
              >
                <Check size={18} />
                Add to My Closet
              </button>

              <button
                onClick={() => { setStage("idle"); setImageDataUrl(null); setAnalysisResult(null); }}
                className="w-full py-3 rounded-2xl flex items-center justify-center gap-2"
                style={{ background: "transparent", border: "1px solid var(--border)", cursor: "pointer" }}
              >
                <span style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>Add another piece</span>
                <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
              </button>
            </motion.div>
          )}

          {/* ── Saving ── */}
          {stage === "saving" && (
            <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 gap-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(199,179,139,0.15)", border: "2px solid var(--gold)" }}>
                  <Check size={32} style={{ color: "var(--gold)" }} />
                </div>
              </motion.div>
              <div className="text-center">
                <h3 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "24px", fontWeight: 400, letterSpacing: "-0.02em" }}>Added to your closet</h3>
                <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: 4 }}>Iris now knows your wardrobe a little better.</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <p style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{label}</p>
      <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 500, textTransform: "capitalize" }}>{value}</p>
    </div>
  );
}

import { useRef, useState } from "react";
import { Camera, Upload, X, Check, ChevronRight, Loader } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const SERVER = `https://${projectId}.supabase.co/functions/v1/irys-api`;

export interface WardrobeItem {
  id: string;
  image: string;           // compressed base64 thumbnail
  photos?: string[];
  name: string;
  category: string;
  color: string;
  secondaryColor?: string | null;
  fit?: string;
  occasions: string[];
  seasons: string[];
  styleNote: string;
  brand?: string | null;
  addedAt: string;
}

interface WardrobeUploadProps {
  accessToken?: string | null;
  onItemAdded: (item: WardrobeItem, options?: { keepOpen?: boolean }) => boolean | Promise<boolean>;
  onUploadComplete?: (items: WardrobeItem[]) => void;
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

const SEASON_OPTIONS = ["spring", "summer", "fall", "winter", "year-round"];
const SEASON_LABELS: Record<string, string> = {
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  autumn: "Fall",
  winter: "Winter",
  "year-round": "Year-round",
};

function normalizeSeasons(seasons?: string[]) {
  const normalized = (seasons ?? [])
    .map((season) => season.trim().toLowerCase())
    .map((season) => season === "autumn" ? "fall" : season)
    .filter((season) => SEASON_OPTIONS.includes(season));

  if (normalized.length === 0 || normalized.includes("year-round")) return ["year-round"];
  return Array.from(new Set(normalized));
}

function toggleSeason(current: string[], season: string) {
  if (season === "year-round") return ["year-round"];
  const withoutYearRound = current.filter((value) => value !== "year-round");
  const next = withoutYearRound.includes(season)
    ? withoutYearRound.filter((value) => value !== season)
    : [...withoutYearRound, season];
  return next.length > 0 ? next : ["year-round"];
}

function isImageFile(file: File) {
  return file.type.startsWith("image/")
    || file.type === ""
    || /\.(avif|gif|heic|heif|jpeg|jpg|png|webp)$/i.test(file.name);
}

async function readFileAsDataUrl(file: File): Promise<{ base64: string; dataUrl: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : "";
      if (!base64) {
        reject(new Error("Could not read image data"));
        return;
      }

      resolve({
        base64,
        dataUrl,
        mediaType: file.type || "image/jpeg",
      });
    };
    reader.onerror = () => reject(new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
}

// Compress image to max 800px wide, JPEG quality 0.8. The dataUrl is what
// persists in the saved closet; object URLs are preview-only and expire.
async function compressImage(file: File): Promise<{ base64: string; dataUrl: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
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
      resolve({ base64: dataUrl.split(",")[1], dataUrl, mediaType: "image/jpeg" });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image file"));
    };
    img.src = url;
  });
}

type Stage = "idle" | "preview" | "analyzing" | "result" | "saving" | "saved";
type UploadQueueItem = {
  id: string;
  file: File;
  previewUrl: string;
};

export function WardrobeUpload({ accessToken, onItemAdded, onUploadComplete, onClose }: WardrobeUploadProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [persistentImageDataUrl, setPersistentImageDataUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Partial<WardrobeItem> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(["year-round"]);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [saveMessage, setSaveMessage] = useState("Saving to closet...");
  const savedItemsRef = useRef<WardrobeItem[]>([]);

  const resetAnalysis = () => {
    setPersistentImageDataUrl(null);
    setAnalysisResult(null);
    setError(null);
    setEditName("");
    setSelectedSeasons(["year-round"]);
  };

  const analyzeQueuedFile = (item: UploadQueueItem) => {
    setImageDataUrl(item.previewUrl);
    resetAnalysis();
    setStage("preview");
    setTimeout(() => analyzeImage(item.file), 200);
  };

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(isImageFile);
    if (imageFiles.length === 0) {
      setError("IRYS could not read those photos. Try one clear JPEG or PNG image.");
      setStage("idle");
      return;
    }

    queue.forEach((item) => URL.revokeObjectURL(item.previewUrl));

    const nextQueue = imageFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    savedItemsRef.current = [];
    setQueue(nextQueue);
    setCurrentQueueIndex(0);
    analyzeQueuedFile(nextQueue[0]);
  };

  const analyzeImage = async (file: File) => {
    setStage("analyzing");
    setError(null);
    try {
      let imagePayload: { base64: string; dataUrl: string; mediaType: string };
      try {
        imagePayload = await compressImage(file);
      } catch {
        imagePayload = await readFileAsDataUrl(file);
      }

      const { base64, dataUrl, mediaType } = imagePayload;
      setPersistentImageDataUrl(dataUrl);

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

      const seasons = normalizeSeasons(data.item.seasons);
      setAnalysisResult({ ...data.item, seasons });
      setSelectedSeasons(seasons);
      setEditName(data.item.name ?? "");
      setStage("result");
    } catch (err) {
      console.log("Analysis error:", err);
      setError("Iris couldn't identify this item. Try a clearer photo.");
      setStage("preview");
    }
  };

  const handleSave = async () => {
    const savedImage = persistentImageDataUrl ?? imageDataUrl;
    if (!analysisResult || !savedImage) return;
    setError(null);
    setSaveMessage("Saving to closet...");
    setStage("saving");

    const newItem: WardrobeItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      image: savedImage,
      photos: [savedImage],
      name: editName || analysisResult.name || "Unnamed item",
      category: analysisResult.category || "tops",
      color: analysisResult.color || "Unknown",
      secondaryColor: analysisResult.secondaryColor,
      fit: analysisResult.fit,
      occasions: analysisResult.occasions || [],
      seasons: selectedSeasons,
      styleNote: analysisResult.styleNote || "",
      brand: analysisResult.brand,
      addedAt: new Date().toISOString(),
    };

    const hasNext = currentQueueIndex < queue.length - 1;
    const saved = await onItemAdded(newItem, { keepOpen: hasNext });
    if (!saved) {
      setError("This piece was analyzed, but couldn't save. Try again before leaving this screen.");
      setStage("result");
      return;
    }

    savedItemsRef.current = [...savedItemsRef.current, newItem];
    setSaveMessage(hasNext ? "Saved. Preparing the next piece..." : "Upload complete.");
    setStage("saved");
    if (hasNext) {
      setTimeout(() => {
        const nextIndex = currentQueueIndex + 1;
        setCurrentQueueIndex(nextIndex);
        analyzeQueuedFile(queue[nextIndex]);
      }, 900);
    } else {
      setTimeout(() => {
        onUploadComplete?.(savedItemsRef.current);
      }, 950);
    }
  };

  const handleSkipCurrent = () => {
    const hasNext = currentQueueIndex < queue.length - 1;
    if (hasNext) {
      const nextIndex = currentQueueIndex + 1;
      setCurrentQueueIndex(nextIndex);
      analyzeQueuedFile(queue[nextIndex]);
      return;
    }

    queue.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setQueue([]);
    setCurrentQueueIndex(0);
    setImageDataUrl(null);
    resetAnalysis();
    setStage("idle");
  };

  const queueLabel = queue.length > 1 ? `Piece ${currentQueueIndex + 1} of ${queue.length}` : null;
  const remainingAfterCurrent = Math.max(queue.length - currentQueueIndex - 1, 0);

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
          {queueLabel && (
            <p style={{ color: "var(--muted-foreground)", fontSize: "12px", marginTop: 4 }}>{queueLabel}</p>
          )}
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
              <div
                className="rounded-2xl p-6 mb-5 text-center"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <p style={{ color: "var(--muted-foreground)", fontSize: "13px", lineHeight: 1.7 }}>
                  Take a photo of any clothing item and Iris will identify it, categorize it, and suggest how to style it — automatically added to your closet.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <label
                  className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                  style={{ background: "var(--gold)", color: "#161616", fontWeight: 600, fontSize: "15px", border: "none", cursor: "pointer" }}
                >
                  <Camera size={20} />
                  Take Photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (files.length > 0) handleFiles(files);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>

                <label
                  className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                  style={{ background: "var(--surface)", color: "var(--cream)", fontWeight: 500, fontSize: "15px", border: "1px solid var(--border)", cursor: "pointer" }}
                >
                  <Upload size={20} />
                  Choose from Library
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (files.length > 0) handleFiles(files);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>

              <p style={{ color: "var(--muted-foreground)", fontSize: "11px", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
                Select one photo or several at once. Iris will review each piece one by one so you can confirm the details before saving.
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
                <button onClick={handleSkipCurrent} className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}>
                  <X size={14} style={{ color: "var(--muted-foreground)" }} />
                  <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
                    {currentQueueIndex < queue.length - 1 ? "Skip this photo" : "Try a different photo"}
                  </span>
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
              </div>

              <div>
                <p style={{ color: "var(--muted-foreground)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Seasons</p>
                <div className="flex gap-2 flex-wrap">
                  {SEASON_OPTIONS.map((season) => {
                    const selected = selectedSeasons.includes(season);
                    return (
                      <button
                        key={season}
                        onClick={() => setSelectedSeasons((current) => toggleSeason(current, season))}
                        className="px-3 py-1.5 rounded-full transition-all"
                        style={{
                          background: selected ? "var(--gold)" : "var(--surface)",
                          color: selected ? "#161616" : "var(--cream)",
                          fontSize: "12px",
                          border: `1px solid ${selected ? "var(--gold)" : "var(--border)"}`,
                          cursor: "pointer",
                        }}
                      >
                        {SEASON_LABELS[season]}
                      </button>
                    );
                  })}
                </div>
                <p style={{ color: "var(--muted-foreground)", fontSize: "11px", lineHeight: 1.5, marginTop: 8 }}>
                  This helps Iris keep winter coats out of summer outfits.
                </p>
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
                {currentQueueIndex < queue.length - 1 ? "Add and Continue" : "Add to My Closet"}
              </button>

              <button
                onClick={handleSkipCurrent}
                className="w-full py-3 rounded-2xl flex items-center justify-center gap-2"
                style={{ background: "transparent", border: "1px solid var(--border)", cursor: "pointer" }}
              >
                <span style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>
                  {currentQueueIndex < queue.length - 1 ? "Skip to next piece" : "Add another piece"}
                </span>
                <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
              </button>
            </motion.div>
          )}

          {/* ── Saving ── */}
          {(stage === "saving" || stage === "saved") && (
            <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 gap-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(199,179,139,0.15)", border: "2px solid var(--gold)" }}>
                  {stage === "saving" ? (
                    <Loader size={32} style={{ color: "var(--gold)", animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Check size={32} style={{ color: "var(--gold)" }} />
                  )}
                </div>
              </motion.div>
              <div className="text-center">
                <h3 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "24px", fontWeight: 400, letterSpacing: "-0.02em" }}>
                  {stage === "saving" ? saveMessage : remainingAfterCurrent > 0 ? "Saved. Next piece..." : "Added to your closet"}
                </h3>
                <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginTop: 4 }}>
                  {stage === "saving"
                    ? "Please keep this screen open."
                    : remainingAfterCurrent > 0
                      ? `${remainingAfterCurrent} more to review.`
                      : "Iris now knows your wardrobe a little better."}
                </p>
              </div>
              <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
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

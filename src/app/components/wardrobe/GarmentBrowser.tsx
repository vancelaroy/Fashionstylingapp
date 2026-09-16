import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, ArrowLeft } from "lucide-react";
import type { WardrobeItem } from "./WardrobeUpload";
import type { OutfitSlots } from "../../lib/outfitIntelligence";

const categories = ["all", "tops", "bottoms", "dresses", "outerwear", "shoes", "bags", "accessories", "suits"];

export function GarmentBrowser({ items, outfit, initialCategory = "all", onSelect, onClose }: {
  items: WardrobeItem[];
  outfit: OutfitSlots;
  initialCategory?: string;
  onSelect: (item: WardrobeItem) => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const selected = new Set(Object.values(outfit).filter(Boolean).map(item => item!.id));
  const visible = items.filter(item => (category === "all" || item.category === category) && item.name.toLowerCase().includes(query.toLowerCase()));
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
      <Dialog.Content className="fixed inset-y-0 left-1/2 z-50 flex w-full max-w-3xl -translate-x-1/2 flex-col outline-none"
        style={{ height: "100dvh", background: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)", paddingTop: "env(safe-area-inset-top)" }}
        >
        <header className="shrink-0 px-4 pt-3 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-2">
            <Dialog.Close aria-label="Return to outfit" className="min-h-11 min-w-11 flex items-center justify-center rounded-full" style={{ background: "var(--surface)" }}><ArrowLeft size={20} /></Dialog.Close>
            <div><Dialog.Title style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>Your pieces</Dialog.Title>
              <Dialog.Description style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{items.length} pieces · {selected.size} selected</Dialog.Description></div>
          </div>
          <div className="flex gap-2">
            <input aria-label="Search garments" placeholder="Search pieces…" value={query} onChange={e => setQuery(e.target.value)} className="min-w-0 flex-1 rounded-xl px-3 py-2" style={{ background: "var(--surface)", fontSize: 16, border: "1px solid var(--border)" }} />
            <select aria-label="Garment category" value={category} onChange={e => setCategory(e.target.value)} className="rounded-xl px-2" style={{ maxWidth: 125, background: "var(--surface)", fontSize: 14, border: "1px solid var(--border)" }}>
              {categories.map(value => <option key={value} value={value}>{value === "all" ? "All pieces" : value[0].toUpperCase() + value.slice(1)}</option>)}
            </select>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4" data-testid="garment-browser-scroll">
          <p className="mb-3" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Choose pieces for your look. A new piece replaces the selection in its slot. Tap a selected piece to remove it.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {visible.map(item => <button key={item.id} aria-pressed={selected.has(item.id)} aria-label={`Select ${item.name}`} onClick={() => onSelect(item)} className="relative overflow-hidden rounded-2xl text-left" style={{ background: "var(--surface)", border: `2px solid ${selected.has(item.id) ? "var(--gold)" : "var(--border)"}` }}>
              <div style={{ aspectRatio: "3 / 4" }}>
                {item.image ? <img src={item.image} alt="" loading="lazy" className="w-full h-full object-contain" /> : <div className="h-full flex items-center justify-center" style={{ color: "var(--gold)" }}>{item.category}</div>}
              </div>
              {selected.has(item.id) && <span className="absolute top-2 right-2 rounded-full p-1" style={{ background: "var(--gold)", color: "var(--charcoal)" }}><Check size={18} /></span>}
              <p className="p-2" style={{ fontSize: 13, lineHeight: 1.4 }}>{item.name}</p>
            </button>)}
          </div>
          {!visible.length && <p className="py-10 text-center">No pieces match. Try another category or search.</p>}
        </div>
        <footer className="shrink-0 px-4 pt-3" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))", background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
          <Dialog.Close className="w-full rounded-xl py-3" style={{ background: "var(--gold)", color: "var(--charcoal)", fontWeight: 600 }}>Return to outfit · {selected.size} selected</Dialog.Close>
        </footer>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

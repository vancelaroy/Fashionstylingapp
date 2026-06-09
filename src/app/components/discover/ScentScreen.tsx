import { useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, Info } from "lucide-react";

interface ScentScreenProps {
  gender: "woman" | "man" | "nonbinary";
  colorSeason?: string;
  stylePersonality?: string[];
}

const SCENT_FAMILIES = [
  {
    id: "aquatic",
    name: "Aquatic / Fresh",
    icon: "🌊",
    desc: "Clean, light, ocean-inspired",
    keywords: ["crisp", "clean", "effortless"],
    bestFor: ["Everyday", "Office", "Spring/Summer"],
    moodBoard: "Think: morning shower, sea breeze, white linen",
    color: "#B0C4DE",
    menFragrances: [
      { name: "Bleu de Chanel", brand: "Chanel", price: "$145", notes: "Citrus, Incense, Sandalwood" },
      { name: "Acqua di Giò", brand: "Giorgio Armani", price: "$95", notes: "Marine, Bergamot, Rosemary" },
      { name: "Sauvage", brand: "Dior", price: "$130", notes: "Bergamot, Pepper, Ambroxan" },
    ],
    womenFragrances: [
      { name: "Light Blue", brand: "Dolce & Gabbana", price: "$89", notes: "Apple, Cedar, Bamboo" },
      { name: "CK One", brand: "Calvin Klein", price: "$65", notes: "Bergamot, Tea, Jasmine" },
      { name: "Daisy", brand: "Marc Jacobs", price: "$98", notes: "Wild Berry, Violet, Musk" },
    ],
  },
  {
    id: "woody",
    name: "Woody / Earthy",
    icon: "🌲",
    desc: "Deep, grounding, sophisticated",
    keywords: ["warm", "grounded", "mature"],
    bestFor: ["Evening", "Dates", "Autumn/Winter"],
    moodBoard: "Think: cedar log fire, aged leather, dark forest",
    color: "#8B7355",
    menFragrances: [
      { name: "Terre d'Hermès", brand: "Hermès", price: "$155", notes: "Grapefruit, Vetiver, Flint" },
      { name: "Y Eau de Parfum", brand: "YSL", price: "$115", notes: "Apple, Sage, Cedarwood" },
      { name: "Paco Rabanne 1 Million", brand: "Paco Rabanne", price: "$105", notes: "Grapefruit, Cinnamon, Leather" },
    ],
    womenFragrances: [
      { name: "Black Opium", brand: "YSL", price: "$119", notes: "Coffee, Jasmine, Vanilla" },
      { name: "Mon Paris", brand: "YSL", price: "$109", notes: "Strawberry, Peony, White Musk" },
      { name: "Wood Sage & Sea Salt", brand: "Jo Malone", price: "$165", notes: "Sea Salt, Sage, Driftwood" },
    ],
  },
  {
    id: "oriental",
    name: "Oriental / Spice",
    icon: "🌶️",
    desc: "Rich, sensual, bold",
    keywords: ["powerful", "sensual", "memorable"],
    bestFor: ["Formal Events", "Winter", "Evening Galas"],
    moodBoard: "Think: amber resin, dark velvet, candlelight",
    color: "#8B1A1A",
    menFragrances: [
      { name: "Tobacco Vanille", brand: "Tom Ford", price: "$295", notes: "Tobacco, Vanilla, Dried Fruits" },
      { name: "Oud Wood", brand: "Tom Ford", price: "$295", notes: "Oud Wood, Rosewood, Cardamom" },
      { name: "La Nuit de L'Homme", brand: "YSL", price: "$115", notes: "Cardamom, Cedar, Vetiver" },
    ],
    womenFragrances: [
      { name: "Black Orchid", brand: "Tom Ford", price: "$185", notes: "Black Orchid, Patchouli, Velvet" },
      { name: "Alien", brand: "Thierry Mugler", price: "$125", notes: "Jasmine, Cashmeran Wood, Amber" },
      { name: "Opium", brand: "YSL", price: "$105", notes: "Mandarin, Rose, Patchouli" },
    ],
  },
  {
    id: "citrus",
    name: "Citrus / Bright",
    icon: "🍊",
    desc: "Energising, uplifting, joyful",
    keywords: ["fresh", "optimistic", "confident"],
    bestFor: ["Daytime", "Spring", "Casual"],
    moodBoard: "Think: sun-warmed lemon groves, sparkling water, morning energy",
    color: "#FFB347",
    menFragrances: [
      { name: "Acqua di Parma Colonia", brand: "Acqua di Parma", price: "$215", notes: "Calabrian Bergamot, Rosemary, Iris" },
      { name: "Bergamote 22", brand: "Le Labo", price: "$245", notes: "Bergamot, Grapefruit, Musk" },
      { name: "Green Irish Tweed", brand: "Creed", price: "$385", notes: "Lemon Verbena, Violet Leaves, Sandalwood" },
    ],
    womenFragrances: [
      { name: "Happy", brand: "Clinique", price: "$75", notes: "Grapefruit, Bergamot, Boysenberry" },
      { name: "Bright Crystal", brand: "Versace", price: "$85", notes: "Pomegranate, Peony, Magnolia" },
      { name: "Neroli Portofino", brand: "Tom Ford", price: "$285", notes: "Neroli, Bergamot, Amber" },
    ],
  },
  {
    id: "floral",
    name: "Floral / Romantic",
    icon: "🌸",
    desc: "Soft, romantic, timeless",
    keywords: ["romantic", "elegant", "timeless"],
    bestFor: ["Date Night", "Spring", "Special Occasions"],
    moodBoard: "Think: rose petals, dewy garden, soft candlelight",
    color: "#D4A5B5",
    menFragrances: [
      { name: "Florals by Maison", brand: "Maison Margiela", price: "$165", notes: "Rose, Jasmine, Vetiver" },
      { name: "Replica Flower Market", brand: "Maison Margiela", price: "$175", notes: "Violet, Rose, Freesia" },
    ],
    womenFragrances: [
      { name: "Miss Dior", brand: "Dior", price: "$135", notes: "Grasse Rose, Peony, Patchouli" },
      { name: "J'adore", brand: "Dior", price: "$145", notes: "Ylang Ylang, Rose, Jasmine" },
      { name: "Coco Mademoiselle", brand: "Chanel", price: "$155", notes: "Orange, Rose, Patchouli" },
    ],
  },
  {
    id: "gourmand",
    name: "Gourmand / Cosy",
    icon: "🍦",
    desc: "Warm, sweet, comforting",
    keywords: ["approachable", "warm", "comforting"],
    bestFor: ["Autumn/Winter", "Cosy Days", "Casual"],
    moodBoard: "Think: warm vanilla, toasted almonds, cashmere blanket",
    color: "#C9A96E",
    menFragrances: [
      { name: "Spicebomb Extreme", brand: "Viktor&Rolf", price: "$125", notes: "Tobacco, Vanilla, Amber" },
      { name: "A*Men Pure Havane", brand: "Thierry Mugler", price: "$115", notes: "Tobacco, Caramel, Patchouli" },
    ],
    womenFragrances: [
      { name: "Angel", brand: "Thierry Mugler", price: "$105", notes: "Patchouli, Caramel, Vanilla" },
      { name: "La Vie est Belle", brand: "Lancôme", price: "$115", notes: "Iris, Praline, Vanilla" },
      { name: "Flowerbomb", brand: "Viktor&Rolf", price: "$125", notes: "Jasmine, Rose, Patchouli" },
    ],
  },
];

const OCCASION_MAP: Record<string, string[]> = {
  "Formal / Work": ["oriental", "woody", "aquatic"],
  "Everyday / Casual": ["aquatic", "citrus", "gourmand"],
  "Date Night": ["floral", "oriental", "woody"],
  "Summer / Outdoors": ["citrus", "aquatic"],
  "Autumn / Winter": ["oriental", "woody", "gourmand"],
  "Spring / Events": ["floral", "citrus"],
};

export function ScentScreen({ gender, colorSeason, stylePersonality }: ScentScreenProps) {
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [expandedFamily, setExpandedFamily] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const isMale = gender === "man";

  const recommendedFamilies = selectedOccasion
    ? SCENT_FAMILIES.filter((f) => OCCASION_MAP[selectedOccasion]?.includes(f.id))
    : getDefaultRecommendations(colorSeason, stylePersonality);

  function getDefaultRecommendations(season?: string, styles?: string[]) {
    const recommended = new Set<string>();
    if (season === "autumn" || season === "winter") { recommended.add("woody"); recommended.add("oriental"); }
    if (season === "spring" || season === "summer") { recommended.add("citrus"); recommended.add("aquatic"); }
    if (styles?.includes("Romantic") || styles?.includes("Classic")) recommended.add("floral");
    if (styles?.includes("Minimalist")) recommended.add("aquatic");
    if (styles?.includes("Edgy") || styles?.includes("Streetwear")) recommended.add("oriental");
    if (styles?.includes("Casual Chic") || styles?.includes("Smart Casual")) recommended.add("citrus");
    if (recommended.size === 0) { recommended.add("aquatic"); recommended.add("woody"); }
    return SCENT_FAMILIES.filter((f) => recommended.has(f.id));
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "22px" }}>Scent Profile</h2>
          <button onClick={() => setShowTooltip(!showTooltip)} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <Info size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
        <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.5 }}>
          Fragrance matched to your style DNA, colour season & occasion.
        </p>

        {showTooltip && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p style={{ color: "var(--muted-foreground)", fontSize: "12px", lineHeight: 1.6 }}>
              Just like colour analysis helps you dress better, scent families help you smell intentional. {isMale ? "Aquatic scents are great for everyday & office. Woody scents project authority. Oriental scents command attention at formal events." : "Floral scents are timeless and romantic. Oriental scents are bold and memorable. Citrus scents are bright and approachable."}
            </p>
          </motion.div>
        )}
      </div>

      {/* Occasion filter */}
      <div className="px-6 mb-5">
        <p style={{ color: "var(--muted-foreground)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          Find a scent for...
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {Object.keys(OCCASION_MAP).map((occ) => (
            <button key={occ} onClick={() => setSelectedOccasion(selectedOccasion === occ ? null : occ)}
              className="shrink-0 px-3 py-2 rounded-full transition-all"
              style={{
                background: selectedOccasion === occ ? "var(--gold)" : "var(--surface)",
                color: selectedOccasion === occ ? "var(--charcoal)" : "var(--muted-foreground)",
                border: `1px solid ${selectedOccasion === occ ? "var(--gold)" : "var(--border)"}`,
                fontSize: "11px", fontWeight: selectedOccasion === occ ? 600 : 400, cursor: "pointer",
              }}
            >
              {occ}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended families */}
      {recommendedFamilies.length > 0 && (
        <div className="px-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontSize: "12px" }}>✦</span>
            <p style={{ color: "var(--gold)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {selectedOccasion ? `Best for ${selectedOccasion}` : "Matched to your Style DNA"}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {recommendedFamilies.map((family, i) => {
              const isExpanded = expandedFamily === family.id;
              const fragrances = isMale ? family.menFragrances : family.womenFragrances;
              return (
                <motion.div key={family.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "var(--surface)", border: `1px solid ${isExpanded ? "rgba(201,169,110,0.3)" : "var(--border)"}` }}
                >
                  <button onClick={() => setExpandedFamily(isExpanded ? null : family.id)}
                    className="w-full flex items-center gap-4 p-4"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: `${family.color}20` }}>
                      {family.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p style={{ color: "var(--cream)", fontWeight: 500, fontSize: "14px", marginBottom: 2 }}>{family.name}</p>
                      <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>{family.desc}</p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {family.bestFor.map((b) => (
                          <span key={b} style={{ fontSize: "9px", color: "var(--gold)", background: "rgba(201,169,110,0.1)", padding: "2px 7px", borderRadius: 99 }}>{b}</span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: "var(--muted-foreground)", transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                  </button>

                  {isExpanded && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="px-4 pb-4" style={{ borderTop: "1px solid var(--border)" }}>
                      <p style={{ color: "var(--muted-foreground)", fontSize: "12px", fontStyle: "italic", lineHeight: 1.5, marginTop: 12, marginBottom: 16 }}>
                        {family.moodBoard}
                      </p>
                      <p style={{ color: "var(--cream)", fontSize: "12px", fontWeight: 500, marginBottom: 10 }}>
                        Recommended {isMale ? "for men" : "for women"}:
                      </p>
                      <div className="flex flex-col gap-3">
                        {fragrances?.map((frag) => (
                          <div key={frag.name} className="flex items-center justify-between p-3 rounded-xl"
                            style={{ background: "var(--surface-2)" }}>
                            <div>
                              <p style={{ color: "var(--cream)", fontSize: "13px", fontWeight: 500 }}>{frag.name}</p>
                              <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>{frag.brand}</p>
                              <p style={{ color: "var(--muted-foreground)", fontSize: "10px", marginTop: 2 }}>{frag.notes}</p>
                            </div>
                            <div className="text-right">
                              <p style={{ color: "var(--gold)", fontWeight: 600, fontSize: "13px" }}>{frag.price}</p>
                              <button className="mt-2 px-3 py-1 rounded-lg" style={{ background: "rgba(201,169,110,0.15)", color: "var(--gold)", fontSize: "10px", fontWeight: 600, border: "none", cursor: "pointer" }}>
                                Shop →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* All families */}
      {selectedOccasion && (
        <div className="px-6 pb-4">
          <p style={{ color: "var(--muted-foreground)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            All Scent Families
          </p>
          <div className="grid grid-cols-3 gap-2">
            {SCENT_FAMILIES.filter((f) => !recommendedFamilies.includes(f)).map((family) => (
              <button key={family.id} onClick={() => setExpandedFamily(family.id === expandedFamily ? null : family.id)}
                className="p-3 rounded-xl flex flex-col items-center gap-2 transition-all"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}>
                <span style={{ fontSize: "22px" }}>{family.icon}</span>
                <p style={{ color: "var(--muted-foreground)", fontSize: "10px", textAlign: "center", lineHeight: 1.3 }}>{family.name.split("/")[0]}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

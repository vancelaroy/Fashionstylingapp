import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, ChevronRight, RotateCcw } from "lucide-react";
import type { StyleProfile } from "../onboarding/OnboardingFlow";

interface Message {
  id: string;
  role: "user" | "coco";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface CocoChatScreenProps {
  profile: StyleProfile;
}

// ─── Profile-aware response engine ───────────────────────────────────────────
function generateCocoResponse(userMessage: string, profile: StyleProfile): { content: string; suggestions?: string[] } {
  const msg = userMessage.toLowerCase();
  const gender = profile.gender || "woman";
  const isMale = gender === "man";
  const season = profile.colorSeason || "autumn";
  const bodyType = profile.bodyType || "hourglass";
  const name = profile.name || "darling";
  const personalities = (profile.stylePersonality || []).join(", ") || "Classic";

  // ── Greetings
  if (msg.match(/^(hi|hey|hello|hiya|howdy)/)) {
    return {
      content: `Hello ${name} ✦ I've been waiting for you. I know your Style DNA inside out — your ${season} colour season, your ${bodyType.replace("-", " ")} silhouette, your ${personalities} aesthetic. Ask me anything. What shall we work on today?`,
      suggestions: ["Plan a capsule wardrobe", "What to wear this weekend?", "Help me dress for an event", "Colour advice for me"],
    };
  }

  // ── Colour / color questions
  if (msg.match(/colou?r|palette|what colou?rs|shade|tone|hue/)) {
    const seasonAdvice: Record<string, string> = {
      spring: `As a **Spring**, your power colours are warm and clear — think coral, peach, golden yellow, warm turquoise, and ivory. Your worst enemy is black worn close to the face — it can make you look washed out. Swap it for camel, warm brown, or navy.`,
      summer: `As a **Summer**, your palette is cool, muted, and light. Dusty rose, lavender, soft teal, powder blue, and dove grey are your friends. Avoid harsh black or warm orange — they fight your natural colouring. Soft white and charcoal suit you far better.`,
      autumn: `As an **Autumn**, you are made for the richest, most luxurious palette — burnt orange, deep olive, burgundy, warm chocolate, mustard, and forest green. These are the colours that make your skin *glow*. Avoid icy pastels or stark white — reach for cream and oyster instead.`,
      winter: `As a **Winter**, you're one of the few who can wear true black and true white with absolute authority. High contrast is your superpower — think royal blue, emerald, fuchsia, burgundy, or pure white against black. Muted earthy tones will dull you. Go bold.`,
    };
    return {
      content: seasonAdvice[season] || seasonAdvice.autumn,
      suggestions: ["What neutrals work for me?", "Best colours for a formal event", "Colours to avoid", "Build a colour capsule"],
    };
  }

  // ── Capsule wardrobe
  if (msg.match(/capsule|wardrobe|essential|staple|foundation|building/)) {
    const capsuleMale = `A strong men's capsule for a **${personalities}** aesthetic:\n\n**Tops (4):** 2 white/cream Oxford shirts, 1 navy crew-neck merino, 1 quality tee in a ${season === "autumn" || season === "winter" ? "camel or charcoal" : "light grey or navy"} tone\n\n**Bottoms (3):** Slim or straight dark jeans, tailored chinos in ${season === "autumn" ? "olive or tan" : "stone or navy"}, a well-cut suit trouser\n\n**Outerwear (2):** Structured blazer, a quality overcoat in camel or charcoal\n\n**Shoes (2):** White leather sneakers, leather derby or Chelsea boots\n\n**Accessories:** A clean leather belt, minimal watch, quality leather bag`;
    const capsuleFemale = `A refined capsule for your **${personalities}** aesthetic and **${season}** season:\n\n**Tops (4):** Silk blouse in a ${season === "autumn" ? "warm cream or rust" : "soft white or dusty pink"}, fitted merino, quality tee, a statement top\n\n**Bottoms (3):** Wide-leg trouser, midi skirt, straight-leg jeans\n\n**Dresses (2):** A day dress + one for evening\n\n**Outerwear (2):** Tailored blazer, a coat that makes you feel *powerful*\n\n**Shoes (3):** Loafers, heeled mule, white sneaker\n\n**Bags (2):** Everyday tote, evening bag`;
    return {
      content: isMale ? capsuleMale : capsuleFemale,
      suggestions: ["Budget breakdown for this", "Where to shop these pieces", "Seasonal capsule instead", "Help me prioritise what to buy first"],
    };
  }

  // ── Event / occasion dressing
  if (msg.match(/wedding|event|interview|date|party|funeral|gala|dinner|brunch|birthday|job/)) {
    const isWedding = msg.includes("wedding");
    const isInterview = msg.includes("interview") || msg.includes("job");
    const isDate = msg.includes("date");

    if (isWedding) {
      const weddingMale = `For a wedding, you want to look *intentional*, not try-hard. For your **${bodyType}** frame:\n\n**Safe & chic:** A well-fitted suit in navy, slate, or warm grey (avoid black unless it's a black-tie affair — it reads like you came from a funeral). Add a pocket square in a ${season === "autumn" ? "burnt orange or rust" : "soft blue or blush"} tone.\n\n**Bold option:** A linen suit in ivory or sage for summer/outdoor weddings — this is a *moment*.\n\n**Shoes:** Derby shoes or loafers. Clean leather, please.\n\nIs this a daytime, evening, or destination wedding?`;
      const weddingFemale = `Wedding guest dressing is an art. Here's my read for your profile:\n\n**Your colours:** Lean into your ${season} palette — ${season === "autumn" ? "deep burgundy, rust, or forest green" : season === "spring" ? "coral, blush, or warm gold" : season === "winter" ? "cobalt, emerald, or deep plum" : "dusty rose, lavender, or soft sage"} — any of these will photograph beautifully.\n\n**Silhouette for ${bodyType.replace("-", " ")}:** ${bodyType === "hourglass" ? "A wrap dress or fitted midi — you can wear almost anything" : bodyType === "pear" ? "An A-line or fit-and-flare that celebrates those hips" : "A flowy midi or column dress"}\n\n**Length:** Midi is the safest, most elegant choice for any wedding.\n\nWhat's the dress code and time of day?`;
      return { content: isMale ? weddingMale : weddingFemale, suggestions: ["It's black tie", "It's outdoor / garden party", "I have nothing to wear — help", "What accessories?"] };
    }

    if (isInterview) {
      return {
        content: `Dressing for an interview is about communicating *before you speak*. Here's the formula for your **${personalities}** aesthetic:\n\n**The rule:** Dress one level above the company's usual dress code. If they're smart casual, you're business casual. If they're business casual, you're business formal.\n\n**For your ${season} colouring:** Your power neutrals are ${season === "autumn" || season === "spring" ? "camel, navy, warm grey, or olive" : "charcoal, navy, cool grey, or cream"}. These project competence and authority.\n\n**Fit is everything.** An average garment that fits perfectly beats an expensive one that doesn't. Does anything in your wardrobe need tailoring before this?`,
        suggestions: ["What if it's a creative industry?", "Tech company — what to wear?", "I need a new interview outfit", "What not to wear to an interview"],
      };
    }

    if (isDate) {
      return {
        content: `A date outfit should make you feel attractive *and* comfortable — because you need to be fully present, not fidgeting with a hem or a collar.\n\nFor a **${personalities}** with your **${season}** colouring:\n\n✦ **First date / daytime:** ${isMale ? "Smart dark jeans, a well-fitted shirt, clean leather shoes. Simple, intentional." : "A flowy midi dress or well-cut jeans with a silk top. Approachable but magnetic."}\n\n✦ **Evening date:** ${isMale ? "Slim trousers, an open-collar shirt, and a blazer you could remove if it gets warm. A little fragrance — something woody or citrus, nothing overpowering." : `A dress that makes you feel like *yourself* but turned up a notch. Your ${season} palette will do the heavy lifting.`}\n\nWhere are you going? I can get more specific.`,
        suggestions: ["It's a dinner date", "Casual — just coffee", "What perfume should I wear?", "I want to look effortless"],
      };
    }

    return {
      content: `Tell me more about this event — the dress code, time of day, venue, and how you want to *feel* when you walk in. The more detail you give me, the more precise I can be.`,
      suggestions: ["Black tie event", "Business casual", "Smart casual", "Outdoor / casual event"],
    };
  }

  // ── Fragrance / scent
  if (msg.match(/perfume|fragrance|scent|cologne|smell/)) {
    const scentMale = `For a man with your **${personalities}** aesthetic, I'd steer you toward:\n\n🌊 **Daily wear:** Something aquatic or citrus — Bleu de Chanel, Acqua di Giò, or Sauvage. Clean, confident, not overwhelming.\n\n🌲 **For evenings or meetings:** A woody base — Terre d'Hermès or Y by YSL. These project authority quietly.\n\n🌶️ **For formal events or winter:** An oriental — Oud Wood by Tom Ford if the budget allows. It's unforgettable.\n\nThe rule of men's fragrance: apply to pulse points *before* getting dressed. Never spray on clothes.`;
    const scentFemale = `For your **${season}** season and **${personalities}** aesthetic:\n\n🌸 **Romantic / Everyday:** Miss Dior, Coco Mademoiselle, or La Vie est Belle — timeless, never try-hard.\n\n🌲 **Evening / Autumn-Winter:** Black Opium (YSL), Wood Sage & Sea Salt (Jo Malone), or Angel (Mugler). Richer, more memorable.\n\n🍊 **Summer / Fresh:** Light Blue (D&G) or Happy (Clinique). Effortless and bright.\n\nA scent should arrive *after* you, not before you. Wrists and the décolletage — never rub your wrists together.`;
    return {
      content: isMale ? scentMale : scentFemale,
      suggestions: ["Recommend a signature scent", "What's a good everyday scent?", "Best scent for formal events", "Open the Scent tab"],
    };
  }

  // ── Budget / shopping
  if (msg.match(/budget|cheap|afford|expensive|price|spend|money|£|\$|invest/)) {
    return {
      content: `Smart question. Here's my philosophy on fashion budgets:\n\n**Spend more on:** Outerwear, shoes, and bags. These are seen the most, touched the most, and last the longest. A £300 coat worn 100 times costs £3 per wear. A £30 fast fashion version worn 5 times costs £6 per wear.\n\n**Save on:** Basics (tees, simple layers), trendy pieces you'll tire of, and anything worn close to the skin that gets replaced often.\n\n**For your ${personalities} aesthetic**, your investment priorities are:\n1. One great coat or blazer\n2. Quality shoes in a neutral colour\n3. A bag that works day-to-night\n\nWhat's your actual monthly or seasonal budget? I can build a plan around it.`,
      suggestions: ["I have £200 to spend", "I have £500 to spend", "Where to shop on a budget?", "Best investment pieces"],
    };
  }

  // ── Body confidence / styling tips for body type
  if (msg.match(/body|shape|flatter|hide|disguise|feel confident|insecure|self.conscious/)) {
    const bodyAdvice: Record<string, string> = {
      hourglass: `Your ${bodyType} silhouette is one of the most versatile — almost any style works when it's fitted through the waist. Embrace wrap dresses, belted coats, and anything that celebrates your natural waist. You don't need to hide anything.`,
      pear: `Your ${bodyType} shape is genuinely beautiful — wider hips are a sign of strength. The styling goal isn't to hide your hips, it's to *balance* your frame. A-line skirts, wide-leg trousers, and statement tops draw the eye upward. Dark bottoms aren't compulsory — that's an outdated rule.`,
      apple: `An ${bodyType} shape looks stunning in empire waistlines, flowy fabrics, and V-necks that create vertical length. Your arms and legs are likely your strongest assets — show them. Avoid clingy fabrics around the midsection, but please don't cover up out of shame.`,
      athletic: `An ${bodyType} male frame is highly versatile. Slim or tapered trousers show your build without looking tight. Structured blazers, well-fitted shirts — everything works when the fit is right. Don't over-size to "look casual" — it reads sloppy, not relaxed.`,
      rectangle: `A ${bodyType} frame has incredible potential for layering and structure. You can create shape with belted pieces, peplum tops, or jackets with waist definition. Colour blocking is your friend — use contrast to create visual curves.`,
      oval: `An ${bodyType} male shape looks sharpest in vertical lines and structured fabrics. Well-cut shirts (not too tight, not too loose), straight-leg trousers, and open collar or V-neck lines all work beautifully. Avoid boxy fits that add horizontal width.`,
    };
    const advice = bodyAdvice[bodyType] || `Every body type has its strengths. The secret is fit — a garment tailored to your proportions will always look better than an expensive one in the wrong size. What specifically would you like to feel more confident about?`;
    return {
      content: `${name}, I want to say this clearly: you don't dress to hide — you dress to express. With that said:\n\n${advice}\n\nWould you like specific outfit formulas for different occasions?`,
      suggestions: ["Outfit formula for work", "Casual looks that flatter me", "What to wear for evening events", "Help me feel confident"],
    };
  }

  // ── Men's specific advice
  if (msg.match(/men|male|masculine|guy|man|him|he|suit|tie/)) {
    return {
      content: `Men's fashion is truly having a moment — and the rules are simpler than most people think.\n\n**The non-negotiables:**\n✦ **Fit first, always.** A £40 shirt that fits is infinitely better than a £200 shirt that doesn't.\n✦ **Invest in your shoes.** People notice.\n✦ **Grooming is part of style.** Your skin, hair, and nails matter as much as your clothes.\n\n**For your ${personalities} aesthetic:**\n${personalities.includes("Streetwear") ? "Layer intentionally — a quality hoodie under a structured coat is a power move." : personalities.includes("Classic") ? "Invest in a navy blazer and well-cut chinos. They'll carry you through 80% of situations." : "Build from basics and let one statement piece do the talking."}\n\nWhat specific situation or wardrobe challenge can I help with?`,
      suggestions: ["How to dress for dates", "Smart casual vs business casual", "Building a men's capsule", "Best menswear brands"],
    };
  }

  // ── Seasonal / trend advice
  if (msg.match(/trend|season|this year|right now|autumn|winter|spring|summer|aw|ss/)) {
    return {
      content: `For your **${season} colour season** and **${personalities}** aesthetic, here's what's worth investing in this season:\n\n**Invest in:** ${season === "autumn" || season === "winter" ? "Rich textures — velvet, boucle, cashmere. Deep jewel tones. Oversized outerwear done intentionally." : "Lightweight linens and cottons. Soft pastels and warm whites. Strappy shoes and minimal silhouettes."}\n\n**Skip:** Anything that feels like a costume. Trends are only worth following when they align with *your* aesthetic — otherwise you'll wear it once and regret it.\n\n**My rule:** If something doesn't feel like you on the first wear, it won't feel like you on the tenth.\n\nWhat are you shopping for specifically?`,
      suggestions: ["What's trending for my aesthetic?", "Trends worth investing in", "Trends to ignore", "Help me edit my wardrobe"],
    };
  }

  // ── Glasses / eyewear
  if (msg.match(/glass|spectacle|frame|eyewear|sunglass|optical/)) {
    const faceShape = profile.faceShape || "oval";
    const frameAdvice: Record<string, string> = {
      oval: "Lucky you — almost every frame shape suits an oval face. Go bold. Try oversized rectangles, geometric shapes, or cat-eyes.",
      round: "Angular frames (rectangle, square, geometric) add definition and structure to softer, rounder features. Avoid circular frames — they emphasise roundness.",
      square: "Rounded or oval frames soften a strong jaw and angular features beautifully. Cat-eyes also work well. Avoid boxy rectangles.",
      heart: "Light frames balanced lower on the face — cat-eyes, oval, or rimless. Avoid decorative browlines that add visual weight to your forehead.",
      diamond: "Cat-eyes or ovals that complement your cheekbones. Frames with detail on the upper half draw attention to your striking bone structure.",
      oblong: "Wide frames — oversized rounds or squares — add width and break up the length. Avoid narrow, small frames.",
    };
    return {
      content: `For your **${faceShape}** face shape:\n\n${frameAdvice[faceShape] || frameAdvice.oval}\n\n**For your ${season} colouring:** ${season === "autumn" || season === "spring" ? "Tortoiseshell, warm browns, gold, and olive frames will complement your warm undertones beautifully." : "Black, silver, cool grey, or jewel-toned frames suit your cool undertones. Avoid warm tortoiseshell."}`,
      suggestions: ["Show me frame recommendations", "Sunglasses advice", "Budget frames that look expensive", "Open the Glasses tab"],
    };
  }

  // ── Default / open-ended
  const defaults = [
    {
      content: `I'm Coco — your personal stylist, built into your pocket. I know your **${season}** colour season, your **${bodyType.replace("-", " ")}** shape, and your **${personalities}** aesthetic. Ask me anything.\n\nSome people come to me with a specific event. Others want to rebuild their wardrobe from scratch. Some just want to know what shoes work with what trousers. All of it is fair game.\n\nWhat's on your mind?`,
      suggestions: ["Plan my capsule wardrobe", "What should I wear tonight?", "Help me with colour", "I have an important event"],
    },
    {
      content: `That's a great area to explore, ${name}. Tell me more — what's the context? Are you shopping, planning for a specific occasion, or trying to make more sense of what's already in your wardrobe? The more I know, the more specific I can be.`,
      suggestions: ["I'm shopping for new pieces", "Planning for an event", "Making sense of my wardrobe", "Just want style advice"],
    },
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// ─── Component ────────────────────────────────────────────────────────────────
const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "coco",
  content: "",
  timestamp: new Date(),
  suggestions: [],
};

const QUICK_STARTERS = [
  "What should I wear this week?",
  "Build me a capsule wardrobe",
  "Colour advice for my season",
  "Help me dress for an event",
  "What fragrance suits me?",
  "I want to upgrade my style",
];

export function CocoChatScreen({ profile }: CocoChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStarted(true);
    setIsTyping(true);

    // Simulate Coco thinking (600–1400ms)
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      const response = generateCocoResponse(text, profile);
      const cocoMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "coco",
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };
      setMessages((prev) => [...prev, cocoMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleSuggestion = (s: string) => sendMessage(s);
  const clearChat = () => { setMessages([]); setStarted(false); };

  const formatContent = (text: string) => {
    // Bold (**text**)
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ color: "var(--cream)", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      // Line breaks
      return part.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>{line}{j < part.split("\n").length - 1 && <br />}</span>
      ));
    });
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--charcoal)", fontFamily: "var(--font-body)" }}>

      {/* Header */}
      <div
        className="px-6 pt-14 pb-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          {/* Coco avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center relative"
            style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.3) 0%, rgba(212,165,181,0.2) 100%)", border: "1.5px solid var(--gold)" }}
          >
            <span style={{ fontFamily: "var(--font-display)", color: "var(--gold)", fontSize: "16px", fontStyle: "italic" }}>C</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center"
              style={{ background: "#6B8F71", border: "1.5px solid var(--charcoal)" }}>
            </div>
          </div>
          <div>
            <p style={{ color: "var(--cream)", fontWeight: 600, fontSize: "15px", lineHeight: 1.2 }}>Coco</p>
            <p style={{ color: "#6B8F71", fontSize: "11px" }}>Your AI Stylist · Online</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {started && (
            <button onClick={clearChat} className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface)", border: "none", cursor: "pointer" }}>
              <RotateCcw size={14} style={{ color: "var(--muted-foreground)" }} />
            </button>
          )}
          <div className="px-2 py-1 rounded-full flex items-center gap-1"
            style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)" }}>
            <Sparkles size={10} style={{ color: "var(--gold)" }} />
            <span style={{ color: "var(--gold)", fontSize: "9px", letterSpacing: "0.08em", fontWeight: 600 }}>BETA · FREE</span>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: "none" }}>
        {!started ? (
          /* Welcome splash */
          <div className="flex flex-col items-center text-center px-4 pt-6 pb-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.2) 0%, rgba(212,165,181,0.15) 100%)", border: "1.5px solid var(--gold)" }}
            >
              <span style={{ fontFamily: "var(--font-display)", color: "var(--gold)", fontSize: "36px", fontStyle: "italic" }}>C</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "26px", lineHeight: 1.2, marginBottom: 8 }}>
                Meet <em style={{ color: "var(--gold)" }}>Coco.</em>
              </h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "13px", lineHeight: 1.6, marginBottom: 6 }}>
                Your personal AI stylist. I know your colour season, body type, and aesthetic — so every answer I give is tailored to <em>you</em>, not a generic template.
              </p>
              <p style={{ color: "var(--muted-foreground)", fontSize: "13px", lineHeight: 1.6, marginBottom: 28 }}>
                Ask me anything — event outfits, capsule wardrobes, colour advice, fragrance, confidence, long-term style planning. I'm here for all of it.
              </p>
            </motion.div>

            {/* Style DNA context card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="w-full rounded-2xl p-4 mb-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p style={{ color: "var(--muted-foreground)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                Coco knows your Style DNA
              </p>
              <div className="grid grid-cols-2 gap-3 text-left">
                {[
                  { label: "Season", value: profile.colorSeason || "Autumn" },
                  { label: "Shape", value: (profile.bodyType || "Hourglass").replace("-", " ") },
                  { label: "Face", value: profile.faceShape || "Heart" },
                  { label: "Aesthetic", value: (profile.stylePersonality || ["Classic"])[0] },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</p>
                    <p style={{ color: "var(--gold)", fontSize: "12px", fontWeight: 500, textTransform: "capitalize" }}>{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick starters */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full">
              <p style={{ color: "var(--muted-foreground)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                Start a conversation
              </p>
              <div className="flex flex-col gap-2">
                {QUICK_STARTERS.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all active:scale-98"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}>
                    <span style={{ color: "var(--cream)", fontSize: "13px" }}>{s}</span>
                    <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          /* Message thread */
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
                >
                  {msg.role === "coco" && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1"
                      style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.25) 0%, rgba(212,165,181,0.2) 100%)", border: "1px solid var(--gold)" }}>
                      <span style={{ fontFamily: "var(--font-display)", color: "var(--gold)", fontSize: "11px", fontStyle: "italic" }}>C</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2" style={{ maxWidth: "80%" }}>
                    <div
                      className="px-4 py-3 rounded-2xl"
                      style={{
                        background: msg.role === "user"
                          ? "linear-gradient(135deg, rgba(201,169,110,0.25) 0%, rgba(201,169,110,0.15) 100%)"
                          : "var(--surface)",
                        border: msg.role === "user"
                          ? "1px solid rgba(201,169,110,0.3)"
                          : "1px solid var(--border)",
                        borderBottomRightRadius: msg.role === "user" ? 4 : undefined,
                        borderBottomLeftRadius: msg.role === "coco" ? 4 : undefined,
                      }}
                    >
                      <p style={{ color: "var(--cream)", fontSize: "13px", lineHeight: 1.65, margin: 0 }}>
                        {msg.role === "coco" ? formatContent(msg.content) : msg.content}
                      </p>
                    </div>

                    {/* Suggestion chips */}
                    {msg.role === "coco" && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((s) => (
                          <button key={s} onClick={() => handleSuggestion(s)}
                            className="px-3 py-1.5 rounded-full transition-all active:scale-95"
                            style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)", color: "var(--gold)", fontSize: "11px", cursor: "pointer" }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    <p style={{ color: "var(--muted-foreground)", fontSize: "10px", alignSelf: msg.role === "user" ? "flex-end" : "flex-start" }}>
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.25) 0%, rgba(212,165,181,0.2) 100%)", border: "1px solid var(--gold)" }}>
                  <span style={{ fontFamily: "var(--font-display)", color: "var(--gold)", fontSize: "11px", fontStyle: "italic" }}>C</span>
                </div>
                <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold)" }}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="px-4 pb-6 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        {/* API note — shown once */}
        {!started && (
          <div className="mb-3 px-3 py-2 rounded-xl flex items-center gap-2"
            style={{ background: "rgba(201,169,110,0.05)", border: "1px solid rgba(201,169,110,0.1)" }}>
            <Sparkles size={11} style={{ color: "var(--gold)" }} />
            <p style={{ color: "var(--muted-foreground)", fontSize: "10px", lineHeight: 1.4 }}>
              Coco runs on smart response logic. Connect the Claude API for full AI conversations.
            </p>
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1 flex items-center px-4 py-3 rounded-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder="Ask Coco anything..."
              className="flex-1 outline-none"
              style={{ background: "transparent", color: "var(--cream)", fontSize: "14px", fontFamily: "var(--font-body)", border: "none" }}
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              background: input.trim() && !isTyping ? "var(--gold)" : "var(--surface)",
              border: "none",
              cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
            }}
          >
            <Send size={16} style={{ color: input.trim() && !isTyping ? "var(--charcoal)" : "var(--muted-foreground)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

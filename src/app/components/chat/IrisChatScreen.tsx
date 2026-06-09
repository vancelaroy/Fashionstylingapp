import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, ChevronRight, RotateCcw, Music } from "lucide-react";
import type { StyleProfile } from "../onboarding/OnboardingFlow";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const SERVER = `https://${projectId}.supabase.co/functions/v1/make-server-7dbc8ff8`;

interface Message {
  id: string;
  role: "user" | "iris";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  playlist?: PlaylistItem[];
}

interface PlaylistItem {
  title: string;
  artist: string;
  vibe: string;
}

interface IrisChatScreenProps {
  profile: StyleProfile;
}

// ─── Playlist generator ───────────────────────────────────────────────────────
function generatePlaylist(occasion: string, personality: string[]): PlaylistItem[] {
  const styles = personality.join(" ").toLowerCase();

  if (occasion.match(/interview|work|job|office/)) {
    return [
      { title: "Golden", artist: "Harry Styles", vibe: "Confident & warm" },
      { title: "Higher Ground", artist: "Stevie Wonder", vibe: "Focused energy" },
      { title: "Glorious", artist: "Macklemore ft. Skylar Grey", vibe: "Belief in yourself" },
      { title: "Power", artist: "Kanye West", vibe: "Walk in like you own it" },
      { title: "Good As Hell", artist: "Lizzo", vibe: "Self-assured, no apologies" },
    ];
  }
  if (occasion.match(/date|tonight|evening|dinner/)) {
    return [
      { title: "Adorn", artist: "Miguel", vibe: "Smooth & magnetic" },
      { title: "Redbone", artist: "Childish Gambino", vibe: "Slow burn confidence" },
      { title: "Make Me Feel", artist: "Janelle Monáe", vibe: "Electric presence" },
      { title: "Slow Motion", artist: "Trey Songz", vibe: "Turn the temperature up" },
      { title: "Die For You", artist: "The Weeknd", vibe: "Intense & unforgettable" },
    ];
  }
  if (occasion.match(/wedding|formal|gala|event/)) {
    return [
      { title: "Empire State of Mind", artist: "JAY-Z & Alicia Keys", vibe: "Grand entrance energy" },
      { title: "Feeling Good", artist: "Nina Simone", vibe: "Timeless & powerful" },
      { title: "Put Your Records On", artist: "Corinne Bailey Rae", vibe: "Effortlessly beautiful" },
      { title: "Suit & Tie", artist: "Justin Timberlake", vibe: "Dressed and ready" },
      { title: "You Look Good", artist: "Lady Antebellum", vibe: "Celebrating yourself" },
    ];
  }
  if (occasion.match(/casual|weekend|brunch|chill/)) {
    return [
      { title: "Sunday Best", artist: "Surfaces", vibe: "Relaxed & radiant" },
      { title: "Levitating", artist: "Dua Lipa", vibe: "Effortless cool" },
      { title: "Blinding Lights", artist: "The Weeknd", vibe: "Nostalgic & alive" },
      { title: "Stay", artist: "Rihanna ft. Mikky Ekko", vibe: "Calm and present" },
      { title: "Good Days", artist: "SZA", vibe: "Soft & intentional" },
    ];
  }
  // Default getting-ready playlist
  if (styles.includes("classic") || styles.includes("minimal")) {
    return [
      { title: "Vogue", artist: "Madonna", vibe: "The original getting-ready anthem" },
      { title: "Pretty Hurts", artist: "Beyoncé", vibe: "Getting ready with purpose" },
      { title: "Fashion", artist: "David Bowie", vibe: "You are the show" },
      { title: "Flawless", artist: "Beyoncé", vibe: "Walking out the door energy" },
      { title: "Confident", artist: "Demi Lovato", vibe: "Last look in the mirror" },
    ];
  }
  return [
    { title: "Run the World (Girls)", artist: "Beyoncé", vibe: "Pure power" },
    { title: "MONTERO", artist: "Lil Nas X", vibe: "Be unapologetically you" },
    { title: "Savage", artist: "Megan Thee Stallion", vibe: "Walk out like that" },
    { title: "Lose Yourself", artist: "Eminem", vibe: "One shot, take it" },
    { title: "Can't Stop the Feeling", artist: "Justin Timberlake", vibe: "Pure joy" },
  ];
}

// ─── Profile-aware response engine ───────────────────────────────────────────
function generateIrisResponse(userMessage: string, profile: StyleProfile): { content: string; suggestions?: string[]; playlist?: PlaylistItem[] } {
  const msg = userMessage.toLowerCase();
  const gender = profile.gender || "woman";
  const isMale = gender === "man";
  const season = profile.colorSeason || "autumn";
  const bodyType = profile.bodyType || "hourglass";
  const name = profile.name || "darling";
  const personalities = (profile.stylePersonality || []).join(", ") || "Classic";

  // ── Playlist requests
  if (msg.match(/playlist|music|song|vibe|getting ready|pump up|hype|bop|soundtrack/)) {
    const occasion = msg.includes("interview") || msg.includes("job") ? "interview"
      : msg.includes("date") || msg.includes("tonight") ? "date"
      : msg.includes("wedding") || msg.includes("formal") ? "wedding"
      : msg.includes("casual") || msg.includes("weekend") ? "casual"
      : "ready";
    const playlist = generatePlaylist(occasion, profile.stylePersonality || []);
    const occasionLabel = occasion === "interview" ? "job interview" : occasion === "date" ? "date night" : occasion === "wedding" ? "formal event" : occasion === "casual" ? "casual day out" : "getting ready";
    return {
      content: `I've curated your getting-ready soundtrack for a **${occasionLabel}** ✦\n\nEvery track is chosen to build your confidence from the first button to the last look in the mirror. Press play, get dressed, and walk out like you already won.`,
      playlist,
      suggestions: ["Make me a date night playlist", "I need work-mode music", "Hype me up for tonight", "Chill getting-ready vibes"],
    };
  }

  // ── Greetings
  if (msg.match(/^(hi|hey|hello|hiya|howdy)/)) {
    return {
      content: `Hello ${name} ✦ I'm Iris — your personal AI stylist. I know your full Style DNA: your **${season}** colour season, your **${bodyType.replace("-", " ")}** silhouette, and your **${personalities}** aesthetic.\n\nI'm here for everything — outfits, colour advice, event dressing, fragrance, and yes, even your getting-ready playlist. What are we working on?`,
      suggestions: ["What should I wear today?", "Plan my capsule wardrobe", "Make me a getting-ready playlist 🎵", "Help me dress for an event"],
    };
  }

  // ── Colour / color questions
  if (msg.match(/colou?r|palette|what colou?rs|shade|tone|hue/)) {
    const seasonAdvice: Record<string, string> = {
      spring: `As a **Spring**, your power colours are warm and clear — coral, peach, golden yellow, warm turquoise, and ivory. Black worn near the face can wash you out. Swap it for camel, warm brown, or navy.`,
      summer: `As a **Summer**, your palette is cool, muted, and light. Dusty rose, lavender, soft teal, powder blue, dove grey. Avoid harsh black or warm orange — soft white and charcoal suit you far better.`,
      autumn: `As an **Autumn**, you were made for the richest palette — burnt orange, deep olive, burgundy, warm chocolate, mustard, forest green. These are the colours that make your skin *glow*. Avoid icy pastels or stark white — reach for cream and oyster instead.`,
      winter: `As a **Winter**, you're one of the few who can wear true black and true white with absolute authority. High contrast is your superpower — royal blue, emerald, fuchsia, burgundy. Muted earthy tones will dull you. Go bold.`,
    };
    return {
      content: seasonAdvice[season] || seasonAdvice.autumn,
      suggestions: ["What neutrals work for me?", "Best colours for a formal event", "Colours to avoid", "Build a colour capsule"],
    };
  }

  // ── Capsule wardrobe
  if (msg.match(/capsule|wardrobe|essential|staple|foundation|building/)) {
    const capsuleMale = `A strong men's capsule for a **${personalities}** aesthetic:\n\n**Tops (4):** 2 white/cream Oxford shirts, 1 navy crew-neck merino, 1 quality tee in ${season === "autumn" || season === "winter" ? "camel or charcoal" : "light grey or navy"}\n\n**Bottoms (3):** Slim dark jeans, tailored chinos in ${season === "autumn" ? "olive or tan" : "stone or navy"}, a well-cut suit trouser\n\n**Outerwear (2):** Structured blazer, quality overcoat in camel or charcoal\n\n**Shoes (2):** White leather sneakers, leather derby or Chelsea boots\n\n**Accessories:** Clean leather belt, minimal watch, quality leather bag`;
    const capsuleFemale = `A refined capsule for your **${personalities}** aesthetic and **${season}** season:\n\n**Tops (4):** Silk blouse in ${season === "autumn" ? "warm cream or rust" : "soft white or dusty pink"}, fitted merino, quality tee, a statement top\n\n**Bottoms (3):** Wide-leg trouser, midi skirt, straight-leg jeans\n\n**Dresses (2):** Day dress + one for evening\n\n**Outerwear (2):** Tailored blazer, a coat that makes you feel *powerful*\n\n**Shoes (3):** Loafers, heeled mule, white sneaker\n\n**Bags (2):** Everyday tote, evening bag`;
    return {
      content: isMale ? capsuleMale : capsuleFemale,
      suggestions: ["Where to shop these pieces", "Prioritise what to buy first", "Seasonal capsule instead", "Make me a getting-ready playlist 🎵"],
    };
  }

  // ── Event / occasion dressing
  if (msg.match(/wedding|event|interview|date|party|funeral|gala|dinner|brunch|birthday|job/)) {
    const isWedding = msg.includes("wedding");
    const isInterview = msg.includes("interview") || msg.includes("job");
    const isDate = msg.includes("date");

    if (isWedding) {
      return {
        content: isMale
          ? `For a wedding, look *intentional*, not try-hard.\n\n**Safe & chic:** A well-fitted suit in navy, slate, or warm grey. Pocket square in a ${season === "autumn" ? "burnt orange or rust" : "soft blue or blush"} tone.\n\n**Bold option:** Linen suit in ivory or sage for a summer/outdoor wedding.\n\n**Shoes:** Derby shoes or loafers. Clean leather only.\n\nIs this daytime, evening, or destination?`
          : `Wedding guest dressing done right for your profile:\n\n**Your colours:** ${season === "autumn" ? "Deep burgundy, rust, or forest green" : season === "spring" ? "Coral, blush, or warm gold" : season === "winter" ? "Cobalt, emerald, or deep plum" : "Dusty rose, lavender, or soft sage"}\n\n**Silhouette:** ${bodyType === "hourglass" ? "Wrap dress or fitted midi" : bodyType === "pear" ? "A-line or fit-and-flare" : "Flowy midi or column dress"}\n\nWhat's the dress code?`,
        suggestions: ["It's black tie", "It's outdoor / garden party", "Make me a getting-ready playlist 🎵", "What accessories?"],
      };
    }
    if (isInterview) {
      return {
        content: `This is your moment — let's dress you like you already have the job.\n\nDress one level above their usual dress code. For your **${season}** colouring, your authority colours are ${season === "autumn" || season === "spring" ? "camel, navy, warm grey, or olive" : "charcoal, navy, cool grey, or cream"}.\n\n**Fit is everything.** A well-fitting average garment beats an expensive one that doesn't. One wrinkle, one pulled button — that's what they'll remember.\n\nWant me to build your exact interview outfit?`,
        suggestions: ["Build my interview outfit", "Creative industry interview", "Make me a confidence playlist 🎵", "What not to wear"],
      };
    }
    if (isDate) {
      return {
        content: `A date outfit should make you feel attractive *and* comfortable — you need to be fully present, not fidgeting.\n\n✦ **First date / daytime:** ${isMale ? "Smart dark jeans, well-fitted shirt, clean leather shoes. Simple, intentional." : `A flowy midi or well-cut jeans with a silk top. Approachable but magnetic.`}\n\n✦ **Evening:** ${isMale ? "Slim trousers, open-collar shirt, blazer you could remove. A little fragrance — woody or citrus, nothing heavy." : `Something that feels like you, turned up a notch. Your ${season} palette will do the work.`}\n\nWhere are you going?`,
        suggestions: ["It's a dinner date", "Casual coffee date", "Make me a date night playlist 🎵", "What perfume / cologne?"],
      };
    }
    return {
      content: `Tell me more — dress code, time of day, venue, and how you want to *feel* when you walk in. The more detail, the more precise I can be.`,
      suggestions: ["Black tie event", "Business casual", "Smart casual", "Make me a getting-ready playlist 🎵"],
    };
  }

  // ── Fragrance / scent
  if (msg.match(/perfume|fragrance|scent|cologne|smell/)) {
    return {
      content: isMale
        ? `For your **${personalities}** aesthetic:\n\n🌊 **Daily:** Bleu de Chanel, Acqua di Giò, or Sauvage — clean, confident, never overwhelming.\n\n🌲 **Evenings / Meetings:** Terre d'Hermès or Y by YSL — quiet authority.\n\n🌶️ **Formal / Winter:** Oud Wood by Tom Ford — unforgettable.\n\nApply to pulse points *before* getting dressed. Never spray on clothes.`
        : `For your **${season}** season:\n\n🌸 **Romantic / Everyday:** Miss Dior, Coco Mademoiselle, or La Vie est Belle.\n\n🌲 **Evening:** Black Opium or Wood Sage & Sea Salt — richer, more memorable.\n\n🍊 **Summer / Fresh:** Light Blue or Happy — effortless and bright.\n\nWrists and décolletage — never rub wrists together after applying.`,
      suggestions: ["Recommend a signature scent", "Best scent for formal events", "Scent for everyday wear", "Open the Scent tab"],
    };
  }

  // ── Budget
  if (msg.match(/budget|cheap|afford|expensive|price|spend|money|£|\$|invest/)) {
    return {
      content: `Smart question. Here's the rule:\n\n**Spend more on:** Outerwear, shoes, bags. Seen most, worn most, last longest. A £300 coat worn 100 times = £3 per wear. A £30 fast-fashion version worn 5 times = £6 per wear.\n\n**Save on:** Basics, trendy pieces you'll tire of, frequent replacements.\n\n**For your ${personalities} aesthetic**, invest in:\n1. One great coat or blazer\n2. Quality shoes in a neutral\n3. A bag that works day-to-night\n\nWhat's your actual budget? I'll build a plan around it.`,
      suggestions: ["I have £200 to spend", "I have £500 to spend", "Best budget-friendly brands", "Investment pieces worth it"],
    };
  }

  // ── Body confidence
  if (msg.match(/body|shape|flatter|hide|confident|insecure|self.conscious/)) {
    return {
      content: `${name}, I want to say this clearly: you don't dress to hide — you dress to *express*.\n\nFor your **${bodyType.replace("-", " ")}** frame, the goal is always fit first. A garment tailored to your proportions will always look better than an expensive one in the wrong size.\n\nWhat specifically would you like to feel more confident about? I'll give you exact outfit formulas.`,
      suggestions: ["Outfit formula for work", "Casual looks that flatter me", "Evening looks for my shape", "Make me a confidence playlist 🎵"],
    };
  }

  // ── Men's styling
  if (msg.match(/men|male|masculine|suit|tie|guys/)) {
    return {
      content: `Men's style is simpler than most people think. Three rules that change everything:\n\n✦ **Fit first, always.** A £40 shirt that fits beats a £200 one that doesn't.\n✦ **Invest in your shoes.** People notice before you speak.\n✦ **Grooming is part of style.** Skin, hair, nails — they matter as much as clothes.\n\nFor your **${personalities}** aesthetic: ${personalities.includes("Streetwear") ? "Layer intentionally — a quality hoodie under a structured coat is a power move." : personalities.includes("Classic") ? "A navy blazer and well-cut chinos carry you through 80% of situations." : "Build from basics, let one statement piece do the talking."}\n\nWhat situation can I help with?`,
      suggestions: ["How to dress for a date", "Smart casual explained", "Build a men's capsule", "Make me a getting-ready playlist 🎵"],
    };
  }

  // ── Season / trends
  if (msg.match(/trend|season|this year|autumn|winter|spring|summer/)) {
    return {
      content: `For your **${season}** palette and **${personalities}** aesthetic:\n\n**Worth investing in:** ${season === "autumn" || season === "winter" ? "Rich textures — velvet, bouclé, cashmere. Deep jewel tones. Oversized outerwear done with intention." : "Lightweight linens and cottons. Soft pastels and warm whites. Strappy shoes and minimal silhouettes."}\n\n**My rule:** If something doesn't feel like you on the first wear, it won't feel like you on the tenth. Trends are only worth following when they align with your aesthetic — otherwise you'll wear it once and regret it.\n\nWhat are you shopping for?`,
      suggestions: ["Trends worth investing in", "Trends to ignore", "Help me edit my wardrobe", "Make me a shopping playlist 🎵"],
    };
  }

  // ── Glasses
  if (msg.match(/glass|spectacle|frame|eyewear|sunglass/)) {
    const faceShape = profile.faceShape || "oval";
    const frameAdvice: Record<string, string> = {
      oval: "Lucky you — almost every frame suits an oval face. Go bold. Try oversized rectangles or cat-eyes.",
      round: "Angular frames add definition to softer features. Rectangle or square shapes work beautifully.",
      square: "Rounded or oval frames soften a strong jaw. Cat-eyes also work well.",
      heart: "Light frames balanced lower — cat-eyes, oval, or rimless. Avoid heavy browlines.",
      diamond: "Cat-eyes or ovals complement your cheekbones. Frames with detail on top work brilliantly.",
      oblong: "Wide frames — oversized rounds or squares — add width. Avoid narrow, small frames.",
    };
    return {
      content: `For your **${faceShape}** face shape:\n\n${frameAdvice[faceShape] || frameAdvice.oval}\n\n**For your ${season} colouring:** ${season === "autumn" || season === "spring" ? "Tortoiseshell, warm browns, gold, or olive frames complement your warm undertones." : "Black, silver, cool grey, or jewel-toned frames suit your cool undertones."}`,
      suggestions: ["Show me frame recommendations", "Sunglasses advice", "Open the Glasses tab", "Budget frames that look expensive"],
    };
  }

  // ── Default
  return {
    content: `I hear you, ${name}. Tell me more — what's the context? Are you shopping, planning for a specific occasion, or making sense of what's already in your wardrobe? The more detail, the more I can help.`,
    suggestions: ["I'm shopping for new pieces", "Planning for an event", "Making sense of my wardrobe", "Make me a getting-ready playlist 🎵"],
  };
}

// ─── Quick starters ───────────────────────────────────────────────────────────
const QUICK_STARTERS = [
  { text: "What should I wear this week?", icon: "✦" },
  { text: "Build me a capsule wardrobe", icon: "◈" },
  { text: "Colour advice for my season", icon: "◐" },
  { text: "Help me dress for an event", icon: "◇" },
  { text: "Make me a getting-ready playlist 🎵", icon: "♪" },
  { text: "What fragrance suits me?", icon: "◯" },
];

// ─── Playlist card component ──────────────────────────────────────────────────
function PlaylistCard({ tracks }: { tracks: PlaylistItem[] }) {
  return (
    <div className="rounded-2xl overflow-hidden mt-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border)", background: "rgba(201,169,110,0.06)" }}>
        <Music size={13} style={{ color: "var(--gold)" }} />
        <p style={{ color: "var(--gold)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
          Iris Playlist ✦
        </p>
      </div>
      <div className="flex flex-col">
        {tracks.map((track, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < tracks.length - 1 ? "1px solid var(--border)" : "none" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(201,169,110,0.1)" }}>
              <span style={{ color: "var(--gold)", fontSize: "11px", fontWeight: 700 }}>{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: "var(--cream)", fontSize: "12px", fontWeight: 500, marginBottom: 1 }}>{track.title}</p>
              <p style={{ color: "var(--muted-foreground)", fontSize: "11px" }}>{track.artist}</p>
            </div>
            <span style={{ color: "var(--muted-foreground)", fontSize: "10px", fontStyle: "italic", textAlign: "right", maxWidth: 80, lineHeight: 1.3 }}>
              {track.vibe}
            </span>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
        <p style={{ color: "var(--muted-foreground)", fontSize: "10px" }}>Copy to Spotify or Apple Music</p>
        <button className="px-3 py-1.5 rounded-full" style={{ background: "var(--gold)", color: "var(--charcoal)", fontSize: "10px", fontWeight: 700, border: "none", cursor: "pointer" }}>
          ▶ Play
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function IrisChatScreen({ profile }: IrisChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setStarted(true);
    setIsTyping(true);

    try {
      // Build conversation history for Claude (last 12 messages for context)
      const history = updatedMessages.slice(-12).map((m) => ({
        role: m.role === "iris" ? "assistant" : "user",
        content: m.content,
      }));

      const res = await fetch(`${SERVER}/iris/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ messages: history, profile }),
      });

      const data = await res.json();
      const replyText = data.reply ?? "Sorry, I had a moment — try asking me again!";

      // Check if the reply contains playlist-style content
      const isPlaylist = text.toLowerCase().match(/playlist|music|song|vibe|getting ready|pump up/);
      const playlist = isPlaylist ? generatePlaylist(text.toLowerCase(), profile.stylePersonality ?? []) : undefined;

      const irisMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "iris",
        content: replyText,
        timestamp: new Date(),
        suggestions: ["What else can I wear?", "Help me with accessories", "What colors suit me?", "Make me a getting-ready playlist 🎵"],
        playlist,
      };
      setMessages((prev) => [...prev, irisMsg]);
    } catch (err) {
      // Fallback to pattern-matching if Claude is unavailable
      const response = generateIrisResponse(text, profile);
      const irisMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "iris",
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
        playlist: response.playlist,
      };
      setMessages((prev) => [...prev, irisMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatContent = (text: string) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ color: "var(--cream)", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      return part.split("\n").map((line, j, arr) => (
        <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
      ));
    });
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--charcoal)", fontFamily: "var(--font-body)" }}>

      {/* Header */}
      <div className="px-6 pt-14 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center relative"
            style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.25) 0%, rgba(212,165,181,0.2) 100%)", border: "1.5px solid var(--gold)" }}>
            <span style={{ fontFamily: "var(--font-display)", color: "var(--gold)", fontSize: "17px", fontStyle: "italic", fontWeight: 600 }}>I</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full" style={{ background: "#6B8F71", border: "1.5px solid var(--charcoal)" }} />
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontWeight: 500, fontSize: "20px", lineHeight: 1.1, letterSpacing: "-0.01em", fontStyle: "italic" }}>Iris</p>
            <p style={{ color: "var(--slate)", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>Your Stylist · Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {started && (
            <button onClick={() => { setMessages([]); setStarted(false); }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
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
          <div className="flex flex-col items-center text-center px-2 pt-4 pb-4">
            {/* Iris avatar */}
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-5 relative"
              style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.2) 0%, rgba(212,165,181,0.15) 100%)", border: "1.5px solid var(--gold)" }}>
              <span style={{ fontFamily: "var(--font-display)", color: "var(--gold)", fontSize: "38px", fontStyle: "italic", fontWeight: 600 }}>I</span>
              {/* Iris eye ring detail */}
              <div className="absolute inset-0 rounded-full" style={{ border: "1px solid rgba(201,169,110,0.2)", margin: 4 }} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 style={{ fontFamily: "var(--font-display)", color: "var(--cream)", fontSize: "38px", lineHeight: 1.05, fontWeight: 400, letterSpacing: "-0.03em", marginBottom: 8 }}>
                Meet <em style={{ color: "var(--gold)" }}>Iris.</em>
              </h2>
              <p style={{ color: "var(--muted-foreground)", fontSize: "13px", lineHeight: 1.7, marginBottom: 24 }}>
                Your personal AI stylist. I know your colour season, body type, face shape, and aesthetic — so every answer is built for <em>you</em>, not a generic template. Ask me about outfits, events, capsule wardrobes, fragrance, or your getting-ready playlist.
              </p>
            </motion.div>

            {/* Style DNA card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="w-full rounded-2xl p-4 mb-5"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p style={{ color: "var(--muted-foreground)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                Iris knows your Style DNA
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
                  <button key={s.text} onClick={() => sendMessage(s.text)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all active:scale-98"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}>
                    <div className="flex items-center gap-3">
                      <span style={{ color: "var(--gold)", fontSize: "13px", minWidth: 16 }}>{s.icon}</span>
                      <span style={{ color: "var(--cream)", fontSize: "13px" }}>{s.text}</span>
                    </div>
                    <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                  {msg.role === "iris" && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1"
                      style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.25) 0%, rgba(212,165,181,0.2) 100%)", border: "1px solid var(--gold)" }}>
                      <span style={{ fontFamily: "var(--font-display)", color: "var(--gold)", fontSize: "12px", fontStyle: "italic", fontWeight: 600 }}>I</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-2" style={{ maxWidth: "80%" }}>
                    <div className="px-4 py-3 rounded-2xl"
                      style={{
                        background: msg.role === "user" ? "linear-gradient(135deg, rgba(201,169,110,0.25) 0%, rgba(201,169,110,0.15) 100%)" : "var(--surface)",
                        border: msg.role === "user" ? "1px solid rgba(201,169,110,0.3)" : "1px solid var(--border)",
                        borderBottomRightRadius: msg.role === "user" ? 4 : undefined,
                        borderBottomLeftRadius: msg.role === "iris" ? 4 : undefined,
                      }}>
                      <p style={{ color: "var(--cream)", fontSize: "13px", lineHeight: 1.65, margin: 0 }}>
                        {msg.role === "iris" ? formatContent(msg.content) : msg.content}
                      </p>
                    </div>
                    {msg.playlist && <PlaylistCard tracks={msg.playlist} />}
                    {msg.role === "iris" && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((s) => (
                          <button key={s} onClick={() => sendMessage(s)}
                            className="px-3 py-1.5 rounded-full transition-all active:scale-95"
                            style={{ background: s.includes("🎵") ? "rgba(201,169,110,0.12)" : "rgba(201,169,110,0.08)", border: `1px solid ${s.includes("🎵") ? "rgba(201,169,110,0.35)" : "rgba(201,169,110,0.2)"}`, color: "var(--gold)", fontSize: "11px", cursor: "pointer" }}>
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

            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.25) 0%, rgba(212,165,181,0.2) 100%)", border: "1px solid var(--gold)" }}>
                  <span style={{ fontFamily: "var(--font-display)", color: "var(--gold)", fontSize: "12px", fontStyle: "italic", fontWeight: 600 }}>I</span>
                </div>
                <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold)" }}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-6 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-end gap-2">
          <div className="flex-1 flex items-center px-4 py-3 rounded-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder="Ask Iris anything..."
              className="flex-1 outline-none"
              style={{ background: "transparent", color: "var(--cream)", fontSize: "14px", fontFamily: "var(--font-body)", border: "none" }}
            />
          </div>
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: input.trim() && !isTyping ? "var(--gold)" : "var(--surface)", border: "none", cursor: input.trim() && !isTyping ? "pointer" : "not-allowed" }}>
            <Send size={16} style={{ color: input.trim() && !isTyping ? "var(--charcoal)" : "var(--muted-foreground)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
const kv = {
  set: async (key: string, value: unknown): Promise<void> => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error } = await supabase.from("kv_store_7dbc8ff8").upsert({ key, value });
    if (error) throw new Error(error.message);
  },

  get: async (key: string): Promise<unknown> => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await supabase
      .from("kv_store_7dbc8ff8")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.value;
  },

  del: async (key: string): Promise<void> => {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error } = await supabase.from("kv_store_7dbc8ff8").delete().eq("key", key);
    if (error) throw new Error(error.message);
  },
};

const app = new Hono();

app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// ── Auth helpers ─────────────────────────────────────────────────────────────

function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

async function getUserId(authHeader: string | null): Promise<string | null> {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}

// ── Sign up ──────────────────────────────────────────────────────────────────

app.post("/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }
    const supabase = adminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });
    if (error) {
      console.log("Signup error:", error.message);
      return c.json({ error: error.message }, 400);
    }
    return c.json({ userId: data.user.id });
  } catch (err) {
    console.log("Signup exception:", err);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// ── Profile ──────────────────────────────────────────────────────────────────

app.get("/profile", async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization") ?? null);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const profile = await kv.get(`profile:${userId}`);
    return c.json({ profile: profile ?? null });
  } catch (err) {
    console.log("Get profile error:", err);
    return c.json({ error: "Failed to load profile" }, 500);
  }
});

app.post("/profile", async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization") ?? null);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const { profile } = await c.req.json();
    await kv.set(`profile:${userId}`, profile);
    return c.json({ success: true });
  } catch (err) {
    console.log("Save profile error:", err);
    return c.json({ error: "Failed to save profile" }, 500);
  }
});

// ── Closet ───────────────────────────────────────────────────────────────────

app.get("/closet", async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization") ?? null);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const closet = await kv.get(`closet:${userId}`);
    return c.json({ closet: closet ?? [] });
  } catch (err) {
    console.log("Get closet error:", err);
    return c.json({ error: "Failed to load closet" }, 500);
  }
});

app.post("/closet", async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization") ?? null);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const { closet } = await c.req.json();
    await kv.set(`closet:${userId}`, closet);
    return c.json({ success: true });
  } catch (err) {
    console.log("Save closet error:", err);
    return c.json({ error: "Failed to save closet" }, 500);
  }
});

// ── Iris — Claude AI chat ─────────────────────────────────────────────────────

type WardrobeItem = {
  id?: string;
  name?: string;
  category?: string;
  color?: string;
  secondaryColor?: string | null;
  occasions?: string[];
  seasons?: string[];
  styleNote?: string;
  brand?: string | null;
};

function isWardrobeItem(value: unknown): value is WardrobeItem & { id: string } {
  return typeof value === "object" && value !== null &&
    typeof (value as WardrobeItem).id === "string" &&
    (value as WardrobeItem).id!.trim().length > 0;
}

async function getWardrobeItems(userId: string): Promise<WardrobeItem[]> {
  const stored = await kv.get(`wardrobe:${userId}`);
  // Preserve every existing record, including older records that predate ids.
  return Array.isArray(stored) ? stored : [];
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

function buildWardrobeSummary(items: WardrobeItem[]): string {
  if (!Array.isArray(items) || items.length === 0) {
    return "The client has not added wardrobe items yet.";
  }

  return items.slice(0, 40).map((item) => {
    const colors = [item.color, item.secondaryColor].filter(Boolean).join(" and ");
    const occasions = Array.isArray(item.occasions) && item.occasions.length > 0
      ? ` for ${item.occasions.join(", ")}`
      : "";
    const season = Array.isArray(item.seasons) && item.seasons.length > 0
      ? ` (${item.seasons.join(", ")})`
      : "";
    const note = item.styleNote ? ` — ${item.styleNote}` : "";
    return `- ${item.name ?? "Wardrobe item"}: ${colors || "unknown color"} ${item.category ?? "piece"}${occasions}${season}${note}`;
  }).join("\n");
}

function normalizeMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((m): m is { role: "user" | "assistant"; content: string } => (
      typeof m === "object" &&
      m !== null &&
      ((m as { role?: unknown }).role === "user" || (m as { role?: unknown }).role === "assistant") &&
      typeof (m as { content?: unknown }).content === "string"
    ))
    .map((m) => ({ role: m.role, content: m.content }));
}

function mergeHistory(stored: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const seen = new Set<string>();
  const merged: ChatMessage[] = [];

  [...stored, ...incoming].forEach((message) => {
    const key = `${message.role}:${message.content}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(message);
  });

  return merged.slice(-24);
}

function buildSystemPrompt(profile: Record<string, unknown>, wardrobeItems: WardrobeItem[] = []): string {
  const gender = profile.gender as string ?? "person";
  const measurements = profile.measurements as Record<string, string> ?? {};
  const wardrobeSummary = buildWardrobeSummary(wardrobeItems);

  const measurementLines = Object.entries(measurements)
    .filter(([, v]) => v)
    .map(([k, v]) => `  - ${k}: ${v}`)
    .join("\n");

  return `You are Iris, a warm and deeply knowledgeable personal stylist for IRYS — a fashion styling app built to make professional styling accessible to everyone.

Your personality: You're like that one friend who actually knows fashion — encouraging, never judgmental, specific rather than generic. You speak naturally, not like a corporate chatbot. You use fashion vocabulary comfortably but always explain when needed. You celebrate every body, every gender, every style.

Your client's Style DNA:
- Name: ${profile.name ?? "there"}
- Gender: ${gender}
- Body type: ${profile.bodyType ?? "not specified"}
- Face shape: ${profile.faceShape ?? "not specified"}
- Color season: ${profile.colorSeason ?? "not specified"} — this tells you which color palettes make them glow
- Style personality: ${Array.isArray(profile.stylePersonality) ? (profile.stylePersonality as string[]).join(", ") : "not specified"}
${measurementLines ? `- Measurements:\n${measurementLines}` : ""}

Their saved wardrobe:
${wardrobeSummary}

How to use their profile:
- Always factor in their color season when suggesting colors
- Reference their body type when suggesting silhouettes and fits
- Match their style personality in your suggestions
- Use their name occasionally to make it feel personal
- For men and non-binary clients, use appropriate vocabulary (chest not bust, inseam not hips, etc.)

What you can help with:
- Outfit suggestions for any occasion (interviews, dates, weddings, casual, work)
- Color palette advice based on their season
- What to wear with specific pieces they own
- Eyeglass frame recommendations based on face shape
- Fragrance suggestions by occasion and season
- Getting-ready playlists to match the vibe
- Style tips for their specific body type
- How to dress for their style personality
- Capsule wardrobe building
- Shopping on any budget

Context intelligence:
- Treat venue, neighborhood, city, time of day, weather, season, and event type as styling inputs, not side details.
- Calibrate dress code by venue. A polished cocktail bar, hotel lounge, gallery, or stylish neighborhood restaurant should read as elevated smart casual; a casual chain, sports bar, or backyard gathering can read more relaxed.
- If the user names a specific venue you do not truly know, infer cautiously from the words and location, then say what assumption you are making.
- If the user gives a city or region, account for likely climate and season. For example, Kansas City summer evening heat changes fabric, layering, and shoe choices.
- Do not claim live weather access unless weather data was explicitly provided in the conversation. If exact weather matters, ask for temperature/rain/humidity or give a conditional recommendation.
- If the user gives a time, consider daylight, heat, commute, and whether the outfit needs to transition from day to evening.
- If a user rejects a recommendation, treat that correction as a preference signal in this conversation and adapt quickly. Avoid repeating the same silhouette, color, or vibe they disliked.
- When choosing from their wardrobe, prioritize event appropriateness, climate comfort, fit, color harmony, and their stated taste over simply combining the first matching categories.

Wardrobe season intelligence:
- Wardrobe items may include season tags: spring, summer, fall, winter, or year-round. Missing season tags should be treated as year-round/flexible, not as forbidden.
- If the user gives temperature, humidity, rain, snow, wind, city, region, trip context, or a named season, use that as the strongest signal for what is wearable.
- In hot, humid, or summer contexts, avoid winter-only items, heavy coats, scarves, bulky wool layers, and heat-trapping styling unless the user explicitly asks for them.
- In cold, snowy, windy, or winter contexts, avoid summer-only pieces as the main outfit unless they work as a base layer.
- If an item is tagged year-round, it can be considered across seasons, but still judge fabric, warmth, weather risk, and event appropriateness.
- If the best outfit is missing a weather-appropriate category, say so briefly and suggest the closest owned option or a practical shopping gap.
- When you skip a piece because of season or weather, be transparent: “I’m skipping your winter jacket because it’s too heavy for humid weather.”

Response style:
- Keep it conversational and warm — 2 to 5 sentences for most replies
- Be specific, not generic ("A camel blazer would complement your autumn coloring" not "try neutral tones")
- If they ask for a playlist, give 4 to 6 real songs with artists and a one-line vibe description
- If they ask what to wear to a specific event, give a complete head-to-toe look
- For event outfits, briefly explain the dress-code read: venue vibe, weather/climate assumption, and why the outfit fits.
- When useful, reference specific pieces from their saved wardrobe by name and build outfits around items they already own
- Never make them feel bad about what they have or how they look
- Be honest about your limits. If you do not know a restaurant, weather, or region detail for sure, say so and ask for the missing context or make a clearly labeled assumption`;
}

app.get("/iris/history", async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization") ?? null);
    if (!userId) return c.json({ messages: [] });
    const messages = await kv.get(`iris-history:${userId}`);
    return c.json({ messages: Array.isArray(messages) ? messages : [] });
  } catch (err) {
    console.log("Get Iris history error:", err);
    return c.json({ error: "Failed to load Iris history" }, 500);
  }
});

app.delete("/iris/history", async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization") ?? null);
    if (!userId) return c.json({ success: true });
    await kv.del(`iris-history:${userId}`);
    return c.json({ success: true });
  } catch (err) {
    console.log("Clear Iris history error:", err);
    return c.json({ error: "Failed to clear Iris history" }, 500);
  }
});

app.post("/iris/chat", async (c) => {
  try {
    const { messages, profile } = await c.req.json();

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "Messages array required" }, 400);
    }

    const userId = await getUserId(c.req.header("Authorization") ?? null);
    const incomingMessages = normalizeMessages(messages);
    const storedMessages = userId ? ((await kv.get(`iris-history:${userId}`)) ?? []) : [];
    const wardrobeItems = userId ? ((await kv.get(`wardrobe:${userId}`)) ?? []) : [];
    const conversationMessages = mergeHistory(
      Array.isArray(storedMessages) ? storedMessages : [],
      incomingMessages,
    );

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return c.json({ error: "Anthropic API key not configured" }, 500);
    }

    const systemPrompt = buildSystemPrompt(profile ?? {}, Array.isArray(wardrobeItems) ? wardrobeItems : []);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: conversationMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.log("Claude API error:", errText);
      return c.json({ error: `Claude API error: ${response.status}` }, 500);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text ?? "I'm not sure how to help with that — try asking me about outfits, colors, or what to wear!";

    if (userId) {
      const nextHistory: ChatMessage[] = [
        ...conversationMessages,
        { role: "assistant", content: reply, timestamp: new Date().toISOString() },
      ].slice(-40);
      await kv.set(`iris-history:${userId}`, nextHistory);
    }

    return c.json({ reply });
  } catch (err) {
    console.log("Iris chat error:", err);
    return c.json({ error: "Chat failed" }, 500);
  }
});

// ── Wardrobe — analyze garment with Claude Vision ────────────────────────────

app.post("/wardrobe/analyze", async (c) => {
  try {
    const { imageBase64, mediaType = "image/jpeg" } = await c.req.json();
    if (!imageBase64) return c.json({ error: "Image required" }, 400);

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) return c.json({ error: "Anthropic API key not configured" }, 500);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: imageBase64 },
            },
            {
              type: "text",
              text: `You are a fashion expert analyzing a clothing item for a personal styling app. Look at this image and return ONLY a valid JSON object — no explanation, no markdown, just JSON.

{
  "name": "descriptive item name (e.g. Navy Slim Blazer)",
  "category": "one of: tops, bottoms, outerwear, shoes, accessories, dresses, suits, bags",
  "color": "primary color name",
  "secondaryColor": "secondary color if applicable, or null",
  "occasions": ["array of: casual, work, evening, formal, sport, weekend"],
  "seasons": ["array of: spring, summer, fall, winter, year-round"],
  "styleNote": "one sentence on how to style it best",
  "brand": "brand name if visible, or null"
}

Use "year-round" for versatile basics that work across most seasons. Use specific seasons for heavy winter pieces, lightweight summer pieces, rain/snow pieces, or anything that is strongly climate-specific.`,
            },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.log("Claude Vision error:", err);
      return c.json({ error: "Analysis failed" }, 500);
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text ?? "{}";

    // Extract JSON from the response (strip any accidental markdown)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return c.json({ item: parsed });
  } catch (err) {
    console.log("Wardrobe analyze error:", err);
    return c.json({ error: "Analysis failed" }, 500);
  }
});

// ── Wardrobe — save & load items ─────────────────────────────────────────────

app.get("/wardrobe/items", async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization") ?? null);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const items = await kv.get(`wardrobe:${userId}`);
    return c.json({ items: items ?? [] });
  } catch (err) {
    console.log("Get wardrobe error:", err);
    return c.json({ error: "Failed to load wardrobe" }, 500);
  }
});

app.post("/wardrobe/items", async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization") ?? null);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const { item, items } = await c.req.json();

    // Retain the original bulk payload for compatibility with deployed clients.
    if (Array.isArray(items)) {
      await kv.set(`wardrobe:${userId}`, items);
      return c.json({ success: true, items });
    }
    if (!isWardrobeItem(item)) return c.json({ error: "Valid wardrobe item required" }, 400);

    const current = await getWardrobeItems(userId);
    if (current.some((existing) => existing.id === item.id)) {
      return c.json({ error: "Wardrobe item already exists" }, 409);
    }
    await kv.set(`wardrobe:${userId}`, [item, ...current]);
    return c.json({ success: true, item }, 201);
  } catch (err) {
    console.log("Save wardrobe error:", err);
    return c.json({ error: "Failed to save wardrobe" }, 500);
  }
});

app.put("/wardrobe/items/:itemId", async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization") ?? null);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const itemId = c.req.param("itemId");
    const { item } = await c.req.json();
    if (!isWardrobeItem(item) || item.id !== itemId) {
      return c.json({ error: "Item id must match request path" }, 400);
    }

    const current = await getWardrobeItems(userId);
    const index = current.findIndex((existing) => existing.id === itemId);
    if (index === -1) return c.json({ error: "Wardrobe item not found" }, 404);
    const next = [...current];
    next[index] = item;
    await kv.set(`wardrobe:${userId}`, next);
    return c.json({ success: true, item });
  } catch (err) {
    console.log("Update wardrobe item error:", err);
    return c.json({ error: "Failed to update wardrobe item" }, 500);
  }
});

app.delete("/wardrobe/items/:itemId", async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization") ?? null);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const itemId = c.req.param("itemId");
    const current = await getWardrobeItems(userId);
    if (!current.some((item) => item.id === itemId)) {
      return c.json({ error: "Wardrobe item not found" }, 404);
    }
    await kv.set(`wardrobe:${userId}`, current.filter((item) => item.id !== itemId));
    return c.json({ success: true });
  } catch (err) {
    console.log("Delete wardrobe item error:", err);
    return c.json({ error: "Failed to delete wardrobe item" }, 500);
  }
});

// ── Outfits — save & load saved looks ────────────────────────────────────────

type SavedOutfit = {
  id: string;
  name: string;
  slotItemIds: Record<string, string>;
  createdAt: string;
};

function normalizeOutfits(value: unknown): SavedOutfit[] {
  if (!Array.isArray(value)) return [];
  return value.filter((outfit): outfit is SavedOutfit => (
    typeof outfit === "object" &&
    outfit !== null &&
    typeof (outfit as SavedOutfit).id === "string" &&
    typeof (outfit as SavedOutfit).name === "string" &&
    typeof (outfit as SavedOutfit).slotItemIds === "object" &&
    typeof (outfit as SavedOutfit).createdAt === "string"
  ));
}

app.get("/outfits", async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization") ?? null);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const outfits = await kv.get(`outfits:${userId}`);
    return c.json({ outfits: normalizeOutfits(outfits) });
  } catch (err) {
    console.log("Get outfits error:", err);
    return c.json({ error: "Failed to load outfits" }, 500);
  }
});

app.post("/outfits", async (c) => {
  try {
    const userId = await getUserId(c.req.header("Authorization") ?? null);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
    const { outfits } = await c.req.json();
    await kv.set(`outfits:${userId}`, normalizeOutfits(outfits));
    return c.json({ success: true });
  } catch (err) {
    console.log("Save outfits error:", err);
    return c.json({ error: "Failed to save outfits" }, 500);
  }
});

Deno.serve((req) => {
  const url = new URL(req.url);
  url.pathname = url.pathname
    .replace(/^\/functions\/v1\/irys-api/, "")
    .replace(/^\/irys-api/, "") || "/";

  return app.fetch(new Request(url, req));
});

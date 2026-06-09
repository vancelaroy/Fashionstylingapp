import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

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
app.get("/make-server-7dbc8ff8/health", (c) => c.json({ status: "ok" }));

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

app.post("/make-server-7dbc8ff8/signup", async (c) => {
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

app.get("/make-server-7dbc8ff8/profile", async (c) => {
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

app.post("/make-server-7dbc8ff8/profile", async (c) => {
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

app.get("/make-server-7dbc8ff8/closet", async (c) => {
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

app.post("/make-server-7dbc8ff8/closet", async (c) => {
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

function buildSystemPrompt(profile: Record<string, unknown>): string {
  const gender = profile.gender as string ?? "person";
  const measurements = profile.measurements as Record<string, string> ?? {};

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

Response style:
- Keep it conversational and warm — 2 to 5 sentences for most replies
- Be specific, not generic ("A camel blazer would complement your autumn coloring" not "try neutral tones")
- If they ask for a playlist, give 4 to 6 real songs with artists and a one-line vibe description
- If they ask what to wear to a specific event, give a complete head-to-toe look
- Never make them feel bad about what they have or how they look`;
}

app.post("/make-server-7dbc8ff8/iris/chat", async (c) => {
  try {
    const { messages, profile } = await c.req.json();

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "Messages array required" }, 400);
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return c.json({ error: "Anthropic API key not configured" }, 500);
    }

    const systemPrompt = buildSystemPrompt(profile ?? {});

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
        messages: messages.map((m: { role: string; content: string }) => ({
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

    return c.json({ reply });
  } catch (err) {
    console.log("Iris chat error:", err);
    return c.json({ error: "Chat failed" }, 500);
  }
});

Deno.serve(app.fetch);

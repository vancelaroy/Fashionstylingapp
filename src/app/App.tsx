import { useState, useEffect, useCallback, type CSSProperties } from "react";
import { publicAnonKey, projectId } from "/utils/supabase/info";
import { supabase } from "../lib/supabase";
import { OnboardingFlow, type StyleProfile } from "./components/onboarding/OnboardingFlow";
import { BottomNav, type Tab } from "./components/navigation/BottomNav";
import { HomeScreen } from "./components/home/HomeScreen";
import { WardrobeScreen } from "./components/wardrobe/WardrobeScreen";
import { DiscoverScreen } from "./components/discover/DiscoverScreen";
import { ProfileScreen } from "./components/profile/ProfileScreen";
import { IrisChatScreen } from "./components/chat/IrisChatScreen";
import { AuthScreen } from "./components/auth/AuthScreen";
import { IrysAppIcon } from "./components/ui/IrysLogo";

const SERVER =`https://${projectId}.supabase.co/functions/v1/irys-api`;

const DEFAULT_PROFILE: StyleProfile = {
  name: "Aria",
  gender: "woman",
  bodyType: "hourglass",
  faceShape: "heart",
  colorSeason: "autumn",
  stylePersonality: ["Classic", "Romantic"],
  measurements: { height: "5'6\"", bust: "36\"", waist: "27\"", hips: "37\"", inseam: "" },
};

type AppState = "loading" | "auth" | "onboarding" | "app";

function getUserStorageKey(accessToken: string | null) {
  if (!accessToken) return "irys.savedOutfits.v1.guest";
  try {
    const payload = accessToken.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, "=")));
    return decoded?.sub ? `irys.savedOutfits.v1.${decoded.sub}` : "irys.savedOutfits.v1.guest";
  } catch {
    return "irys.savedOutfits.v1.guest";
  }
}

export default function App() {
  /* MARKER-MAKE-KIT-INVOKED */
  const [appState, setAppState] = useState<AppState>("loading");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<StyleProfile>(DEFAULT_PROFILE);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [splashDone, setSplashDone] = useState(false);
  const [irisItemPrompt, setIrisItemPrompt] = useState<string | null>(null);
  const [pendingOutfitItemIds, setPendingOutfitItemIds] = useState<string[] | null>(null);
  const isAuthCallback = typeof window !== "undefined" && window.location.pathname === "/auth/callback";
  const savedOutfitsKey = getUserStorageKey(accessToken);

  // Guarantee the splash shows for at least 2s — gives the logo animation time to play
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const loadProfile = useCallback(async (token: string) => {
    try {
      const res = await fetch(`${SERVER}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setAppState("app");
      } else {
        // New user — no profile saved yet, send to onboarding
        setAppState("onboarding");
      }
    } catch (err) {
      console.log("Failed to load profile:", err);
      // Server unavailable — still let the user in via onboarding
      setAppState("onboarding");
    }
  }, []);

  useEffect(() => {
    if (!isAuthCallback) return;

    const finishOAuth = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const errorDescription = url.searchParams.get("error_description") ?? url.searchParams.get("error");

      if (errorDescription) {
        console.log("OAuth callback error:", errorDescription);
        window.history.replaceState({}, document.title, "/");
        setAppState("auth");
        return;
      }

      if (!code) {
        window.history.replaceState({}, document.title, "/");
        setAppState("auth");
        return;
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      window.history.replaceState({}, document.title, "/");

      if (error || !data.session?.access_token) {
        console.log("OAuth session exchange failed:", error?.message);
        setAppState("auth");
        return;
      }

      setAccessToken(data.session.access_token);
      loadProfile(data.session.access_token);
    };

    finishOAuth();
  }, [isAuthCallback, loadProfile]);

  // onAuthStateChange is the single source of truth — no getSession() race condition.
  // INITIAL_SESSION: fires on mount (handles page refresh + post-OAuth redirect)
  // SIGNED_IN: fires after email login or OAuth callback completes
  // SIGNED_OUT: fires after signOut()
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isAuthCallback) return;
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.access_token) {
          setAccessToken(session.access_token);
          loadProfile(session.access_token);
        } else if (event === "INITIAL_SESSION") {
          setAppState("auth");
        }
      } else if (event === "SIGNED_OUT") {
        setAccessToken(null);
        setProfile(DEFAULT_PROFILE);
        setAppState("auth");
      }
    });
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const saveProfile = async (token: string, p: StyleProfile) => {
    try {
      await fetch(`${SERVER}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profile: p }),
      });
    } catch (err) {
      console.log("Failed to save profile:", err);
    }
  };

  const handleAuth = (token: string) => {
    if (token === "guest") {
      setAppState("onboarding");
      return;
    }
    setAccessToken(token);
    loadProfile(token);
  };

  // previewMode = true means onboarding runs but won't save to the database
  const [previewMode, setPreviewMode] = useState(false);

  const handleOnboardingComplete = (newProfile: StyleProfile) => {
    setProfile(newProfile);
    if (accessToken && !previewMode) saveProfile(accessToken, newProfile);
    setPreviewMode(false);
    setAppState("app");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange SIGNED_OUT handles state cleanup
  };

  // Full reset — overwrites saved profile
  const handleReset = () => {
    setPreviewMode(false);
    setAppState("onboarding");
  };

  // Preview mode — runs onboarding but doesn't touch the saved profile
  const handlePreview = () => {
    setPreviewMode(true);
    setAppState("onboarding");
  };

  const handleAskIrisAboutItem = (prompt: string) => {
    setIrisItemPrompt(prompt);
    setActiveTab("iris");
  };

  const handleEditDailyLook = (itemIds: string[]) => {
    setPendingOutfitItemIds(itemIds);
    setActiveTab("wardrobe");
  };

  const mobileShell: CSSProperties = {
    width: "min(100vw, 430px)",
    maxWidth: 430,
    height: "100dvh",          // dvh = excludes browser chrome on iOS
    background: "#161616",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    boxSizing: "border-box",
  };

  // ── Loading splash — show until both auth resolves AND 2s timer fires ─────
  if (appState === "loading" || !splashDone) {
    return (
      <div style={{ ...mobileShell, alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
        <style>{`
          @keyframes irys-fade-in { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
          @keyframes irys-pulse { 0%,100%{opacity:0.15} 50%{opacity:0.9} }
          @keyframes irys-wordmark { from { opacity: 0; letter-spacing: 0.3em; } to { opacity: 1; letter-spacing: -0.04em; } }
        `}</style>
        <div className="flex flex-col items-center gap-6">
          {/* Logo mark — scales in */}
          <div style={{ animation: "irys-fade-in 0.8s cubic-bezier(0.16,1,0.3,1) forwards" }}>
            <IrysAppIcon size={100} />
          </div>
          {/* Wordmark — letter-spacing collapses in */}
          <h1 style={{
            fontFamily: "var(--font-display)",
            color: "var(--gold)",
            fontSize: "44px",
            fontWeight: 400,
            letterSpacing: "-0.04em",
            fontStyle: "italic",
            lineHeight: 1,
            animation: "irys-wordmark 1s 0.3s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            Irys
          </h1>
          {/* Pulse dots */}
          <div className="flex gap-2" style={{ opacity: 0, animation: "irys-fade-in 0.5s 1s forwards" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--gold)", animation: `irys-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Auth screen ────────────────────────────────────────────────
  if (appState === "auth") {
    return (
      <div style={{ ...mobileShell, overflowY: "auto", margin: "0 auto" }}>
        <AuthScreen onAuth={handleAuth} />
      </div>
    );
  }

  // ── Onboarding ─────────────────────────────────────────────────
  if (appState === "onboarding") {
    return (
      <div style={{ ...mobileShell, overflowY: "auto", margin: "0 auto" }}>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // ── Main app ───────────────────────────────────────────────────
  return (
    <div style={{ width: "100%", minHeight: "100dvh", background: "#0E0E0E", display: "flex", justifyContent: "center" }}>
      <div style={{ ...mobileShell }}>
        <div className="flex-1 overflow-hidden relative">
          {activeTab === "home" && (
            <HomeScreen
              profile={profile}
              accessToken={accessToken}
              savedOutfitsKey={savedOutfitsKey}
              onAskIris={handleAskIrisAboutItem}
              onOpenWardrobe={() => setActiveTab("wardrobe")}
              onEditLook={handleEditDailyLook}
            />
          )}
          {activeTab === "wardrobe" && (
            <WardrobeScreen
              accessToken={accessToken}
              savedOutfitsKey={savedOutfitsKey}
              onAskIris={handleAskIrisAboutItem}
              pendingOutfitItemIds={pendingOutfitItemIds}
              onPendingOutfitConsumed={() => setPendingOutfitItemIds(null)}
            />
          )}
          {activeTab === "iris" && (
            <IrisChatScreen
              profile={profile}
              accessToken={accessToken}
              pendingPrompt={irisItemPrompt}
              onPendingPromptConsumed={() => setIrisItemPrompt(null)}
            />
          )}
          {activeTab === "discover" && (
            <DiscoverScreen
              profile={profile}
              accessToken={accessToken}
              onAskIris={handleAskIrisAboutItem}
              onOpenWardrobe={() => setActiveTab("wardrobe")}
            />
          )}
          {activeTab === "profile" && (
            <ProfileScreen
              profile={profile}
              onReset={handleReset}
              onPreview={handlePreview}
              onSignOut={handleSignOut}
              isLoggedIn={!!accessToken}
            />
          )}
        </div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

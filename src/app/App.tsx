import { useState, useEffect } from "react";
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

const SERVER =`https://${projectId}.supabase.co/functions/v1/make-server-7dbc8ff8`;

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

export default function App() {
  /* MARKER-MAKE-KIT-INVOKED */
  const [appState, setAppState] = useState<AppState>("loading");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<StyleProfile>(DEFAULT_PROFILE);
  const [activeTab, setActiveTab] = useState<Tab>("home");

  // On mount — check for existing session (also handles OAuth redirect)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        setAccessToken(session.access_token);
        loadProfile(session.access_token);
      } else {
        setAppState("auth");
      }
    });

    // Listen for OAuth sign-in completing
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        setAccessToken(session.access_token);
        loadProfile(session.access_token);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (token: string) => {
    try {
      const res = await fetch(`${SERVER}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setAppState("app");
      } else {
        setAppState("onboarding");
      }
    } catch (err) {
      console.log("Failed to load profile:", err);
      setAppState("onboarding");
    }
  };

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

  const handleOnboardingComplete = (newProfile: StyleProfile) => {
    setProfile(newProfile);
    if (accessToken) saveProfile(accessToken, newProfile);
    setAppState("app");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAccessToken(null);
    setProfile(DEFAULT_PROFILE);
    setAppState("auth");
  };

  const handleReset = () => setAppState("onboarding");

  // ── Loading splash ─────────────────────────────────────────────
  if (appState === "loading") {
    return (
      <div className="size-full flex items-center justify-center" style={{ background: "#0E0D0C" }}>
        <div className="flex flex-col items-center gap-4">
          <h1 style={{
            fontFamily: "var(--font-display)",
            color: "var(--gold)",
            fontSize: "56px",
            fontWeight: 400,
            letterSpacing: "-0.04em",
            fontStyle: "italic",
            lineHeight: 1,
          }}>
            IRYS
          </h1>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--gold)", animation: `irys-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
          <style>{`@keyframes irys-pulse { 0%,100%{opacity:0.15} 50%{opacity:0.9} }`}</style>
        </div>
      </div>
    );
  }

  // ── Auth screen ────────────────────────────────────────────────
  if (appState === "auth") {
    return (
      <div className="size-full flex items-center justify-center" style={{ background: "#0E0D0C" }}>
        <div className="relative overflow-hidden" style={{ width: "100%", maxWidth: 430, height: "100%", maxHeight: 932, background: "#0E0D0C" }}>
          <AuthScreen onAuth={handleAuth} />
        </div>
      </div>
    );
  }

  // ── Onboarding ─────────────────────────────────────────────────
  if (appState === "onboarding") {
    return (
      <div className="size-full flex items-center justify-center" style={{ background: "#0E0D0C" }}>
        <div className="relative overflow-hidden" style={{ width: "100%", maxWidth: 430, height: "100%", maxHeight: 932, background: "#0E0D0C" }}>
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </div>
      </div>
    );
  }

  // ── Main app ───────────────────────────────────────────────────
  return (
    <div className="size-full flex items-center justify-center" style={{ background: "#080807" }}>
      <div className="relative overflow-hidden flex flex-col"
        style={{ width: "100%", maxWidth: 430, height: "100%", maxHeight: 932, background: "#0E0D0C" }}>
        <div className="flex-1 overflow-hidden relative">
          {activeTab === "home" && <HomeScreen profile={profile} />}
          {activeTab === "wardrobe" && <WardrobeScreen />}
          {activeTab === "iris" && <IrisChatScreen profile={profile} />}
          {activeTab === "discover" && <DiscoverScreen profile={profile} />}
          {activeTab === "profile" && (
            <ProfileScreen
              profile={profile}
              onReset={handleReset}
              onSignOut={handleSignOut}
            />
          )}
        </div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

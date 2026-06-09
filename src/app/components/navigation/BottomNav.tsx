import { Home, Shirt, Compass, User, MessageCircle } from "lucide-react";

export type Tab = "home" | "wardrobe" | "iris" | "discover" | "profile";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs = [
  { id: "home" as Tab, label: "Today", icon: Home },
  { id: "wardrobe" as Tab, label: "Closet", icon: Shirt },
  { id: "iris" as Tab, label: "Iris", icon: MessageCircle, isSpecial: true },
  { id: "discover" as Tab, label: "Discover", icon: Compass },
  { id: "profile" as Tab, label: "My DNA", icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        fontFamily: "var(--font-body)",
      }}
      className="flex items-center justify-around px-1 pt-2 pb-6"
    >
      {tabs.map(({ id, label, icon: Icon, isSpecial }) => {
        const isActive = activeTab === id;

        if (isSpecial) {
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex flex-col items-center gap-1 -mt-5 transition-all duration-200"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
                style={{
                  background: isActive
                    ? "var(--gold)"
                    : "linear-gradient(135deg, rgba(201,169,110,0.9) 0%, rgba(180,145,90,0.95) 100%)",
                  boxShadow: isActive
                    ? "0 4px 20px rgba(201,169,110,0.5)"
                    : "0 4px 16px rgba(201,169,110,0.3)",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--charcoal)",
                    fontSize: "20px",
                    fontStyle: "italic",
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  I
                </span>
              </div>
              <span
                style={{
                  color: isActive ? "var(--gold)" : "var(--muted-foreground)",
                  fontSize: "10px",
                  letterSpacing: "0.05em",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center gap-1 px-3 py-1 transition-all duration-200"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <div
              className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
              style={{
                background: isActive ? "rgba(201, 169, 110, 0.12)" : "transparent",
              }}
            >
              <Icon
                size={18}
                style={{ color: isActive ? "var(--gold)" : "var(--muted-foreground)" }}
                strokeWidth={isActive ? 2 : 1.5}
              />
              {isActive && (
                <span
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                  style={{ background: "var(--gold)" }}
                />
              )}
            </div>
            <span
              style={{
                color: isActive ? "var(--gold)" : "var(--muted-foreground)",
                fontSize: "10px",
                letterSpacing: "0.04em",
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

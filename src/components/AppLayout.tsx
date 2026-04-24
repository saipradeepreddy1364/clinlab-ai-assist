import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus2,
  Sparkles,
  ClipboardList,
  Users,
  Upload,
  Moon,
  Sun,
  Stethoscope,
  Bell,
  ChevronLeft,
  Signal,
  Wifi,
  BatteryFull,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/new-case", label: "New", icon: FilePlus2 },
  { to: "/ai-engine", label: "AI", icon: Sparkles, primary: true },
  { to: "/patients", label: "Records", icon: Users },
  { to: "/uploads", label: "Files", icon: Upload },
];

const titleMap: Record<string, string> = {
  "/": "Clinical Assistant",
  "/new-case": "New Case",
  "/ai-engine": "AI Clinical Guide",
  "/lab-requisition": "Lab Requisition",
  "/patients": "Patient Records",
  "/uploads": "File Uploads",
};

const AppLayout = () => {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isDetail = location.pathname.startsWith("/patients/") && location.pathname !== "/patients";
  const title =
    titleMap[location.pathname] ?? (isDetail ? "Patient" : "ClinLab");

  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    // Outer "device stage" — gives a phone-frame feel on tablet/desktop
    <div className="min-h-screen w-full bg-muted/40 dark:bg-background flex items-center justify-center md:p-6">
      <div
        className={cn(
          "relative w-full bg-background flex flex-col overflow-hidden",
          // Phone-shape on md+, fullscreen on mobile
          "min-h-screen md:min-h-0 md:h-[860px] md:max-h-[92vh] md:w-[420px]",
          "md:rounded-[2.75rem] md:border md:border-border md:shadow-elevated"
        )}
      >
        {/* Faux status bar — visible on md+ to sell the phone frame */}
        <div className="hidden md:flex items-center justify-between px-7 pt-3 pb-1 text-[11px] font-semibold text-foreground/80">
          <span>{time}</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <BatteryFull className="w-4 h-4" />
          </div>
        </div>

        {/* App header */}
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/60 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {isDetail ? (
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 -ml-1 rounded-full hover:bg-muted flex items-center justify-center transition-smooth"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
                <Stethoscope className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
            )}
            <div className="min-w-0">
              {isHome && (
                <p className="text-[11px] text-muted-foreground leading-tight">ClinLab</p>
              )}
              <h1 className="font-display font-bold text-base leading-tight truncate">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggle} className="rounded-full h-9 w-9">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            <button className="relative w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-smooth">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-urgent" />
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
          <Outlet />
        </main>

        {/* Bottom tab bar */}
        <nav className="absolute bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur-xl border-t border-border/60 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] grid grid-cols-5 gap-1">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-smooth",
                  isActive ? "text-primary" : "text-muted-foreground active:bg-muted"
                )
              }
            >
              {({ isActive }) =>
                t.primary ? (
                  <div
                    className={cn(
                      "w-12 h-12 -mt-5 rounded-2xl flex items-center justify-center shadow-elevated transition-smooth",
                      "gradient-primary text-primary-foreground",
                      isActive && "scale-105"
                    )}
                  >
                    <t.icon className="w-5 h-5" />
                  </div>
                ) : (
                  <>
                    <t.icon className={cn("w-5 h-5", isActive && "scale-110 transition-smooth")} />
                    <span className="text-[10px] font-medium">{t.label}</span>
                  </>
                )
              }
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AppLayout;

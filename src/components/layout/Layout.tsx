import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { SessionPicker } from "./SessionPicker";
import { WelcomeTour } from "./WelcomeTour";
import { useEffect, useState } from "react";
import { SessionContext } from "@/lib/session";
import type { Id } from "../../../convex/_generated/dataModel";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/setup": "Session Setup",
  "/grade": "Grade Essays",
  "/results": "Results",
  "/evaluate": "Evaluate Accuracy",
};

const SESSION_KEY = "essaygrader.sessionId";

export function Layout() {
  const location = useLocation();
  const [sessionId, setSessionIdState] = useState<Id<"sessions"> | null>(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? (saved as Id<"sessions">) : null;
  });
  const [tourReplayKey, setTourReplayKey] = useState(0);

  const setSessionId = (id: Id<"sessions"> | null) => {
    setSessionIdState(id);
    if (id) localStorage.setItem(SESSION_KEY, id);
    else localStorage.removeItem(SESSION_KEY);
  };

  useEffect(() => {
    document.title = `${ROUTE_TITLES[location.pathname] ?? "EssayGrader Pro"} · EssayGrader Pro`;
  }, [location.pathname]);

  const title =
    location.pathname.startsWith("/essays/")
      ? "Essay Detail"
      : ROUTE_TITLES[location.pathname] ?? "EssayGrader Pro";

  return (
    <SessionContext.Provider value={{ sessionId, setSessionId }}>
      <div className="flex h-screen bg-background">
        <Sidebar onReplayTour={() => setTourReplayKey((k) => k + 1)} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm px-8 flex items-center justify-between sticky top-0 z-30">
            <div>
              <h1 className="text-base font-semibold text-foreground">{title}</h1>
            </div>
            <SessionPicker />
          </header>
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-6xl mx-auto px-8 py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <WelcomeTour replayKey={tourReplayKey} />
    </SessionContext.Provider>
  );
}

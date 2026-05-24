import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  LayoutDashboard,
  Settings2,
  Sparkles,
  ListChecks,
  ShieldCheck,
  GraduationCap,
  Database,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/setup", label: "Setup", icon: Settings2 },
  { to: "/grade", label: "Grade", icon: Sparkles },
  { to: "/results", label: "Results", icon: ListChecks },
  { to: "/evaluate", label: "Evaluate", icon: ShieldCheck },
];

type Toast = { kind: "success" | "info" | "error"; text: string };

function SeedControl() {
  const status = useQuery(api.seed.status);
  const loadSampleData = useMutation(api.seed.loadSampleData);
  const clearSampleData = useMutation(api.seed.clearSampleData);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const seeded = status?.seeded ?? false;
  const loading = status === undefined;

  async function onLoad() {
    setBusy(true);
    setToast(null);
    try {
      const res = await loadSampleData({});
      setToast({
        kind: res.created ? "success" : "info",
        text: res.message,
      });
    } catch (err) {
      setToast({
        kind: "error",
        text: err instanceof Error ? err.message : "Failed to load sample data.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function onClear() {
    if (
      !window.confirm(
        "Remove all sample sessions, rubrics, and essays? This cannot be undone."
      )
    ) {
      return;
    }
    setBusy(true);
    setToast(null);
    try {
      const res = await clearSampleData({});
      setToast({
        kind: res.removed > 0 ? "success" : "info",
        text: res.message,
      });
    } catch (err) {
      setToast({
        kind: "error",
        text: err instanceof Error ? err.message : "Failed to remove sample data.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Database className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">
          Sample Data
        </span>
        {seeded && !loading && (
          <span className="ml-auto text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
            Loaded
          </span>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug mb-2.5">
        {seeded
          ? "Three demo sessions are populated. Remove to reset to an empty app."
          : "Populate the app with three realistic sessions for an instant tour."}
      </p>
      {seeded ? (
        <button
          onClick={onClear}
          disabled={busy || loading}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded border border-border bg-background hover:bg-muted text-foreground text-xs font-medium px-2.5 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
          Remove Sample Data
        </button>
      ) : (
        <button
          onClick={onLoad}
          disabled={busy || loading}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium px-2.5 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Database className="h-3 w-3" />
          )}
          Load Sample Data
        </button>
      )}
      {toast && (
        <div
          className={cn(
            "mt-2 flex items-start gap-1.5 rounded px-2 py-1.5 text-[11px] leading-tight",
            toast.kind === "success" &&
              "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200",
            toast.kind === "info" &&
              "bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200",
            toast.kind === "error" &&
              "bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200"
          )}
        >
          {toast.kind === "error" ? (
            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ onReplayTour }: { onReplayTour: () => void }) {
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-card/50 flex flex-col">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center shadow-sm">
          <GraduationCap className="h-4.5 w-4.5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-foreground">EssayGrader</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Pro · Calibrated AI Grading
          </div>
        </div>
      </div>

      <nav data-tour="sidebar-nav" className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <div data-tour="seed-control">
          <SeedControl />
        </div>
        <button
          onClick={onReplayTour}
          className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1.5 rounded transition-colors"
          title="Replay the welcome tour"
        >
          <PlayCircle className="h-3 w-3" />
          Replay welcome tour
        </button>
        <div className="rounded-md bg-muted/60 p-3 text-xs">
          <div className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Powered by AWS Bedrock
          </div>
          <p className="text-muted-foreground leading-snug">
            FERPA-friendly. Same code runs against local models for full data containment.
          </p>
        </div>
      </div>
    </aside>
  );
}

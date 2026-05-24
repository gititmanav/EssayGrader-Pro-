import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSession } from "@/lib/session";
import { Link } from "react-router-dom";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty";
import {
  GraduationCap,
  Sparkles,
  Clock,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ListChecks,
  BookOpen,
  ArrowRight,
  PlayCircle,
} from "lucide-react";

const MINUTES_PER_ESSAY_MANUAL = 12;

export function Dashboard() {
  const { sessionId, setSessionId } = useSession();
  const allSessions = useQuery(api.sessions.list);
  const stats = useQuery(
    api.essays.stats,
    sessionId ? { sessionId } : "skip"
  );
  const summary = useQuery(
    api.evaluation.summarize,
    sessionId ? { sessionId } : "skip"
  );
  const ungraded = useQuery(
    api.essays.listByType,
    sessionId ? { sessionId, type: "ungraded" as const } : "skip"
  );

  const seedSessions = (allSessions ?? []).filter((s) => s.isSeed);

  if (!sessionId) {
    return (
      <div className="space-y-6">
        {seedSessions.length > 0 && (
          <DemoWelcome
            seedSessions={seedSessions}
            activeId={null}
            onPick={setSessionId}
          />
        )}
        <EmptyState
          icon={GraduationCap}
          title="Welcome to EssayGrader Pro"
          description="Create your first grading session using the dropdown in the top-right. Sessions group essays for one assignment — calibrate once, grade the whole batch."
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-sm text-muted-foreground py-12 text-center">
        Loading…
      </div>
    );
  }

  const totalProcessed = stats.graded;
  const minutesSaved = totalProcessed * MINUTES_PER_ESSAY_MANUAL * 0.7;
  const hoursSaved = (minutesSaved / 60).toFixed(1);

  const gradeDistribution = computeGradeDistribution(ungraded ?? []);

  return (
    <div className="space-y-7">
      {seedSessions.length > 0 && (
        <DemoWelcome
          seedSessions={seedSessions}
          activeId={sessionId}
          onPick={setSessionId}
        />
      )}

      <div>
        <p className="text-sm text-muted-foreground mb-1">Overview</p>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Snapshot of your session. Track grading progress, validation accuracy,
          and time saved compared to manual grading.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBlock
          icon={CheckCircle2}
          label="Essays graded"
          value={stats.graded}
          sub={stats.pending > 0 ? `${stats.pending} pending` : "All caught up"}
        />
        <StatBlock
          icon={ShieldCheck}
          label="Approval rate"
          value={
            stats.graded > 0
              ? `${Math.round((stats.approved / stats.graded) * 100)}%`
              : "—"
          }
          sub={`${stats.approved} approved, ${stats.overridden} adjusted`}
        />
        <StatBlock
          icon={TrendingUp}
          label="Avg AI confidence"
          value={
            stats.graded > 0
              ? `${(stats.avgConfidence * 100).toFixed(0)}%`
              : "—"
          }
          sub="across graded essays"
        />
        <StatBlock
          icon={Clock}
          label="Time saved (est.)"
          value={`${hoursSaved}h`}
          sub={`vs ${MINUTES_PER_ESSAY_MANUAL}min/essay manual baseline`}
          accent
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Grade distribution</CardTitle>
            <CardDescription>
              How the AI is grading this batch (final grades after instructor
              overrides, where applicable).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gradeDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No graded essays yet. Distribution will appear after grading.
              </p>
            ) : (
              <div className="space-y-2.5">
                {gradeDistribution.map((g) => (
                  <div key={g.label} className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium text-muted-foreground tabular-nums">
                      {g.label}
                    </div>
                    <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden relative">
                      <div
                        className="h-full bg-primary/80 transition-all"
                        style={{ width: `${g.pct}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-2 text-xs font-medium">
                        {g.count} {g.count === 1 ? "essay" : "essays"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validation status</CardTitle>
            <CardDescription>
              Confidence the AI matches your style.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!summary || summary.total === 0 ? (
              <div className="text-center py-4">
                <ShieldCheck className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground mb-3">
                  No validation run yet
                </p>
                <Link to="/evaluate">
                  <Button variant="outline" size="sm">
                    Run validation
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div>
                  <div className="text-3xl font-semibold tabular-nums">
                    {Math.round((summary.exactMatches / summary.total) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    exact match · {summary.total} essay
                    {summary.total === 1 ? "" : "s"} validated
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Within 5 pts</span>
                    <span className="font-medium">
                      {Math.round((summary.within5 / summary.total) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Within 10 pts</span>
                    <span className="font-medium">
                      {Math.round((summary.within10 / summary.total) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg deviation</span>
                    <span className="font-medium">
                      {summary.avgDiff.toFixed(1)} pts
                    </span>
                  </div>
                </div>
                <Link to="/evaluate">
                  <Button variant="outline" size="sm" className="w-full">
                    View details
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <QuickAction
            icon={BookOpen}
            label="Setup"
            description="Add or edit rubric and references"
            to="/setup"
          />
          <QuickAction
            icon={Sparkles}
            label="Grade"
            description="Upload and grade new essays"
            to="/grade"
            highlight={stats.pending > 0}
            badge={stats.pending > 0 ? `${stats.pending} pending` : undefined}
          />
          <QuickAction
            icon={ListChecks}
            label="Review results"
            description="Approve, adjust, or export"
            to="/results"
          />
        </CardContent>
      </Card>

    </div>
  );
}

function DemoWelcome({
  seedSessions,
  activeId,
  onPick,
}: {
  seedSessions: Doc<"sessions">[];
  activeId: Id<"sessions"> | null;
  onPick: (id: Id<"sessions">) => void;
}) {
  return (
    <div data-tour="demo-welcome" className="rounded-lg border border-primary/30 bg-primary/[0.04] p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-8 w-8 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
          <PlayCircle className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">
            Demo data loaded — pick a session to explore
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            These three sessions are pre-populated to show the app at different
            states: fully calibrated, partially set up, and empty.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {seedSessions.map((s, idx) => {
          const isActive = s._id === activeId;
          const meta = DEMO_META[idx] ?? DEFAULT_DEMO_META;
          return (
            <button
              key={s._id}
              onClick={() => onPick(s._id)}
              className={`text-left rounded-md border p-3 transition-colors ${
                isActive
                  ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">
                <span className={isActive ? "text-primary" : ""}>
                  {meta.tag}
                </span>
                {isActive && (
                  <span className="ml-auto text-[10px] font-semibold text-primary">
                    Active
                  </span>
                )}
              </div>
              <div className="text-sm font-medium text-foreground mb-1 leading-snug">
                {s.name}
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {meta.blurb}
              </div>
              {!isActive && (
                <div className="text-xs font-medium text-primary mt-2 inline-flex items-center gap-1">
                  Open <ArrowRight className="h-3 w-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const DEMO_META = [
  {
    tag: "Recommended · Fully calibrated",
    blurb:
      "5 graded reference essays, 3 ungraded waiting, and 2 essays already AI-graded so the review interface is populated.",
  },
  {
    tag: "Partial · Different domain",
    blurb:
      "MBA-level ethics case studies with 3 references and 1 ungraded essay — shows the app generalizes across subjects.",
  },
  {
    tag: "Empty · Fresh start",
    blurb:
      "A brand-new session. Open it to see the empty-state guidance for a real first-time setup.",
  },
];
const DEFAULT_DEMO_META = { tag: "Demo session", blurb: "" };

function StatBlock({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-5 ${
        accent ? "border-primary/30 bg-primary/[0.03]" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide font-medium">
        <Icon className={`h-3.5 w-3.5 ${accent ? "text-primary" : ""}`} />
        {label}
      </div>
      <div className={`text-3xl font-semibold mt-1.5 tabular-nums ${accent ? "text-primary" : ""}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  description,
  to,
  highlight,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  to: string;
  highlight?: boolean;
  badge?: string;
}) {
  return (
    <Link
      to={to}
      className={`group rounded-md border p-4 transition-colors hover:border-primary ${
        highlight ? "border-primary/40 bg-primary/[0.03]" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5 text-primary" />
        {badge && <Badge variant="default">{badge}</Badge>}
      </div>
      <div className="text-sm font-medium flex items-center gap-1.5">
        {label}
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
    </Link>
  );
}

function computeGradeDistribution(essays: Array<any>) {
  const completed = essays.filter((e) => e.status === "complete");
  if (completed.length === 0) return [];

  const grades = completed.map((e) => {
    const final = e.professorAdjustedGrade ?? e.aiGrade ?? "";
    return categorizeGrade(final);
  });

  const counts: Record<string, number> = {};
  for (const g of grades) {
    counts[g] = (counts[g] || 0) + 1;
  }

  const order = ["A", "B", "C", "D", "F", "Other"];
  const total = completed.length;
  return order
    .filter((label) => counts[label] > 0)
    .map((label) => ({
      label,
      count: counts[label],
      pct: (counts[label] / total) * 100,
    }));
}

function categorizeGrade(grade: string): string {
  const trimmed = grade.trim().toUpperCase();
  if (/^[A][+-]?$/.test(trimmed)) return "A";
  if (/^[B][+-]?$/.test(trimmed)) return "B";
  if (/^[C][+-]?$/.test(trimmed)) return "C";
  if (/^[D][+-]?$/.test(trimmed)) return "D";
  if (/^F$/.test(trimmed)) return "F";
  const pct = grade.match(/(\d+(?:\.\d+)?)/);
  if (pct) {
    const n = parseFloat(pct[1]);
    if (n >= 90) return "A";
    if (n >= 80) return "B";
    if (n >= 70) return "C";
    if (n >= 60) return "D";
    return "F";
  }
  return "Other";
}

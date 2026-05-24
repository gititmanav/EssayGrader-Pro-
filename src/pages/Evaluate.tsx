import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSession } from "@/lib/session";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty";
import {
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Loader2,
  RotateCcw,
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

export function Evaluate() {
  const { sessionId } = useSession();
  const references = useQuery(
    api.essays.listByType,
    sessionId ? { sessionId, type: "reference" as const } : "skip"
  );
  const summary = useQuery(
    api.evaluation.summarize,
    sessionId ? { sessionId } : "skip"
  );
  const moveToHoldout = useMutation(api.evaluation.moveToHoldout);
  const restoreAll = useMutation(api.evaluation.restoreAllHoldouts);
  const gradeHoldouts = useAction(api.gradeEssay.gradeHoldouts);

  const [holdoutCount, setHoldoutCount] = useState(2);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!sessionId) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Pick or create a session first"
        description="Sessions group related essays — typically one per assignment."
      />
    );
  }

  async function handleRun() {
    if (!sessionId) return;
    setError(null);
    setRunning(true);
    try {
      await moveToHoldout({ sessionId, count: holdoutCount });
      await gradeHoldouts({ sessionId });
    } catch (e: any) {
      setError(e.message ?? "Validation failed");
    } finally {
      setRunning(false);
    }
  }

  async function handleReset() {
    if (!sessionId) return;
    await restoreAll({ sessionId });
  }

  const refCount = references?.length ?? 0;
  const minRefs = holdoutCount + 2;
  const canRun = refCount >= minRefs && !running;

  const accuracy =
    summary && summary.total > 0
      ? (summary.exactMatches / summary.total) * 100
      : 0;
  const within5Pct =
    summary && summary.total > 0 ? (summary.within5 / summary.total) * 100 : 0;
  const within10Pct =
    summary && summary.total > 0 ? (summary.within10 / summary.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Trust before scale</p>
        <h2 className="text-2xl font-semibold tracking-tight">
          Validate accuracy
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Before trusting the AI on a full batch, hold out some of your already-graded
          essays. The AI grades them blind, then we compare. If accuracy is low,
          add more reference essays or refine the rubric.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Run a validation
          </CardTitle>
          <CardDescription>
            We'll move {holdoutCount} reference essays to a holdout set, hide
            your grades from the AI, then ask it to grade them using the
            remaining references for calibration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="space-y-1.5">
              <Label htmlFor="hold-count" className="text-xs">
                Essays to hold out
              </Label>
              <Input
                id="hold-count"
                type="number"
                min={1}
                max={Math.max(1, refCount - 2)}
                value={holdoutCount}
                onChange={(e) =>
                  setHoldoutCount(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-24"
              />
            </div>
            <div className="flex-1 text-xs text-muted-foreground">
              {refCount < minRefs ? (
                <span className="text-amber-600 inline-flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Need {minRefs - refCount} more reference essay
                  {minRefs - refCount === 1 ? "" : "s"} (minimum 2 must remain for
                  calibration).
                </span>
              ) : (
                <span>
                  {refCount - holdoutCount} reference essays will remain for
                  calibration during the test.
                </span>
              )}
            </div>
            <Button onClick={handleRun} disabled={!canRun}>
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run validation
                </>
              )}
            </Button>
            {summary && summary.total > 0 && (
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
          {error && (
            <div className="text-sm text-red-600 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {summary && summary.total > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              label="Exact match"
              value={`${accuracy.toFixed(0)}%`}
              detail={`${summary.exactMatches} of ${summary.total}`}
              variant={accuracy >= 70 ? "success" : accuracy >= 50 ? "warning" : "danger"}
            />
            <MetricCard
              label="Within 5 pts"
              value={`${within5Pct.toFixed(0)}%`}
              detail={`${summary.within5} of ${summary.total}`}
              variant={within5Pct >= 80 ? "success" : "warning"}
            />
            <MetricCard
              label="Within 10 pts"
              value={`${within10Pct.toFixed(0)}%`}
              detail={`${summary.within10} of ${summary.total}`}
              variant={within10Pct >= 90 ? "success" : "warning"}
            />
            <MetricCard
              label="Avg deviation"
              value={summary.avgDiff.toFixed(1)}
              detail="points off"
              variant={summary.avgDiff <= 5 ? "success" : summary.avgDiff <= 10 ? "warning" : "danger"}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Side-by-side comparison
              </CardTitle>
              <CardDescription>
                Each row shows the instructor's grade vs. the AI's blind grade.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary.rows.map((r) => (
                  <ComparisonRow key={r.essayId} row={r} />
                ))}
              </div>

              <RecommendationBanner accuracy={accuracy} within10Pct={within10Pct} />
            </CardContent>
          </Card>
        </>
      )}

      {summary && summary.pendingCount > 0 && summary.total === 0 && (
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm">
                {summary.pendingCount} holdout essay
                {summary.pendingCount === 1 ? "" : "s"} being graded…
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {(!summary || (summary.total === 0 && summary.pendingCount === 0)) && (
        <EmptyState
          icon={ShieldCheck}
          title="No validation run yet"
          description="Run a validation to see how closely the AI matches your grading style. We recommend doing this before grading a large batch."
        />
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  variant,
}: {
  label: string;
  value: string;
  detail: string;
  variant: "success" | "warning" | "danger";
}) {
  const colorMap = {
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  };
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
        {label}
      </div>
      <div className={`text-3xl font-semibold mt-1 ${colorMap[variant]}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{detail}</div>
    </div>
  );
}

function ComparisonRow({
  row,
}: {
  row: {
    essayId: string;
    title: string;
    professorGrade: string;
    aiGrade: string;
    matchExact: boolean;
    diff?: number | null;
    aiConfidence?: number;
  };
}) {
  const { matchExact, diff } = row;
  const closeness =
    diff === null || diff === undefined
      ? "unknown"
      : diff === 0
        ? "match"
        : diff <= 5
          ? "close"
          : diff <= 10
            ? "moderate"
            : "far";

  const bandColor = {
    match: "border-emerald-200 bg-emerald-50/40",
    close: "border-emerald-200 bg-emerald-50/30",
    moderate: "border-amber-200 bg-amber-50/30",
    far: "border-red-200 bg-red-50/30",
    unknown: "border-border bg-card",
  }[closeness];

  return (
    <div className={`rounded-md border p-3 ${bandColor}`}>
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{row.title}</div>
          <div className="text-xs text-muted-foreground">
            AI confidence:{" "}
            {row.aiConfidence !== undefined
              ? `${(row.aiConfidence * 100).toFixed(0)}%`
              : "n/a"}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <GradeChip label="Instructor" grade={row.professorGrade} />
          <ArrowSep matchExact={matchExact} diff={diff} />
          <GradeChip label="AI" grade={row.aiGrade} />
        </div>
      </div>
    </div>
  );
}

function GradeChip({ label, grade }: { label: string; grade: string }) {
  return (
    <div className="text-center min-w-[80px]">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </div>
      <div className="text-xl font-semibold tabular-nums">{grade}</div>
    </div>
  );
}

function ArrowSep({
  matchExact,
  diff,
}: {
  matchExact: boolean;
  diff?: number | null;
}) {
  if (matchExact || diff === 0) {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Match
      </Badge>
    );
  }
  if (diff === null || diff === undefined) {
    return <Badge variant="outline">diff?</Badge>;
  }
  const variant: "success" | "warning" | "danger" =
    diff <= 5 ? "success" : diff <= 10 ? "warning" : "danger";
  return <Badge variant={variant}>±{diff.toFixed(1)}</Badge>;
}

function RecommendationBanner({
  accuracy,
  within10Pct,
}: {
  accuracy: number;
  within10Pct: number;
}) {
  if (within10Pct >= 90) {
    return (
      <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
        <div>
          <div className="text-sm font-semibold text-emerald-900">
            Strong calibration
          </div>
          <p className="text-xs text-emerald-700 mt-0.5">
            The AI is grading within 10 points of your standards on {within10Pct.toFixed(0)}% of essays.
            You can confidently grade the full batch — keep a human in the loop for the
            edge cases (low AI-confidence essays).
          </p>
        </div>
      </div>
    );
  }
  if (accuracy < 30) {
    return (
      <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 flex items-start gap-3">
        <XCircle className="h-5 w-5 text-red-600 shrink-0" />
        <div>
          <div className="text-sm font-semibold text-red-900">
            Calibration needs work
          </div>
          <p className="text-xs text-red-700 mt-0.5">
            The AI is missing your standards. Add more diverse reference essays
            (especially edge cases — the strongest and weakest), or refine the rubric to
            be more explicit about how each criterion translates to grade points.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
      <div>
        <div className="text-sm font-semibold text-amber-900">
          Acceptable but improvable
        </div>
        <p className="text-xs text-amber-700 mt-0.5">
          The AI is in the right neighborhood. Adding 2-3 more reference essays
          covering the grade range will tighten accuracy. Review every essay rather
          than batch-approving until validation crosses 90% within 10 points.
        </p>
      </div>
    </div>
  );
}

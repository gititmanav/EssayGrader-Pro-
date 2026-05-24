import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSession } from "@/lib/session";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty";
import { EssayInput } from "@/components/upload/EssayInput";
import {
  Sparkles,
  GraduationCap,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Trash2,
  FileText,
} from "lucide-react";

export function Grade() {
  const { sessionId } = useSession();
  const ungraded = useQuery(
    api.essays.listByType,
    sessionId ? { sessionId, type: "ungraded" as const } : "skip"
  );
  const references = useQuery(
    api.essays.listByType,
    sessionId ? { sessionId, type: "reference" as const } : "skip"
  );
  const rubric = useQuery(
    api.rubrics.getForSession,
    sessionId ? { sessionId } : "skip"
  );

  const addUngraded = useMutation(api.essays.addUngraded);
  const removeEssay = useMutation(api.essays.remove);
  const gradeAll = useAction(api.gradeEssay.gradeAllPending);
  const gradeSingle = useAction(api.gradeEssay.gradeSingle);

  const [running, setRunning] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  if (!sessionId) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Pick or create a session first"
        description="Sessions group related essays — typically one per assignment."
      />
    );
  }

  const refCount = references?.length ?? 0;
  const hasRubric = !!rubric?.content;
  const setupReady = refCount >= 1 && hasRubric;

  const items = ungraded ?? [];
  const completed = items.filter((e) => e.status === "complete").length;
  const inProgress = items.filter((e) => e.status === "grading").length;
  const pending = items.filter(
    (e) => e.status === "pending" || e.status === "error"
  ).length;
  const progressPct = items.length > 0 ? (completed / items.length) * 100 : 0;

  async function handleGradeAll() {
    if (!sessionId) return;
    setRunning(true);
    try {
      await gradeAll({ sessionId });
    } finally {
      setRunning(false);
    }
  }

  function handleBulkParse() {
    const blocks = bulkText
      .split(/\n---+\n/g)
      .map((b) => b.trim())
      .filter(Boolean);
    blocks.forEach((block, idx) => {
      const lines = block.split("\n");
      const titleLine = lines[0] || `Essay ${idx + 1}`;
      const title = titleLine.replace(/^#\s*/, "").trim();
      const body = lines.slice(1).join("\n").trim() || titleLine;
      addUngraded({
        sessionId: sessionId!,
        title: title.length > 80 ? `Essay ${idx + 1}` : title,
        content: body,
      });
    });
    setBulkText("");
    setShowBulk(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Bulk grading</p>
        <h2 className="text-2xl font-semibold tracking-tight">Grade essays</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Upload ungraded essays, then run the AI. Results stream in live —
          you'll see each essay update from <em>Pending</em> to <em>Complete</em>.
        </p>
      </div>

      {!setupReady && (
        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-amber-900 mb-1">
                  Setup not complete
                </div>
                <p className="text-sm text-amber-800 mb-3">
                  You need {!hasRubric ? "a rubric" : null}
                  {!hasRubric && refCount < 1 ? " and " : null}
                  {refCount < 1 ? "at least 1 reference essay" : null} before
                  grading. The AI calibrates against your references — grading
                  without them isn't possible.
                </p>
                <Link to="/setup">
                  <Button variant="outline" size="sm">
                    Go to Setup
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard label="To grade" value={pending} variant="default" />
        <StatCard label="Grading…" value={inProgress} variant="warning" />
        <StatCard label="Complete" value={completed} variant="success" />
      </div>

      {items.length > 0 && (
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">
                Progress · {completed}/{items.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {progressPct.toFixed(0)}%
              </span>
            </div>
            <Progress value={progressPct} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Essays to grade
              </CardTitle>
              <CardDescription>
                Add essays one at a time, or paste many in bulk (separated by{" "}
                <code className="text-[10px] px-1 py-0.5 bg-muted rounded">---</code>).
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulk(!showBulk)}
              >
                {showBulk ? "Cancel bulk" : "Bulk paste"}
              </Button>
              <Button
                onClick={handleGradeAll}
                disabled={!setupReady || pending === 0 || running}
                size="sm"
              >
                {running ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Grading…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Grade {pending > 0 ? `${pending} pending` : "all"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {showBulk ? (
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="text-sm font-medium">Bulk paste</div>
              <p className="text-xs text-muted-foreground">
                Format: first line of each essay is the title, then a blank line,
                then the essay text. Separate essays with{" "}
                <code className="text-[10px] px-1 py-0.5 bg-muted rounded">---</code> on
                its own line.
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={10}
                className="w-full text-xs font-mono rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={`Student #042 — Essay 1\n\nThe industrial revolution transformed…\n\n---\n\nStudent #043 — Essay 2\n\nIn examining Bourdieu's concept of habitus…`}
              />
              <Button size="sm" onClick={handleBulkParse} disabled={!bulkText.trim()}>
                Add all
              </Button>
            </div>
          ) : (
            <EssayInput
              compact
              onAdd={async (e) => {
                if (!sessionId) return;
                await addUngraded({
                  sessionId,
                  title: e.title,
                  content: e.content,
                });
              }}
            />
          )}

          {items.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No essays uploaded yet"
              description="Add essays above to start grading. The AI will use your reference essays for calibration."
            />
          ) : (
            <div className="space-y-2">
              {items.map((essay) => (
                <EssayRow
                  key={essay._id}
                  essay={essay}
                  onRegrade={() =>
                    gradeSingle({ essayId: essay._id })
                  }
                  onDelete={() => removeEssay({ essayId: essay._id })}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EssayRow({
  essay,
  onRegrade,
  onDelete,
}: {
  essay: any;
  onRegrade: () => void;
  onDelete: () => void;
}) {
  const statusBadge =
    essay.status === "complete" ? (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        {essay.aiGrade}
      </Badge>
    ) : essay.status === "grading" ? (
      <Badge variant="warning" className="gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Grading
      </Badge>
    ) : essay.status === "error" ? (
      <Badge variant="danger" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Error
      </Badge>
    ) : (
      <Badge variant="outline">Pending</Badge>
    );

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3 hover:border-primary/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate">{essay.title}</span>
          {statusBadge}
          {essay.aiConfidence !== undefined &&
            essay.status === "complete" && (
              <span className="text-xs text-muted-foreground">
                · {(essay.aiConfidence * 100).toFixed(0)}% confidence
              </span>
            )}
        </div>
        {essay.status === "error" ? (
          <p className="text-xs text-red-600 line-clamp-1">
            {essay.errorMessage}
          </p>
        ) : essay.status === "complete" && essay.aiFeedback ? (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {essay.aiFeedback}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {essay.content.slice(0, 140)}…
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {essay.status === "complete" && (
          <Link to={`/essays/${essay._id}`}>
            <Button variant="ghost" size="sm">
              Review
            </Button>
          </Link>
        )}
        {(essay.status === "error" || essay.status === "complete") && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRegrade}
            title="Re-grade"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "default" | "success" | "warning";
}) {
  const colorMap = {
    default: "text-foreground",
    success: "text-emerald-600",
    warning: "text-amber-600",
  };
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
        {label}
      </div>
      <div className={`text-3xl font-semibold mt-1 ${colorMap[variant]}`}>
        {value}
      </div>
    </div>
  );
}

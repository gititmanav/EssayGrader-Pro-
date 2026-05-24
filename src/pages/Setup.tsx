import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSession } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty";
import { EssayInput } from "@/components/upload/EssayInput";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  FileStack,
  Trash2,
  Sparkles,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

const SAMPLE_RUBRIC = `Argumentation (30 pts): Does the essay present a clear, original thesis supported by sound reasoning?
Evidence & Examples (25 pts): Are claims backed by specific, relevant evidence from course materials?
Writing Quality (20 pts): Is the prose clear, grammatically correct, and well-organized?
Engagement with Counter-Arguments (15 pts): Does the writer acknowledge and address opposing views?
Originality of Insight (10 pts): Does the essay offer a perspective beyond surface-level treatment?`;

export function Setup() {
  const { sessionId } = useSession();
  const rubric = useQuery(
    api.rubrics.getForSession,
    sessionId ? { sessionId } : "skip"
  );
  const references = useQuery(
    api.essays.listByType,
    sessionId ? { sessionId, type: "reference" as const } : "skip"
  );
  const upsertRubric = useMutation(api.rubrics.upsert);
  const addReference = useMutation(api.essays.addReference);
  const removeEssay = useMutation(api.essays.remove);

  const [rubricText, setRubricText] = useState("");
  const [maxScore, setMaxScore] = useState(100);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (rubric) {
      setRubricText(rubric.content);
      setMaxScore(rubric.maxScore);
    }
  }, [rubric?._id]);

  if (!sessionId) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Pick or create a session first"
        description="Use the session dropdown in the top-right to create your first grading session — typically one per assignment."
      />
    );
  }

  async function handleSaveRubric() {
    if (!sessionId || !rubricText.trim()) return;
    setSaving(true);
    await upsertRubric({
      sessionId,
      content: rubricText.trim(),
      maxScore,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const refCount = references?.length ?? 0;
  const calibrationQuality =
    refCount === 0
      ? { level: "none", color: "danger" as const, msg: "Add reference essays to enable AI grading." }
      : refCount < 3
        ? { level: "weak", color: "warning" as const, msg: "Add more for better calibration (3+ recommended)." }
        : refCount < 5
          ? { level: "good", color: "success" as const, msg: "Solid calibration — AI will follow your style well." }
          : { level: "excellent", color: "success" as const, msg: "Excellent — diverse examples produce the most reliable grading." };

  const rubricReady = !!rubric?.content;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Step-by-step setup</p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Calibrate AI to your grading style
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Enter your rubric, then add a handful of essays you've already graded.
            The AI studies your standards and grades new essays the way <em>you</em> would —
            not how a generic AI baseline would.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StepCard
          step={1}
          title="Rubric"
          complete={rubricReady}
          description={rubricReady ? "Saved" : "Enter or paste your grading rubric"}
        />
        <StepCard
          step={2}
          title="Reference essays"
          complete={refCount >= 3}
          inProgress={refCount > 0 && refCount < 3}
          description={`${refCount} added${refCount > 0 ? ` — ${calibrationQuality.msg.split('.')[0]}` : ""}`}
        />
        <StepCard
          step={3}
          title="Ready to grade"
          complete={rubricReady && refCount >= 3}
          description={
            rubricReady && refCount >= 3
              ? "Head to the Grade page →"
              : "Complete steps 1 and 2 first"
          }
          link={rubricReady && refCount >= 3 ? "/grade" : undefined}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Grading rubric
              </CardTitle>
              <CardDescription>
                The criteria you grade against. Paste from your syllabus, an existing
                rubric, or write fresh.
              </CardDescription>
            </div>
            {!rubricText && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRubricText(SAMPLE_RUBRIC)}
              >
                Use sample
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={rubricText}
            onChange={(e) => setRubricText(e.target.value)}
            placeholder="e.g., Argumentation (30 pts): A clear, defensible thesis…"
            rows={9}
            className="font-mono text-sm"
          />
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div className="space-y-1.5">
              <Label htmlFor="max-score" className="text-xs">Max score (for analytics)</Label>
              <Input
                id="max-score"
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value) || 100)}
                className="w-28"
              />
            </div>
            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-xs text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved
                </span>
              )}
              <Button onClick={handleSaveRubric} disabled={!rubricText.trim() || saving}>
                {saving ? "Saving…" : "Save rubric"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileStack className="h-4 w-4 text-primary" />
                Reference essays
                <Badge variant={calibrationQuality.color} className="ml-1">
                  {refCount} added · {calibrationQuality.level}
                </Badge>
              </CardTitle>
              <CardDescription>{calibrationQuality.msg}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <EssayInput showGrade onAdd={() => {}} onAddGraded={async (e) => {
            if (!sessionId) return;
            await addReference({
              sessionId,
              title: e.title,
              content: e.content,
              professorGrade: e.grade,
              professorFeedback: e.feedback,
            });
          }} />

          {refCount === 0 ? (
            <div className="rounded-md border border-dashed border-border p-6 text-center">
              <AlertCircle className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No reference essays yet. Add at least 3 to calibrate the AI.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Added references
              </div>
              {references?.map((essay) => (
                <div
                  key={essay._id}
                  className="flex items-start gap-3 rounded-md border border-border bg-card p-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {essay.title}
                      </span>
                      <Badge variant="outline">{essay.professorGrade}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {essay.content.slice(0, 200)}
                      {essay.content.length > 200 ? "…" : ""}
                    </p>
                    {essay.professorFeedback && (
                      <p className="text-xs text-muted-foreground/80 italic mt-1.5 line-clamp-1">
                        "{essay.professorFeedback}"
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEssay({ essayId: essay._id })}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {rubricReady && refCount >= 3 && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-emerald-900">
                  Ready to grade
                </div>
                <p className="text-xs text-emerald-700">
                  Your rubric and references are set. Upload essays to grade or validate accuracy first.
                </p>
              </div>
              <Link to="/evaluate">
                <Button variant="outline" size="sm">
                  Validate first
                </Button>
              </Link>
              <Link to="/grade">
                <Button size="sm">
                  <Sparkles className="h-4 w-4" />
                  Grade essays
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
  complete,
  inProgress,
  link,
}: {
  step: number;
  title: string;
  description: string;
  complete?: boolean;
  inProgress?: boolean;
  link?: string;
}) {
  const content = (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        complete
          ? "border-emerald-200 bg-emerald-50/40"
          : inProgress
            ? "border-amber-200 bg-amber-50/40"
            : "border-border bg-card"
      } ${link ? "hover:border-primary cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div
          className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${
            complete
              ? "bg-emerald-600 text-white"
              : inProgress
                ? "bg-amber-500 text-white"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : step}
        </div>
      </div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
    </div>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}

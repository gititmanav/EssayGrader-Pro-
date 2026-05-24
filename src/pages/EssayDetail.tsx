import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Save,
  Sparkles,
  Brain,
  ListTree,
} from "lucide-react";

export function EssayDetail() {
  const { essayId } = useParams<{ essayId: string }>();
  const navigate = useNavigate();
  const essay = useQuery(
    api.essays.get,
    essayId ? { essayId: essayId as Id<"essays"> } : "skip"
  );
  const approve = useMutation(api.essays.approve);
  const override = useMutation(api.essays.overrideGrade);

  const [editing, setEditing] = useState(false);
  const [adjGrade, setAdjGrade] = useState("");
  const [adjFeedback, setAdjFeedback] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (essay) {
      setAdjGrade(essay.professorAdjustedGrade ?? essay.aiGrade ?? "");
      setAdjFeedback(essay.professorAdjustedFeedback ?? essay.aiFeedback ?? "");
      setNotes(essay.professorNotes ?? "");
    }
  }, [essay?._id]);

  if (!essay) {
    return (
      <div className="p-12 text-center text-sm text-muted-foreground">
        Loading essay…
      </div>
    );
  }

  if (essay.status !== "complete") {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="p-12 text-center">
          <p className="text-sm text-muted-foreground">
            This essay is {essay.status}. Come back when it's complete.
          </p>
        </div>
      </div>
    );
  }

  async function handleApprove() {
    if (!essay) return;
    await approve({ essayId: essay._id });
  }

  async function handleSaveOverride() {
    if (!essay) return;
    await override({
      essayId: essay._id,
      adjustedGrade:
        adjGrade !== essay.aiGrade ? adjGrade : undefined,
      adjustedFeedback:
        adjFeedback !== essay.aiFeedback ? adjFeedback : undefined,
      notes: notes.trim() || undefined,
    });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const finalGrade = essay.professorAdjustedGrade ?? essay.aiGrade;
  const adjusted = !!essay.professorAdjustedGrade;
  const approved = essay.professorApproved === true;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <BackLink />
        <div className="flex items-center gap-2">
          {!approved && !editing && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Edit3 className="h-4 w-4" />
              Adjust
            </Button>
          )}
          {!approved && (
            <Button onClick={handleApprove}>
              <CheckCircle2 className="h-4 w-4" />
              Approve AI grade
            </Button>
          )}
          {approved && (
            <Badge variant="success" className="text-sm py-1 px-3">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Approved
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <h2 className="text-2xl font-semibold tracking-tight truncate">
          {essay.title}
        </h2>
        {adjusted && (
          <Badge variant="warning">
            Adjusted from AI grade {essay.aiGrade}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="lg:sticky lg:top-20 lg:self-start">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              Essay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-foreground max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin pr-2">
              {essay.content}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Grade
                </CardTitle>
                {essay.aiConfidence !== undefined && (
                  <Badge variant="outline">
                    AI confidence {(essay.aiConfidence * 100).toFixed(0)}%
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <div className="space-y-1.5">
                  <Label>Adjusted grade</Label>
                  <Input
                    value={adjGrade}
                    onChange={(e) => setAdjGrade(e.target.value)}
                    className="text-lg font-semibold"
                  />
                </div>
              ) : (
                <div className="text-5xl font-semibold tabular-nums">
                  {finalGrade}
                </div>
              )}

              <Separator />

              <div className="space-y-1.5">
                <Label>Feedback for student</Label>
                {editing ? (
                  <Textarea
                    value={adjFeedback}
                    onChange={(e) => setAdjFeedback(e.target.value)}
                    rows={8}
                  />
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                    {essay.professorAdjustedFeedback ?? essay.aiFeedback}
                  </p>
                )}
              </div>

              {editing && (
                <div className="space-y-1.5">
                  <Label>Notes (private — not shown to student)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g., 'This student typically struggles with thesis — this is improvement.'"
                  />
                </div>
              )}

              {editing && (
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveOverride}>
                    <Save className="h-4 w-4" />
                    Save adjustments
                  </Button>
                </div>
              )}
              {saved && (
                <div className="text-xs text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Adjustments saved
                </div>
              )}
            </CardContent>
          </Card>

          {essay.aiCriteriaBreakdown && essay.aiCriteriaBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTree className="h-4 w-4 text-primary" />
                  Criterion-by-criterion breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {essay.aiCriteriaBreakdown.map((c, idx) => (
                    <div
                      key={idx}
                      className="rounded-md border border-border p-3 bg-card"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-sm font-medium">{c.criterion}</div>
                        <Badge variant="default">{c.score}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {c.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {essay.aiReasoning && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  AI reasoning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {essay.aiReasoning}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  function BackLink() {
    return (
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
    );
  }
}

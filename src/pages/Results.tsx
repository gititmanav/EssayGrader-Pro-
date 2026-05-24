import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSession } from "@/lib/session";
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
import { EmptyState } from "@/components/ui/empty";
import {
  CheckCircle2,
  Edit3,
  Download,
  GraduationCap,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { downloadCSV, formatRelativeTime } from "@/lib/utils";

export function Results() {
  const { sessionId } = useSession();
  const essays = useQuery(
    api.essays.listByType,
    sessionId ? { sessionId, type: "ungraded" as const } : "skip"
  );
  const approve = useMutation(api.essays.approve);

  if (!sessionId) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Pick or create a session first"
        description="Select a session to view its grading results."
      />
    );
  }

  const completed = (essays ?? []).filter((e) => e.status === "complete");

  function handleExport() {
    if (completed.length === 0) return;
    const rows = completed.map((e) => ({
      essay: e.title,
      final_grade: e.professorAdjustedGrade ?? e.aiGrade ?? "",
      ai_grade: e.aiGrade ?? "",
      ai_confidence: e.aiConfidence ? (e.aiConfidence * 100).toFixed(0) + "%" : "",
      professor_approved: e.professorApproved ? "yes" : "no",
      adjusted: e.professorAdjustedGrade ? "yes" : "no",
      notes: e.professorNotes ?? "",
      feedback: e.professorAdjustedFeedback ?? e.aiFeedback ?? "",
    }));
    downloadCSV(rows, `grades-${sessionId}-${Date.now()}.csv`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Review & override</p>
          <h2 className="text-2xl font-semibold tracking-tight">Results</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Review the AI's grades. Approve, adjust, or edit feedback. The AI is
            an assistant — your final say is what counts.
          </p>
        </div>
        <Button onClick={handleExport} disabled={completed.length === 0} variant="outline">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {completed.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No graded essays yet"
          description="Once you grade essays, they'll show up here for review."
          action={
            <Link to="/grade">
              <Button>
                <Sparkles className="h-4 w-4" />
                Go to Grade
              </Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{completed.length} essays graded</CardTitle>
            <CardDescription>
              Click any essay to review the full feedback and override.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border -mx-6">
              {completed.map((essay) => {
                const finalGrade = essay.professorAdjustedGrade ?? essay.aiGrade;
                const adjusted = !!essay.professorAdjustedGrade;
                const approved = essay.professorApproved === true;
                return (
                  <Link
                    to={`/essays/${essay._id}`}
                    key={essay._id}
                    className="block px-6 py-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">
                            {essay.title}
                          </span>
                          {approved && (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Approved
                            </Badge>
                          )}
                          {adjusted && (
                            <Badge variant="warning" className="gap-1">
                              <Edit3 className="h-3 w-3" />
                              Adjusted
                            </Badge>
                          )}
                          {!approved && !adjusted && (
                            <Badge variant="outline">Awaiting review</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {essay.aiFeedback}
                        </p>
                        <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-3">
                          {essay.gradedAt && (
                            <span>graded {formatRelativeTime(essay.gradedAt)}</span>
                          )}
                          {essay.aiConfidence !== undefined && (
                            <span>
                              AI confidence: {(essay.aiConfidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-semibold tabular-nums">
                          {finalGrade}
                        </div>
                        {adjusted && (
                          <div className="text-[10px] text-muted-foreground">
                            AI: {essay.aiGrade}
                          </div>
                        )}
                      </div>
                      {!approved && !adjusted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            approve({ essayId: essay._id });
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

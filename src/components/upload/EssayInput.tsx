import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EssayInputProps {
  onAdd: (essay: { title: string; content: string }) => void;
  showGrade?: boolean;
  onAddGraded?: (essay: {
    title: string;
    content: string;
    grade: string;
    feedback?: string;
  }) => void;
  compact?: boolean;
}

export function EssayInput({
  onAdd,
  showGrade,
  onAddGraded,
  compact,
}: EssayInputProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTitle("");
    setContent("");
    setGrade("");
    setFeedback("");
  }

  function handleAdd() {
    if (!title.trim() || !content.trim()) return;
    if (showGrade) {
      if (!grade.trim() || !onAddGraded) return;
      onAddGraded({
        title: title.trim(),
        content: content.trim(),
        grade: grade.trim(),
        feedback: feedback.trim() || undefined,
      });
    } else {
      onAdd({ title: title.trim(), content: content.trim() });
    }
    reset();
  }

  async function handleFile(file: File) {
    if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ""));
    if (file.type === "application/pdf") {
      alert(
        "PDF upload: copy/paste the text for the demo. (Full PDF parsing works via the S3 + serverless flow described in the README — local-only mode requires the text directly.)"
      );
      return;
    }
    const text = await file.text();
    setContent(text);
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-5 space-y-4",
        compact && "p-4 space-y-3"
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="essay-title">Essay title / student ID</Label>
          <Input
            id="essay-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Student #042 — On Bourdieu"
          />
        </div>
        {showGrade && (
          <div className="space-y-1.5">
            <Label htmlFor="essay-grade">Instructor grade</Label>
            <Input
              id="essay-grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g., B+ or 87/100"
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="essay-content">Essay text</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileRef.current?.click()}
            className="text-xs h-7"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload .txt
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.docx,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </div>
        <Textarea
          id="essay-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste the full essay text here…"
          rows={compact ? 5 : 8}
        />
      </div>

      {showGrade && (
        <div className="space-y-1.5">
          <Label htmlFor="essay-feedback">
            Instructor feedback{" "}
            <span className="font-normal text-muted-foreground">(optional, helps calibration)</span>
          </Label>
          <Textarea
            id="essay-feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What did you tell the student about this grade?"
            rows={3}
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {(title || content) && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={
            !title.trim() ||
            !content.trim() ||
            (showGrade && !grade.trim())
          }
        >
          <FileText className="h-4 w-4" />
          {showGrade ? "Add reference essay" : "Add essay"}
        </Button>
      </div>
    </div>
  );
}

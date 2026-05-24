import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  sessionId: Id<"sessions">;
  sessionName: string;
  onClose: () => void;
  onDeleted: (deletedId: Id<"sessions">) => void;
};

export function DeleteSessionDialog({
  sessionId,
  sessionName,
  onClose,
  onDeleted,
}: Props) {
  const removeSession = useMutation(api.sessions.remove);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches = typed.trim() === sessionName.trim();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleDelete() {
    if (!matches || busy) return;
    setBusy(true);
    setError(null);
    try {
      await removeSession({ sessionId });
      onDeleted(sessionId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete session."
      );
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-start gap-3 p-5 border-b border-border">
          <div className="h-9 w-9 shrink-0 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
            <AlertTriangle className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-foreground">
              Delete this session?
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 truncate">
              {sessionName}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 -m-1 rounded"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-3 text-xs text-red-900 dark:text-red-200 leading-relaxed">
            <div className="font-semibold mb-1">This cannot be undone.</div>
            The following will be permanently removed:
            <ul className="list-disc list-inside mt-1.5 space-y-0.5">
              <li>The session</li>
              <li>Its rubric</li>
              <li>All essays in this session (reference, ungraded, and holdout)</li>
              <li>All AI grades, instructor reviews, and validation results</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground block">
              Type{" "}
              <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">
                {sessionName}
              </span>{" "}
              to confirm:
            </label>
            <Input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Session name…"
              disabled={busy}
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches) handleDelete();
              }}
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 dark:text-red-400">{error}</div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 pb-5">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={busy}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!matches || busy}
            size="sm"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            Delete session
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSession } from "@/lib/session";
import { ChevronDown, Plus, Trash2, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteSessionDialog } from "./DeleteSessionDialog";
import type { Id } from "../../../convex/_generated/dataModel";

export function SessionPicker() {
  const sessions = useQuery(api.sessions.list);
  const createSession = useMutation(api.sessions.create);
  const { sessionId, setSessionId } = useSession();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{
    id: Id<"sessions">;
    name: string;
  } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessions) return;
    if (sessions.length === 0) {
      if (sessionId) setSessionId(null);
      return;
    }
    const stillExists = sessions.some((s) => s._id === sessionId);
    if (!sessionId || !stillExists) {
      setSessionId(sessions[0]._id);
    }
  }, [sessions, sessionId, setSessionId]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = sessions?.find((s) => s._id === sessionId);

  async function handleCreate() {
    if (!newName.trim()) return;
    const id = await createSession({ name: newName.trim() });
    setSessionId(id);
    setNewName("");
    setCreating(false);
    setOpen(false);
  }

  function handleDeleted(deletedId: Id<"sessions">) {
    if (sessionId === deletedId) setSessionId(null);
    setPendingDelete(null);
  }

  return (
    <>
      <div ref={ref} data-tour="session-picker" className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-accent transition-colors text-sm"
        >
          <span className="text-muted-foreground text-xs">Session:</span>
          <span className="font-medium text-foreground max-w-[200px] truncate">
            {current?.name ?? "None"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-md shadow-lg z-50 overflow-hidden">
            <div className="max-h-72 overflow-y-auto scrollbar-thin">
              {sessions?.map((s) => {
                const isActive = s._id === sessionId;
                return (
                  <div
                    key={s._id}
                    className={`group flex items-center text-sm transition-colors ${
                      isActive ? "bg-primary/5" : "hover:bg-accent"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSessionId(s._id);
                        setOpen(false);
                      }}
                      className={`flex-1 min-w-0 text-left px-3 py-2 flex items-center gap-2 ${
                        isActive ? "text-primary font-medium" : ""
                      }`}
                    >
                      {isActive ? (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <span className="w-3.5 shrink-0" />
                      )}
                      <span className="truncate">{s.name}</span>
                      {s.isSeed && (
                        <span className="ml-auto text-[9px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                          Demo
                        </span>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete({ id: s._id, name: s.name });
                        setOpen(false);
                      }}
                      className="p-2 mr-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-opacity"
                      aria-label={`Delete ${s.name}`}
                      title="Delete session"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
              {sessions?.length === 0 && (
                <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                  No sessions yet
                </div>
              )}
            </div>
            <div className="border-t border-border p-2">
              {creating ? (
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Marketing 101 — Midterm"
                    className="text-xs h-8"
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                  <Button size="sm" onClick={handleCreate} className="h-8">
                    Add
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCreating(true)}
                  className="w-full justify-start h-8 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New session
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {pendingDelete && (
        <DeleteSessionDialog
          sessionId={pendingDelete.id}
          sessionName={pendingDelete.name}
          onClose={() => setPendingDelete(null)}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}

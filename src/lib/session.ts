import { createContext, useContext } from "react";
import type { Id } from "../../convex/_generated/dataModel";

interface SessionContextValue {
  sessionId: Id<"sessions"> | null;
  setSessionId: (id: Id<"sessions"> | null) => void;
}

export const SessionContext = createContext<SessionContextValue>({
  sessionId: null,
  setSessionId: () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

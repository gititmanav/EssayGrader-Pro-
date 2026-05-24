import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

const convex = convexUrl
  ? new ConvexReactClient(convexUrl)
  : null;

function Root() {
  if (!convex) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="max-w-xl bg-card border border-border rounded-lg p-8 shadow-sm">
          <h1 className="text-2xl font-semibold mb-3 text-foreground">
            Convex not configured
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Set <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">VITE_CONVEX_URL</code> in your <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">.env.local</code> after running{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">npx convex dev</code>.
          </p>
          <p className="text-sm text-muted-foreground">
            See <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">MANAV_TODO.md</code> for full setup instructions.
          </p>
        </div>
      </div>
    );
  }
  return (
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

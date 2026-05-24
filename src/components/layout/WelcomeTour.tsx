import { useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";

const TOUR_KEY = "essaygrader.tour.completed";

type Placement = "top" | "bottom" | "right" | "left" | "center";

type Step = {
  selector?: string;
  title: string;
  body: string;
  placement?: Placement;
  routeHint?: string;
};

const STEPS: Step[] = [
  {
    title: "Welcome to EssayGrader Pro",
    body: "Quick 60-second tour. The app calibrates an AI grader to your style using essays you've already graded — then helps you review the AI's work before it touches student records.",
    placement: "center",
  },
  {
    selector: '[data-tour="sidebar-nav"]',
    title: "Five stages, left-to-right",
    body: "Dashboard for the snapshot. Setup adds the rubric + reference essays. Grade runs the AI on new essays. Results is where you review and approve. Evaluate is the trust-building step.",
    placement: "right",
  },
  {
    selector: '[data-tour="session-picker"]',
    title: "Sessions group one assignment",
    body: "Switch between assignments here. Each session has its own rubric and calibration. Hover any session to delete it — destructive actions require typing the name to confirm.",
    placement: "bottom",
  },
  {
    selector: '[data-tour="demo-welcome"]',
    title: "Three pre-loaded demo sessions",
    body: "Marketing 101 is fully calibrated with five reference essays and two already AI-graded. Business Ethics shows a partial setup. Entrepreneurship is empty — open it to see the fresh-start state.",
    placement: "bottom",
    routeHint: "/",
  },
  {
    selector: '[data-tour="seed-control"]',
    title: "Sample data is reversible",
    body: "Load and remove the demo data freely. Loading is idempotent — won't duplicate. Removing cascades through essays, rubrics, and validation results in one click.",
    placement: "right",
  },
  {
    title: "You're ready",
    body: "Open Marketing 101 from the Dashboard to see a calibrated session. Then visit Setup → Grade → Results to see the full instructor workflow.",
    placement: "center",
  },
];

const PADDING = 8;
const TOOLTIP_OFFSET = 14;
const TOOLTIP_WIDTH = 360;

type Props = {
  replayKey: number;
};

export function WelcomeTour({ replayKey }: Props) {
  const seedStatus = useQuery(api.seed.status);
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (replayKey > 0) {
      setStepIdx(0);
      setActive(true);
    }
  }, [replayKey]);

  useEffect(() => {
    if (replayKey > 0) return;
    if (seedStatus === undefined) return;
    const done = localStorage.getItem(TOUR_KEY);
    if (done === "1") return;
    if (location.pathname !== "/") return;
    const t = window.setTimeout(() => setActive(true), 700);
    return () => window.clearTimeout(t);
  }, [seedStatus, location.pathname, replayKey]);

  const step = STEPS[stepIdx];

  useLayoutEffect(() => {
    if (!active) {
      setRect(null);
      return;
    }
    if (!step || !step.selector) {
      setRect(null);
      return;
    }
    if (step.routeHint && location.pathname !== step.routeHint) {
      navigate(step.routeHint);
    }
    let rafId = 0;

    function update() {
      const el = document.querySelector(step.selector!);
      if (!el) {
        setRect(null);
        return;
      }
      try {
        el.scrollIntoView({ block: "nearest", inline: "nearest" });
      } catch {
        // older browsers without ScrollIntoViewOptions support — ignore
      }
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setRect(el.getBoundingClientRect());
      });
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, stepIdx, step, location.pathname, navigate]);

  if (!active || !step) return null;

  function close() {
    localStorage.setItem(TOUR_KEY, "1");
    setActive(false);
    setStepIdx(0);
  }

  function next() {
    if (stepIdx >= STEPS.length - 1) {
      close();
    } else {
      setStepIdx(stepIdx + 1);
    }
  }

  function prev() {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }

  const centered = !step.selector || step.placement === "center" || !rect;
  const total = STEPS.length;
  const isLast = stepIdx === total - 1;

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none">
      {centered ? (
        <div
          className="absolute inset-0 bg-black/65 backdrop-blur-sm pointer-events-auto"
          onClick={close}
        />
      ) : (
        <Spotlight rect={rect!} onClick={close} />
      )}

      <TourTooltip
        rect={rect}
        centered={centered}
        step={step}
        stepIdx={stepIdx}
        total={total}
        isLast={isLast}
        onNext={next}
        onPrev={prev}
        onClose={close}
      />
    </div>
  );
}

function Spotlight({
  rect,
  onClick,
}: {
  rect: DOMRect;
  onClick: () => void;
}) {
  const left = Math.max(0, rect.left - PADDING);
  const top = Math.max(0, rect.top - PADDING);
  const width = rect.width + PADDING * 2;
  const height = rect.height + PADDING * 2;

  return (
    <div
      className="absolute inset-0 pointer-events-auto"
      onClick={onClick}
      style={{ background: "transparent" }}
    >
      <div
        className="absolute rounded-md transition-all duration-200 ring-2 ring-primary/70 ring-offset-2 ring-offset-background/0"
        style={{
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.65)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function TourTooltip({
  rect,
  centered,
  step,
  stepIdx,
  total,
  isLast,
  onNext,
  onPrev,
  onClose,
}: {
  rect: DOMRect | null;
  centered: boolean;
  step: Step;
  stepIdx: number;
  total: number;
  isLast: boolean;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}) {
  const { top, left, transform } = computeTooltipPosition({
    rect,
    centered,
    placement: step.placement ?? "bottom",
  });

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        top,
        left,
        transform,
        width: `${TOOLTIP_WIDTH}px`,
        maxWidth: "calc(100vw - 24px)",
      }}
    >
      <div className="rounded-lg border border-border bg-card shadow-2xl">
        <div className="flex items-start gap-3 p-4 border-b border-border">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-1 rounded mt-0.5">
            {stepIdx + 1} / {total}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground leading-snug">
              {step.title}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 -m-1 rounded hover:bg-muted transition-colors"
            aria-label="Skip tour"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-4 text-xs leading-relaxed text-muted-foreground">
          {step.body}
        </div>

        <div className="flex items-center justify-between gap-2 px-4 pb-4">
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-1.5">
            {stepIdx > 0 && (
              <button
                onClick={onPrev}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-border bg-background hover:bg-muted text-xs font-medium transition-colors"
              >
                <ChevronLeft className="h-3 w-3" />
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-colors"
            >
              {isLast ? "Done" : "Next"}
              {!isLast && <ChevronRight className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function computeTooltipPosition({
  rect,
  centered,
  placement,
}: {
  rect: DOMRect | null;
  centered: boolean;
  placement: Placement;
}): { top: string; left: string; transform: string } {
  if (centered || !rect) {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tipW = Math.min(TOOLTIP_WIDTH, vw - 24);
  const tipH = 220;

  let p = placement;
  if (p === "right" && rect.right + TOOLTIP_OFFSET + tipW > vw) p = "bottom";
  if (p === "left" && rect.left - TOOLTIP_OFFSET - tipW < 0) p = "bottom";
  if (p === "bottom" && rect.bottom + TOOLTIP_OFFSET + tipH > vh) p = "top";
  if (p === "top" && rect.top - TOOLTIP_OFFSET - tipH < 0) p = "bottom";

  let top = 0;
  let left = 0;

  switch (p) {
    case "right":
      top = clamp(rect.top + rect.height / 2 - tipH / 2, 12, vh - tipH - 12);
      left = rect.right + TOOLTIP_OFFSET;
      break;
    case "left":
      top = clamp(rect.top + rect.height / 2 - tipH / 2, 12, vh - tipH - 12);
      left = rect.left - TOOLTIP_OFFSET - tipW;
      break;
    case "top":
      top = rect.top - TOOLTIP_OFFSET - tipH;
      left = clamp(rect.left + rect.width / 2 - tipW / 2, 12, vw - tipW - 12);
      break;
    case "bottom":
    default:
      top = rect.bottom + TOOLTIP_OFFSET;
      left = clamp(rect.left + rect.width / 2 - tipW / 2, 12, vw - tipW - 12);
      break;
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
    transform: "none",
  };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

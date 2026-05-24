# EssayGrader Pro

> Calibrated AI essay grading. Few-shot the model to your style with a handful of essays you've already graded — then validate accuracy on held-out examples before you trust it on a full batch.

[![Built with](https://img.shields.io/badge/Built%20with-React%20%7C%20TypeScript%20%7C%20Convex%20%7C%20AWS%20Bedrock-2563eb)]()
[![Type-safe](https://img.shields.io/badge/TypeScript-strict-3178c6)]()
[![Backend](https://img.shields.io/badge/Backend-Convex-ee342f)]()
[![AI](https://img.shields.io/badge/Model-Amazon%20Nova%20Pro%20via%20Bedrock%20Converse-ff9900)]()

**Live demo:** *coming soon* — `[your-deployment-url]`
**One-paragraph version:** Educators spend disproportionate time on essay grading and apply standards inconsistently across a stack. This app uses **few-shot prompting** (not RAG, not fine-tuning) to teach a frontier LLM the *individual instructor's* grading style from 5–10 graded examples, then grades new essays the same way. A **blind-validation pass** on held-out essays establishes a measurable accuracy floor before the instructor trusts the AI on the rest of the batch.

---

## Why this is different

| Approach                   | What it learns                  | When it works              | Where it breaks            |
| -------------------------- | ------------------------------- | -------------------------- | -------------------------- |
| Generic prompt + rubric    | The rubric                      | Standardized assessments   | Hides instructor variance  |
| RAG over course materials  | The syllabus                    | Factual / closed-form Qs   | Essay grading isn't lookup |
| Fine-tuning per course     | The style                       | 500+ examples, stable rubric | Cost, latency, drift       |
| **Few-shot + validation** *(this app)* | **The style, in-context** | **5–10 examples, weekly assignment** | **Token cost on long essays** |

The interesting bet: the most signal in this problem is **the essays you've already graded**, not the rubric. Two instructors with the same rubric give different grades. Few-shot calibration captures that delta without the cost of fine-tuning.

---

## Live walkthrough

The deployment ships with three pre-seeded sessions so reviewers can try it without setup:

| Session                                  | State          | What it demonstrates                                                |
| ---------------------------------------- | -------------- | ------------------------------------------------------------------- |
| **Marketing 101 — Midterm Essay**        | Fully calibrated | 5 reference essays (A→D), 3 ungraded, 2 already AI-graded for review |
| **Business Ethics — Case Study**         | Partial         | Different domain, MBA-level — proves cross-subject generalization   |
| **Entrepreneurship — Pitch Evaluation**  | Empty           | Fresh-start state for the first-time setup flow                     |

A first-visit tour highlights the five pages and the key controls (60 seconds). Replayable anytime from the sidebar.

---

## Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                          BROWSER (React + Vite)                       │
│                                                                       │
│   Pages: Dashboard │ Setup │ Grade │ Results │ Evaluate │ EssayDetail │
│                            │                                          │
│           ┌────────────────┼──────────────────┐                       │
│           │   Convex React hooks (real-time)  │                       │
│           └────────────────┬──────────────────┘                       │
└────────────────────────────┼──────────────────────────────────────────┘
                             │ WebSocket (queries + mutations)
                             ▼
┌───────────────────────────────────────────────────────────────────────┐
│                            CONVEX                                     │
│                                                                       │
│   schema.ts   sessions.ts   essays.ts   rubrics.ts   evaluation.ts    │
│       │           │             │           │             │           │
│       └───────────┴─────────────┴───────────┴─────────────┘           │
│                             │                                         │
│                             ▼                                         │
│     gradeEssay.ts (Node action) ──► AWS Bedrock (Converse API)        │
│                              \                                        │
│                               └──► AWS S3 (essay file storage)        │
└───────────────────────────────────────────────────────────────────────┘
```

### Request flow — grading one essay

```
Browser            Convex              Bedrock             S3
   │                  │                   │                 │
   │ runAction        │                   │                 │
   │ gradeOne ───────►│                   │                 │
   │                  │ runQuery rubric   │                 │
   │                  │ runQuery refs     │                 │
   │                  │ markGrading       │                 │
   │                  │                   │                 │
   │                  │ ConverseCommand ─►│                 │
   │                  │ (Nova Pro)        │                 │
   │                  │                   │ inference       │
   │                  │ ◄──── JSON ───────│                 │
   │                  │                   │                 │
   │                  │ parse + clamp     │                 │
   │                  │ saveAIGrade       │                 │
   │ ◄── live update  │                   │                 │
   │  via subscription│                   │                 │
```

The browser doesn't poll. Convex pushes the grade update through the existing query subscription the moment it's written — every essay card animates from "Pending" → "Grading…" → "Complete" without any frontend retry logic.

---

## Tech stack — choices with rationale

| Layer        | Choice                                 | Why this over the alternative                                                                                                                                            |
| ------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend     | **React 18 + Vite + TypeScript**       | Vite for dev-server latency on a 1700-module project. Strict TS surfaces schema-shape mistakes against Convex's generated types.                                         |
| UI           | **Tailwind + custom shadcn-style primitives** | Hand-rolled `Button`, `Card`, `Input`, `Empty` etc. instead of `npx shadcn add` — smaller dep footprint, no untyped CLI codegen. Tailwind tokens centralize the palette. |
| DB / backend | **Convex**                             | Real-time queries push grading progress with zero frontend code. Single TS type-flow from schema → mutations → React. Zero infra to set up.                              |
| File storage | **AWS S3 with pre-signed URLs**        | Browser uploads direct to S3 — Convex never touches the file bytes. FERPA-friendly: encrypted at rest, time-limited URLs, audit logs.                                    |
| AI inference | **AWS Bedrock Converse API + Amazon Nova Pro** | Converse API is **model-agnostic** — swapping to Claude / Llama / Titan is a `BEDROCK_MODEL_ID` change, no code edit. Nova Pro is first-party (no model-access wait) and ~10× cheaper than frontier-Claude on Bedrock for similar quality on this task. |
| Auth         | (intentionally omitted)                | Single-instructor demo. A real deployment plugs in Convex Auth — schema already has session-level scoping for multi-tenant.                                              |

---

## Key design decisions

These are the choices I'd defend at a whiteboard.

#### 1. Few-shot, not RAG, not fine-tuning

| Constraint                                | Few-shot ✅          | RAG ⚠️                              | Fine-tune ⚠️           |
| ----------------------------------------- | -------------------- | ----------------------------------- | ---------------------- |
| Setup time per assignment                 | minutes              | hours (chunk + embed)               | days (data + train)    |
| Adapts to instructor style                | ✅ direct             | ❌ retrieves facts, not style        | ✅ but rigid             |
| Works with 5–10 graded essays             | ✅                   | ⚠️ undertrained                     | ❌ needs 500+            |
| Lets the instructor *see* what calibrated | ✅ (refs in prompt)  | ⚠️ retrieval is opaque               | ❌ baked into weights    |

RAG is the right pattern for grounding grades in syllabus content — that's a **future-roadmap** item, layered on top of few-shot. They're not mutually exclusive.

#### 2. Convex over Postgres + REST

The grading flow has natural concurrency (3 essays at a time), live progress updates, and a real-time UI. With Postgres I'd be writing polling endpoints or wiring server-sent events. Convex queries are reactive by default — the work shifts from plumbing to product.

Trade-off: Convex's vendor coupling. Mitigated by keeping all business logic in well-typed modules (`essays.ts`, `evaluation.ts`) that read as plain TypeScript.

#### 3. Bedrock Converse API over `InvokeModel`

`InvokeModel` requires a model-specific JSON body (Claude's `anthropic_version` field vs. Nova's `inferenceConfig` field). The Converse API normalizes both. **Result:** swapping Nova for Claude 3.5 Sonnet is one line:

```bash
npx convex env set BEDROCK_MODEL_ID "anthropic.claude-3-5-sonnet-20241022-v2:0"
```

No code change, no redeploy of the frontend, no schema migration. Matters for A/B-testing models on the same prompt.

#### 4. The blind-validation step

This is the part most "AI grader" tools skip. Before grading the unknown batch, the app holds out 2–3 of the instructor's already-graded essays, asks the AI to grade them blind (without the instructor's grade in context), and shows a side-by-side comparison with exact-match-rate / within-5-pts / within-10-pts metrics. If the AI grades poorly on essays where you know the correct answer, you find out *before* committing 90 grades.

This is the insight I underweighted in the interview that triggered this prototype.

---

## Data model

```typescript
sessions    : { name, description?, createdAt, isSeed? }
rubrics     : { sessionId → sessions, content, maxScore, gradeScale? }
essays      : { sessionId, title, content,
                type: "reference" | "ungraded" | "holdout",
                status: "pending" | "grading" | "complete" | "error",
                // calibration input
                professorGrade?, professorFeedback?,
                // AI output
                aiGrade?, aiFeedback?, aiReasoning?, aiConfidence?,
                aiCriteriaBreakdown?: [{criterion, score, comment}],
                // instructor review
                professorApproved?, professorAdjustedGrade?,
                professorAdjustedFeedback?, professorNotes?,
                s3Key?, gradedAt?, createdAt }
evaluations : { sessionId, holdoutEssayId, professorGrade, aiGrade,
                gradeMatch, gradeDifference?, createdAt }
```

Indexed by `by_session`, `by_session_and_type`, `by_session_and_status` — the three access patterns the UI actually uses.

---

## Feature matrix

| Feature                                          | Status | Notes                                                                  |
| ------------------------------------------------ | ------ | ---------------------------------------------------------------------- |
| Session setup (rubric + reference essays)        | ✅      | Wizard-style with quality indicator                                    |
| Paste-text or file upload (PDF, TXT, DOCX)       | ✅      | PDF parsed server-side via `pdf-parse`                                 |
| Few-shot AI grading                              | ✅      | Batched 3-at-a-time to respect Bedrock TPM limits                      |
| Detailed feedback + reasoning + confidence       | ✅      | Structured JSON, defensive parsing for malformed responses             |
| Per-criterion breakdown                          | ✅      | Each rubric criterion gets its own score + comment                     |
| Instructor review (approve / adjust / annotate)  | ✅      | One-click approve, override grade, edit feedback before student sees it |
| Blind-holdout validation                         | ✅      | Exact-match + within-N-pts metrics, side-by-side comparison            |
| Real-time grading progress                       | ✅      | Convex subscriptions — no polling                                      |
| Bulk CSV export for LMS upload                   | ✅      | Final grade resolves `professorAdjustedGrade ?? aiGrade`               |
| Idempotent demo seed                             | ✅      | Three pre-loaded sessions, can be removed and re-added safely          |
| First-visit guided tour                          | ✅      | Spotlight overlay with 7 steps, replayable from sidebar                |
| Delete session with typed confirmation           | ✅      | GitHub-style — must type the name to enable the destroy button         |
| LMS push (Canvas/Blackboard)                     | ⏳      | Roadmap — current export is CSV                                        |
| Bedrock Guardrails for content safety            | ⏳      | Roadmap — relevant for sensitive-topic essays                          |
| Bedrock Knowledge Bases over course materials    | ⏳      | Roadmap — RAG layer on top of few-shot                                 |
| Multi-TA consensus calibration                   | ⏳      | Roadmap — current model is one-instructor                              |

---

## Security & privacy

Essay text is student PII under FERPA in most jurisdictions. Design choices made for that:

| Concern                       | Mitigation                                                                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Files in cloud storage        | S3 with **block-all-public-access**, **server-side encryption**, **pre-signed URLs** with 1-hour TTL. Convex stores the S3 key, never the file bytes. |
| Prompts sent to a third party | AWS Bedrock **does not retain prompts or train on them** by default ([AWS data-protection FAQ](https://aws.amazon.com/bedrock/security-compliance/)). |
| Maximum-containment deployment | Same code path works against a local model (Ollama / vLLM) — only `BEDROCK_MODEL_ID` and the AWS SDK client need to swap. The grading prompt is identical. |
| Hardcoded secrets             | All credentials live in Convex env vars (`npx convex env set ...`), never in `.env.local` or source.                                                  |
| Audit trail                   | Every `aiGrade` / `professorApproved` / `professorAdjustedGrade` mutation is timestamped in Convex's built-in history.                                |

---

## Code-quality signals

Things a reviewer might check:

- **`tsc -b` passes with `strict: true`, `noImplicitAny: true`** across frontend *and* Convex backend — Convex's generated types flow into both.
- **All Convex functions validate arguments** with `v.id()`, `v.string()`, `v.union()` etc. No untyped JSON crossing the boundary.
- **No `any`s** in the AI response parser — `extractJSON` returns `ParsedGrade` (a typed shape), and every field is narrowed with `String()`, `Number()`, `Math.max/min` clamps, or `instanceof` guards before write.
- **Idempotent mutations** where it matters: `loadSampleData` checks for existing seed before inserting; `gradeAllPending` only retries `pending` or `error` essays.
- **Error containment**: a Bedrock failure on essay #4 doesn't fail essays #5–10. Each essay's status flips to `error` with the message; the user can retry individually or in bulk.
- **No partial writes**: schema field names stay stable; status transitions go `pending → grading → complete | error`, never skipping.

---

## Quick start

```bash
git clone <repo>
cd EssayGrader-Pro-
npm install

# Convex (free tier is plenty)
npx convex dev    # creates a project, prints VITE_CONVEX_URL

# Bedrock + S3 credentials (these live on Convex, not the client)
npx convex env set AWS_ACCESS_KEY_ID    "AKIA..."
npx convex env set AWS_SECRET_ACCESS_KEY "..."
npx convex env set AWS_REGION           "us-east-1"
npx convex env set S3_BUCKET            "your-bucket-name"
npx convex env set BEDROCK_MODEL_ID     "amazon.nova-pro-v1:0"

# Frontend
echo "VITE_CONVEX_URL=https://<your-deployment>.convex.cloud" > .env.local
npm run dev   # http://localhost:5173
```

**AWS prerequisites** (one-time, ~15 min): IAM user with `bedrock:InvokeModel`, `s3:PutObject`, `s3:GetObject`, `s3:ListBucket`; Amazon Nova Pro access requested in the Bedrock console (us-east-1, typically instant); S3 bucket with block-all-public-access and CORS configured for your dev origin. Full setup walk-through lives in [`HOW_TO_USE.md`](HOW_TO_USE.md).

---

## Roadmap

Ordered by leverage:

1. **Bedrock Knowledge Bases over course materials** — RAG layer that grounds grades in the syllabus and assigned readings. The cleanest place to attach this is a `getRelevantContext(rubric, essay)` call inside `buildUserPrompt` — the few-shot frame doesn't change.
2. **LMS push** — Canvas API integration. The CSV export already maps cleanly to Canvas's `csv-import` format; the remaining work is OAuth.
3. **Multi-TA consensus calibration** — if 3 TAs each grade 10 sample essays, learn a *consensus* grading function that minimizes inter-rater variance. Useful for large lecture courses where consistency across TAs is the actual bottleneck.
4. **Bedrock Guardrails** — content-safety filtering for sensitive-topic essays (politics, mental health). Configured externally, no code change.
5. **On-prem mode** — a small env flag flips the inference client from Bedrock to a configurable local endpoint (Ollama / vLLM). Same prompt, same response parser, zero student data leaves the institution's network.

---

## What I learned building this

A few things I'd write down for the next person doing a calibrated-LLM project:

- **The validation step matters more than the grading step.** Without exact-match-rate visible up front, instructors don't trust the AI — and trust is the actual product.
- **Few-shot is sensitive to grading-scale leakage.** If reference essays say "B+" and the new essay's rubric is 0–100, the model defaults to letter grades anyway. Always pin the grade scale explicitly in the prompt.
- **Reasoning > confidence.** A confidence score is hard to ground; a step-by-step reasoning trace is auditable. Both go in the response, but reasoning is what unlocks the override decision.
- **The Converse API is underused.** Most Bedrock tutorials show `InvokeModel`. Converse is strictly better for any app that may want to swap models.

---

## License

MIT — see [LICENSE](LICENSE).

## Author

**Manav Kaneria** — MS Computer Science, Northeastern University.

# How to use EssayGrader Pro

A walk-through for instructors. ~10 minutes to read, ~20 minutes to actually grade your first batch.

> **Skip ahead:**
> [Demo tour](#0-first-visit) · [Create a session](#1-create-a-session) · [Add a rubric](#2-add-a-rubric) · [Add reference essays](#3-add-reference-essays) · [Validate](#4-validate-the-ai-on-known-essays) · [Grade](#5-grade-the-real-batch) · [Review](#6-review-approve-override) · [Export](#7-export-to-your-lms) · [Self-host](#self-host-deployment)

---

## 0. First visit

When you open the app for the first time, you'll see a guided tour that highlights every page in the app. It takes about a minute. You can replay it anytime from the sidebar (**Replay welcome tour** at the bottom).

If sample data is loaded (three sessions: Marketing 101, Business Ethics, Entrepreneurship), the Dashboard surfaces them at the top with one-click switching. **Marketing 101** is the recommended starting point — it's the most fully calibrated session, useful as a reference for what a "ready" state looks like.

---

## The mental model

Five pages, one direction:

```
Setup ──► Evaluate ──► Grade ──► Results ──► Export
  │           │           │          │
  └─ rubric   └─ test     └─ run AI  └─ approve / override
     + 5–10     accuracy    on new      one essay at a time
     graded     on known    essays
     essays    essays
```

You'll spend most time in **Setup** (one-time per assignment) and **Results** (per-batch).

---

## 1. Create a session

A *session* is one assignment — one rubric, one set of reference essays, one batch of student work. You'll create one per assignment.

1. Top-right header → **Session: …** dropdown → **New session**.
2. Name it something specific: `Marketing 350 — Final Paper` is better than `Final`.
3. The session becomes active immediately.

> **Tip:** keep names instructor-readable. The session name is what you see in the dropdown three weeks later when you can't remember which course this was.

You can delete any session by hovering it in the dropdown and clicking the trash icon. Deletion is destructive — you'll be required to type the session name to confirm, and it cascades through every essay, rubric, and validation result attached to that session.

---

## 2. Add a rubric

Navigate to **Setup** in the sidebar.

| Field           | What goes here                                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Rubric text     | The full rubric, free-form. Bullet points, sections, point values — copy/paste from your course materials.                       |
| Max score       | Total points (`100` is the default and what most rubrics use).                                                                   |
| Grade scale     | Optional. Tell the AI what scale to output: `A/B/C/D/F`, `0-100`, `1-7`, `Pass/Fail+`, etc. Defaults to inferring from references. |

**The rubric is a baseline.** The reference essays are what actually teach the AI *your* standards.

### What makes a good rubric for this tool

- Specify **criteria** explicitly: "thesis clarity", "evidence quality", "structure", etc. The AI will use these in its per-criterion breakdown.
- Point distributions matter: a 30/25/20/15/10 split tells the model which dimensions to weight more.
- Avoid vague terms ("good writing") unless your reference essays make them concrete by example.

---

## 3. Add reference essays

These are essays you've **already graded**. You'll typically add 5–10. Three is the bare minimum; more references improve calibration on hard cases but cost more tokens per grading call.

For each reference essay:

1. **Paste or upload** — the upload zone accepts `.txt`, `.pdf`, `.docx`. Direct paste also works.
2. **Title** — student identifier or essay title. Avoid real names; use `Student #04421` or similar.
3. **Your grade** — exactly what you gave the student. Use the same scale you'll want the AI to use (e.g., `87/100` or `B+`).
4. **Your feedback** — optional but high-leverage. The feedback explains *why* you gave that grade — exactly what the AI needs to mirror your style.

### The references should span the grade range

Add at least one of each rough grade band: A, B, C, D. The model learns the **gradient** between grades, not just absolute scoring. A session with five A-grade reference essays will grade everything as an A.

### Quality indicator

The Setup page shows a calibration-readiness indicator. Green at 5+ references; amber 3–4; red below 3. Don't proceed to grading with red.

---

## 4. Validate the AI on known essays

This is the step most "AI grader" tools skip. **Do not skip it.**

Navigate to **Evaluate** in the sidebar.

1. Click **Run validation**. The app randomly holds out 2–3 of your reference essays.
2. The AI re-grades them **blind** — without seeing your grade for those specific essays.
3. The results page shows a side-by-side comparison: your grade vs. AI grade, with three accuracy metrics:

| Metric              | What it tells you                                  | What's acceptable                           |
| ------------------- | -------------------------------------------------- | ------------------------------------------- |
| Exact match rate    | % where the AI grade matches yours character-for-character | Stretch goal; 30–50% is realistic            |
| Within 5 pts        | % where the AI grade is within ±5 points of yours  | Should be ≥70% before you trust the batch   |
| Within 10 pts       | % within ±10 points                                | Should be ≥90% before trusting the batch    |

If the numbers are weaker than these floors, **the model isn't well-calibrated**. Most fixes:

- Add 2–3 more reference essays spanning the grade range.
- Pin the grade scale more explicitly in the rubric ("Output one of: A, B, C, D, F").
- Re-read the references — sometimes a flat C that's really a B+ is the actual problem.

### Important: rerun validation when you change references

Validation is point-in-time. If you add or edit a reference essay, the previous validation is stale.

---

## 5. Grade the real batch

Navigate to **Grade** in the sidebar.

1. **Upload or paste** the ungraded student essays. Same input as Setup — bulk paste, file upload, or one at a time.
2. Each essay appears as a card in **Pending** state.
3. Click **Grade all pending**. The AI works through the batch, 3 essays at a time (to respect Bedrock rate limits).
4. Watch the cards progress: **Pending** → **Grading…** → **Complete**. The UI updates in real time — no need to refresh.

### What to expect on timing

| Batch size | Approx. wall time |
| ---------- | ----------------- |
| 5 essays   | ~30 s             |
| 25 essays  | ~3 min            |
| 90 essays  | ~10 min           |

The bottleneck is Bedrock latency, not the UI. You can leave the page; results persist.

### If something errors

A single essay failing doesn't fail the batch. Errored essays show with a red badge and the error message. Click **Retry** on the card, or click **Grade all pending** again — it only re-runs `pending` and `error` essays, never re-grades a `complete` one.

---

## 6. Review, approve, override

Navigate to **Results**. Each graded essay is a row; click to open the **EssayDetail** view.

The detail view has the essay on the left and the AI's output on the right:

- **Grade** — what the AI assigned
- **Feedback** — 2–3 paragraphs for the student
- **Reasoning** — step-by-step explanation referencing the rubric and the reference essays
- **Confidence** — 0.0–1.0; treat <0.7 as "look closely"
- **Per-criterion breakdown** — each rubric criterion scored separately

You have three actions:

| Action       | What happens                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| **Approve**  | One click. Marks the AI's grade and feedback as final. The exported grade will be `aiGrade`.          |
| **Adjust**   | Override the grade and/or the feedback. The exported grade becomes `professorAdjustedGrade`.          |
| **Add notes** | Private notes (for your records, not visible to students). Useful for tracking patterns across the batch. |

**Bulk approve** is available on the Results list page — useful when you've eyeballed several essays and want to clear the easy ones in one click.

### Calibration tip

If you find yourself adjusting more than ~20% of grades in the same direction (e.g., always raising B+ → A-), your reference essays may underrepresent that grade band. Add 1–2 more A-band references and rerun validation to confirm.

---

## 7. Export to your LMS

From the **Results** page → **Export grades as CSV**.

The CSV includes:

| Column            | Source                                                       |
| ----------------- | ------------------------------------------------------------ |
| `title`           | Essay title (your student identifier)                        |
| `final_grade`     | `professorAdjustedGrade ?? aiGrade` — whichever is authoritative |
| `ai_grade`        | The AI's original grade (kept for audit)                     |
| `professor_approved` | `yes` / `no`                                              |
| `adjusted`        | `yes` / `no` (whether you overrode)                          |
| `notes`           | Your private notes                                           |
| `feedback`        | The final feedback the student will see                      |

Canvas, Blackboard, and Brightspace all accept CSV import with column mapping. LMS-native API push is on the roadmap.

---

## Sample data

The three pre-loaded sessions (Marketing 101, Business Ethics, Entrepreneurship) are managed from the sidebar:

- **Load Sample Data** — populates three demo sessions, **idempotent** (won't duplicate if already loaded).
- **Remove Sample Data** — cascades through all seed sessions, essays, rubrics, and validation results. Your own sessions are untouched.

Useful for resetting to a clean state if you've been experimenting.

---

## Privacy notes

Essay text is student PII under FERPA in most jurisdictions. Practical notes:

- All AI inference goes through AWS Bedrock, which **does not retain prompts or train on them** by default.
- Essay files in S3 are encrypted at rest, behind block-all-public-access, with pre-signed URLs that expire after one hour.
- The grading code path is model-agnostic via Bedrock's Converse API — if your institution requires fully-local inference, point `BEDROCK_MODEL_ID` at a local Ollama / vLLM endpoint and the rest of the app works unchanged.
- Avoid putting real student names in essay titles. The app stores whatever you upload.

---

## Self-host deployment

### Prerequisites

- AWS account with Bedrock access (us-east-1 recommended)
- Convex account (free tier)
- Node 20+

### Step-by-step

```bash
# 1. Clone and install
git clone <repo> && cd EssayGrader-Pro-
npm install

# 2. Convex setup
npx convex dev         # creates a project, prints your deployment URL
# Convex prints: VITE_CONVEX_URL=https://<your-deployment>.convex.cloud

# 3. AWS environment (stored on Convex, never client-side)
npx convex env set AWS_ACCESS_KEY_ID    "AKIA..."
npx convex env set AWS_SECRET_ACCESS_KEY "..."
npx convex env set AWS_REGION           "us-east-1"
npx convex env set S3_BUCKET            "essaygrader-uploads-<your-suffix>"
npx convex env set BEDROCK_MODEL_ID     "amazon.nova-pro-v1:0"

# 4. Frontend env
echo "VITE_CONVEX_URL=https://<your-deployment>.convex.cloud" > .env.local

# 5. Run
npm run dev   # http://localhost:5173
```

### AWS IAM policy (minimum)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": ["bedrock:InvokeModel"],          "Resource": "*" },
    { "Effect": "Allow", "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::essaygrader-uploads-*/*" },
    { "Effect": "Allow", "Action": ["s3:ListBucket"],                "Resource": "arn:aws:s3:::essaygrader-uploads-*" }
  ]
}
```

### S3 bucket CORS

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedOrigins": ["http://localhost:5173", "https://your-domain.example.com"],
    "ExposeHeaders": []
  }
]
```

### Bedrock model access

In the Bedrock console (us-east-1) → **Model access** → request **Amazon Nova Pro**. AWS first-party models like Nova are approved instantly. (To use Claude instead: request **Claude 3.5 Sonnet v2**, then `npx convex env set BEDROCK_MODEL_ID "anthropic.claude-3-5-sonnet-20241022-v2:0"` — no code change.)

### Deploy to production

```bash
# Convex production deployment
npx convex deploy
# Mirror env vars to prod
npx convex env set --prod BEDROCK_MODEL_ID "amazon.nova-pro-v1:0"
# (repeat for AWS_* and S3_BUCKET)

# Frontend — works on any Vite-compatible host (Vercel, Netlify, Cloudflare Pages)
# Set VITE_CONVEX_URL to your prod deployment URL in the host's env.
```

---

## Troubleshooting

| Symptom                                            | Likely cause                                           | Fix                                                         |
| -------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| "No reference essays found" when grading           | You haven't added references for this session yet      | Setup → add at least 3 reference essays                     |
| Every essay errors with "AWS credentials not configured" | Convex env vars not set                          | Re-run `npx convex env set AWS_ACCESS_KEY_ID …` etc.       |
| Bedrock returns "AccessDeniedException"            | Model access not approved in Bedrock console           | Bedrock console → Model access → request Nova Pro           |
| File upload fails with CORS error                  | S3 bucket CORS doesn't include your origin             | Update bucket CORS to include `http://localhost:5173`       |
| Grades drift consistently in one direction         | Reference essays underrepresent that grade band        | Add 1–2 references in the underrepresented band, rerun validation |
| Validation accuracy is poor                        | Rubric is vague, or references span too narrow a range | Tighten rubric, add references spanning A→D                 |
| App auto-selects an empty session                  | Old session ID in localStorage points at a deleted one | Will auto-recover on next page load                         |

---

## Keyboard & gestures

- **Esc** — close the welcome tour, modals, or dropdowns
- **Enter** in the typed-confirmation field — equivalent to clicking Delete (only fires when the name matches exactly)
- **Click outside** any modal or dropdown — closes it

---

That's the whole app. If something's confusing, that's a UX bug — feel free to open an issue.

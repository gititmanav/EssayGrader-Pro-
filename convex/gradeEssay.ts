"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

type ReferenceInput = { content: string; grade: string; feedback?: string };

type CriterionBreakdown = {
  criterion: string;
  score: string;
  comment: string;
};

type ParsedGrade = {
  grade?: unknown;
  feedback?: unknown;
  reasoning?: unknown;
  confidence?: unknown;
  criteriaBreakdown?: unknown;
};

const SYSTEM_PROMPT = `You are an expert teaching assistant helping an instructor grade student essays.
You have been calibrated to this instructor's grading style by studying their previously graded examples.

Your task:
1. Analyze the grading rubric AND the instructor's graded examples to understand their standards, expectations, and grading patterns.
2. Grade the new essay following the SAME standards and patterns the instructor uses.
3. Provide detailed, constructive feedback the student can learn from (reference specific passages).
4. Explain your reasoning step by step.
5. Assign a confidence score (0.0-1.0) reflecting how certain you are about the grade.

CRITICAL RULES:
- Match the instructor's grading style, not a generic standard.
- If the instructor tends to grade strictly on argumentation but leniently on grammar, follow that pattern.
- Your grade should be what THIS instructor would give, not what an average instructor would give.
- Always respond with VALID JSON ONLY — no markdown fences, no prose around it.
- Use exactly the same grade scale the instructor uses in the reference examples (letter grades, percentages, etc.).
`;

function buildUserPrompt(opts: {
  rubricText: string;
  references: Array<{
    content: string;
    grade: string;
    feedback?: string;
  }>;
  essayContent: string;
  essayTitle: string;
}): string {
  const refsBlock = opts.references
    .map(
      (ref, i) => `
### Reference Essay ${i + 1}
**Essay:**
${ref.content}

**Instructor's Grade:** ${ref.grade}
**Instructor's Feedback:** ${ref.feedback || "(none provided)"}
`
    )
    .join("\n");

  return `## Grading Rubric
${opts.rubricText || "(No explicit rubric — infer the criteria from the reference essays.)"}

## Reference Essays (Instructor's Graded Examples)
These show how the instructor grades. Study them carefully.
${refsBlock}

## Essay to Grade
**Title:** ${opts.essayTitle}

${opts.essayContent}

## Your Response
Respond with VALID JSON ONLY in this exact shape:
{
  "grade": "the grade following the same scale as the reference essays",
  "feedback": "2-3 paragraphs of detailed, constructive feedback for the student",
  "reasoning": "step-by-step explanation of why you assigned this grade, referencing specific rubric criteria and how this essay compares to the reference essays",
  "confidence": 0.85,
  "criteriaBreakdown": [
    {"criterion": "Argument Quality", "score": "B+", "comment": "..."},
    {"criterion": "Evidence Usage", "score": "A-", "comment": "..."}
  ]
}`;
}

function getBedrockClient() {
  const region = process.env.AWS_REGION || "us-east-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      "AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in Convex env."
    );
  }
  return new BedrockRuntimeClient({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function extractJSON(text: string): ParsedGrade {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {}
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {}
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    } catch {}
  }
  throw new Error("Could not parse JSON response from model");
}

async function invokeModel(prompt: string, system: string): Promise<string> {
  const client = getBedrockClient();
  const modelId =
    process.env.BEDROCK_MODEL_ID || "amazon.nova-pro-v1:0";

  const response = await client.send(
    new ConverseCommand({
      modelId,
      messages: [
        {
          role: "user",
          content: [{ text: prompt }],
        },
      ],
      system: [{ text: system }],
      inferenceConfig: {
        maxTokens: 2500,
        temperature: 0.3,
      },
    })
  );

  const text = response.output?.message?.content?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("Unexpected Bedrock Converse response shape");
  }
  return text;
}

export const gradeOne = internalAction({
  args: { essayId: v.id("essays") },
  handler: async (ctx, args) => {
    const essay = await ctx.runQuery(api.essays.get, { essayId: args.essayId });
    if (!essay) return;
    if (essay.type !== "ungraded" && essay.type !== "holdout") return;

    await ctx.runMutation(internal.essays.markGrading, {
      essayId: args.essayId,
    });

    try {
      const rubric = await ctx.runQuery(api.rubrics.getForSession, {
        sessionId: essay.sessionId,
      });
      const refs = await ctx.runQuery(api.essays.listByType, {
        sessionId: essay.sessionId,
        type: "reference",
      });

      if (refs.length === 0) {
        throw new Error(
          "No reference essays found. Add at least one graded reference essay in Setup."
        );
      }

      const userPrompt = buildUserPrompt({
        rubricText: rubric?.content ?? "",
        references: refs.map(
          (r: Doc<"essays">): ReferenceInput => ({
            content: r.content,
            grade: r.professorGrade ?? "",
            feedback: r.professorFeedback,
          })
        ),
        essayContent: essay.content,
        essayTitle: essay.title,
      });

      const raw: string = await invokeModel(userPrompt, SYSTEM_PROMPT);
      const parsed: ParsedGrade = extractJSON(raw);

      const grade: string = String(parsed.grade ?? "");
      const feedback: string = String(parsed.feedback ?? "");
      const reasoning: string = String(parsed.reasoning ?? "");
      const confidence: number = Math.max(
        0,
        Math.min(1, Number(parsed.confidence ?? 0.7))
      );
      const breakdown: CriterionBreakdown[] | undefined = Array.isArray(
        parsed.criteriaBreakdown
      )
        ? (parsed.criteriaBreakdown as unknown[])
            .filter(
              (c: unknown): c is Record<string, unknown> =>
                !!c && typeof c === "object"
            )
            .map(
              (c: Record<string, unknown>): CriterionBreakdown => ({
                criterion: String(c.criterion ?? ""),
                score: String(c.score ?? ""),
                comment: String(c.comment ?? ""),
              })
            )
        : undefined;

      await ctx.runMutation(internal.essays.saveAIGrade, {
        essayId: args.essayId,
        aiGrade: grade,
        aiFeedback: feedback,
        aiReasoning: reasoning,
        aiConfidence: confidence,
        aiCriteriaBreakdown: breakdown,
      });
    } catch (err: unknown) {
      const message: string =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Unknown error during AI grading";
      await ctx.runMutation(internal.essays.markError, {
        essayId: args.essayId,
        errorMessage: message,
      });
    }
  },
});

export const gradeAllPending = action({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args): Promise<{ graded: number }> => {
    const essays: Doc<"essays">[] = await ctx.runQuery(api.essays.listByType, {
      sessionId: args.sessionId,
      type: "ungraded",
    });
    const pending: Doc<"essays">[] = essays.filter(
      (e: Doc<"essays">) => e.status === "pending" || e.status === "error"
    );

    const batchSize = 3;
    for (let i = 0; i < pending.length; i += batchSize) {
      const batch: Doc<"essays">[] = pending.slice(i, i + batchSize);
      await Promise.all(
        batch.map(
          (e: Doc<"essays">): Promise<null> =>
            ctx.runAction(internal.gradeEssay.gradeOne, { essayId: e._id })
        )
      );
    }

    return { graded: pending.length };
  },
});

export const gradeHoldouts = action({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args): Promise<{ graded: number }> => {
    const essays: Doc<"essays">[] = await ctx.runQuery(api.essays.listByType, {
      sessionId: args.sessionId,
      type: "holdout",
    });
    const pending: Doc<"essays">[] = essays.filter(
      (e: Doc<"essays">) => e.status === "pending" || e.status === "error"
    );

    for (const e of pending) {
      await ctx.runAction(internal.gradeEssay.gradeOne, { essayId: e._id });
    }

    return { graded: pending.length };
  },
});

export const gradeSingle = action({
  args: { essayId: v.id("essays") },
  handler: async (ctx, args): Promise<null> => {
    await ctx.runAction(internal.gradeEssay.gradeOne, {
      essayId: args.essayId,
    });
    return null;
  },
});

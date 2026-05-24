import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    isSeed: v.optional(v.boolean()),
  }),

  rubrics: defineTable({
    sessionId: v.id("sessions"),
    content: v.string(),
    extractedCriteria: v.optional(v.string()),
    maxScore: v.number(),
    gradeScale: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_session", ["sessionId"]),

  essays: defineTable({
    sessionId: v.id("sessions"),
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("reference"),
      v.literal("ungraded"),
      v.literal("holdout")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("grading"),
      v.literal("complete"),
      v.literal("error")
    ),
    errorMessage: v.optional(v.string()),

    professorGrade: v.optional(v.string()),
    professorFeedback: v.optional(v.string()),

    aiGrade: v.optional(v.string()),
    aiFeedback: v.optional(v.string()),
    aiReasoning: v.optional(v.string()),
    aiConfidence: v.optional(v.number()),
    aiCriteriaBreakdown: v.optional(
      v.array(
        v.object({
          criterion: v.string(),
          score: v.string(),
          comment: v.string(),
        })
      )
    ),

    professorApproved: v.optional(v.boolean()),
    professorAdjustedGrade: v.optional(v.string()),
    professorAdjustedFeedback: v.optional(v.string()),
    professorNotes: v.optional(v.string()),

    s3Key: v.optional(v.string()),
    gradedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_and_type", ["sessionId", "type"])
    .index("by_session_and_status", ["sessionId", "status"]),

  evaluations: defineTable({
    sessionId: v.id("sessions"),
    holdoutEssayId: v.id("essays"),
    professorGrade: v.string(),
    aiGrade: v.string(),
    gradeMatch: v.boolean(),
    gradeDifference: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),
});

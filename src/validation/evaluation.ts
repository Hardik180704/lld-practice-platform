import { z } from "zod";

export const evaluationResultSchema = z.object({
  evaluator: z.string().min(1),
  evaluatorVersion: z.string().min(1),
  overallScore: z.number().int().min(0).max(100),
  summary: z.string().min(1).max(2_000),
  criteria: z.array(
    z.object({
      criterionId: z.string().min(1),
      score: z.number().int().min(0),
      evidence: z.array(z.string().min(1)).min(1),
      concerns: z.array(z.string().min(1)),
      suggestions: z.array(z.string().min(1)).min(1),
      confidence: z.number().min(0).max(1),
    }),
  ),
});

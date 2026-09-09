import { z } from "zod";

const meaningfulText = z
  .string()
  .trim()
  .min(30, "Please provide at least 30 characters.")
  .max(12_000, "Keep each section below 12,000 characters.");

export const submitAttemptSchema = z.object({
  problemId: z.string().min(1),
  assumptions: meaningfulText,
  design: z
    .string()
    .trim()
    .min(120, "Describe your classes and interactions in at least 120 characters.")
    .max(20_000),
  tradeoffs: meaningfulText,
  edgeCases: meaningfulText,
  idempotencyKey: z.string().uuid(),
});

export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;

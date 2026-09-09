import { createHash } from "node:crypto";
import { EvaluateAttempt } from "@/application/evaluate-attempt";
import { getPrisma } from "@/infrastructure/database/prisma";
import { RubricEvaluator } from "@/infrastructure/evaluation/rubric-evaluator";
import { PrismaAttemptRepository } from "@/infrastructure/repositories/prisma-attempt-repository";
import { submitAttemptSchema } from "@/validation/submission";

const DEMO_LEARNER_ID = "demo-learner";

export async function POST(request: Request) {
  const parsed = submitAttemptSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const prisma = getPrisma();
  const input = parsed.data;
  const problemExists = await prisma.problem.count({ where: { id: input.problemId, isPublished: true } });
  if (!problemExists) return Response.json({ error: "Problem not found." }, { status: 404 });
  const existing = await prisma.attempt.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing) return Response.json({ attemptId: existing.id, status: existing.status });

  const attempt = await prisma.$transaction(async (tx) => {
    const latest = await tx.attempt.aggregate({ where: { learnerId: DEMO_LEARNER_ID, problemId: input.problemId }, _max: { version: true } });
    return tx.attempt.create({
      data: {
        learnerId: DEMO_LEARNER_ID,
        problemId: input.problemId,
        version: (latest._max.version ?? 0) + 1,
        status: "SUBMITTED",
        submittedAt: new Date(),
        idempotencyKey: input.idempotencyKey,
        submission: {
          create: {
            assumptions: input.assumptions,
            design: input.design,
            tradeoffs: input.tradeoffs,
            edgeCases: input.edgeCases,
            contentHash: createHash("sha256").update(JSON.stringify(input)).digest("hex"),
          },
        },
      },
    });
  });

  const useCase = new EvaluateAttempt(new PrismaAttemptRepository(prisma), new RubricEvaluator());
  await useCase.execute(attempt.id);
  const completed = await prisma.attempt.findUniqueOrThrow({ where: { id: attempt.id }, select: { status: true } });
  return Response.json({ attemptId: attempt.id, status: completed.status }, { status: 201 });
}

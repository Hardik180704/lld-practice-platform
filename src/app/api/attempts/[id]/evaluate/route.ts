import {
  AttemptEvaluationConflictError,
  AttemptNotFoundError,
  EvaluateAttempt,
} from "@/application/evaluate-attempt";
import { getPrisma } from "@/infrastructure/database/prisma";
import { RubricEvaluator } from "@/infrastructure/evaluation/rubric-evaluator";
import { getCurrentLearnerId } from "@/infrastructure/learner-session";
import { PrismaAttemptRepository } from "@/infrastructure/repositories/prisma-attempt-repository";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const learnerId = await getCurrentLearnerId();
  if (!learnerId) return Response.json({ error: "Attempt not found." }, { status: 404 });

  const prisma = getPrisma();
  const current = await prisma.attempt.findFirst({
    where: { id, learnerId },
    select: { status: true },
  });
  if (!current) return Response.json({ error: "Attempt not found." }, { status: 404 });
  if (current.status !== "SUBMITTED" && current.status !== "FAILED") {
    return Response.json(
      { error: "Evaluation is already in progress or complete." },
      { status: 409 },
    );
  }
  const useCase = new EvaluateAttempt(
    new PrismaAttemptRepository(prisma),
    new RubricEvaluator(),
  );

  try {
    await useCase.execute(id);
  } catch (error) {
    if (error instanceof AttemptNotFoundError) {
      const attemptStillExists = await prisma.attempt.count({ where: { id, learnerId } });
      return Response.json(
        { error: attemptStillExists ? "Evaluation is already in progress or complete." : "Attempt not found." },
        { status: attemptStillExists ? 409 : 404 },
      );
    }
    if (error instanceof AttemptEvaluationConflictError) {
      return Response.json({ error: "Evaluation is already in progress or complete." }, { status: 409 });
    }
    throw error;
  }

  const attempt = await prisma.attempt.findUniqueOrThrow({
    where: { id },
    select: { status: true, failureReason: true },
  });
  return Response.json(attempt);
}

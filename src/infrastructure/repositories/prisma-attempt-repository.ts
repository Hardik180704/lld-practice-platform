import type { AttemptRepository } from "@/domain/ports";
import type { EvaluationResult } from "@/domain/evaluation";
import type { PrismaClient } from "@/generated/prisma/client";

export class PrismaAttemptRepository implements AttemptRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findForEvaluation(attemptId: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        submission: true,
        problem: { include: { rubricCriteria: { orderBy: { position: "asc" } } } },
      },
    });

    if (!attempt?.submission || !["SUBMITTED", "FAILED"].includes(attempt.status)) return null;
    return {
      id: attempt.id,
      status: attempt.status as "SUBMITTED" | "FAILED",
      submission: {
        assumptions: attempt.submission.assumptions,
        design: attempt.submission.design,
        tradeoffs: attempt.submission.tradeoffs,
        edgeCases: attempt.submission.edgeCases,
      },
      rubric: attempt.problem.rubricCriteria,
    };
  }

  async markEvaluating(attemptId: string) {
    await this.prisma.attempt.update({ where: { id: attemptId }, data: { status: "EVALUATING", failureReason: null } });
  }

  async complete(attemptId: string, result: EvaluationResult) {
    await this.prisma.$transaction(async (tx) => {
      await tx.evaluation.create({
        data: {
          attemptId,
          evaluator: result.evaluator,
          evaluatorVersion: result.evaluatorVersion,
          overallScore: result.overallScore,
          summary: result.summary,
          results: { create: result.criteria },
        },
      });
      await tx.attempt.update({ where: { id: attemptId }, data: { status: "COMPLETED", completedAt: new Date() } });
    });
  }

  async fail(attemptId: string, reason: string) {
    await this.prisma.attempt.update({ where: { id: attemptId }, data: { status: "FAILED", failureReason: reason.slice(0, 500) } });
  }
}

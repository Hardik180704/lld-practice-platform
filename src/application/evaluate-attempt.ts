import { Attempt } from "@/domain/attempt";
import type { SubmissionEvaluator } from "@/domain/evaluation";
import type { AttemptRepository } from "@/domain/ports";

export class AttemptNotFoundError extends Error {
  constructor(attemptId: string) {
    super(`Attempt ${attemptId} was not found.`);
    this.name = "AttemptNotFoundError";
  }
}

export class EvaluateAttempt {
  constructor(
    private readonly attempts: AttemptRepository,
    private readonly evaluator: SubmissionEvaluator,
  ) {}

  async execute(attemptId: string): Promise<void> {
    const record = await this.attempts.findForEvaluation(attemptId);
    if (!record) throw new AttemptNotFoundError(attemptId);

    const attempt = new Attempt(record.id, record.status);
    attempt.transitionTo("EVALUATING");
    await this.attempts.markEvaluating(attemptId);

    try {
      const result = await this.evaluator.evaluate(record.submission, record.rubric);
      attempt.transitionTo("COMPLETED");
      await this.attempts.complete(attemptId, result);
    } catch (error) {
      attempt.transitionTo("FAILED");
      const reason = error instanceof Error ? error.message : "Unknown evaluator error";
      await this.attempts.fail(attemptId, reason);
    }
  }
}

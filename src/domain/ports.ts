import type {
  EvaluationResult,
  RubricCriterion,
  SubmissionContent,
} from "./evaluation";

export type AttemptForEvaluation = {
  id: string;
  status: "SUBMITTED" | "FAILED";
  submission: SubmissionContent;
  rubric: RubricCriterion[];
};

export interface AttemptRepository {
  findForEvaluation(attemptId: string): Promise<AttemptForEvaluation | null>;
  markEvaluating(attemptId: string): Promise<void>;
  complete(attemptId: string, result: EvaluationResult): Promise<void>;
  fail(attemptId: string, reason: string): Promise<void>;
}

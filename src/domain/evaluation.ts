export type SubmissionContent = {
  assumptions: string;
  design: string;
  tradeoffs: string;
  edgeCases: string;
};

export type RubricCriterion = {
  id: string;
  key: string;
  title: string;
  description: string;
  maxScore: number;
};

export type CriterionEvaluation = {
  criterionId: string;
  score: number;
  evidence: string[];
  concerns: string[];
  suggestions: string[];
  confidence: number;
};

export type EvaluationResult = {
  evaluator: string;
  evaluatorVersion: string;
  overallScore: number;
  summary: string;
  criteria: CriterionEvaluation[];
};

export interface SubmissionEvaluator {
  evaluate(
    submission: SubmissionContent,
    rubric: RubricCriterion[],
  ): Promise<EvaluationResult>;
}

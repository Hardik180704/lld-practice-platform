import type {
  EvaluationResult,
  RubricCriterion,
  SubmissionContent,
  SubmissionEvaluator,
} from "@/domain/evaluation";
import { evaluationResultSchema } from "@/validation/evaluation";

const signals: Record<string, RegExp[]> = {
  requirements: [/assum/i, /require/i, /constraint/i],
  responsibilities: [/responsib/i, /class/i, /service/i, /entity/i],
  relationships: [/depend/i, /compos/i, /associat/i, /interface/i],
  encapsulation: [/private/i, /invariant/i, /encapsulat/i, /interface/i],
  extensibility: [/strateg/i, /polic/i, /factory/i, /extend/i, /replace/i],
  "edge-cases": [/fail/i, /invalid/i, /concurr/i, /empty/i, /test/i],
  explanation: [/because/i, /trade.?off/i, /chosen/i, /instead/i],
};

/** A deterministic baseline evaluator. It is replaceable by an LLM evaluator. */
export class RubricEvaluator implements SubmissionEvaluator {
  async evaluate(
    submission: SubmissionContent,
    rubric: RubricCriterion[],
  ): Promise<EvaluationResult> {
    const fullText = Object.values(submission).join("\n");
    const lengthFactor = Math.min(1, fullText.length / 1800);

    const criteria = rubric.map((criterion) => {
      const matched = (signals[criterion.key] ?? []).filter((signal) => signal.test(fullText));
      const coverage = matched.length / Math.max(1, (signals[criterion.key] ?? []).length);
      const ratio = Math.min(0.92, 0.3 + lengthFactor * 0.25 + coverage * 0.4);
      const score = Math.max(1, Math.round(criterion.maxScore * ratio));
      const hasStrongEvidence = coverage >= 0.5;

      return {
        criterionId: criterion.id,
        score,
        evidence: [
          hasStrongEvidence
            ? `The submission contains explicit language relevant to ${criterion.title.toLowerCase()}.`
            : `The submission provides some context for ${criterion.title.toLowerCase()}.`,
        ],
        concerns: hasStrongEvidence
          ? []
          : [`The reasoning for ${criterion.title.toLowerCase()} is mostly implicit.`],
        suggestions: [
          hasStrongEvidence
            ? `Add one concrete scenario that stress-tests this part of the design.`
            : `Name the decision, explain why it belongs there, and show one interaction.`,
        ],
        confidence: hasStrongEvidence ? 0.82 : 0.62,
      };
    });

    const total = criteria.reduce((sum, item) => sum + item.score, 0);
    const max = rubric.reduce((sum, item) => sum + item.maxScore, 0);
    const overallScore = Math.round((total / max) * 100);

    return evaluationResultSchema.parse({
      evaluator: "deterministic-rubric",
      evaluatorVersion: "1.0.0",
      overallScore,
      summary:
        overallScore >= 70
          ? "The design communicates a solid direction. Use the criterion-level suggestions to make its decisions easier to verify."
          : "The design has a workable foundation, but several decisions need clearer responsibilities, evidence, and change scenarios.",
      criteria,
    });
  }
}

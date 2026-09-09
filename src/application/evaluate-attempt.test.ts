import { describe, expect, it, vi } from "vitest";
import { EvaluateAttempt, AttemptNotFoundError } from "./evaluate-attempt";
import type { AttemptRepository } from "@/domain/ports";
import type { SubmissionEvaluator } from "@/domain/evaluation";

function repository(): AttemptRepository {
  return {
    findForEvaluation: vi.fn().mockResolvedValue({ id:"a1",status:"SUBMITTED",submission:{assumptions:"a",design:"d",tradeoffs:"t",edgeCases:"e"},rubric:[] }),
    markEvaluating: vi.fn(), complete: vi.fn(), fail: vi.fn(),
  };
}

const result = { evaluator:"test",evaluatorVersion:"1",overallScore:70,summary:"Good",criteria:[] };

describe("EvaluateAttempt", () => {
  it("stores a successful evaluation", async () => {
    const repo=repository(); const evaluator:SubmissionEvaluator={evaluate:vi.fn().mockResolvedValue(result)};
    await new EvaluateAttempt(repo,evaluator).execute("a1");
    expect(repo.markEvaluating).toHaveBeenCalledWith("a1");
    expect(repo.complete).toHaveBeenCalledWith("a1",result);
    expect(repo.fail).not.toHaveBeenCalled();
  });

  it("marks an attempt failed when its evaluator fails", async () => {
    const repo=repository(); const evaluator:SubmissionEvaluator={evaluate:vi.fn().mockRejectedValue(new Error("timeout"))};
    await new EvaluateAttempt(repo,evaluator).execute("a1");
    expect(repo.fail).toHaveBeenCalledWith("a1","timeout");
  });

  it("rejects a missing attempt", async () => {
    const repo=repository(); vi.mocked(repo.findForEvaluation).mockResolvedValue(null);
    await expect(new EvaluateAttempt(repo,{evaluate:vi.fn()}).execute("missing")).rejects.toBeInstanceOf(AttemptNotFoundError);
  });
});

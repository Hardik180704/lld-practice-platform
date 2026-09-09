import { describe, expect, it } from "vitest";
import { Attempt, InvalidAttemptTransitionError } from "./attempt";

describe("Attempt", () => {
  it("follows the successful evaluation lifecycle", () => {
    const attempt = new Attempt("attempt-1", "DRAFT");
    attempt.transitionTo("SUBMITTED");
    attempt.transitionTo("EVALUATING");
    attempt.transitionTo("COMPLETED");
    expect(attempt.status).toBe("COMPLETED");
  });

  it("rejects skipping evaluation", () => {
    const attempt = new Attempt("attempt-1", "SUBMITTED");
    expect(() => attempt.transitionTo("COMPLETED")).toThrow(InvalidAttemptTransitionError);
  });

  it("allows a failed evaluation to be retried", () => {
    const attempt = new Attempt("attempt-1", "FAILED");
    attempt.transitionTo("EVALUATING");
    expect(attempt.status).toBe("EVALUATING");
  });
});

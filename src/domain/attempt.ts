export const attemptStatuses = [
  "DRAFT",
  "SUBMITTED",
  "EVALUATING",
  "COMPLETED",
  "FAILED",
] as const;

export type AttemptStatus = (typeof attemptStatuses)[number];

const allowedTransitions: Record<AttemptStatus, readonly AttemptStatus[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["EVALUATING"],
  EVALUATING: ["COMPLETED", "FAILED"],
  COMPLETED: [],
  FAILED: ["EVALUATING"],
};

export class InvalidAttemptTransitionError extends Error {
  constructor(from: AttemptStatus, to: AttemptStatus) {
    super(`Attempt cannot transition from ${from} to ${to}.`);
    this.name = "InvalidAttemptTransitionError";
  }
}

export class Attempt {
  constructor(
    readonly id: string,
    private currentStatus: AttemptStatus,
  ) {}

  get status(): AttemptStatus {
    return this.currentStatus;
  }

  transitionTo(next: AttemptStatus): void {
    if (!allowedTransitions[this.currentStatus].includes(next)) {
      throw new InvalidAttemptTransitionError(this.currentStatus, next);
    }
    this.currentStatus = next;
  }
}

# Design Note

## MVP and user flow

The MVP contains three problems and one structured-text submission format. The learner selects a problem, reviews requirements, submits four reasoning sections, receives rubric feedback, reviews history, and starts a new version.

## Domain model

- `Problem` owns the prompt, requirements, and ordered rubric.
- `Attempt` owns lifecycle rules and version identity.
- `Submission` is immutable evidence captured before evaluation starts.
- `Evaluation` records which evaluator/version produced the result.
- `CriterionResult` connects a rubric criterion to score, evidence, concerns, suggestions, and confidence.
- `SubmissionEvaluator` and `AttemptRepository` are ports. Infrastructure adapters depend inward on them.

The lifecycle prevents feedback from appearing before evaluation and makes failure visible. A failed evaluation can retry; a completed attempt is immutable.

## Evaluation approach

The baseline evaluator is deterministic and transparent. It measures whether the submission makes relevant reasoning explicit and returns a schema-validated result. It deliberately avoids pretending to understand a design as deeply as a reviewer. The interface allows a later LLM evaluator to use the same rubric and output contract.

Deterministic responsibilities include input shape, required depth, lifecycle transitions, idempotency, score bounds, and persistence. Judgment-heavy responsibilities—quality of abstractions, trade-offs, and improvement suggestions—are the natural extension point for an LLM or human reviewer.

## Failure and latency

The submission and its hash are committed before a separate evaluation request starts. The result page displays live status while the attempt moves to `EVALUATING`, then `COMPLETED` or `FAILED`. Evaluator errors are captured as failure reasons and can be retried. An atomic status update prevents duplicate workers from claiming the same attempt. If latency or traffic grows, the next separation would be a durable background worker consuming attempt IDs; the domain and UI states already support that change.

## Change tests

**Diagram submission:** introduce a `SubmissionContent` variant and parser while preserving Attempt, Evaluation, and the practice flow.

**Another evaluator:** implement `SubmissionEvaluator` for an LLM, rules engine, or human-review queue. No route or domain lifecycle rewrite is required.

## Trade-offs

Neon and Prisma provide real persistence and constraints with low operational cost. A modular monolith keeps deployment and debugging simple. Authentication, live diagramming, code execution, queues, and microservices are excluded because they do not improve the core learning loop enough within the assignment boundary.

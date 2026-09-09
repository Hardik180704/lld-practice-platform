# AI Usage

AI was used as an engineering partner, with each suggestion checked against the assignment's learner problem and two-day scope.

## 1. Architecture boundary

AI suggested a modular monolith with domain, application, and infrastructure layers. I accepted the dependency direction because domain transitions and evaluator replacement are central scoring concerns. I rejected microservices and a separate queue service because they would add deployment work without improving the MVP loop.

## 2. Submission format

AI compared text, code, diagrams, and combined submissions. I accepted structured text with four sections because it captures requirements, responsibilities, trade-offs, and edge cases while remaining feasible. I rejected an embedded UML editor and code runner for the initial version.

## 3. Feedback contract

AI proposed a fixed, schema-validated rubric output containing score, evidence, concern, suggestion, and confidence. I accepted this because explainability is more useful than an unconstrained 100-point score. Zod validates the result before persistence.

## 4. Persistence choice

AI initially suggested SQLite for speed. I chose Neon Postgres with Prisma instead to demonstrate realistic persistence and migrations. I retained the recommendation to hide Prisma behind repository interfaces so the ORM does not become the domain model.

## 5. Evaluation strategy

AI suggested an optional LLM evaluator plus a deterministic baseline. I accepted the evaluator interface and baseline, but deferred the external LLM call. This keeps the prototype runnable without a secret key and makes its current limits honest. An LLM adapter can be added later without changing the application use case.

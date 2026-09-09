# DesignLoop

DesignLoop is a focused Low-Level Design practice platform. A learner chooses a problem, explains a design in a structured format, receives evidence-backed rubric feedback, reviews earlier attempts, and tries again.

## Why this MVP

LLD problems rarely have one correct class diagram. A useful practice tool therefore needs to evaluate reasoning—not resemblance to a reference solution. DesignLoop asks for assumptions, responsibilities and interactions, trade-offs, and edge cases. Feedback is stored as `criterion → score → evidence → concern → suggestion → confidence`.

## Features

- Three curated LLD problems with requirements and difficulty
- Structured design submission with server-side Zod validation
- Explicit `SUBMITTED → EVALUATING → COMPLETED / FAILED` lifecycle
- Replaceable evaluator interface with a deterministic rubric baseline
- Evidence-backed feedback across seven criteria
- Versioned attempt history and retry flow
- Local draft auto-save that survives accidental refreshes
- Idempotent submissions and transactional result persistence
- Responsive, accessible UI with meaningful empty/error states

## Tech stack

- Next.js 16 App Router, React 19, and TypeScript
- Neon Postgres
- Prisma ORM 7 with the PostgreSQL driver adapter
- Zod 4 at input and evaluator boundaries
- Vitest for domain, application, and validation tests

## Run locally

Requirements: Node.js 22+, pnpm 10+, and a Neon project.

```bash
pnpm install
cp .env.example .env.local
```

Paste the pooled Neon URL into `DATABASE_URL` and the direct URL into `DIRECT_URL`. Then:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000`.

## Quality commands

```bash
pnpm check
pnpm build
```

`pnpm check` runs lint, strict TypeScript checks, and the test suite.

## Architecture

```text
UI / Route Handlers
        ↓
Application use cases
        ↓
Domain entities + ports
        ↑
Prisma repositories / rubric evaluator
```

The domain owns valid attempt transitions. The application layer coordinates work. Prisma and evaluators implement ports at the edge. Replacing the rubric evaluator with an LLM or human-review adapter does not change the practice workflow.

## Current limitations

- Attempts are scoped to an anonymous, HTTP-only browser cookie. Authentication is intentionally outside the two-day MVP, so clearing browser data also clears access to that browser's history.
- Submission and evaluation use separate requests, so learner work is committed before evaluation starts. A durable background queue is deliberately deferred; the state model is ready for one if latency or traffic grows.
- The deterministic evaluator measures explicit evidence signals; it does not claim semantic understanding. Its purpose is a reliable baseline and a clean extension seam.
- The MVP supports structured text only. A future diagram submission can implement a new submission-content adapter.

See [Research](docs/RESEARCH.md), [Design](docs/DESIGN.md), and [AI usage](AI_USAGE.md) for the assignment notes.

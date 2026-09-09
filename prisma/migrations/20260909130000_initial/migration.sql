CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "AttemptStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'EVALUATING', 'COMPLETED', 'FAILED');

CREATE TABLE "Problem" (
  "id" TEXT NOT NULL, "slug" TEXT NOT NULL, "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL, "context" TEXT NOT NULL, "requirements" TEXT[],
  "evaluationHints" TEXT[], "difficulty" "Difficulty" NOT NULL,
  "estimatedMinutes" INTEGER NOT NULL, "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "RubricCriterion" (
  "id" TEXT NOT NULL, "problemId" TEXT NOT NULL, "key" TEXT NOT NULL,
  "title" TEXT NOT NULL, "description" TEXT NOT NULL, "maxScore" INTEGER NOT NULL,
  "position" INTEGER NOT NULL, CONSTRAINT "RubricCriterion_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Attempt" (
  "id" TEXT NOT NULL, "learnerId" TEXT NOT NULL, "problemId" TEXT NOT NULL,
  "status" "AttemptStatus" NOT NULL DEFAULT 'DRAFT', "version" INTEGER NOT NULL,
  "idempotencyKey" TEXT NOT NULL, "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "submittedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "failureReason" TEXT,
  CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Submission" (
  "id" TEXT NOT NULL, "attemptId" TEXT NOT NULL, "assumptions" TEXT NOT NULL,
  "design" TEXT NOT NULL, "tradeoffs" TEXT NOT NULL, "edgeCases" TEXT NOT NULL,
  "contentHash" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Evaluation" (
  "id" TEXT NOT NULL, "attemptId" TEXT NOT NULL, "evaluator" TEXT NOT NULL,
  "evaluatorVersion" TEXT NOT NULL, "overallScore" INTEGER NOT NULL, "summary" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CriterionResult" (
  "id" TEXT NOT NULL, "evaluationId" TEXT NOT NULL, "criterionId" TEXT NOT NULL,
  "score" INTEGER NOT NULL, "evidence" TEXT[], "concerns" TEXT[], "suggestions" TEXT[],
  "confidence" DOUBLE PRECISION NOT NULL, CONSTRAINT "CriterionResult_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Problem_slug_key" ON "Problem"("slug");
CREATE INDEX "Problem_isPublished_difficulty_idx" ON "Problem"("isPublished", "difficulty");
CREATE UNIQUE INDEX "RubricCriterion_problemId_key_key" ON "RubricCriterion"("problemId", "key");
CREATE UNIQUE INDEX "RubricCriterion_problemId_position_key" ON "RubricCriterion"("problemId", "position");
CREATE UNIQUE INDEX "Attempt_idempotencyKey_key" ON "Attempt"("idempotencyKey");
CREATE INDEX "Attempt_learnerId_startedAt_idx" ON "Attempt"("learnerId", "startedAt" DESC);
CREATE UNIQUE INDEX "Attempt_learnerId_problemId_version_key" ON "Attempt"("learnerId", "problemId", "version");
CREATE UNIQUE INDEX "Submission_attemptId_key" ON "Submission"("attemptId");
CREATE UNIQUE INDEX "Evaluation_attemptId_key" ON "Evaluation"("attemptId");
CREATE UNIQUE INDEX "CriterionResult_evaluationId_criterionId_key" ON "CriterionResult"("evaluationId", "criterionId");

ALTER TABLE "RubricCriterion" ADD CONSTRAINT "RubricCriterion_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CriterionResult" ADD CONSTRAINT "CriterionResult_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CriterionResult" ADD CONSTRAINT "CriterionResult_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "RubricCriterion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/infrastructure/database/prisma";
import {
  LEARNER_COOKIE_NAME,
  learnerCookieOptions,
} from "@/infrastructure/learner-session";
import { submitAttemptSchema } from "@/validation/submission";

export async function POST(request: NextRequest) {
  const parsed = submitAttemptSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Please correct the highlighted fields.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const prisma = getPrisma();
  const input = parsed.data;
  const problemExists = await prisma.problem.count({ where: { id: input.problemId, isPublished: true } });
  if (!problemExists) return Response.json({ error: "Problem not found." }, { status: 404 });
  const existing = await prisma.attempt.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing) {
    const response = NextResponse.json({ attemptId: existing.id, status: existing.status });
    response.cookies.set(LEARNER_COOKIE_NAME, existing.learnerId, learnerCookieOptions);
    return response;
  }

  const learnerId = request.cookies.get(LEARNER_COOKIE_NAME)?.value ?? randomUUID();
  const contentHash = createHash("sha256")
    .update(JSON.stringify({
      assumptions: input.assumptions,
      design: input.design,
      tradeoffs: input.tradeoffs,
      edgeCases: input.edgeCases,
    }))
    .digest("hex");

  const attempt = await prisma.$transaction(async (tx) => {
    const latest = await tx.attempt.aggregate({ where: { learnerId, problemId: input.problemId }, _max: { version: true } });
    return tx.attempt.create({
      data: {
        learnerId,
        problemId: input.problemId,
        version: (latest._max.version ?? 0) + 1,
        status: "SUBMITTED",
        submittedAt: new Date(),
        idempotencyKey: input.idempotencyKey,
        submission: {
          create: {
            assumptions: input.assumptions,
            design: input.design,
            tradeoffs: input.tradeoffs,
            edgeCases: input.edgeCases,
            contentHash,
          },
        },
      },
    });
  });

  const response = NextResponse.json(
    { attemptId: attempt.id, status: attempt.status },
    { status: 201 },
  );
  response.cookies.set(LEARNER_COOKIE_NAME, learnerId, learnerCookieOptions);
  return response;
}

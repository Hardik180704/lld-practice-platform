"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, RefreshCcw } from "lucide-react";
import type { AttemptStatus } from "@/domain/attempt";

export function EvaluationProgress({
  attemptId,
  status,
  failureReason,
}: {
  attemptId: string;
  status: AttemptStatus;
  failureReason: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  const runEvaluation = useCallback(async () => {
    try {
      const response = await fetch(`/api/attempts/${attemptId}/evaluate`, {
        method: "POST",
      });
      if (!response.ok && response.status !== 409) {
        const result = await response.json();
        setMessage(result.error ?? "Evaluation could not be completed.");
      }
    } catch {
      setMessage("The evaluator could not be reached. Your submission is safe.");
    } finally {
      router.refresh();
    }
  }, [attemptId, router]);

  useEffect(() => {
    if (status !== "SUBMITTED") return;
    const controller = new AbortController();
    void fetch(`/api/attempts/${attemptId}/evaluate`, {
      method: "POST",
      signal: controller.signal,
    })
      .catch(() => undefined)
      .finally(() => router.refresh());
    return () => controller.abort();
  }, [attemptId, router, status]);

  useEffect(() => {
    if (status !== "EVALUATING") return;
    const timer = window.setInterval(() => router.refresh(), 2_000);
    return () => window.clearInterval(timer);
  }, [router, status]);

  const failed = status === "FAILED" || Boolean(message);

  return (
    <section className={`evaluation-progress ${failed ? "is-failed" : ""}`} aria-live="polite">
      <div className="evaluation-icon">
        {failed ? <RefreshCcw size={24} /> : <LoaderCircle className="spinner" size={26} />}
      </div>
      <div>
        <p className="kicker">{failed ? "Evaluation paused" : "Review in progress"}</p>
        <h2>{failed ? "Your submission is safe." : "Evaluating your design…"}</h2>
        <p>
          {message || failureReason ||
            "We’re checking each rubric dimension and connecting feedback to evidence in your answer."}
        </p>
      </div>
      {failed ? (
        <button className="button primary" onClick={() => { setMessage(""); void runEvaluation(); }} type="button">
          <RefreshCcw size={16} /> Retry evaluation
        </button>
      ) : (
        <div className="evaluation-steps" aria-hidden="true"><span /><span /><span /></div>
      )}
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";

type FieldName = "assumptions" | "design" | "tradeoffs" | "edgeCases";
const fields: { name: FieldName; label: string; help: string; placeholder: string }[] = [
  { name: "assumptions", label: "Assumptions and scope", help: "State what you are solving—and deliberately not solving.", placeholder: "Example: One facility, multiple floors, and a single entry gate for this MVP..." },
  { name: "design", label: "Classes, responsibilities, and interactions", help: "Describe the core objects, what each owns, and how a main use case flows.", placeholder: "ParkingLot owns floors and coordinates entry. SpotAssignmentPolicy selects a compatible spot..." },
  { name: "tradeoffs", label: "Decisions and trade-offs", help: "Explain why you chose this design and what alternatives you rejected.", placeholder: "I separated pricing behind a policy because rates change independently..." },
  { name: "edgeCases", label: "Edge cases and testing", help: "Show how the design behaves when things go wrong or happen concurrently.", placeholder: "Two entries requesting the final compatible spot; payment failure during exit..." },
];

export function SubmissionForm({ problemId }: { problemId: string }) {
  const router = useRouter();
  const storageKey = `designloop:draft:${problemId}`;
  const formRef = useRef<HTMLFormElement>(null);
  const idempotencyKey = useRef<string | null>(null);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string[]>>>({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved || !formRef.current) return;
      const draft = JSON.parse(saved) as Partial<Record<FieldName, string>>;
      for (const field of fields) {
        const element = formRef.current.elements.namedItem(field.name);
        const savedValue = draft[field.name];
        if (element instanceof HTMLTextAreaElement && savedValue) {
          element.value = savedValue;
        }
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  function saveDraft(form: HTMLFormElement) {
    const data = new FormData(form);
    window.localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(data)));
  }

  async function submit(formData: FormData) {
    setPending(true);
    setErrors({});
    setFormError("");
    try {
      idempotencyKey.current ??= crypto.randomUUID();
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, ...Object.fromEntries(formData), idempotencyKey: idempotencyKey.current }),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.fields ?? {});
        setFormError(result.error ?? "Submission failed.");
        return;
      }
      window.localStorage.removeItem(storageKey);
      router.push(`/attempts/${result.attemptId}`);
    } catch {
      setFormError("We could not save the submission. Your draft is safe—please retry.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="submission-form" onInput={(event) => saveDraft(event.currentTarget)} ref={formRef}>
      {formError ? <p className="form-error" role="alert">{formError}</p> : null}
      {fields.map((field, index) => (
        <div className="field" key={field.name}>
          <div className="field-heading"><span>0{index + 1}</span><div><label htmlFor={field.name}>{field.label}</label><small>{field.help}</small></div></div>
          <textarea id={field.name} name={field.name} placeholder={field.placeholder} required aria-invalid={Boolean(errors[field.name])} />
          {errors[field.name]?.map((error) => <p className="error-text" key={error}>{error}</p>)}
        </div>
      ))}
      <div className="submit-row"><p><strong>Draft auto-saved locally.</strong> Submission is stored before evaluation begins.</p><button className="button primary" disabled={pending} type="submit">{pending ? <><LoaderCircle className="spinner" size={17} /> Saving…</> : <>Submit for feedback <ArrowRight size={17} /></>}</button></div>
    </form>
  );
}

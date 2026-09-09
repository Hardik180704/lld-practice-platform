import { describe, expect, it } from "vitest";
import { submitAttemptSchema } from "./submission";

const valid = { problemId:"p1",idempotencyKey:"6ba7b810-9dad-11d1-80b4-00c04fd430c8",assumptions:"A focused assumption with sufficient detail.",design:"ParkingLot coordinates entry while an allocation policy selects a compatible spot. Tickets preserve entry time and the assigned spot for later fee calculation.",tradeoffs:"Policies add one seam while avoiding conditionals in the coordinator.",edgeCases:"Handle a full lot, duplicate exit, and two requests for the final spot." };

describe("submitAttemptSchema", () => {
  it("accepts a meaningful structured submission", () => expect(submitAttemptSchema.safeParse(valid).success).toBe(true));
  it("rejects a shallow design", () => expect(submitAttemptSchema.safeParse({...valid,design:"Use some classes."}).success).toBe(false));
  it("rejects malformed idempotency keys", () => expect(submitAttemptSchema.safeParse({...valid,idempotencyKey:"retry"}).success).toBe(false));
});

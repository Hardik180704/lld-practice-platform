import { cookies } from "next/headers";

export const LEARNER_COOKIE_NAME = "designloop_learner";

export const learnerCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export async function getCurrentLearnerId() {
  const cookieStore = await cookies();
  return cookieStore.get(LEARNER_COOKIE_NAME)?.value ?? null;
}

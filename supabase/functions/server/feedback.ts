// The caller must resolve userId from the bearer token, never from request JSON.
export async function saveFeedback(userId: string | null, input: unknown, write: (key: string, value: unknown) => Promise<void>) {
  if (!userId) return { status: 401, error: "Unauthorized" };
  if (!input || typeof input !== "object") return { status: 400, error: "Invalid feedback" };
  const body = input as Record<string, unknown>;
  if (typeof body.submissionId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.submissionId)) return { status: 400, error: "Invalid submission" };
  const fields: Record<string, string> = {};
  for (const key of ["trying", "stuck", "expected", "idea"]) {
    const value = body[key] ?? "";
    if (typeof value !== "string" || value.length > 4000) return { status: 400, error: "Feedback is too long or invalid" };
    fields[key] = value.trim();
  }
  if (!fields.trying || !fields.stuck) return { status: 400, error: "Please fill in both feedback questions" };
  await write(`feedback:${userId}:${body.submissionId}`, { ...fields, userId, submittedAt: new Date().toISOString() });
  return { status: 200 };
}

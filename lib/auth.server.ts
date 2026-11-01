import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "./auth";

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

// Call at the top of every protected server component / action.
export async function requireAdmin() {
  const token = await getSessionToken();
  if (!token) redirect("/dashboard/login");
  return token;
}


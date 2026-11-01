"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth";

// Server-side logout (clears the httpOnly cookie if it exists).
// Client-side logout (localStorage) is handled by clientLogout() in lib/auth.ts.
export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/dashboard/login");
}

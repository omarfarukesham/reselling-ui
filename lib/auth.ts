// Constants shared by server + middleware + client
export const SESSION_COOKIE = "admin_session";

// ---- Client-side helpers (localStorage) ----

/** Read the JWT from localStorage (client-only). */
export function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/** Read role from localStorage (client-only). */
export function getClientRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("role");
}

/** Read email from localStorage (client-only). */
export function getClientEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("email");
}

/** Clear all auth data from localStorage and redirect to login. */
export function clientLogout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  window.location.href = "/dashboard/login";
}

// Admin login — calls the real backend API.
// POST /api/auth/login  →  { data: { token } }
// The JWT payload contains { email, role, id }.

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LoginResponse {
  success: boolean;
  token: string;
  email: string;
  role: string;
  message?: string;
}

/**
 * Calls the backend login endpoint, decodes the JWT to extract email & role,
 * and returns them alongside the raw token.
 */
export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = await res.json();

  if (!res.ok || !body?.data?.token) {
    return {
      success: false,
      token: "",
      email: "",
      role: "",
      message: body?.message || "Invalid email or password.",
    };
  }

  const token: string = body.data.token;

  // Decode the JWT payload (base64url → JSON) to read email & role.
  const payload = JSON.parse(atob(token.split(".")[1]));

  return {
    success: true,
    token,
    email: payload.email ?? email,
    role: payload.role ?? "",
  };
}

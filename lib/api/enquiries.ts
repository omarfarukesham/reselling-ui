import type {
  AdminEnquiriesQuery,
  AdminEnquiriesResponse,
  CreateEnquiryInput,
  IEnquiry,
  UpdateEnquiryInput,
} from "@/lib/types";

export const ENQUIRIES_CHANGED_EVENT = "enquiries:changed";

export function notifyEnquiriesChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ENQUIRIES_CHANGED_EVENT));
  }
}

export function getEnquiriesApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_AGENCY_API_URL) {
    return process.env.NEXT_PUBLIC_AGENCY_API_URL.replace(/\/+$/, "");
  }
  const base = process.env.NEXT_PUBLIC_API_URL || "https://api.easyby.pro/api";
  const cleaned = base.replace(/\/+$/, "");
  if (cleaned.endsWith("/api/v1")) return cleaned;
  if (cleaned.endsWith("/api")) return `${cleaned}/v1`;
  return `${cleaned}/api/v1`;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function readBody(res: Response) {
  return res.json().catch(() => null);
}

/**
 * 1. List All Enquiries (Search, Filter, Pagination)
 * GET /api/v1/enquiries?page=1&limit=20&status=received&search=...
 */
export async function getAdminEnquiries(
  token: string,
  query: AdminEnquiriesQuery = {}
): Promise<AdminEnquiriesResponse> {
  const url = new URL(`${getEnquiriesApiBaseUrl()}/enquiries`);

  if (query.page) url.searchParams.set("page", String(query.page));
  if (query.limit) url.searchParams.set("limit", String(query.limit));
  if (query.status) url.searchParams.set("status", query.status);
  if (query.projectType) url.searchParams.set("projectType", query.projectType);
  if (query.budget) url.searchParams.set("budget", query.budget);
  if (query.search?.trim()) url.searchParams.set("search", query.search.trim());
  if (query.sortBy) url.searchParams.set("sortBy", query.sortBy);
  if (query.sortOrder) url.searchParams.set("sortOrder", query.sortOrder);

  const res = await fetch(url.toString(), {
    headers: authHeaders(token),
    cache: "no-store",
  });

  const body = await readBody(res);

  if (!res.ok) {
    const errorMsg = body?.message || `Failed to fetch enquiries (Status ${res.status})`;
    throw new Error(errorMsg);
  }

  const list: IEnquiry[] = Array.isArray(body?.data) ? body.data : [];
  return {
    status: body?.status ?? true,
    statusCode: body?.statusCode ?? res.status,
    message: body?.message ?? "Enquiries retrieved successfully",
    meta: body?.meta ?? {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      total: list.length,
      totalPage: 1,
    },
    data: list,
  };
}

/**
 * 2. View Single Enquiry Details
 * GET /api/v1/enquiries/:id
 */
export async function getAdminEnquiryById(
  token: string,
  id: string
): Promise<IEnquiry> {
  const url = `${getEnquiriesApiBaseUrl()}/enquiries/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  const body = await readBody(res);

  if (!res.ok || !body?.data) {
    throw new Error(body?.message || `Failed to fetch enquiry details (Status ${res.status})`);
  }

  return body.data;
}

/**
 * 3. Edit Enquiry (Update Status / Admin Notes)
 * PATCH /api/v1/enquiries/:id
 */
export async function updateAdminEnquiry(
  token: string,
  id: string,
  payload: UpdateEnquiryInput
): Promise<IEnquiry> {
  const url = `${getEnquiriesApiBaseUrl()}/enquiries/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  const body = await readBody(res);

  if (!res.ok || !body?.data) {
    throw new Error(body?.message || `Failed to update enquiry (Status ${res.status})`);
  }

  notifyEnquiriesChanged();
  return body.data;
}

/**
 * 4. Delete an Enquiry
 * DELETE /api/v1/enquiries/:id
 */
export async function deleteAdminEnquiry(
  token: string,
  id: string
): Promise<{ success: boolean; message?: string }> {
  const url = `${getEnquiriesApiBaseUrl()}/enquiries/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  const body = await readBody(res);

  if (!res.ok) {
    throw new Error(body?.message || `Failed to delete enquiry (Status ${res.status})`);
  }

  notifyEnquiriesChanged();
  return {
    success: true,
    message: body?.message || "Enquiry deleted successfully",
  };
}

/**
 * 5. Create an Enquiry (Manual lead entry or submission)
 * POST /api/v1/enquiries
 */
export async function createAdminEnquiry(
  payload: CreateEnquiryInput,
  token?: string
): Promise<IEnquiry> {
  const url = `${getEnquiriesApiBaseUrl()}/enquiries`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...payload,
      submittedAt: payload.submittedAt || new Date().toISOString(),
    }),
  });

  const body = await readBody(res);

  if (!res.ok) {
    let msg = body?.message || "Failed to create enquiry.";
    if (body?.fields) {
      const fieldErrors = Object.entries(body.fields)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      msg = `${msg} (${fieldErrors})`;
    }
    throw new Error(msg);
  }

  notifyEnquiriesChanged();
  return body?.data ?? body;
}

import type {
  AdminOrdersQuery,
  AdminOrdersResponse,
  IOrder,
  Order,
  TrackedOrder,
} from "@/lib/types";

const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
};

/**
 * Fetch all orders for the admin dashboard with pagination, search, and filters.
 * GET /api/order?page=1&limit=10&search=...&orderStatus=...
 */
export async function getAdminOrders(
  token: string,
  query: AdminOrdersQuery = {}
): Promise<AdminOrdersResponse> {
  const url = new URL(`${getApiBaseUrl()}/order`);

  if (query.page) url.searchParams.set("page", String(query.page));
  if (query.limit) url.searchParams.set("limit", String(query.limit));
  if (query.search?.trim()) url.searchParams.set("search", query.search.trim());
  if (query.orderStatus) url.searchParams.set("orderStatus", query.orderStatus);
  if (query.deliveryArea) url.searchParams.set("deliveryArea", query.deliveryArea);
  if (query.sortBy) url.searchParams.set("sortBy", query.sortBy);
  if (query.sortOrder) url.searchParams.set("sortOrder", query.sortOrder);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = body?.message || `Failed to fetch orders (Status ${res.status})`;
    throw new Error(errorMsg);
  }

  return {
    orders: Array.isArray(body?.data) ? body.data : [],
    meta: body?.meta || {
      page: query.page || 1,
      limit: query.limit || 10,
      total: Array.isArray(body?.data) ? body.data.length : 0,
      totalPage: 1,
    },
  };
}

/**
 * Fetch single order by orderId or _id (Admin)
 * GET /api/order/:orderId
 */
export async function getAdminOrderById(
  token: string,
  orderId: string
): Promise<IOrder> {
  const res = await fetch(`${getApiBaseUrl()}/order/${encodeURIComponent(orderId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.data) {
    throw new Error(body?.message || "Failed to fetch order details");
  }

  return body.data;
}

/**
 * Update order by orderId or _id (Admin)
 * PUT /api/order/:orderId
 */
export async function updateAdminOrder(
  token: string,
  orderId: string,
  payload: Partial<IOrder>
): Promise<IOrder> {
  const res = await fetch(`${getApiBaseUrl()}/order/${encodeURIComponent(orderId)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.data) {
    throw new Error(body?.message || "Failed to update order");
  }

  return body.data;
}

/**
 * Delete order by orderId or _id (Admin)
 * DELETE /api/order/:orderId
 */
export async function deleteAdminOrder(
  token: string,
  orderId: string
): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/order/${encodeURIComponent(orderId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message || "Failed to delete order");
  }
}

/**
 * Create a new order (can be used by admin or user)
 * POST /api/order/create-order
 */
export async function createAdminOrder(
  token: string | null,
  payload: Partial<IOrder>
): Promise<IOrder> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}/order/create-order`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.data) {
    throw new Error(body?.message || "Failed to create order");
  }

  return body.data;
}

/**
 * Backwards-compatibility wrapper for legacy callers
 */
export async function getOrders(token: string): Promise<Order[]> {
  try {
    const { orders } = await getAdminOrders(token, { limit: 100 });
    return orders.map((o) => ({
      id: o.orderId || o._id,
      customerName: o.userName,
      phone: o.mobileNumber,
      address: o.deliveryAddress,
      size: (o.productColors && o.productColors.length > 0) ? o.productColors.join(", ") : "Standard",
      quantity: o.qty,
      zone: o.deliveryArea === "insideDhaka" ? "inside" : "outside",
      total: o.totalPrice ?? (o.price * o.qty + (o.deliveryCharged ?? 0)),
      status: (o.orderStatus === "confirm"
        ? "confirmed"
        : o.orderStatus === "onWay"
        ? "shipped"
        : o.orderStatus === "cancel"
        ? "cancelled"
        : o.orderStatus) as Order["status"],
      createdAt: typeof o.createdAt === "string" ? o.createdAt : new Date(o.createdAt || Date.now()).toISOString(),
    }));
  } catch {
    return [];
  }
}

/**
 * Customer "My Order" lookup by mobile number ("01XXXXXXXXX").
 * GET /api/order/my-orders/:mobileNumber
 */
export async function getMyOrders(mobile: string): Promise<TrackedOrder[]> {
  const res = await fetch(`${getApiBaseUrl()}/order/my-orders/${encodeURIComponent(mobile)}`, {
    cache: "no-store",
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Failed to load orders (${res.status})`);
  const body: { data?: TrackedOrder[] } = await res.json();
  return body.data ?? [];
}

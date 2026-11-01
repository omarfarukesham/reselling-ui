"use client";

import { useCallback, useEffect, useState } from "react";
import { getClientToken, getClientEmail, getClientRole } from "@/lib/auth";
import {
  getAdminOrders,
  updateAdminOrder,
  deleteAdminOrder,
  createAdminOrder,
} from "@/lib/api/orders";
import OrderStatsCards from "@/components/dashboard/OrderStatsCards";
import OrdersTable from "@/components/dashboard/OrdersTable";
import type { IOrder, PaginationMeta, TOrderStatus } from "@/lib/types";

export default function DashboardPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Pagination query state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // User details
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  useEffect(() => {
    setEmail(getClientEmail());
    setRole(getClientRole());
  }, []);

  // Fetch orders from backend
  const fetchOrders = useCallback(async () => {
    const token = getClientToken();
    if (!token) return;

    setLoading(true);
    try {
      const response = await getAdminOrders(token, {
        page,
        limit,
        search: search.trim() || undefined,
        orderStatus: statusFilter || undefined,
        deliveryArea: areaFilter || undefined,
        sortBy,
        sortOrder,
      });

      setOrders(response.orders);
      setMeta(response.meta);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, areaFilter, sortBy, sortOrder]);

  // Load orders when queries change (with 350ms debounce for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchOrders]);

  // Quick update order status
  const handleUpdateStatus = async (orderId: string, newStatus: TOrderStatus) => {
    const token = getClientToken();
    if (!token) return;

    try {
      const updated = await updateAdminOrder(token, orderId, { orderStatus: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id || o.orderId === updated.orderId ? updated : o))
      );
      showToast(`Order status updated to "${newStatus}"`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update order status", "error");
      throw err;
    }
  };

  // Update order payload
  const handleUpdateOrder = async (orderId: string, data: Partial<IOrder>) => {
    const token = getClientToken();
    if (!token) return;

    try {
      const updated = await updateAdminOrder(token, orderId, data);
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id || o.orderId === updated.orderId ? updated : o))
      );
      showToast("Order updated successfully!");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update order", "error");
      throw err;
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId: string) => {
    const token = getClientToken();
    if (!token) return;

    try {
      await deleteAdminOrder(token, orderId);
      setOrders((prev) => prev.filter((o) => o._id !== orderId && o.orderId !== orderId));
      setMeta((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
      showToast("Order deleted successfully!");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete order", "error");
      throw err;
    }
  };

  // Create order
  const handleCreateOrder = async (orderData: Partial<IOrder>) => {
    const token = getClientToken();
    try {
      await createAdminOrder(token, orderData);
      showToast("New order created successfully!");
      // Reset to page 1 and refresh
      setPage(1);
      fetchOrders();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to create order", "error");
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            Orders Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Monitor, track, and update all customer orders with live status management.
          </p>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <OrderStatsCards
        orders={orders}
        totalFromMeta={meta.total}
        activeStatus={statusFilter}
        onSelectStatus={(st) => {
          setStatusFilter(st);
          setPage(1);
        }}
      />

      {/* Main Orders Table with CRUD Actions & Pagination */}
      <OrdersTable
        orders={orders}
        meta={meta}
        loading={loading}
        search={search}
        onSearchChange={(s) => {
          setSearch(s);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(st) => {
          setStatusFilter(st);
          setPage(1);
        }}
        areaFilter={areaFilter}
        onAreaFilterChange={(a) => {
          setAreaFilter(a);
          setPage(1);
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(sb, so) => {
          setSortBy(sb);
          setSortOrder(so);
          setPage(1);
        }}
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={(lim) => {
          setLimit(lim);
          setPage(1);
        }}
        onRefresh={fetchOrders}
        onUpdateStatus={handleUpdateStatus}
        onUpdateOrder={handleUpdateOrder}
        onDeleteOrder={handleDeleteOrder}
        onCreateOrder={handleCreateOrder}
        toast={toast}
        onDismissToast={() => setToast(null)}
      />
    </div>
  );
}

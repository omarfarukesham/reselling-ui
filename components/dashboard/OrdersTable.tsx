"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Phone,
  Mail,
  MapPin,
  Check,
  Copy,
  AlertCircle,
  X,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import type { IOrder, PaginationMeta, TDeliveryArea, TOrderStatus } from "@/lib/types";
import { fmt } from "@/lib/utils";
import OrderDetailsModal from "./OrderDetailsModal";
import OrderEditModal from "./OrderEditModal";
import OrderCreateModal from "./OrderCreateModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface OrdersTableProps {
  orders: IOrder[];
  meta: PaginationMeta;
  loading: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  areaFilter: string;
  onAreaFilterChange: (area: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  onRefresh: () => void;
  onUpdateStatus: (orderId: string, status: TOrderStatus) => Promise<void>;
  onUpdateOrder: (orderId: string, data: Partial<IOrder>) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  onCreateOrder: (data: Partial<IOrder>) => Promise<void>;
  toast: { message: string; type: "success" | "error" } | null;
  onDismissToast: () => void;
}

const statusOptions: { value: string; label: string; count?: number }[] = [
  { value: "", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirm", label: "Confirmed" },
  { value: "onWay", label: "On Way" },
  { value: "delivered", label: "Delivered" },
  { value: "return", label: "Returned" },
  { value: "cancel", label: "Cancelled" },
];

const statusStyles: Record<TOrderStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-amber-50 text-amber-700 border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  confirm: { bg: "bg-blue-50 text-blue-700 border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
  onWay: { bg: "bg-sky-50 text-sky-700 border-sky-200", text: "text-sky-700", dot: "bg-sky-500" },
  delivered: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  return: { bg: "bg-purple-50 text-purple-700 border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
  cancel: { bg: "bg-red-50 text-red-700 border-red-200", text: "text-red-700", dot: "bg-red-500" },
};

export default function OrdersTable({
  orders,
  meta,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  areaFilter,
  onAreaFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  page,
  onPageChange,
  limit,
  onLimitChange,
  onRefresh,
  onUpdateStatus,
  onUpdateOrder,
  onDeleteOrder,
  onCreateOrder,
  toast,
  onDismissToast,
}: OrdersTableProps) {
  // Modal states
  const [selectedOrderForView, setSelectedOrderForView] = useState<IOrder | null>(null);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<IOrder | null>(null);
  const [selectedOrderForDelete, setSelectedOrderForDelete] = useState<IOrder | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 1500);
  };

  const handleInlineStatusChange = async (orderId: string, newStatus: TOrderStatus) => {
    setUpdatingId(orderId);
    try {
      await onUpdateStatus(orderId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const startEntry = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const endEntry = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs font-semibold shadow-sm transition-all animate-in fade-in ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`grid h-5 w-5 place-items-center rounded-full ${
                toast.type === "success" ? "bg-emerald-200 text-emerald-800" : "bg-red-200 text-red-800"
              }`}
            >
              ✓
            </span>
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={onDismissToast}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Filter & Action Bar */}
      <div className="rounded-3xl bg-white p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-4">
        {/* Controls Row: Search + Area + Sort + Add Button */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by order ID, name, phone, address..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-8 text-xs text-neutral-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Delivery Area Filter */}
            <select
              value={areaFilter}
              onChange={(e) => onAreaFilterChange(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
            >
              <option value="">All Areas</option>
              <option value="insideDhaka">Inside Dhaka</option>
              <option value="outsideDhaka">Outside Dhaka</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split(":");
                onSortChange(sb, so as "asc" | "desc");
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="totalPrice:desc">Amount: High to Low</option>
              <option value="totalPrice:asc">Amount: Low to High</option>
              <option value="qty:desc">Quantity: High to Low</option>
            </select>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
              title="Refresh order list"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-brand-600" : ""}`} />
            </button>

            {/* Create Order Button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-all active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>Create Order</span>
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" /> Status:
          </span>
          {statusOptions.map((opt) => {
            const active = statusFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onStatusFilterChange(opt.value)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-xs border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-slate-50/70 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Delivery Details</th>
                <th className="px-5 py-3.5">Items</th>
                <th className="px-5 py-3.5 text-right">Total Amount</th>
                <th className="px-5 py-3.5">Order Status</th>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                      <p className="text-xs font-medium text-slate-500">Loading orders from server…</p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <p className="font-bold text-sm text-neutral-800">No orders found</p>
                      <p className="text-xs text-slate-500">
                        {search || statusFilter || areaFilter
                          ? "Try clearing your search or status filters."
                          : "Orders placed by customers will show up here."}
                      </p>
                      {(search || statusFilter || areaFilter) && (
                        <button
                          type="button"
                          onClick={() => {
                            onSearchChange("");
                            onStatusFilterChange("");
                            onAreaFilterChange("");
                          }}
                          className="mt-2 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const id = o.orderId || o._id;
                  const total =
                    o.totalPrice ?? o.price * o.qty + (o.deliveryCharged ?? 0);
                  const isUpdatingThis = updatingId === (o._id || o.orderId);

                  return (
                    <tr
                      key={o._id || o.orderId}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Order ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-neutral-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                            {id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(id)}
                            className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy ID"
                          >
                            {copiedId === id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-neutral-900 leading-tight">{o.userName}</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <a
                              href={`tel:${o.mobileNumber}`}
                              className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                              title="Click to call"
                            >
                              <Phone className="h-3 w-3 text-brand-500" />
                              {o.mobileNumber}
                            </a>
                            <button
                              type="button"
                              onClick={(e) => handleCopyPhone(o.mobileNumber, e)}
                              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                              title="Copy mobile number"
                            >
                              {copiedPhone === o.mobileNumber ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Delivery Address & Zone */}
                      <td className="max-w-[220px] px-5 py-4">
                        <p className="truncate text-slate-700 font-medium" title={o.deliveryAddress}>
                          {o.deliveryAddress}
                        </p>
                        <span
                          className={`inline-block mt-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                            o.deliveryArea === "insideDhaka"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          }`}
                        >
                          {o.deliveryArea === "insideDhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                        </span>
                      </td>

                      {/* Items & Colors */}
                      <td className="px-5 py-4 text-slate-600">
                        <span className="font-bold text-neutral-900">{o.qty} pcs</span>
                        <span className="text-[11px] text-slate-400 block">@ {fmt(o.price)}৳</span>
                        {o.productColors && o.productColors.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {o.productColors.map((c, i) => (
                              <span
                                key={i}
                                className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="px-5 py-4 text-right">
                        <span className="font-extrabold text-sm text-neutral-900">{fmt(total)}৳</span>
                        <span className="block text-[10px] text-slate-400">
                          incl. {o.deliveryCharged ?? (o.deliveryArea === "outsideDhaka" ? 120 : 80)}৳ del.
                        </span>
                      </td>

                      {/* Order Status (Interactive Quick Dropdown) */}
                      <td className="px-5 py-4">
                        <div className="relative inline-block">
                          <select
                            value={o.orderStatus}
                            onChange={(e) =>
                              handleInlineStatusChange(o._id || o.orderId, e.target.value as TOrderStatus)
                            }
                            disabled={isUpdatingThis}
                            className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize outline-none transition disabled:opacity-50 ${
                              statusStyles[o.orderStatus]?.bg || "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirm">Confirm</option>
                            <option value="onWay">On Way</option>
                            <option value="delivered">Delivered</option>
                            <option value="return">Return</option>
                            <option value="cancel">Cancel</option>
                          </select>
                          {isUpdatingThis && (
                            <span className="absolute -right-5 top-1.5">
                              <Loader2 className="h-3 w-3 animate-spin text-brand-600" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        <span className="block font-medium text-neutral-800">
                          {new Date(o.createdAt).toLocaleDateString("en-GB", {
                            timeZone: "Asia/Dhaka",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {new Date(o.createdAt).toLocaleTimeString("en-GB", {
                            timeZone: "Asia/Dhaka",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForView(o)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-xs"
                            title="View details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForEdit(o)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 transition-colors shadow-xs"
                            title="Edit order"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForDelete(o)}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors shadow-xs"
                            title="Delete order"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 px-5 py-4 bg-slate-50/50 text-xs">
          {/* Summary + Per page selector */}
          <div className="flex items-center gap-4">
            <span className="text-slate-500">
              Showing <span className="font-bold text-neutral-800">{startEntry}</span> to{" "}
              <span className="font-bold text-neutral-800">{endEntry}</span> of{" "}
              <span className="font-bold text-neutral-800">{meta.total}</span> orders
            </span>

            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Per page:</span>
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-700 outline-none focus:border-brand-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => onPageChange(page - 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page number indicators */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: Math.min(5, meta.totalPage || 1) }, (_, i) => {
                let p = i + 1;
                if (meta.totalPage > 5) {
                  if (page > 3 && page < meta.totalPage - 1) {
                    p = page - 2 + i;
                  } else if (page >= meta.totalPage - 1) {
                    p = meta.totalPage - 4 + i;
                  }
                }
                if (p < 1 || p > meta.totalPage) return null;

                const isCurrent = p === page;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPageChange(p)}
                    disabled={loading}
                    className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition-colors ${
                      isCurrent
                        ? "bg-brand-600 text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={page >= meta.totalPage || loading}
              onClick={() => onPageChange(page + 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPage || loading}
              onClick={() => onPageChange(meta.totalPage)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {selectedOrderForView && (
        <OrderDetailsModal
          order={selectedOrderForView}
          onClose={() => setSelectedOrderForView(null)}
          onUpdateStatus={async (id, st) => {
            await onUpdateStatus(id, st);
            setSelectedOrderForView((prev) => (prev ? { ...prev, orderStatus: st } : null));
          }}
          onEdit={(ord) => {
            setSelectedOrderForView(null);
            setSelectedOrderForEdit(ord);
          }}
        />
      )}

      {/* Edit Modal */}
      {selectedOrderForEdit && (
        <OrderEditModal
          order={selectedOrderForEdit}
          onClose={() => setSelectedOrderForEdit(null)}
          onSave={onUpdateOrder}
        />
      )}

      {/* Create Modal */}
      <OrderCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={onCreateOrder}
      />

      {/* Delete Confirmation Modal */}
      {selectedOrderForDelete && (
        <DeleteConfirmModal
          order={selectedOrderForDelete}
          onClose={() => setSelectedOrderForDelete(null)}
          onConfirm={onDeleteOrder}
        />
      )}
    </div>
  );
}

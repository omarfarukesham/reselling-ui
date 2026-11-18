"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Filter,
  Globe,
  Loader2,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  User,
  X,
  Sparkles,
} from "lucide-react";
import { getClientRole, getClientToken } from "@/lib/auth";
import {
  createAdminEnquiry,
  deleteAdminEnquiry,
  getAdminEnquiries,
  getAdminEnquiryById,
  updateAdminEnquiry,
} from "@/lib/api/enquiries";
import type {
  CreateEnquiryInput,
  IEnquiry,
  PaginationMeta,
  TEnquiryStatus,
} from "@/lib/types";

const PROJECT_TYPES = [
  "Business website",
  "Website + lead automation",
  "Workflow automation",
  "Social media management",
  "Website + social media",
  "Something else / not sure yet",
];

const BUDGET_RANGES = [
  "Under $500",
  "$500 – $1,000",
  "$1,000 – $2,500",
  "$2,500+",
  "Not sure yet",
];

const STATUS_OPTIONS: TEnquiryStatus[] = ["received", "new", "contacted", "closed"];

const statusConfig: Record<
  TEnquiryStatus,
  { label: string; badge: string; dot: string; desc: string }
> = {
  received: {
    label: "Received",
    badge: "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20",
    dot: "bg-blue-500",
    desc: "Initial form submission received",
  },
  new: {
    label: "New",
    badge: "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20",
    dot: "bg-amber-500",
    desc: "Unreviewed enquiry awaiting triage",
  },
  contacted: {
    label: "Contacted",
    badge: "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20",
    dot: "bg-purple-500",
    desc: "Outreach made / consultation in progress",
  },
  closed: {
    label: "Closed",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20",
    dot: "bg-emerald-500",
    desc: "Completed / converted or archived",
  },
};

const formatDateTime = (isoString?: string) => {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Dhaka",
    });
  } catch {
    return isoString;
  }
};

export default function AgencyManager() {
  const [role, setRole] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Enquiries list state
  const [enquiries, setEnquiries] = useState<IEnquiry[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPage: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [statusFilter, setStatusFilter] = useState<TEnquiryStatus | "">("");
  const [projectTypeFilter, setProjectTypeFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Counts summary
  const [statusCounts, setStatusCounts] = useState<{
    total: number;
    received: number;
    new: number;
    contacted: number;
    closed: number;
  }>({
    total: 0,
    received: 0,
    new: 0,
    contacted: 0,
    closed: 0,
  });

  // Modals & Action States
  const [detailItem, setDetailItem] = useState<IEnquiry | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editItem, setEditItem] = useState<IEnquiry | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<IEnquiry | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Auth / Role check
  useEffect(() => {
    const currentRole = getClientRole();
    setRole(currentRole);
    setAuthChecked(true);
  }, []);

  const isAdmin =
    role?.toLowerCase() === "admin" || role?.toLowerCase() === "superadmin";

  // Fetch summary counts
  const fetchCounts = useCallback(async (token: string) => {
    try {
      const [resAll, resReceived, resNew, resContacted, resClosed] = await Promise.all([
        getAdminEnquiries(token, { limit: 1 }),
        getAdminEnquiries(token, { status: "received", limit: 1 }),
        getAdminEnquiries(token, { status: "new", limit: 1 }),
        getAdminEnquiries(token, { status: "contacted", limit: 1 }),
        getAdminEnquiries(token, { status: "closed", limit: 1 }),
      ]);
      setStatusCounts({
        total: resAll.meta.total,
        received: resReceived.meta.total,
        new: resNew.meta.total,
        contacted: resContacted.meta.total,
        closed: resClosed.meta.total,
      });
    } catch {
      // Non-fatal if counts fail
    }
  }, []);

  // Main fetch function
  const fetchEnquiries = useCallback(async () => {
    const token = getClientToken();
    if (!token || !isAdmin) return;

    setLoading(true);
    const [sortBy, sortOrder] = sort.split(":") as [string, "asc" | "desc"];

    try {
      const res = await getAdminEnquiries(token, {
        page,
        limit,
        status: statusFilter,
        projectType: projectTypeFilter || undefined,
        budget: budgetFilter || undefined,
        search: search.trim() || undefined,
        sortBy,
        sortOrder,
      });

      setEnquiries(res.data);
      setMeta(res.meta);
      fetchCounts(token);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load enquiries.", "error");
    } finally {
      setLoading(false);
    }
  }, [
    isAdmin,
    page,
    limit,
    statusFilter,
    projectTypeFilter,
    budgetFilter,
    search,
    sort,
    fetchCounts,
  ]);

  // Debounced trigger for search
  useEffect(() => {
    if (!authChecked || !isAdmin) return;
    const t = setTimeout(fetchEnquiries, 300);
    return () => clearTimeout(t);
  }, [authChecked, isAdmin, fetchEnquiries]);

  // View details
  const handleOpenDetails = async (item: IEnquiry) => {
    const token = getClientToken();
    const itemId = item.id || item._id;
    if (!token || !itemId) {
      setDetailItem(item);
      return;
    }

    setDetailItem(item);
    setDetailLoading(true);
    try {
      const full = await getAdminEnquiryById(token, itemId);
      setDetailItem(full);
    } catch {
      // Keep basic item if single fetch fails
    } finally {
      setDetailLoading(false);
    }
  };

  // Quick or explicit status update
  const handleUpdateStatusAndNotes = async (
    id: string,
    newStatus: TEnquiryStatus,
    adminNotes?: string
  ) => {
    const token = getClientToken();
    if (!token) return;

    setActionBusy(true);
    try {
      const updated = await updateAdminEnquiry(token, id, {
        status: newStatus,
        adminNotes,
      });

      // Update in local state
      setEnquiries((prev) =>
        prev.map((e) => ((e.id || e._id) === id ? { ...e, ...updated } : e))
      );
      if (detailItem && (detailItem.id || detailItem._id) === id) {
        setDetailItem((prev) => (prev ? { ...prev, ...updated } : null));
      }

      showToast(`Enquiry updated to "${newStatus}".`, "success");
      setEditItem(null);
      fetchCounts(token);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update enquiry.", "error");
    } finally {
      setActionBusy(false);
    }
  };

  // Delete enquiry
  const handleDeleteEnquiry = async () => {
    if (!deleteItem) return;
    const token = getClientToken();
    const id = deleteItem.id || deleteItem._id;
    if (!token || !id) return;

    setActionBusy(true);
    try {
      await deleteAdminEnquiry(token, id);
      setEnquiries((prev) => prev.filter((e) => (e.id || e._id) !== id));
      if (detailItem && (detailItem.id || detailItem._id) === id) {
        setDetailItem(null);
      }
      showToast("Enquiry deleted successfully.", "success");
      setDeleteItem(null);
      fetchCounts(token);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete enquiry.", "error");
    } finally {
      setActionBusy(false);
    }
  };

  // Create new enquiry
  const handleCreateEnquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = getClientToken();
    if (!token) return;

    const fd = new FormData(e.currentTarget);
    const payload: CreateEnquiryInput = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim().toLowerCase(),
      businessName: String(fd.get("businessName") || "").trim(),
      projectType: String(fd.get("projectType") || ""),
      budget: String(fd.get("budget") || ""),
      message: String(fd.get("message") || "").trim(),
      submittedAt: new Date().toISOString(),
    };

    if (payload.message.length < 20) {
      showToast("Message must be at least 20 characters.", "error");
      return;
    }

    setActionBusy(true);
    try {
      await createAdminEnquiry(payload, token);
      showToast("New enquiry created successfully!", "success");
      setIsCreateOpen(false);
      fetchEnquiries();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create enquiry.", "error");
    } finally {
      setActionBusy(false);
    }
  };

  // ─────────────────────────── Role Guard ───────────────────────────
  if (authChecked && !isAdmin) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="rounded-3xl border border-red-100 bg-white p-10 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-8 ring-red-50/50">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-xl font-bold tracking-tight text-neutral-900">
            Admin Access Restricted
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Only users with the <span className="font-semibold text-neutral-900">admin</span> role
            are authorized to manage agency leads and consultation enquiries. Your current account
            role does not have administrative permissions for this area.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md transition-all ${
            toast.type === "success"
              ? "border border-emerald-200 bg-emerald-950/90 text-emerald-100"
              : "border border-red-200 bg-red-950/90 text-red-100"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 rounded-lg p-1 text-slate-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Agency Leads</h1>
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200">
              Admin Only
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage incoming agency client enquiries, consultations, notes, and lead statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchEnquiries()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-neutral-900 transition-colors shadow-xs disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Enquiry</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
        <button
          onClick={() => {
            setStatusFilter("");
            setPage(1);
          }}
          className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
            statusFilter === ""
              ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <span
            className={`text-xs font-medium ${
              statusFilter === "" ? "text-slate-300" : "text-slate-500"
            }`}
          >
            Total Leads
          </span>
          <span className="mt-2 text-2xl font-black">{statusCounts.total}</span>
          <span
            className={`mt-1 text-[11px] ${
              statusFilter === "" ? "text-slate-400" : "text-slate-400"
            }`}
          >
            All time submissions
          </span>
        </button>

        <button
          onClick={() => {
            setStatusFilter("received");
            setPage(1);
          }}
          className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
            statusFilter === "received"
              ? "border-blue-600 bg-blue-600 text-white shadow-sm"
              : "border-slate-200 bg-white hover:border-blue-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium ${
                statusFilter === "received" ? "text-blue-100" : "text-blue-700"
              }`}
            >
              Received
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                statusFilter === "received" ? "bg-white" : "bg-blue-500"
              }`}
            />
          </div>
          <span className="mt-2 text-2xl font-black">{statusCounts.received}</span>
          <span
            className={`mt-1 text-[11px] ${
              statusFilter === "received" ? "text-blue-100" : "text-slate-400"
            }`}
          >
            Incoming queue
          </span>
        </button>

        <button
          onClick={() => {
            setStatusFilter("new");
            setPage(1);
          }}
          className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
            statusFilter === "new"
              ? "border-amber-600 bg-amber-600 text-white shadow-sm"
              : "border-slate-200 bg-white hover:border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium ${
                statusFilter === "new" ? "text-amber-100" : "text-amber-700"
              }`}
            >
              New
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                statusFilter === "new" ? "bg-white" : "bg-amber-500"
              }`}
            />
          </div>
          <span className="mt-2 text-2xl font-black">{statusCounts.new}</span>
          <span
            className={`mt-1 text-[11px] ${
              statusFilter === "new" ? "text-amber-100" : "text-slate-400"
            }`}
          >
            Needs review
          </span>
        </button>

        <button
          onClick={() => {
            setStatusFilter("contacted");
            setPage(1);
          }}
          className={`flex flex-col rounded-2xl border p-4 text-left transition-all ${
            statusFilter === "contacted"
              ? "border-purple-600 bg-purple-600 text-white shadow-sm"
              : "border-slate-200 bg-white hover:border-purple-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium ${
                statusFilter === "contacted" ? "text-purple-100" : "text-purple-700"
              }`}
            >
              Contacted
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                statusFilter === "contacted" ? "bg-white" : "bg-purple-500"
              }`}
            />
          </div>
          <span className="mt-2 text-2xl font-black">{statusCounts.contacted}</span>
          <span
            className={`mt-1 text-[11px] ${
              statusFilter === "contacted" ? "text-purple-100" : "text-slate-400"
            }`}
          >
            In discussions
          </span>
        </button>

        <button
          onClick={() => {
            setStatusFilter("closed");
            setPage(1);
          }}
          className={`flex flex-col rounded-2xl border p-4 text-left transition-all col-span-2 sm:col-span-1 ${
            statusFilter === "closed"
              ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
              : "border-slate-200 bg-white hover:border-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium ${
                statusFilter === "closed" ? "text-emerald-100" : "text-emerald-700"
              }`}
            >
              Closed
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                statusFilter === "closed" ? "bg-white" : "bg-emerald-500"
              }`}
            />
          </div>
          <span className="mt-2 text-2xl font-black">{statusCounts.closed}</span>
          <span
            className={`mt-1 text-[11px] ${
              statusFilter === "closed" ? "text-emerald-100" : "text-slate-400"
            }`}
          >
            Converted / Done
          </span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        {/* Status Tab buttons */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
          {(["", ...STATUS_OPTIONS] as (TEnquiryStatus | "")[]).map((st) => {
            const active = statusFilter === st;
            const label = st === "" ? "All Statuses" : statusConfig[st].label;
            const count =
              st === ""
                ? statusCounts.total
                : statusCounts[st as keyof typeof statusCounts];

            return (
              <button
                key={st || "all"}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-neutral-900"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Select Filters */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, company, message..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-neutral-900 placeholder:text-slate-400 outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Project Type Filter */}
          <select
            value={projectTypeFilter}
            onChange={(e) => {
              setProjectTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-neutral-900 outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Project Types</option>
            {PROJECT_TYPES.map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>

          {/* Budget Filter */}
          <select
            value={budgetFilter}
            onChange={(e) => {
              setBudgetFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-neutral-900 outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Budgets</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-neutral-900 outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="name:asc">Name A → Z</option>
            <option value="name:desc">Name Z → A</option>
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            <p className="mt-3 text-xs font-medium">Loading agency enquiries…</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-neutral-900">No enquiries found</h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {search || statusFilter || projectTypeFilter || budgetFilter
                ? "Try clearing filters or search terms to see more enquiries."
                : "No agency consultation requests have been submitted yet."}
            </p>
            {(search || statusFilter || projectTypeFilter || budgetFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setProjectTypeFilter("");
                  setBudgetFilter("");
                  setPage(1);
                }}
                className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 sm:px-6">Client & Business</th>
                  <th className="px-4 py-3">Project & Budget</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {enquiries.map((item) => {
                  const id = item.id || item._id || "";
                  const conf = statusConfig[item.status] || statusConfig.received;

                  return (
                    <tr
                      key={id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetails(item)}
                    >
                      {/* Client & Business */}
                      <td className="px-4 py-3.5 sm:px-6">
                        <div className="font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                          <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="truncate max-w-[200px]">{item.businessName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[220px]">
                          {item.email}
                        </div>
                      </td>

                      {/* Project & Budget */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-neutral-800">{item.projectType}</div>
                        <div className="mt-1 inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {item.budget}
                        </div>
                      </td>

                      {/* Status */}
                      <td
                        className="px-4 py-3.5"
                        onClick={(e) => e.stopPropagation()} // Let user change status without opening drawer
                      >
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleUpdateStatusAndNotes(
                              id,
                              e.target.value as TEnquiryStatus,
                              item.adminNotes
                            )
                          }
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer outline-none ${conf.badge}`}
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st} className="bg-white text-neutral-900">
                              {statusConfig[st].label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDateTime(item.createdAt)}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-4 py-3.5 text-right sm:px-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(item)}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-slate-300 hover:text-neutral-900 hover:bg-slate-50 transition-colors shadow-xs"
                            title="View full enquiry details"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditItem(item)}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-colors shadow-xs"
                            title="Edit status & admin notes"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteItem(item)}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors shadow-xs"
                            title="Delete enquiry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta.total > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-neutral-900">
                {(meta.page - 1) * meta.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-neutral-900">
                {Math.min(meta.page * meta.limit, meta.total)}
              </span>{" "}
              of <span className="font-semibold text-neutral-900">{meta.total}</span> enquiries
            </div>

            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.page <= 1}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="px-2 text-xs font-medium text-slate-600">
                  Page {meta.page} of {meta.totalPage || 1}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPage, p + 1))}
                  disabled={meta.page >= meta.totalPage}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────── VIEW DETAILS DRAWER / MODAL ─────────────────────────── */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">Enquiry Details</h3>
                  <p className="text-[11px] text-slate-500">ID: {detailItem.id || detailItem._id}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 space-y-5 text-xs text-slate-600">
              {detailLoading && (
                <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-2.5 text-blue-700">
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span>Loading full audit details from server…</span>
                </div>
              )}

              {/* Top Contact info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Lead Name
                  </span>
                  <p className="text-sm font-semibold text-neutral-900 mt-0.5">{detailItem.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Business / Company
                  </span>
                  <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                    {detailItem.businessName}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Email Address
                  </span>
                  <p className="mt-0.5">
                    <a
                      href={`mailto:${detailItem.email}`}
                      className="font-medium text-brand-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" /> {detailItem.email}
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Current Status
                  </span>
                  <div className="mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                        statusConfig[detailItem.status]?.badge || statusConfig.received.badge
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          statusConfig[detailItem.status]?.dot || "bg-blue-500"
                        }`}
                      />
                      {statusConfig[detailItem.status]?.label || detailItem.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Type & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Project Type Requested
                  </span>
                  <p className="mt-1 font-semibold text-neutral-900">{detailItem.projectType}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Client Budget Range
                  </span>
                  <p className="mt-1 font-semibold text-neutral-900">{detailItem.budget}</p>
                </div>
              </div>

              {/* Message */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Client Message / Project Scope
                </span>
                <div className="mt-1.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 font-normal text-neutral-800 leading-relaxed whitespace-pre-wrap">
                  {detailItem.message}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Admin Notes
                  </span>
                  <button
                    onClick={() => {
                      setEditItem(detailItem);
                    }}
                    className="text-[11px] font-semibold text-brand-600 hover:underline"
                  >
                    Edit Notes
                  </button>
                </div>
                <div className="mt-1.5 rounded-2xl border border-amber-200/80 bg-amber-50/30 p-3.5 text-neutral-800">
                  {detailItem.adminNotes ? (
                    <p className="whitespace-pre-wrap">{detailItem.adminNotes}</p>
                  ) : (
                    <p className="italic text-slate-400">
                      No internal notes recorded yet. Click &quot;Edit Notes&quot; to add follow-up records.
                    </p>
                  )}
                </div>
              </div>

              {/* Metadata / Technical Info */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1.5 text-[11px] text-slate-500">
                <div className="flex justify-between">
                  <span>Created At:</span>
                  <span className="font-mono text-slate-700">
                    {formatDateTime(detailItem.createdAt)}
                  </span>
                </div>
                {detailItem.submittedAt && (
                  <div className="flex justify-between">
                    <span>Client Submitted Clock:</span>
                    <span className="font-mono text-slate-700">
                      {formatDateTime(detailItem.submittedAt)}
                    </span>
                  </div>
                )}
                {detailItem.ipHash && (
                  <div className="flex justify-between">
                    <span>IP Hash:</span>
                    <span className="font-mono text-slate-700 truncate max-w-[280px]">
                      {detailItem.ipHash}
                    </span>
                  </div>
                )}
                {detailItem.userAgent && (
                  <div className="flex justify-between">
                    <span>User Agent:</span>
                    <span className="font-mono text-slate-700 truncate max-w-[280px]">
                      {detailItem.userAgent}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-6 py-3.5">
              <button
                onClick={() => {
                  setDeleteItem(detailItem);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Enquiry</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditItem(detailItem)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  Edit Status & Notes
                </button>
                <button
                  onClick={() => setDetailItem(null)}
                  className="rounded-xl bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────── EDIT ENQUIRY MODAL (PATCH) ─────────────────────────── */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-brand-600" />
                <h3 className="font-bold text-neutral-900 text-sm">Update Enquiry</h3>
              </div>
              <button
                onClick={() => setEditItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const newStatus = fd.get("status") as TEnquiryStatus;
                const adminNotes = String(fd.get("adminNotes") || "").trim();
                const id = editItem.id || editItem._id || "";
                handleUpdateStatusAndNotes(id, newStatus, adminNotes);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-neutral-800 mb-1">Client Name</label>
                <p className="text-slate-500 font-medium">{editItem.name} ({editItem.businessName})</p>
              </div>

              <div>
                <label htmlFor="edit-status" className="block font-bold text-neutral-800 mb-1">
                  Enquiry Status
                </label>
                <select
                  id="edit-status"
                  name="status"
                  defaultValue={editItem.status}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {statusConfig[st].label} — {statusConfig[st].desc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-adminNotes" className="block font-bold text-neutral-800 mb-1">
                  Admin Internal Notes
                </label>
                <textarea
                  id="edit-adminNotes"
                  name="adminNotes"
                  defaultValue={editItem.adminNotes || ""}
                  rows={4}
                  placeholder="Record phone discussions, consultation outcomes, proposal links, follow-up dates..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionBusy}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-50 shadow-xs"
                >
                  {actionBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────── CREATE ENQUIRY MODAL (POST) ─────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-brand-600" />
                <h3 className="font-bold text-neutral-900 text-sm">Add New Lead / Enquiry</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEnquiry} className="overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="create-name" className="block font-semibold text-slate-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    id="create-name"
                    name="name"
                    required
                    maxLength={100}
                    placeholder="e.g. Jordan Lee"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="create-email" className="block font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="create-email"
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    placeholder="jordan@example.com"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="create-business" className="block font-semibold text-slate-700 mb-1">
                  Business / Company Name *
                </label>
                <input
                  id="create-business"
                  name="businessName"
                  required
                  maxLength={150}
                  placeholder="e.g. Lee Home Services"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="create-project" className="block font-semibold text-slate-700 mb-1">
                    Project Type *
                  </label>
                  <select
                    id="create-project"
                    name="projectType"
                    required
                    defaultValue={PROJECT_TYPES[0]}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  >
                    {PROJECT_TYPES.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="create-budget" className="block font-semibold text-slate-700 mb-1">
                    Budget Range *
                  </label>
                  <select
                    id="create-budget"
                    name="budget"
                    required
                    defaultValue={BUDGET_RANGES[0]}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  >
                    {BUDGET_RANGES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="create-message" className="block font-semibold text-slate-700 mb-1">
                  Enquiry Message / Project Details * (min 20 chars)
                </label>
                <textarea
                  id="create-message"
                  name="message"
                  required
                  minLength={20}
                  maxLength={5000}
                  rows={4}
                  placeholder="Explain what the client needs, company background, and specific deliverables..."
                  className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionBusy}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-50 shadow-xs"
                >
                  {actionBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Enquiry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────── DELETE MODAL ─────────────────────────── */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-xs space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Delete Enquiry?</h3>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete the consultation enquiry from{" "}
                <span className="font-semibold text-neutral-900">{deleteItem.name}</span> (
                {deleteItem.businessName})? This action cannot be reversed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEnquiry}
                disabled={actionBusy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50 shadow-xs"
              >
                {actionBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

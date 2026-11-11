"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClientToken } from "@/lib/auth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Loader2 } from "lucide-react";

// Every page inside (protected) requires an admin session stored in localStorage.
export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getClientToken();
    if (!token) {
      router.replace("/dashboard/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <p className="text-sm font-medium text-slate-500">Checking authentication…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col">
      <DashboardHeader />
      <div className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col lg:flex-row">
        <DashboardSidebar />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:pl-2 lg:pr-8">{children}</main>
      </div>
    </div>
  );
}

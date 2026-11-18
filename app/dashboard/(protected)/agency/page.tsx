import type { Metadata } from "next";
import AgencyManager from "@/components/dashboard/AgencyManager";

export const metadata: Metadata = {
  title: "Agency Leads · Admin Dashboard",
  description: "Manage incoming agency leads, consultations, and client proposals.",
};

export default function AgencyPage() {
  return <AgencyManager />;
}

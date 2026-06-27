import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnquiriesPageContent } from "@/components/enquiries/enquiries-page-content";

export const metadata: Metadata = {
  title: "Enquiries",
};

export default function EnquiriesPage() {
  return (
    <DashboardShell
      title="Enquiries"
      description="Track new event enquiries from first contact to confirmed booking"
    >
      <div className="mx-auto max-w-7xl">
        <EnquiriesPageContent />
      </div>
    </DashboardShell>
  );
}

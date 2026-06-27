import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnquiriesList } from "@/components/enquiries/enquiries-list";
import { EnquiryPipelineCards } from "@/components/enquiries/enquiry-pipeline-cards";
import { enquiryPipelineStats } from "@/lib/mock/enquiries";

export const metadata: Metadata = {
  title: "Enquiries",
};

export default function EnquiriesPage() {
  return (
    <DashboardShell
      title="Enquiries"
      description="Track new event enquiries from first contact to confirmed booking"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <EnquiryPipelineCards stats={enquiryPipelineStats} />
        <EnquiriesList />
      </div>
    </DashboardShell>
  );
}

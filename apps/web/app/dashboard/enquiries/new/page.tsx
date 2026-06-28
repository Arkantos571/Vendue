import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { NewEnquiryForm } from "@/components/enquiries/new-enquiry-form";

export const metadata: Metadata = {
  title: "New enquiry",
};

export default function NewEnquiryPage() {
  return (
    <DashboardShell title="New enquiry" description="Capture a new event enquiry.">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/dashboard/enquiries"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to enquiries
        </Link>
        <NewEnquiryForm />
      </div>
    </DashboardShell>
  );
}

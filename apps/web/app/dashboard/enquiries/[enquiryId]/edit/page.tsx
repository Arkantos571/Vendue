import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EditEnquiryForm } from "@/components/enquiries/edit-enquiry-form";
import { loadEnquiryForPage } from "@/lib/enquiries/data";

interface Props { params: Promise<{ enquiryId: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { enquiryId } = await params;
  const enquiry = await loadEnquiryForPage(enquiryId);
  return { title: enquiry ? `Edit ${enquiry.eventName}` : "Edit enquiry" };
}

export default async function EditEnquiryPage({ params }: Props) {
  const { enquiryId } = await params;
  const enquiry = await loadEnquiryForPage(enquiryId);
  if (!enquiry) notFound();

  return (
    <DashboardShell title="Edit enquiry" description={enquiry.eventName}>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href={`/dashboard/enquiries/${enquiryId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-100">
          <ArrowLeft className="h-4 w-4" />Back to enquiry
        </Link>
        <EditEnquiryForm enquiry={enquiry} />
      </div>
    </DashboardShell>
  );
}

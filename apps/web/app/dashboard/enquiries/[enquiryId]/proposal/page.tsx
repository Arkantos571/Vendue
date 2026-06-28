import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProposalBuilderView } from "@/components/enquiries/proposal-builder-view";
import { loadEnquiryProposalForPage } from "@/lib/enquiries/data";

interface ProposalPageProps {
  params: Promise<{ enquiryId: string }>;
}

export async function generateMetadata({ params }: ProposalPageProps): Promise<Metadata> {
  const { enquiryId } = await params;
  const data = await loadEnquiryProposalForPage(enquiryId);

  return {
    title: data ? `Proposal — ${data.enquiry.eventName}` : "Proposal builder",
  };
}

export default async function EnquiryProposalPage({ params }: ProposalPageProps) {
  const { enquiryId } = await params;
  const data = await loadEnquiryProposalForPage(enquiryId);

  if (!data) {
    notFound();
  }

  return (
    <DashboardShell title="Proposal builder" description={data.enquiry.eventName}>
      <div className="mx-auto max-w-7xl">
        <ProposalBuilderView enquiry={data.enquiry} venue={data.venue} />
      </div>
    </DashboardShell>
  );
}

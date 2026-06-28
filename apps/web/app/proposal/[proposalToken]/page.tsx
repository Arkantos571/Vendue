import type { Metadata } from "next";
import { EnquirePageShell } from "@/components/enquiries/enquire-page-shell";
import { PublicProposalView } from "@/components/enquiries/public-proposal-view";
import { loadPublicProposalAction } from "@/lib/enquiries/public-proposal-actions";

interface PublicProposalPageProps {
  params: Promise<{ proposalToken: string }>;
}

export async function generateMetadata({ params }: PublicProposalPageProps): Promise<Metadata> {
  const { proposalToken } = await params;
  const result = await loadPublicProposalAction(proposalToken);

  if (!result.success) {
    return { title: "Proposal" };
  }

  return {
    title: `Proposal — ${result.proposal.eventName}`,
    description: `Event proposal for ${result.proposal.clientName} at ${result.proposal.venueName}.`,
  };
}

export default async function PublicProposalPage({ params }: PublicProposalPageProps) {
  const { proposalToken } = await params;
  const result = await loadPublicProposalAction(proposalToken);

  if (!result.success) {
    return (
      <EnquirePageShell title="Proposal not found" description="This proposal link is invalid or has expired.">
        <div className="v-panel">
          <p className="text-sm text-muted-foreground">{result.error}</p>
        </div>
      </EnquirePageShell>
    );
  }

  const { proposal } = result;

  return (
    <EnquirePageShell
      venueName={proposal.venueName}
      title="Your event proposal"
      description={`Prepared for ${proposal.clientName}`}
    >
      <PublicProposalView token={proposalToken} proposal={proposal} />
    </EnquirePageShell>
  );
}

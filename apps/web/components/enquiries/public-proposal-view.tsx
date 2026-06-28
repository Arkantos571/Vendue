"use client";

import { useState } from "react";
import { PublicProposalDocument } from "@/components/enquiries/public-proposal-document";
import { PublicProposalResponseForm } from "@/components/enquiries/public-proposal-response-form";
import type { PublicProposal } from "@/lib/enquiries/public-proposal-types";

interface PublicProposalViewProps {
  token: string;
  proposal: PublicProposal;
}

export function PublicProposalView({ token, proposal: initialProposal }: PublicProposalViewProps) {
  const [proposal, setProposal] = useState(initialProposal);

  function handleUpdated(updates: Partial<PublicProposal>) {
    setProposal((current) => ({ ...current, ...updates }));
  }

  return (
    <div className="space-y-8">
      <PublicProposalDocument proposal={proposal} />
      <PublicProposalResponseForm token={token} proposal={proposal} onUpdated={handleUpdated} />
      <p className="text-center text-xs text-muted-foreground">
        Powered by Venudue · This page is a read-only proposal preview
      </p>
    </div>
  );
}

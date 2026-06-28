"use client";

import { useState } from "react";
import { PublicProposalDocument } from "@/components/enquiries/public-proposal-document";
import { Button } from "@/components/ui/button";
import { respondPublicProposalAction } from "@/lib/enquiries/public-proposal-actions";
import type { PublicProposal } from "@/lib/enquiries/public-proposal-types";
import type { ProposalShareStatus } from "@/lib/mock/enquiries";
import { proposalShareStatusLabels } from "@/lib/mock/enquiries";

interface PublicProposalViewProps {
  token: string;
  proposal: PublicProposal;
}

export function PublicProposalView({ token, proposal: initialProposal }: PublicProposalViewProps) {
  const [proposal, setProposal] = useState(initialProposal);
  const [message, setMessage] = useState<string | null>(null);
  const [isResponding, setIsResponding] = useState(false);

  const hasResponded =
    proposal.proposalShareStatus === "accepted_placeholder" ||
    proposal.proposalShareStatus === "declined_placeholder";

  async function handleAccept() {
    setIsResponding(true);
    setMessage(null);

    const result = await respondPublicProposalAction({
      token,
      response: "accepted_placeholder",
    });

    setIsResponding(false);

    if (!result.success) {
      setMessage(result.error);
      return;
    }

    setProposal((current) => ({
      ...current,
      proposalShareStatus: result.proposalShareStatus,
    }));
    setMessage(
      "Thank you — we've noted your interest. Proposal acceptance workflow coming soon. This is not a legally binding acceptance.",
    );
  }

  async function handleQuestion() {
    setMessage(
      "Please contact the venue team directly to ask questions. A built-in messaging workflow is coming soon.",
    );
  }

  return (
    <div className="space-y-8">
      <PublicProposalDocument proposal={proposal} />

      {hasResponded && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Status: {proposalShareStatusLabels[proposal.proposalShareStatus as ProposalShareStatus]}
        </p>
      )}

      {!hasResponded && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" disabled={isResponding} onClick={handleAccept} className="sm:flex-1">
            Looks good / Accept proposal
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isResponding}
            onClick={handleQuestion}
            className="sm:flex-1"
          >
            Ask a question
          </Button>
        </div>
      )}

      {message && (
        <p className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          {message}
        </p>
      )}

      <p className="text-center text-xs text-stone-500">
        Powered by Venudue · This page is a read-only proposal preview
      </p>
    </div>
  );
}

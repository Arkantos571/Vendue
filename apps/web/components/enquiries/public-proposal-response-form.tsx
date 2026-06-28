"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitPublicProposalResponseAction } from "@/lib/enquiries/public-proposal-actions";
import type { PublicProposal } from "@/lib/enquiries/public-proposal-types";
import {
  proposalClientResponseLabels,
  type ProposalClientResponse,
} from "@/lib/mock/enquiries";
import { cn } from "@/lib/utils";

interface PublicProposalResponseFormProps {
  token: string;
  proposal: PublicProposal;
  onUpdated: (updates: Partial<PublicProposal>) => void;
}

const responseOptions: ProposalClientResponse[] = ["interested", "question", "not_right_now"];

export function PublicProposalResponseForm({
  token,
  proposal,
  onUpdated,
}: PublicProposalResponseFormProps) {
  const [selected, setSelected] = useState<ProposalClientResponse | null>(
    proposal.proposalClientResponse,
  );
  const [message, setMessage] = useState(proposal.proposalClientMessage ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasExistingResponse = Boolean(proposal.proposalClientResponse);

  useEffect(() => {
    setSelected(proposal.proposalClientResponse);
    setMessage(proposal.proposalClientMessage ?? "");
  }, [proposal]);

  async function handleSubmit() {
    if (!selected) {
      setError("Please choose a response.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await submitPublicProposalResponseAction({
      token,
      response: selected,
      message: message.trim() || null,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onUpdated({
      proposalShareStatus: result.proposalShareStatus,
      proposalClientResponse: result.proposalClientResponse,
      proposalClientMessage: result.proposalClientMessage,
      proposalRespondedAt: result.proposalRespondedAt,
    });
    setSuccess("Response sent. The venue team will follow up.");
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-stone-900">Interested in this proposal?</h2>
      <p className="mt-2 text-sm text-stone-600">
        This is not a booking confirmation or contract. The venue team will follow up.
      </p>

      {hasExistingResponse && proposal.proposalClientResponse && (
        <p className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
          Your current response: {proposalClientResponseLabels[proposal.proposalClientResponse]}.
          You can update it below.
        </p>
      )}

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {success && (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {success}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {responseOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSelected(option)}
            className={cn(
              "rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
              selected === option
                ? "border-brand-700 bg-brand-50 text-brand-800"
                : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50",
            )}
          >
            {option === "interested"
              ? "Looks good"
              : option === "question"
                ? "I have a question"
                : "Not right now"}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <label htmlFor="proposal-client-message" className="text-sm font-medium text-stone-700">
          Message to the venue team
        </label>
        <Textarea
          id="proposal-client-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Optional — share questions, timing notes, or preferences"
          className="mt-2"
          disabled={isSubmitting}
        />
      </div>

      <Button type="button" className="mt-4" disabled={isSubmitting} onClick={handleSubmit}>
        {isSubmitting ? "Sending…" : hasExistingResponse ? "Update response" : "Send response"}
      </Button>
    </section>
  );
}

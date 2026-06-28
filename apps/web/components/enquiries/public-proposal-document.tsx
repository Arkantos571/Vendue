import {
  publicProposalInclusions,
  publicProposalIntro,
  publicProposalPackage,
  publicProposalSchedule,
  publicProposalTerms,
  publicProposalTitle,
} from "@/lib/enquiries/public-proposal-display";
import type { PublicProposal } from "@/lib/enquiries/public-proposal-types";
import { formatEnquiryCurrency } from "@/lib/mock/enquiries";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PublicProposalDocumentProps {
  proposal: PublicProposal;
  className?: string;
}

export function PublicProposalDocument({ proposal, className }: PublicProposalDocumentProps) {
  const accent = proposal.accentColour || "#5b21b6";
  const title = publicProposalTitle(proposal);
  const intro = publicProposalIntro(proposal);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg",
        className,
      )}
    >
      <header className="px-6 py-10 text-white sm:px-10" style={{ backgroundColor: accent }}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Venudue</p>
        <p className="mt-4 text-sm text-white/90">Prepared for {proposal.clientName}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-base text-white/90">Proposal for {proposal.eventName}</p>
        <p className="mt-4 text-sm text-white/80">
          {proposal.venueName}
          {proposal.venueCity ? ` · ${proposal.venueCity}` : ""}
        </p>
        <p className="text-xs text-white/70">{proposal.venueType}</p>
      </header>

      <div className="space-y-10 px-6 py-10 sm:px-10">
        <section>
          <p className="text-base leading-relaxed text-stone-700">{intro}</p>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Event details</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-stone-500">Event</dt>
              <dd className="mt-1 font-medium text-stone-900">{proposal.eventName}</dd>
            </div>
            {proposal.eventTypeName && (
              <div>
                <dt className="text-stone-500">Event type</dt>
                <dd className="mt-1 text-stone-800">{proposal.eventTypeName}</dd>
              </div>
            )}
            <div>
              <dt className="text-stone-500">Schedule</dt>
              <dd className="mt-1 text-stone-800">{publicProposalSchedule(proposal)}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Guests</dt>
              <dd className="mt-1 text-stone-800">{proposal.guestCount}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl bg-stone-50 px-5 py-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Proposed package</h2>
          <p className="mt-3 text-lg font-medium text-stone-900">{publicProposalPackage(proposal)}</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-stone-900">
            {formatEnquiryCurrency(proposal.estimatedValue)}
            <span className="ml-2 text-sm font-normal text-stone-500">estimated</span>
          </p>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Inclusions</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
            {publicProposalInclusions(proposal)}
          </p>
        </section>

        {proposal.proposalValidUntil && (
          <section className="rounded-lg border border-stone-200 px-4 py-3">
            <p className="text-sm text-stone-700">
              <span className="font-medium">Valid until</span> {formatDate(proposal.proposalValidUntil)}
            </p>
          </section>
        )}

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Next steps</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            To proceed, please let us know if this proposal works for you. Our team will follow up with
            formal booking documentation. Online acceptance and payments are coming soon.
          </p>
        </section>

        <section className="border-t border-stone-100 pt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Terms</h2>
          <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-stone-500">
            {publicProposalTerms(proposal)}
          </p>
        </section>
      </div>
    </article>
  );
}

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
        "overflow-hidden rounded-xl border border-border bg-background shadow-lg",
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
          <p className="text-base leading-relaxed text-foreground/90">{intro}</p>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Event details</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Event</dt>
              <dd className="mt-1 font-medium text-foreground">{proposal.eventName}</dd>
            </div>
            {proposal.eventTypeName && (
              <div>
                <dt className="text-muted-foreground">Event type</dt>
                <dd className="mt-1 text-foreground">{proposal.eventTypeName}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">Schedule</dt>
              <dd className="mt-1 text-foreground">{publicProposalSchedule(proposal)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Guests</dt>
              <dd className="mt-1 text-foreground">{proposal.guestCount}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl bg-muted px-5 py-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Proposed package</h2>
          <p className="mt-3 text-lg font-medium text-foreground">{publicProposalPackage(proposal)}</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            {formatEnquiryCurrency(proposal.estimatedValue)}
            <span className="ml-2 text-sm font-normal text-muted-foreground">estimated</span>
          </p>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inclusions</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {publicProposalInclusions(proposal)}
          </p>
        </section>

        {proposal.proposalValidUntil && (
          <section className="rounded-lg border border-border px-4 py-3">
            <p className="text-sm text-foreground/90">
              <span className="font-medium">Valid until</span> {formatDate(proposal.proposalValidUntil)}
            </p>
          </section>
        )}

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next steps</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            To proceed, please let us know if this proposal works for you. Our team will follow up with
            formal booking documentation. Online acceptance and payments are coming soon.
          </p>
        </section>

        <section className="border-t border-border pt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Terms</h2>
          <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
            {publicProposalTerms(proposal)}
          </p>
        </section>
      </div>
    </article>
  );
}

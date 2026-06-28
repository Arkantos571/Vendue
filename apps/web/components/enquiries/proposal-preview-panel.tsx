import {
  buildProposalPreviewData,
  formatProposalSchedule,
  type ProposalPreviewData,
  type ProposalVenueSummary,
} from "@/lib/enquiries/proposal";
import { enquiryStatusLabels, formatEnquiryCurrency, type MockEnquiry } from "@/lib/mock/enquiries";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProposalPreviewPanelProps {
  enquiry: MockEnquiry;
  venue: ProposalVenueSummary;
  draft?: Partial<{
    title: string;
    intro: string;
    packageName: string;
    inclusions: string;
    terms: string;
    estimatedValue: number;
    validUntil: string | null;
    notes: string;
  }>;
  className?: string;
}

function resolvePreview(
  enquiry: MockEnquiry,
  venue: ProposalVenueSummary,
  draft?: ProposalPreviewPanelProps["draft"],
): ProposalPreviewData {
  const base = buildProposalPreviewData(enquiry, venue);
  if (!draft) return base;

  return {
    ...base,
    title: draft.title?.trim() || base.title,
    intro: draft.intro?.trim() || base.intro,
    packageName: draft.packageName?.trim() || base.packageName,
    inclusions: draft.inclusions?.trim() || base.inclusions,
    terms: draft.terms?.trim() || base.terms,
    estimatedValue: draft.estimatedValue ?? base.estimatedValue,
    validUntil: draft.validUntil ?? base.validUntil,
    enquiry: {
      ...enquiry,
      proposalNotes: draft.notes ?? enquiry.proposalNotes,
    },
  };
}

export function ProposalPreviewPanel({
  enquiry,
  venue,
  draft,
  className,
}: ProposalPreviewPanelProps) {
  const preview = resolvePreview(enquiry, venue, draft);
  const accent = venue.accentColour || "#5b21b6";

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        Preview only — sending and PDF export coming later
      </div>

      <article className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <header className="px-6 py-8 text-white sm:px-8" style={{ backgroundColor: accent }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">Venudue</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{preview.title}</h2>
          <p className="mt-3 text-sm text-white/90">
            {venue.name}
            {venue.city ? ` · ${venue.city}` : ""}
          </p>
          <p className="mt-1 text-xs text-white/75">{venue.venueType}</p>
        </header>

        <div className="space-y-8 px-6 py-8 sm:px-8">
          <section>
            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">{preview.intro}</p>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Client & event</h3>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-stone-500">Client</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-100">{enquiry.clientName}</dd>
              </div>
              {enquiry.company && (
                <div>
                  <dt className="text-stone-500">Company</dt>
                  <dd className="text-stone-800 dark:text-stone-200">{enquiry.company}</dd>
                </div>
              )}
              <div>
                <dt className="text-stone-500">Event</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-100">{enquiry.eventName}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Type</dt>
                <dd className="text-stone-800 dark:text-stone-200">{enquiry.eventType}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Schedule</dt>
                <dd className="text-stone-800 dark:text-stone-200">{formatProposalSchedule(enquiry)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Guests</dt>
                <dd className="text-stone-800 dark:text-stone-200">{enquiry.guestCount}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Proposed package</h3>
            <p className="mt-3 text-sm font-medium text-stone-900 dark:text-stone-100">{preview.packageName}</p>
            <p className="mt-4 text-2xl font-semibold text-stone-900 dark:text-stone-50">
              {formatEnquiryCurrency(preview.estimatedValue)}
              <span className="ml-2 text-sm font-normal text-stone-500">estimated</span>
            </p>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Inclusions</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-700 dark:text-stone-300">
              {preview.inclusions}
            </p>
          </section>

          {preview.enquiry.proposalNotes?.trim() && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Notes</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                {preview.enquiry.proposalNotes.trim()}
              </p>
            </section>
          )}

          {preview.validUntil && (
            <section className="rounded-lg bg-stone-50 px-4 py-3 dark:bg-stone-800/50">
              <p className="text-sm text-stone-700 dark:text-stone-300">
                <span className="font-medium">Valid until:</span> {formatDate(preview.validUntil)}
              </p>
            </section>
          )}

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Next steps</h3>
            <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              To proceed, please confirm your acceptance before the validity date. Our team will then
              send formal booking documentation.
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6 dark:border-stone-800">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Terms</h3>
            <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-stone-500 dark:text-stone-400">
              {preview.terms}
            </p>
          </section>
        </div>

        <footer className="border-t border-stone-100 bg-stone-50 px-6 py-4 text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-400 sm:px-8">
          Proposal status: {enquiryStatusLabels[enquiry.status]} · Prepared in Venudue
        </footer>
      </article>
    </div>
  );
}

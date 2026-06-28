"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Copy, Mail } from "lucide-react";
import { ProposalPreviewPanel } from "@/components/enquiries/proposal-preview-panel";
import { ProposalShareSection } from "@/components/enquiries/proposal-share-section";
import { EmailComposerModal } from "@/components/enquiries/email-composer-modal";
import { ProposalResponseSummary } from "@/components/enquiries/proposal-response-summary";
import { EnquiryStatusBadge } from "@/components/enquiries/enquiry-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  markProposalSentAction,
  updateEnquiryProposalAction,
  type EnquiryProposalInput,
} from "@/lib/enquiries/actions";
import {
  buildProposalPreviewData,
  defaultProposalIntro,
  defaultProposalTitle,
  formatProposalText,
  type ProposalVenueSummary,
} from "@/lib/enquiries/proposal";
import { formatEnquiryCurrency, type MockEnquiry } from "@/lib/mock/enquiries";
import { formatDate } from "@/lib/utils";

interface ProposalBuilderViewProps {
  enquiry: MockEnquiry;
  venue: ProposalVenueSummary;
}

export function ProposalBuilderView({ enquiry: initialEnquiry, venue }: ProposalBuilderViewProps) {
  const router = useRouter();
  const [enquiry, setEnquiry] = useState(initialEnquiry);

  const [title, setTitle] = useState(
    initialEnquiry.proposalTitle ?? defaultProposalTitle(initialEnquiry, venue.name),
  );
  const [intro, setIntro] = useState(
    initialEnquiry.proposalIntro ?? defaultProposalIntro(initialEnquiry, venue),
  );
  const [proposedPackage, setProposedPackage] = useState(initialEnquiry.proposedPackage ?? "");
  const [inclusions, setInclusions] = useState(initialEnquiry.proposalInclusions ?? "");
  const [terms, setTerms] = useState(initialEnquiry.proposalTerms ?? "");
  const [notes, setNotes] = useState(initialEnquiry.proposalNotes ?? "");
  const [internalNotes, setInternalNotes] = useState(initialEnquiry.proposalInternalNotes ?? "");
  const [estimatedValue, setEstimatedValue] = useState(String(initialEnquiry.estimatedValue || ""));
  const [validUntil, setValidUntil] = useState(initialEnquiry.proposalValidUntil ?? "");
  const [followUpDate, setFollowUpDate] = useState(initialEnquiry.nextFollowUpDate ?? "");

  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const [emailOpen, setEmailOpen] = useState(false);

  const isConverted = Boolean(enquiry.convertedEventId);
  const isLost = enquiry.status === "lost";
  const isReadOnly = isConverted || isLost;

  const previewDraft = useMemo(() => {
    const parsed = Number(estimatedValue);
    return {
      title,
      intro,
      packageName: proposedPackage,
      inclusions,
      terms,
      estimatedValue: Number.isFinite(parsed) ? parsed : 0,
      validUntil: validUntil || null,
      notes,
    };
  }, [title, intro, proposedPackage, inclusions, terms, estimatedValue, validUntil, notes]);

  const plainText = useMemo(() => {
    const base = buildProposalPreviewData(enquiry, venue);
    return formatProposalText({
      ...base,
      title: previewDraft.title || base.title,
      intro: previewDraft.intro || base.intro,
      packageName: previewDraft.packageName || base.packageName,
      inclusions: previewDraft.inclusions || base.inclusions,
      terms: previewDraft.terms || base.terms,
      estimatedValue: previewDraft.estimatedValue,
      validUntil: previewDraft.validUntil,
      enquiry: { ...enquiry, proposalNotes: notes },
    });
  }, [enquiry, venue, previewDraft, notes]);

  function buildInput(): EnquiryProposalInput {
    const parsedValue = Number(estimatedValue);
    return {
      enquiry_id: enquiry.id,
      proposal_title: title,
      proposal_intro: intro,
      proposed_package: proposedPackage,
      proposal_inclusions: inclusions,
      proposal_terms: terms,
      proposal_notes: notes,
      proposal_internal_notes: internalNotes,
      estimated_value: Number.isFinite(parsedValue) ? parsedValue : 0,
      proposal_valid_until: validUntil || null,
      next_follow_up_date: followUpDate || null,
    };
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const result = await updateEnquiryProposalAction(buildInput());
    setIsSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setEnquiry(result.enquiry);
    setSuccess("Proposal draft saved.");
    router.refresh();
  }

  async function handleMarkSent() {
    setIsSending(true);
    setError(null);
    setSuccess(null);

    const result = await markProposalSentAction(buildInput());
    setIsSending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setEnquiry(result.enquiry);
    setSuccess("Marked as proposal sent. Email sending will be connected later.");
    router.refresh();
  }

  async function handleCopy() {
    const text = formatProposalText({
      ...buildProposalPreviewData(enquiry, venue),
      title: previewDraft.title || defaultProposalTitle(enquiry, venue.name),
      intro: previewDraft.intro || defaultProposalIntro(enquiry, venue),
      packageName: previewDraft.packageName || "Package details to be confirmed",
      inclusions: previewDraft.inclusions || "Inclusions will be confirmed with your event coordinator.",
      terms: previewDraft.terms || "",
      estimatedValue: previewDraft.estimatedValue,
      validUntil: previewDraft.validUntil,
      enquiry: { ...enquiry, proposalNotes: notes },
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("manual");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Proposal builder</h2>
            <EnquiryStatusBadge status={enquiry.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {enquiry.eventName} · {enquiry.clientName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/enquiries/${enquiry.id}`}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to enquiry
          </Link>
          <Button type="button" variant="outline" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            {copyState === "copied" ? "Copied" : "Copy proposal text"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setEmailOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Email proposal link
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-700 dark:text-red-300">{error}</p>}
      {success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          {success}
        </p>
      )}

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Draft fields</CardTitle>
              <CardDescription>Edit the proposal content saved to this enquiry.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="proposal-title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Proposal title
                </label>
                <Input
                  id="proposal-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isReadOnly || isSaving || isSending}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="proposal-intro" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Intro message
                </label>
                <Textarea
                  id="proposal-intro"
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  rows={4}
                  disabled={isReadOnly || isSaving || isSending}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="builder-package" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Proposed package
                </label>
                <Input
                  id="builder-package"
                  value={proposedPackage}
                  onChange={(e) => setProposedPackage(e.target.value)}
                  disabled={isReadOnly || isSaving || isSending}
                  className="mt-1.5"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="builder-value" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Estimated value (£)
                  </label>
                  <Input
                    id="builder-value"
                    type="number"
                    min={0}
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    disabled={isReadOnly || isSaving || isSending}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label htmlFor="builder-valid" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Valid until
                  </label>
                  <Input
                    id="builder-valid"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    disabled={isReadOnly || isSaving || isSending}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="builder-inclusions" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Inclusions
                </label>
                <Textarea
                  id="builder-inclusions"
                  value={inclusions}
                  onChange={(e) => setInclusions(e.target.value)}
                  rows={4}
                  placeholder="Room hire, AV, staffing, catering…"
                  disabled={isReadOnly || isSaving || isSending}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="builder-notes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Client-facing notes
                </label>
                <Textarea
                  id="builder-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  disabled={isReadOnly || isSaving || isSending}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="builder-terms" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Terms placeholder
                </label>
                <Textarea
                  id="builder-terms"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={4}
                  disabled={isReadOnly || isSaving || isSending}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="builder-internal" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Internal proposal notes
                </label>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  Not shown in the client preview — for your team only.
                </p>
                <Textarea
                  id="builder-internal"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  disabled={isReadOnly || isSaving || isSending}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="builder-followup" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Internal follow-up date
                </label>
                <Input
                  id="builder-followup"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  disabled={isReadOnly || isSaving || isSending}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Source summary</CardTitle>
              <CardDescription>Read-only enquiry and venue context.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Venue</dt>
                  <dd className="text-slate-900 dark:text-slate-100">{venue.name}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Venue type</dt>
                  <dd className="text-slate-800 dark:text-slate-200">{venue.venueType}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Client email</dt>
                  <dd className="text-slate-800 dark:text-slate-200">{enquiry.clientEmail}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Requested date</dt>
                  <dd className="text-slate-800 dark:text-slate-200">
                    {enquiry.requestedDate ? formatDate(enquiry.requestedDate) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Space</dt>
                  <dd className="text-slate-800 dark:text-slate-200">{enquiry.spacePreference}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Current estimate</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">
                    {formatEnquiryCurrency(enquiry.estimatedValue)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <ProposalShareSection
            enquiry={enquiry}
            buildProposalInput={buildInput}
            onUpdated={setEnquiry}
          />

          <ProposalResponseSummary enquiry={enquiry} showBuilderLink={false} />

          {!isReadOnly && (
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={isSaving || isSending} onClick={handleSave}>
                {isSaving ? "Saving…" : "Save proposal draft"}
              </Button>
              <Button type="button" variant="outline" disabled={isSaving || isSending} onClick={handleMarkSent}>
                {isSending ? "Updating…" : "Mark proposal sent"}
              </Button>
            </div>
          )}
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <ProposalPreviewPanel enquiry={enquiry} venue={venue} draft={previewDraft} />
        </div>
      </div>

      {copyState === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle>Copy proposal text</CardTitle>
            <CardDescription>Clipboard access unavailable — copy manually below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea readOnly value={plainText} rows={16} className="font-mono text-xs" />
          </CardContent>
        </Card>
      )}
      <EmailComposerModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        enquiry={enquiry}
        venueName={venue.name}
        mode="proposal"
        onUpdated={setEnquiry}
      />
    </div>
  );
}

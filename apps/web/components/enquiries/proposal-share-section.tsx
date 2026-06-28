"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  generateProposalLinkAction,
  markProposalSentAction,
  type EnquiryProposalInput,
} from "@/lib/enquiries/actions";
import { getPublicProposalPath, getPublicProposalUrl } from "@/lib/enquiries/public-url";
import {
  proposalShareStatusLabels,
  type MockEnquiry,
} from "@/lib/mock/enquiries";
import { formatDate } from "@/lib/utils";

interface ProposalShareSectionProps {
  enquiry: MockEnquiry;
  buildProposalInput: () => EnquiryProposalInput;
  onUpdated?: (enquiry: MockEnquiry) => void;
}

export function ProposalShareSection({
  enquiry,
  buildProposalInput,
  onUpdated,
}: ProposalShareSectionProps) {
  const [current, setCurrent] = useState(enquiry);
  const [publicUrl, setPublicUrl] = useState(
    enquiry.proposalToken ? getPublicProposalUrl(enquiry.proposalToken) : "",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isConverted = Boolean(current.convertedEventId);
  const isLost = current.status === "lost";
  const hasLink = Boolean(current.proposalToken && publicUrl);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    const result = await generateProposalLinkAction(current.id);
    setIsGenerating(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setCurrent(result.enquiry);
    setPublicUrl(result.publicUrl);
    onUpdated?.(result.enquiry);
    setSuccess(hasLink ? "Proposal link is ready." : "Proposal link generated.");
  }

  async function handleCopy() {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setError("Could not copy automatically. Select the link and copy manually.");
    }
  }

  async function handleMarkSent() {
    setIsSending(true);
    setError(null);
    setSuccess(null);

    const result = await markProposalSentAction(buildProposalInput());
    setIsSending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setCurrent(result.enquiry);
    onUpdated?.(result.enquiry);
    setSuccess("Marked as proposal sent. Email sending will be connected later.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-brand-700" />
          Share proposal
        </CardTitle>
        <CardDescription>
          Generate a secure public link your client can open without signing in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-red-700 dark:text-red-300">{error}</p>}
        {success && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
            {success}
          </p>
        )}

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Proposal status</dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
              {proposalShareStatusLabels[current.proposalShareStatus]}
            </dd>
          </div>
          {current.proposalViewedAt && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">First viewed</dt>
              <dd className="mt-1 text-slate-800 dark:text-slate-200">
                {formatDate(current.proposalViewedAt)}
              </dd>
            </div>
          )}
        </dl>

        {hasLink && (
          <div>
            <label htmlFor="public-proposal-url" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Public proposal link
            </label>
            <Input id="public-proposal-url" readOnly value={publicUrl} className="mt-1.5 font-mono text-xs" />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {!isConverted && !isLost && (
            <Button type="button" disabled={isGenerating || isSending} onClick={handleGenerate}>
              {isGenerating ? "Working…" : hasLink ? "Refresh link" : "Generate proposal link"}
            </Button>
          )}
          {hasLink && (
            <>
              <Button type="button" variant="outline" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                {copyState === "copied" ? "Copied" : "Copy link"}
              </Button>
              <Link
                href={getPublicProposalPath(current.proposalToken!)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <ExternalLink className="h-4 w-4" />
                Open public proposal
              </Link>
            </>
          )}
          {!isConverted && !isLost && (
            <Button type="button" variant="outline" disabled={isGenerating || isSending} onClick={handleMarkSent}>
              {isSending ? "Updating…" : "Mark proposal sent"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

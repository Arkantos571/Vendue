import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicProposalPath, getPublicProposalUrl } from "@/lib/enquiries/public-url";
import {
  proposalClientResponseLabels,
  proposalShareStatusLabels,
  type MockEnquiry,
} from "@/lib/mock/enquiries";
import { formatDate } from "@/lib/utils";

interface ProposalResponseSummaryProps {
  enquiry: MockEnquiry;
  showBuilderLink?: boolean;
}

export function ProposalResponseSummary({
  enquiry,
  showBuilderLink = true,
}: ProposalResponseSummaryProps) {
  const publicUrl = enquiry.proposalToken ? getPublicProposalUrl(enquiry.proposalToken) : null;

  const items = [
    {
      label: "Proposal status",
      value: proposalShareStatusLabels[enquiry.proposalShareStatus],
    },
    {
      label: "First viewed",
      value: enquiry.proposalViewedAt ? formatDate(enquiry.proposalViewedAt) : "Not yet viewed",
    },
    {
      label: "Client response",
      value: enquiry.proposalClientResponse
        ? proposalClientResponseLabels[enquiry.proposalClientResponse]
        : "No response yet",
    },
    {
      label: "Responded at",
      value: enquiry.proposalRespondedAt ? formatDate(enquiry.proposalRespondedAt) : "—",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposal response</CardTitle>
        <CardDescription>Client activity from the public proposal link.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-4 sm:grid-cols-2">
          {items.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{value}</dd>
            </div>
          ))}
        </dl>

        {enquiry.proposalClientMessage && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Client message</p>
            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 dark:bg-slate-800/50">
              {enquiry.proposalClientMessage}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {showBuilderLink && (
            <Link
              href={`/dashboard/enquiries/${enquiry.id}/proposal`}
              className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              Open proposal builder
            </Link>
          )}
          {enquiry.proposalToken && (
            <Link
              href={getPublicProposalPath(enquiry.proposalToken)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <ExternalLink className="h-4 w-4" />
              View public proposal
            </Link>
          )}
        </div>

        {publicUrl && (
          <p className="text-xs text-slate-500 dark:text-slate-400 break-all">{publicUrl}</p>
        )}
      </CardContent>
    </Card>
  );
}

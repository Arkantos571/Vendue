"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getEmailProviderStatusAction,
  logCopiedEnquiryEmailAction,
  saveEnquiryEmailDraftAction,
  sendEnquiryEmailAction,
} from "@/lib/email/actions";
import {
  buildEnquiryEmailTemplate,
  enquiryEmailTemplateLabels,
  formatEmailForClipboard,
  type EnquiryEmailTemplate,
} from "@/lib/email/templates";
import type { MockEnquiry } from "@/lib/mock/enquiries";

export type EmailComposerMode = "enquiry" | "proposal";

interface EmailComposerModalProps {
  open: boolean;
  onClose: () => void;
  enquiry: MockEnquiry;
  venueName: string;
  mode: EmailComposerMode;
  onUpdated?: (enquiry: MockEnquiry) => void;
}

export function EmailComposerModal({
  open,
  onClose,
  enquiry,
  venueName,
  mode,
  onUpdated,
}: EmailComposerModalProps) {
  const initialTemplate: EnquiryEmailTemplate = mode === "proposal" ? "proposal" : "follow_up";
  const hasProposalToken = Boolean(enquiry.proposalToken);

  const [template, setTemplate] = useState<EnquiryEmailTemplate>(initialTemplate);
  const [recipient, setRecipient] = useState(enquiry.clientEmail);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [includeProposalLink, setIncludeProposalLink] = useState(hasProposalToken);
  const [providerConfigured, setProviderConfigured] = useState(false);
  const [isLoadingProvider, setIsLoadingProvider] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const templateContext = useMemo(
    () => ({
      clientName: enquiry.clientName,
      eventName: enquiry.eventName,
      venueName,
      proposalToken: enquiry.proposalToken,
      includeProposalLink,
    }),
    [enquiry.clientName, enquiry.eventName, enquiry.proposalToken, includeProposalLink, venueName],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setTemplate(initialTemplate);
    setRecipient(enquiry.clientEmail);
    setIncludeProposalLink(hasProposalToken);
    setError(null);
    setSuccess(null);

    const draft = buildEnquiryEmailTemplate(initialTemplate, {
      clientName: enquiry.clientName,
      eventName: enquiry.eventName,
      venueName,
      proposalToken: enquiry.proposalToken,
      includeProposalLink: hasProposalToken,
    });
    setSubject(draft.subject);
    setBody(draft.body);
  }, [open, enquiry.clientEmail, enquiry.clientName, enquiry.eventName, enquiry.id, enquiry.proposalToken, hasProposalToken, initialTemplate, venueName]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadProvider() {
      setIsLoadingProvider(true);
      const result = await getEmailProviderStatusAction();
      if (cancelled) {
        return;
      }

      if (result.success) {
        setProviderConfigured(result.configured);
      }
      setIsLoadingProvider(false);
    }

    void loadProvider();

    return () => {
      cancelled = true;
    };
  }, [open]);

  function applyTemplate(nextTemplate: EnquiryEmailTemplate, withLink = includeProposalLink) {
    const draft = buildEnquiryEmailTemplate(nextTemplate, {
      clientName: enquiry.clientName,
      eventName: enquiry.eventName,
      venueName,
      proposalToken: enquiry.proposalToken,
      includeProposalLink: withLink,
    });
    setSubject(draft.subject);
    setBody(draft.body);
  }

  function handleTemplateChange(nextTemplate: EnquiryEmailTemplate) {
    setTemplate(nextTemplate);
    applyTemplate(nextTemplate);
  }

  function handleIncludeLinkChange(checked: boolean) {
    setIncludeProposalLink(checked);
    applyTemplate(template, checked);
  }

  async function handleSaveDraft() {
    setIsSavingDraft(true);
    setError(null);
    setSuccess(null);

    const result = await saveEnquiryEmailDraftAction({
      enquiry_id: enquiry.id,
      recipient_email: recipient,
      subject,
      body,
    });

    setIsSavingDraft(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess("Draft saved.");
  }

  async function handleSend() {
    setIsSending(true);
    setError(null);
    setSuccess(null);

    const result = await sendEnquiryEmailAction({
      enquiry_id: enquiry.id,
      recipient_email: recipient,
      subject,
      body,
      template,
      mark_proposal_sent: template === "proposal",
    });

    setIsSending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (result.enquiry) {
      onUpdated?.(result.enquiry);
    }

    setSuccess("Email sent successfully.");
  }

  async function handleCopy() {
    setIsCopying(true);
    setError(null);
    setSuccess(null);

    const clipboardText = formatEmailForClipboard(recipient, subject, body);

    try {
      await navigator.clipboard.writeText(clipboardText);
    } catch {
      setIsCopying(false);
      setError("Could not copy to clipboard. Select the message and copy manually.");
      return;
    }

    const result = await logCopiedEnquiryEmailAction({
      enquiry_id: enquiry.id,
      recipient_email: recipient,
      subject,
      body,
      template,
    });

    setIsCopying(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (result.enquiry) {
      onUpdated?.(result.enquiry);
    }

    setSuccess(
      providerConfigured
        ? "Email copied to clipboard."
        : "Email copied. Provider not configured yet.",
    );
  }

  if (!open) {
    return null;
  }

  const isBusy = isSending || isCopying || isSavingDraft;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 dark:bg-black/60"
        aria-label="Close email composer"
        onClick={() => {
          if (!isBusy) {
            onClose();
          }
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-composer-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-brand-50 p-2 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 id="email-composer-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {mode === "proposal" ? "Email proposal link" : "Email client"}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Draft and preview an email for {enquiry.clientName}. Sending uses your configured provider when available.
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              {success}
            </div>
          )}

          {!isLoadingProvider && !providerConfigured && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              Email provider is not configured yet. Copy the email instead.
            </div>
          )}

          {mode === "enquiry" && (
            <div className="space-y-2">
              <Label htmlFor="email-template">Template</Label>
              <Select
                id="email-template"
                value={template}
                onChange={(event) => handleTemplateChange(event.target.value as EnquiryEmailTemplate)}
                disabled={isBusy}
              >
                {(Object.keys(enquiryEmailTemplateLabels) as EnquiryEmailTemplate[]).map((key) => (
                  <option key={key} value={key}>
                    {enquiryEmailTemplateLabels[key]}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email-to">To</Label>
            <Input
              id="email-to"
              type="email"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              disabled={isBusy}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-subject">Subject</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              disabled={isBusy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-body">Message</Label>
            <Textarea
              id="email-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={12}
              disabled={isBusy}
              className="font-mono text-sm"
            />
          </div>

          {hasProposalToken && (
            <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                className="mt-1"
                checked={includeProposalLink}
                onChange={(event) => handleIncludeLinkChange(event.target.checked)}
                disabled={isBusy}
              />
              <span>Include proposal link in the message</span>
            </label>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end dark:border-slate-800">
          <Button type="button" variant="outline" disabled={isBusy} onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="outline" disabled={isBusy} onClick={handleSaveDraft}>
            {isSavingDraft ? "Saving…" : "Save draft"}
          </Button>
          <Button type="button" variant="outline" disabled={isBusy} onClick={handleCopy}>
            {isCopying ? "Copying…" : "Copy email"}
          </Button>
          <Button
            type="button"
            disabled={isBusy || isLoadingProvider || !providerConfigured}
            onClick={handleSend}
          >
            {isSending ? "Sending…" : "Send email"}
          </Button>
        </div>
      </div>
    </div>
  );
}

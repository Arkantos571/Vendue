"use client";

import { Copy, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPublicEnquiryUrl } from "@/lib/enquiries/public-url";
import { normalizePublicSlug } from "@/lib/venue-setup/slug";

type PublicEnquiryLinkSettingsProps = {
  enabled: boolean;
  publicSlug: string;
  venueName: string;
  onEnabledChange: (enabled: boolean) => void;
  onPublicSlugChange: (slug: string) => void;
  disabled?: boolean;
};

export function PublicEnquiryLinkSettings({
  enabled,
  publicSlug,
  venueName,
  onEnabledChange,
  onPublicSlugChange,
  disabled = false,
}: PublicEnquiryLinkSettingsProps) {
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const previewSlug = useMemo(
    () => normalizePublicSlug(publicSlug.trim() || venueName),
    [publicSlug, venueName],
  );

  const previewUrl = useMemo(() => getPublicEnquiryUrl(previewSlug), [previewSlug]);
  const openHref = previewSlug ? `/enquire/${previewSlug}` : "/enquire";

  async function handleCopy() {
    if (!previewSlug) {
      return;
    }

    try {
      await navigator.clipboard.writeText(previewUrl);
      setCopyMessage("Link copied");
      window.setTimeout(() => setCopyMessage(null), 2000);
    } catch {
      setCopyMessage("Could not copy link");
    }
  }

  return (
    <section className="space-y-4 border-t border-stone-100 pt-8 dark:border-stone-800">
      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Public enquiry form
        </h3>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Share a link with clients so they can submit enquiries directly to your venue.
        </p>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-700 dark:bg-stone-800/50">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-500"
          checked={enabled}
          disabled={disabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
        />
        <span>
          <span className="block text-sm font-medium text-stone-900 dark:text-stone-100">
            Enable public enquiry form
          </span>
          <span className="mt-1 block text-sm text-stone-500 dark:text-stone-400">
            When enabled, your shareable link accepts new website enquiries.
          </span>
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="public_slug">Public slug</Label>
          <Input
            id="public_slug"
            value={publicSlug}
            disabled={disabled || !enabled}
            onChange={(event) => onPublicSlugChange(normalizePublicSlug(event.target.value))}
            placeholder="the-grand-hall"
            autoComplete="off"
            spellCheck={false}
          />
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Lowercase letters, numbers, and hyphens only.
          </p>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Preview URL</Label>
          <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
            {enabled && previewSlug ? previewUrl : "Enable the form and set a slug to generate a link."}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !enabled || !previewSlug}
          onClick={() => void handleCopy()}
        >
          <Copy className="h-4 w-4" />
          Copy link
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !enabled || !previewSlug}
          onClick={() => window.open(openHref, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="h-4 w-4" />
          Open form
        </Button>
        {copyMessage ? <span className="text-sm text-brand-700 dark:text-brand-300">{copyMessage}</span> : null}
      </div>
    </section>
  );
}

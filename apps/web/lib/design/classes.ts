/** Shared Tailwind class groups backed by CSS design tokens. */

export const pageHeading = "text-lg font-semibold text-foreground";
export const sectionHeading = "text-base font-semibold text-foreground";
export const sectionTitle = "text-2xl font-semibold text-foreground";
export const textMuted = "text-muted-foreground";
export const textSubtle = "text-muted-foreground";
export const textBody = "text-foreground/90";
export const linkBrand = "font-medium text-primary hover:opacity-90";

export const panel =
  "rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm";

export const cardSurface =
  "rounded-xl border border-border bg-card text-card-foreground shadow-sm";

export const emptyState =
  "rounded-xl border border-border bg-card px-6 py-12 text-center text-card-foreground shadow-sm";

export const tableHeader =
  "border-b border-border bg-muted/60 text-xs font-medium uppercase tracking-wide text-muted-foreground";

export const tableRowHover =
  "transition-colors hover:bg-muted/80 focus-visible:bg-muted/80";

export const filterChipActive =
  "rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground";

export const filterChipInactive =
  "rounded-full bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted";

export const alertError =
  "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300";

export const alertSuccess =
  "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300";

export const alertInfo =
  "rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-200";

import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  /** Sidebar / dark backgrounds */
  variant?: "default" | "inverse";
  href?: string;
  size?: LogoSize;
  ariaLabel?: string;
}

const sizeStyles: Record<
  LogoSize,
  { icon: string; wordmark: string; gap: string }
> = {
  sm: { icon: "h-7 w-7", wordmark: "text-base", gap: "gap-2" },
  md: { icon: "h-8 w-8", wordmark: "text-lg", gap: "gap-2.5" },
  lg: { icon: "h-10 w-10", wordmark: "text-xl", gap: "gap-3" },
};

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect x="2" y="4" width="28" height="26" rx="7" className="fill-primary" />
      <rect x="2" y="4" width="28" height="8" rx="7" className="fill-brand-900/35" />
      <circle cx="10" cy="8" r="1.25" className="fill-primary-foreground/70" />
      <circle cx="16" cy="8" r="1.25" className="fill-primary-foreground/70" />
      <circle cx="22" cy="8" r="1.25" className="fill-primary-foreground/70" />
      {/* Upright V: open at top, point at bottom */}
      <path
        d="M10.5 15.5L16 24.5L21.5 15.5H18.8L16 20.2L13.2 15.5H10.5Z"
        className="fill-primary-foreground"
      />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
  variant = "default",
  href = "/",
  size = "md",
  ariaLabel = "Venudue home",
}: LogoProps) {
  const styles = sizeStyles[size];
  const isInverse = variant === "inverse";

  const content = (
    <>
      <LogoIcon className={cn("shrink-0", styles.icon)} />
      {showWordmark ? (
        <span
          className={cn(
            "font-semibold tracking-tight",
            styles.wordmark,
            isInverse ? "text-primary-foreground" : "text-foreground",
          )}
        >
          Venudue
        </span>
      ) : null}
    </>
  );

  const linkClass = cn(
    "inline-flex items-center transition-opacity hover:opacity-90",
    styles.gap,
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={linkClass}
        aria-label={showWordmark ? undefined : ariaLabel}
      >
        {content}
      </Link>
    );
  }

  return (
    <span className={linkClass} aria-label={showWordmark ? undefined : ariaLabel}>
      {content}
    </span>
  );
}

export function LogoIconOnly({
  className,
  size = "md",
}: {
  className?: string;
  size?: LogoSize;
}) {
  return <LogoIcon className={cn(sizeStyles[size].icon, className)} />;
}

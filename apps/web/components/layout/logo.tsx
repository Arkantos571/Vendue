import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";
type LogoVariant = "default" | "inverse" | "landing";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  variant?: LogoVariant;
  href?: string;
  size?: LogoSize;
  ariaLabel?: string;
}

const sizeStyles: Record<
  LogoSize,
  { box: string; wordmark: string; gap: string; vText: string }
> = {
  sm: { box: "h-7 w-7 rounded-lg", wordmark: "text-base", gap: "gap-2", vText: "text-[15px]" },
  md: { box: "h-8 w-8 rounded-[9px]", wordmark: "text-lg", gap: "gap-2.5", vText: "text-[17px]" },
  lg: { box: "h-10 w-10 rounded-[10px]", wordmark: "text-xl", gap: "gap-3", vText: "text-[21px]" },
};

const markStyles: Record<LogoVariant, string> = {
  default: "bg-primary text-primary-foreground",
  inverse: "bg-primary text-primary-foreground",
  landing: "bg-[#6f9180] text-[#f7f4ef]",
};

const wordmarkStyles: Record<LogoVariant, string> = {
  default: "text-foreground",
  inverse: "text-primary-foreground",
  landing: "text-[#f2f4ef]",
};

function LogoIcon({
  className,
  size = "md",
  variant = "default",
}: {
  className?: string;
  size?: LogoSize;
  variant?: LogoVariant;
}) {
  const styles = sizeStyles[size];

  return (
    <span
      className={cn(
        "logo-mark inline-flex shrink-0 items-center justify-center font-display font-medium leading-none",
        markStyles[variant],
        styles.box,
        styles.vText,
        className,
      )}
      aria-hidden
    >
      V
    </span>
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

  const content = (
    <>
      <LogoIcon size={size} variant={variant} />
      {showWordmark ? (
        <span
          className={cn(
            "logo-wordmark font-display font-medium tracking-tight",
            styles.wordmark,
            wordmarkStyles[variant],
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
  variant = "default",
}: {
  className?: string;
  size?: LogoSize;
  variant?: LogoVariant;
}) {
  return <LogoIcon className={className} size={size} variant={variant} />;
}

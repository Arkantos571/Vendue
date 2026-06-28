import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  variant?: "default" | "inverse";
  href?: string;
  size?: LogoSize;
  ariaLabel?: string;
}

const sizeStyles: Record<
  LogoSize,
  { box: string; wordmark: string; gap: string; vText: string }
> = {
  sm: { box: "h-7 w-7 rounded-[6px]", wordmark: "text-base", gap: "gap-2", vText: "text-[13px]" },
  md: { box: "h-8 w-8 rounded-[7px]", wordmark: "text-lg", gap: "gap-2.5", vText: "text-[15px]" },
  lg: { box: "h-10 w-10 rounded-[8px]", wordmark: "text-xl", gap: "gap-3", vText: "text-[18px]" },
};

function LogoIcon({ className, size = "md" }: { className?: string; size?: LogoSize }) {
  const styles = sizeStyles[size];

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-primary text-primary-foreground",
        styles.box,
        className,
      )}
      aria-hidden
    >
      <span className="absolute inset-x-0 top-[20%] flex justify-center gap-[3px]">
        <span className="h-[3px] w-[3px] rounded-full bg-primary-foreground/60" />
        <span className="h-[3px] w-[3px] rounded-full bg-primary-foreground/60" />
        <span className="h-[3px] w-[3px] rounded-full bg-primary-foreground/60" />
      </span>
      <span
        className={cn(
          "font-display translate-y-[8%] font-medium leading-none",
          styles.vText,
        )}
      >
        V
      </span>
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
  const isInverse = variant === "inverse";

  const content = (
    <>
      <LogoIcon size={size} />
      {showWordmark ? (
        <span
          className={cn(
            "font-display font-medium tracking-tight",
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
  return <LogoIcon className={className} size={size} />;
}

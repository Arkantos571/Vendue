import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  variant?: "light" | "dark";
  href?: string;
}

export function Logo({
  className,
  showWordmark = true,
  variant = "light",
  href = "/",
}: LogoProps) {
  const isDark = variant === "dark";

  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white",
          isDark ? "bg-brand-500" : "bg-brand-700",
        )}
      >
        V
      </span>
      {showWordmark && (
        <span
          className={cn(
            "text-lg font-semibold tracking-tight",
            isDark ? "text-white" : "text-stone-900",
          )}
        >
          Vendue
        </span>
      )}
    </Link>
  );
}

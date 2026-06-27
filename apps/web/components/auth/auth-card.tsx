import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { PublicThemeToggle } from "@/components/layout/public-theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 py-12 dark:bg-stone-950">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <PublicThemeToggle />
      </div>
      <Link href="/" className="mb-8 transition-opacity hover:opacity-80">
        <Logo />
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      {footer && <div className="mt-6 text-center text-sm text-stone-600 dark:text-stone-400">{footer}</div>}
      <Link href="/" className="mt-4 text-sm text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200">← Back to homepage</Link>
    </div>
  );
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="v-link">
      {children}
    </Link>
  );
}

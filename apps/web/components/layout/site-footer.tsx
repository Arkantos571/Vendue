import Link from "next/link";
import { Logo } from "@/components/layout/logo";

const footerLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/enquire", label: "Enquire" },
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Get started" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">
              Venudue — hospitality event operations at{" "}
              <span className="font-medium text-foreground">venudue.app</span>
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Venudue. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

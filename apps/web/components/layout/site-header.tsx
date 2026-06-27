"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/layout/logo";
import { PublicThemeToggle } from "@/components/layout/public-theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <PublicThemeToggle />
          <Link href="/sign-in" className="hidden text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 sm:inline">Sign in</Link>
          <Link href="/sign-up" className="hidden h-10 items-center justify-center rounded-lg bg-brand-700 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-800 sm:inline-flex">Start managing events</Link>
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label={mobileOpen ? "Close menu" : "Open menu"}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-stone-200 bg-white px-4 py-4 dark:border-stone-800 dark:bg-stone-950 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm font-medium text-stone-700 dark:text-stone-300" onClick={() => setMobileOpen(false)}>{label}</Link>
            ))}
            <Link href="/sign-in" className="text-sm font-medium text-stone-700 dark:text-stone-300">Sign in</Link>
            <Link href="/sign-up" className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-700 px-4 text-sm font-medium text-white">Start managing events</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

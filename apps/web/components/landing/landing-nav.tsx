"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/layout/logo";
import { PublicThemeToggle } from "@/components/layout/public-theme-toggle";

const LINKS = [
  { label: "Product", href: "#features" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Sign in", href: "/sign-in" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="lp-nav">
      <div className="lp-container lp-nav__bar">
        <Logo href="/#top" />

        <nav className="lp-nav__links" aria-label="Main navigation">
          {LINKS.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
          <Link href="/sign-up" className="lp-btn lp-btn-primary lp-nav__cta">
            Start free
          </Link>
        </nav>

        <div className="lp-nav__actions">
          <PublicThemeToggle />
          <button
            type="button"
            className="lp-nav__toggle md:hidden"
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="lp-nav__toggle-bar" />
            <span className="lp-nav__toggle-bar" />
          </button>
        </div>
      </div>

      {open ? (
        <nav id="landing-mobile-menu" className="lp-nav__mobile" aria-label="Mobile navigation">
          {LINKS.map((link) => (
            <Link key={link.label} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/sign-up" className="lp-btn lp-btn-primary" onClick={() => setOpen(false)}>
            Start free
          </Link>
        </nav>
      ) : null}
    </header>
  );
}

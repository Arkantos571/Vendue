import Link from "next/link";
import { Logo } from "@/components/layout/logo";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Enquiries", href: "#features" },
      { label: "Events", href: "#features" },
      { label: "Function sheets", href: "#features" },
      { label: "Rotas", href: "#features" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#top" },
      { label: "Pricing", href: "#pricing" },
      { label: "Contact", href: "/enquire" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#top" },
      { label: "Terms", href: "#top" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer__grid">
        <div className="lp-footer__brand">
          <Logo href="/" variant="landing" />
          <p className="lp-footer__tagline">
            Hospitality event operations, on one screen.
          </p>
          <p className="lp-footer__domain">venudue.app</p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.heading} className="lp-footer__column">
            <p className="lp-footer__heading">{column.heading}</p>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="lp-container lp-footer__bottom">
        <span>© {new Date().getFullYear()} Venudue. All rights reserved.</span>
      </div>
    </footer>
  );
}

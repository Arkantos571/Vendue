import Link from "next/link";

export function LandingCta() {
  return (
    <section id="pricing" className="lp-section lp-cta">
      <div className="lp-container lp-cta__panel">
        <h2 className="lp-cta__heading">Ready to run a calmer service?</h2>
        <p className="lp-cta__sub">
          Set up your first venue in minutes. Free while you&apos;re getting started.
        </p>
        <div className="lp-cta__actions">
          <Link href="/sign-up" className="lp-btn lp-btn-primary">
            Start managing events
          </Link>
          <Link href="/sign-in" className="lp-btn lp-btn-secondary">
            View demo dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

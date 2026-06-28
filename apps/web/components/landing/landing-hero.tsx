import Link from "next/link";

const EVENTS = [
  {
    name: "Harper wedding",
    meta: "120 covers · Garden room · 13:00",
    tone: "sage" as const,
  },
  {
    name: "Corporate dinner",
    meta: "40 covers · Private dining · 19:30",
    tone: "marigold" as const,
  },
  {
    name: "Enquiry · 30th party",
    meta: "Awaiting deposit",
    tone: "danger" as const,
  },
];

export function LandingHero() {
  return (
    <section id="top" className="lp-hero">
      <div className="lp-container lp-hero__grid">
        <div>
          <p className="lp-eyebrow">Hospitality event operations</p>
          <h1 className="lp-hero__headline">
            Run the room,
            <br />
            not the chaos.
          </h1>
          <p className="lp-hero__lead">
            Enquiries, events, function sheets and rotas in one calm workspace. Your
            whole team, finally on the same page.
          </p>
          <div className="lp-hero__actions">
            <Link href="/sign-up" className="lp-btn lp-btn-primary">
              Start free
            </Link>
            <Link href="/sign-in" className="lp-btn lp-btn-secondary">
              View demo dashboard
            </Link>
          </div>
          <p className="lp-hero__note">Free for single venues. No card required.</p>
        </div>

        <div className="lp-hero__panel" aria-hidden="true">
          <div className="lp-hero__panel-head">
            <span>Today · Sat 28 Jun</span>
            <span className="lp-hero__panel-count">4 events</span>
          </div>
          <ul className="lp-hero__panel-list">
            {EVENTS.map((event) => (
              <li
                key={event.name}
                className={`lp-hero__event lp-hero__event--${event.tone}`}
              >
                <span className="lp-hero__event-name">{event.name}</span>
                <span className="lp-hero__event-meta">{event.meta}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

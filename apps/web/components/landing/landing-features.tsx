const CALENDAR_INTENSITY = [1, 3, 1, 1, 2, 3, 1, 1, 1, 3, 1, 1, 2, 3];

const ROSTER = [
  { initials: "JM", tone: "marigold" as const },
  { initials: "RP", tone: "sage" as const },
  { initials: "TK", tone: "danger" as const },
];

export function LandingFeatures() {
  return (
    <section id="features" className="lp-section">
      <div className="lp-container">
        <div className="lp-features__intro">
          <h2 className="lp-features__heading">
            See your whole operation on <span className="lp-features__accent">one screen</span>.
          </h2>
          <p className="lp-features__sub">
            Stop juggling spreadsheets, inboxes and group chats.
          </p>
        </div>

        <div className="lp-bento-grid">
          <article className="lp-bento lp-bento--calendar">
            <p className="lp-bento__label">Event calendar</p>
            <div className="lp-bento__heatmap" aria-hidden="true">
              {CALENDAR_INTENSITY.map((level, index) => (
                <span key={index} className={`lp-bento__cell lp-bento__cell--${level}`} />
              ))}
            </div>
            <p className="lp-bento__metric">
              June · <strong>18 events</strong>
            </p>
            <p className="lp-bento__caption">3 awaiting function sheets</p>
          </article>

          <article className="lp-bento">
            <p className="lp-bento__label">Enquiry pipeline</p>
            <p className="lp-bento__stat">12</p>
            <p className="lp-bento__delta">+4 this week</p>
            <p className="lp-bento__desc">
              Track new leads from first contact through proposal to confirmed booking.
            </p>
          </article>

          <article className="lp-bento">
            <p className="lp-bento__label">Team management</p>
            <p className="lp-bento__stat">24</p>
            <p className="lp-bento__caption">active staff members</p>
            <p className="lp-bento__desc">
              Maintain your roster with roles, rates, and availability.
            </p>
          </article>

          <article className="lp-bento">
            <p className="lp-bento__label">Rota builder</p>
            <div className="lp-bento__roster" aria-hidden="true">
              {ROSTER.map((person) => (
                <span
                  key={person.initials}
                  className={`lp-bento__avatar lp-bento__avatar--${person.tone}`}
                >
                  {person.initials}
                </span>
              ))}
              <span className="lp-bento__avatar lp-bento__avatar--more">+5</span>
            </div>
            <p className="lp-bento__desc">
              Assign staff to events with roles, sections, and labour cost visibility.
            </p>
          </article>

          <article className="lp-bento">
            <p className="lp-bento__label">Function sheets</p>
            <p className="lp-bento__stat">9</p>
            <p className="lp-bento__caption">ready for service</p>
            <p className="lp-bento__desc">
              Operational run sheets for F&B, setup, and service requirements.
            </p>
          </article>

          <article className="lp-bento">
            <p className="lp-bento__label">Public proposals</p>
            <p className="lp-bento__stat">6</p>
            <p className="lp-bento__caption">awaiting client response</p>
            <p className="lp-bento__desc">
              Share polished proposals clients can view and respond to online.
            </p>
          </article>

          <article className="lp-bento">
            <p className="lp-bento__label">Staff shift view</p>
            <p className="lp-bento__stat">18</p>
            <p className="lp-bento__caption">shifts this week</p>
            <p className="lp-bento__desc">
              Mobile-friendly shift cards so floor staff know where to be and when.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

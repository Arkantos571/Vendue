const PROOF_CHIPS = [
  "Enquiries",
  "Events",
  "Function sheets",
  "Rotas",
  "Team",
  "Proposals",
];

export function LandingProof() {
  return (
    <section className="lp-section lp-proof">
      <div className="lp-container">
        <p className="lp-proof__statement">
          Built for venues still running events across spreadsheets, WhatsApp and
          scattered notes.
        </p>
        <p className="lp-proof__support">
          Venudue brings enquiries, events, function sheets and rotas into one calm
          workspace your whole team can trust.
        </p>
        <div className="lp-proof__chips" aria-label="Venudue modules">
          {PROOF_CHIPS.map((chip) => (
            <span key={chip} className="lp-proof__chip">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

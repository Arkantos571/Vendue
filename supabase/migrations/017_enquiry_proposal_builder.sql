-- Proposal builder draft fields (non-destructive)

ALTER TABLE enquiries
  ADD COLUMN IF NOT EXISTS proposal_title text,
  ADD COLUMN IF NOT EXISTS proposal_intro text,
  ADD COLUMN IF NOT EXISTS proposal_inclusions text,
  ADD COLUMN IF NOT EXISTS proposal_terms text,
  ADD COLUMN IF NOT EXISTS proposal_internal_notes text;

COMMENT ON COLUMN enquiries.proposal_title IS 'Client-facing proposal title';
COMMENT ON COLUMN enquiries.proposal_intro IS 'Opening message for the proposal';
COMMENT ON COLUMN enquiries.proposal_inclusions IS 'Package inclusions list or description';
COMMENT ON COLUMN enquiries.proposal_terms IS 'Terms and conditions placeholder';
COMMENT ON COLUMN enquiries.proposal_internal_notes IS 'Internal-only notes not shown to client';

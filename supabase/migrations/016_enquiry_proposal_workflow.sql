-- Proposal workflow fields for enquiries (non-destructive)

ALTER TABLE enquiries
  ADD COLUMN IF NOT EXISTS proposal_notes text,
  ADD COLUMN IF NOT EXISTS proposed_package text,
  ADD COLUMN IF NOT EXISTS proposal_valid_until date,
  ADD COLUMN IF NOT EXISTS lost_reason text;

COMMENT ON COLUMN enquiries.proposal_notes IS 'Manager notes included with the proposal';
COMMENT ON COLUMN enquiries.proposed_package IS 'Summary of proposed package or offering';
COMMENT ON COLUMN enquiries.proposal_valid_until IS 'Date until which the proposal remains valid';
COMMENT ON COLUMN enquiries.lost_reason IS 'Optional reason when enquiry is marked lost';

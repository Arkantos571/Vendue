-- Optional E2E fixture: shareable proposal token on an existing enquiry.
-- Run after demo_data.sql and venue onboarding.
-- Default token matches apps/web/e2e/global-setup.ts when E2E_PROPOSAL_TOKEN is unset.

BEGIN;

UPDATE public.enquiries e
SET
  proposal_token = 'e2e-test-proposal-token',
  proposal_status = 'shared',
  proposal_title = 'E2E Test Proposal',
  proposal_intro = 'This proposal is used by Playwright E2E tests.',
  proposal_inclusions = 'Room hire, canapés, and service staff.',
  proposal_terms = 'Subject to venue availability.',
  proposal_valid_until = '2026-12-31',
  estimated_value = 8500,
  proposed_package = 'Standard package'
FROM public.venues v
WHERE e.venue_id = v.id
  AND v.id = (SELECT id FROM public.venues ORDER BY created_at LIMIT 1)
  AND e.status IN ('proposal_sent', 'qualified', 'new')
  AND e.proposal_token IS NULL
  AND e.id = (
    SELECT id FROM public.enquiries
    WHERE venue_id = v.id
    ORDER BY created_at DESC
    LIMIT 1
  );

COMMIT;

-- Public shareable proposal links (non-destructive)

ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS proposal_token text,
  ADD COLUMN IF NOT EXISTS proposal_published_at timestamptz,
  ADD COLUMN IF NOT EXISTS proposal_viewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS proposal_status text NOT NULL DEFAULT 'draft';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'enquiries_proposal_status_check'
  ) THEN
    ALTER TABLE public.enquiries
      ADD CONSTRAINT enquiries_proposal_status_check
      CHECK (
        proposal_status IN (
          'draft',
          'shared',
          'viewed',
          'accepted_placeholder',
          'declined_placeholder'
        )
      );
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS enquiries_proposal_token_unique_idx
  ON public.enquiries (proposal_token)
  WHERE proposal_token IS NOT NULL;

-- Load a client-safe proposal by token. Records first view and notifies managers.
CREATE OR REPLACE FUNCTION public.get_public_proposal(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text := nullif(trim(p_token), '');
  v_row record;
  v_event_type_name text;
  v_space_name text;
  v_first_view boolean;
BEGIN
  IF v_token IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT
    e.id,
    e.event_name,
    e.client_name,
    e.requested_date,
    e.preferred_start_time,
    e.preferred_end_time,
    e.guest_count,
    e.estimated_value,
    e.proposed_package,
    e.proposal_title,
    e.proposal_intro,
    e.proposal_inclusions,
    e.proposal_terms,
    e.proposal_valid_until,
    e.proposal_status,
    e.proposal_viewed_at,
    v.name AS venue_name,
    v.venue_type,
    v.venue_type_custom,
    v.city AS venue_city,
    v.accent_colour
  INTO v_row
  FROM public.enquiries e
  INNER JOIN public.venues v ON v.id = e.venue_id
  WHERE e.proposal_token = v_token;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT et.name INTO v_event_type_name
  FROM public.event_types et
  WHERE et.id = (SELECT event_type_id FROM public.enquiries WHERE id = v_row.id);

  SELECT s.name INTO v_space_name
  FROM public.spaces s
  WHERE s.id = (SELECT space_id FROM public.enquiries WHERE id = v_row.id);

  v_first_view := v_row.proposal_viewed_at IS NULL;

  IF v_first_view OR v_row.proposal_status IN ('draft', 'shared') THEN
    UPDATE public.enquiries
    SET
      proposal_viewed_at = COALESCE(proposal_viewed_at, timezone('utc', now())),
      proposal_status = CASE
        WHEN proposal_status IN ('draft', 'shared') THEN 'viewed'
        ELSE proposal_status
      END
    WHERE id = v_row.id
    RETURNING proposal_status, proposal_viewed_at INTO v_row.proposal_status, v_row.proposal_viewed_at;
  END IF;

  IF v_first_view THEN
    INSERT INTO public.notifications (
      venue_id,
      profile_id,
      type,
      title,
      body,
      related_enquiry_id,
      metadata
    )
    SELECT
      e.venue_id,
      vm.profile_id,
      'proposal_viewed',
      'Proposal viewed',
      e.client_name || ' viewed the proposal for ' || e.event_name,
      e.id,
      jsonb_build_object('enquiry_id', e.id)
    FROM public.enquiries e
    INNER JOIN public.venue_members vm ON vm.venue_id = e.venue_id
    WHERE e.id = v_row.id
      AND vm.role IN ('owner', 'admin', 'manager')
      AND vm.profile_id IS NOT NULL
      AND vm.joined_at IS NOT NULL;
  END IF;

  RETURN jsonb_build_object(
    'venue_name', v_row.venue_name,
    'venue_type', v_row.venue_type,
    'venue_type_custom', v_row.venue_type_custom,
    'venue_city', v_row.venue_city,
    'accent_colour', v_row.accent_colour,
    'event_name', v_row.event_name,
    'client_name', v_row.client_name,
    'requested_date', v_row.requested_date,
    'preferred_start_time', v_row.preferred_start_time,
    'preferred_end_time', v_row.preferred_end_time,
    'guest_count', v_row.guest_count,
    'event_type_name', v_event_type_name,
    'space_name', v_space_name,
    'proposed_package', v_row.proposed_package,
    'estimated_value', v_row.estimated_value,
    'proposal_title', v_row.proposal_title,
    'proposal_intro', v_row.proposal_intro,
    'proposal_inclusions', v_row.proposal_inclusions,
    'proposal_terms', v_row.proposal_terms,
    'proposal_valid_until', v_row.proposal_valid_until,
    'proposal_status', v_row.proposal_status
  );
END;
$$;

-- Placeholder client response (not legally binding).
CREATE OR REPLACE FUNCTION public.respond_public_proposal(
  p_token text,
  p_response text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text := nullif(trim(p_token), '');
BEGIN
  IF v_token IS NULL THEN
    RETURN false;
  END IF;

  IF p_response NOT IN ('accepted_placeholder', 'declined_placeholder') THEN
    RAISE EXCEPTION 'Invalid proposal response';
  END IF;

  UPDATE public.enquiries
  SET proposal_status = p_response
  WHERE proposal_token = v_token;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_proposal(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.respond_public_proposal(text, text) TO anon, authenticated;

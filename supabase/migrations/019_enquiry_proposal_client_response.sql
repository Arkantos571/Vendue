-- Client proposal response tracking (non-destructive)

ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS proposal_client_response text,
  ADD COLUMN IF NOT EXISTS proposal_client_message text,
  ADD COLUMN IF NOT EXISTS proposal_responded_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'enquiries_proposal_client_response_check'
  ) THEN
    ALTER TABLE public.enquiries
      ADD CONSTRAINT enquiries_proposal_client_response_check
      CHECK (
        proposal_client_response IS NULL
        OR proposal_client_response IN ('interested', 'question', 'not_right_now', 'declined')
      );
  END IF;
END $$;

-- Include client response fields in public proposal load.
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
    e.proposal_client_response,
    e.proposal_client_message,
    e.proposal_responded_at,
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
    'proposal_status', v_row.proposal_status,
    'proposal_client_response', v_row.proposal_client_response,
    'proposal_client_message', v_row.proposal_client_message,
    'proposal_responded_at', v_row.proposal_responded_at
  );
END;
$$;

-- Submit or update a client proposal response (not legally binding).
CREATE OR REPLACE FUNCTION public.submit_public_proposal_response(
  p_token text,
  p_response text,
  p_message text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text := nullif(trim(p_token), '');
  v_row record;
  v_previous_response text;
  v_message text := nullif(trim(p_message), '');
  v_proposal_status text;
  v_proposal_client_response text;
  v_proposal_client_message text;
  v_proposal_responded_at timestamptz;
BEGIN
  IF v_token IS NULL THEN
    RETURN NULL;
  END IF;

  IF p_response NOT IN ('interested', 'question', 'not_right_now', 'declined') THEN
    RAISE EXCEPTION 'Invalid proposal response';
  END IF;

  SELECT
    e.id,
    e.venue_id,
    e.client_name,
    e.event_name,
    e.proposal_client_response,
    e.proposal_status
  INTO v_row
  FROM public.enquiries e
  WHERE e.proposal_token = v_token;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_previous_response := v_row.proposal_client_response;

  UPDATE public.enquiries
  SET
    proposal_client_response = p_response,
    proposal_client_message = v_message,
    proposal_responded_at = timezone('utc', now()),
    proposal_status = CASE
      WHEN p_response = 'interested' THEN 'accepted_placeholder'
      WHEN p_response = 'not_right_now' THEN 'declined_placeholder'
      ELSE proposal_status
    END
  WHERE id = v_row.id
  RETURNING proposal_status, proposal_client_response, proposal_client_message, proposal_responded_at
  INTO v_proposal_status, v_proposal_client_response, v_proposal_client_message, v_proposal_responded_at;

  IF v_previous_response IS DISTINCT FROM p_response THEN
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
      v_row.venue_id,
      vm.profile_id,
      'proposal_response',
      'Proposal response received',
      v_row.client_name || ' responded to the proposal for ' || v_row.event_name,
      v_row.id,
      jsonb_build_object(
        'enquiry_id', v_row.id,
        'proposal_client_response', p_response
      )
    FROM public.venue_members vm
    WHERE vm.venue_id = v_row.venue_id
      AND vm.role IN ('owner', 'admin', 'manager')
      AND vm.profile_id IS NOT NULL
      AND vm.joined_at IS NOT NULL;
  END IF;

  RETURN jsonb_build_object(
    'proposal_status', v_proposal_status,
    'proposal_client_response', v_proposal_client_response,
    'proposal_client_message', v_proposal_client_message,
    'proposal_responded_at', v_proposal_responded_at
  );
END;
$$;

DROP FUNCTION IF EXISTS public.respond_public_proposal(text, text);

GRANT EXECUTE ON FUNCTION public.get_public_proposal(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_public_proposal_response(text, text, text) TO anon, authenticated;

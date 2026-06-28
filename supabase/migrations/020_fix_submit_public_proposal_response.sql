-- Fix submit_public_proposal_response: RETURNING into v_row fields not in initial SELECT
-- caused "record v_row has no field proposal_client_message".

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

GRANT EXECUTE ON FUNCTION public.submit_public_proposal_response(text, text, text) TO anon, authenticated;

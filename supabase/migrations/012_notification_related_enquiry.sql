-- Link enquiry notifications to enquiry records for click-through navigation.

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS related_enquiry_id uuid REFERENCES public.enquiries (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS notifications_related_enquiry_id_idx
  ON public.notifications (related_enquiry_id);

UPDATE public.notifications
SET related_enquiry_id = COALESCE(
  related_enquiry_id,
  NULLIF(metadata ->> 'enquiry_id', '')::uuid
)
WHERE metadata ? 'enquiry_id';

CREATE OR REPLACE FUNCTION public.submit_public_enquiry(
  p_venue_id uuid,
  p_event_name text,
  p_client_name text,
  p_client_email text,
  p_client_phone text DEFAULT NULL,
  p_requested_date date DEFAULT NULL,
  p_preferred_start_time time DEFAULT NULL,
  p_preferred_end_time time DEFAULT NULL,
  p_end_is_next_day boolean DEFAULT false,
  p_event_type_id uuid DEFAULT NULL,
  p_space_id uuid DEFAULT NULL,
  p_guest_count integer DEFAULT NULL,
  p_budget_estimate numeric DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enquiry_id uuid := gen_random_uuid();
  v_event_name text := trim(p_event_name);
  v_client_name text := trim(p_client_name);
  v_client_email text := lower(trim(p_client_email));
  v_budget numeric(12, 2);
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.venues WHERE id = p_venue_id) THEN
    RAISE EXCEPTION 'Invalid venue';
  END IF;

  IF v_event_name = '' THEN
    RAISE EXCEPTION 'Event name is required';
  END IF;

  IF v_client_name = '' THEN
    RAISE EXCEPTION 'Client name is required';
  END IF;

  IF v_client_email = '' OR v_client_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'A valid client email is required';
  END IF;

  IF p_requested_date IS NULL THEN
    RAISE EXCEPTION 'Requested date is required';
  END IF;

  IF p_guest_count IS NULL OR p_guest_count < 1 THEN
    RAISE EXCEPTION 'Guest count must be at least 1';
  END IF;

  IF p_event_type_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.event_types
    WHERE id = p_event_type_id
      AND venue_id = p_venue_id
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Invalid event type';
  END IF;

  IF p_space_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.spaces
    WHERE id = p_space_id
      AND venue_id = p_venue_id
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Invalid space';
  END IF;

  IF p_preferred_start_time IS NOT NULL
    AND p_preferred_end_time IS NOT NULL
    AND NOT p_end_is_next_day
    AND p_preferred_end_time <= p_preferred_start_time THEN
    RAISE EXCEPTION 'End time must be after start time, or choose a next-day end time';
  END IF;

  v_budget := CASE
    WHEN p_budget_estimate IS NOT NULL AND p_budget_estimate >= 0 THEN p_budget_estimate
    ELSE NULL
  END;

  INSERT INTO public.enquiries (
    id,
    venue_id,
    event_name,
    client_name,
    client_email,
    client_phone,
    requested_date,
    preferred_start_time,
    preferred_end_time,
    event_type_id,
    space_id,
    guest_count,
    budget_estimate,
    estimated_value,
    status,
    source,
    priority,
    notes,
    activity,
    created_by
  ) VALUES (
    v_enquiry_id,
    p_venue_id,
    v_event_name,
    v_client_name,
    v_client_email,
    NULLIF(trim(p_client_phone), ''),
    p_requested_date,
    p_preferred_start_time,
    p_preferred_end_time,
    p_event_type_id,
    p_space_id,
    p_guest_count,
    v_budget,
    v_budget,
    'new',
    'website',
    'medium',
    NULLIF(trim(p_notes), ''),
    '[]'::jsonb,
    NULL
  );

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
    p_venue_id,
    vm.profile_id,
    'new_enquiry',
    'New website enquiry',
    v_client_name || ' submitted an enquiry for ' || v_event_name,
    v_enquiry_id,
    jsonb_build_object('enquiry_id', v_enquiry_id)
  FROM public.venue_members vm
  WHERE vm.venue_id = p_venue_id
    AND vm.role IN ('owner', 'admin', 'manager')
    AND vm.profile_id IS NOT NULL
    AND vm.joined_at IS NOT NULL;

  RETURN v_enquiry_id;
END;
$$;

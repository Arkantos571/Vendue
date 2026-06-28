-- Fix 013: PostgreSQL cannot change list_public_venues() return type via CREATE OR REPLACE.
-- Safe to run if 013 failed at list_public_venues(); schema changes use IF NOT EXISTS in 013.

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS public_slug text,
  ADD COLUMN IF NOT EXISTS enquiry_form_enabled boolean NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS venues_public_slug_unique_idx
  ON public.venues (public_slug)
  WHERE public_slug IS NOT NULL;

UPDATE public.venues
SET public_slug = COALESCE(
  public_slug,
  NULLIF(
    lower(regexp_replace(trim(both '-' from regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g')), '^$', '')),
    ''
  ),
  slug
)
WHERE public_slug IS NULL;

DROP FUNCTION IF EXISTS public.list_public_venues();

CREATE OR REPLACE FUNCTION public.list_public_venues()
RETURNS TABLE (id uuid, name text, public_slug text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.id, v.name, v.public_slug
  FROM public.venues v
  WHERE v.enquiry_form_enabled = true
    AND v.public_slug IS NOT NULL
  ORDER BY v.name ASC;
$$;

GRANT EXECUTE ON FUNCTION public.list_public_venues() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_venue_by_slug(p_public_slug text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slug text := lower(trim(p_public_slug));
  v_venue record;
BEGIN
  IF v_slug = '' THEN
    RETURN NULL;
  END IF;

  SELECT v.id, v.name, v.public_slug, v.enquiry_form_enabled
  INTO v_venue
  FROM public.venues v
  WHERE v.public_slug = v_slug;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'venue_id', v_venue.id,
    'venue_name', v_venue.name,
    'public_slug', v_venue.public_slug,
    'enquiry_form_enabled', v_venue.enquiry_form_enabled
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_enquiry_form_options(p_venue_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_venue_name text;
  v_enquiry_form_enabled boolean;
  v_spaces jsonb;
  v_event_types jsonb;
BEGIN
  SELECT name, enquiry_form_enabled
  INTO v_venue_name, v_enquiry_form_enabled
  FROM public.venues
  WHERE id = p_venue_id;

  IF NOT FOUND OR v_enquiry_form_enabled IS NOT TRUE THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('id', s.id, 'name', s.name)
      ORDER BY s.sort_order, s.name
    ),
    '[]'::jsonb
  )
  INTO v_spaces
  FROM public.spaces s
  WHERE s.venue_id = p_venue_id
    AND s.is_active = true;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('id', et.id, 'name', et.name)
      ORDER BY et.sort_order, et.name
    ),
    '[]'::jsonb
  )
  INTO v_event_types
  FROM public.event_types et
  WHERE et.venue_id = p_venue_id
    AND et.is_active = true;

  RETURN jsonb_build_object(
    'venue_id', p_venue_id,
    'venue_name', v_venue_name,
    'spaces', v_spaces,
    'event_types', v_event_types
  );
END;
$$;

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
  IF NOT EXISTS (
    SELECT 1
    FROM public.venues
    WHERE id = p_venue_id
      AND enquiry_form_enabled = true
  ) THEN
    RAISE EXCEPTION 'Enquiry form unavailable';
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

GRANT EXECUTE ON FUNCTION public.get_public_venue_by_slug(text) TO anon, authenticated;

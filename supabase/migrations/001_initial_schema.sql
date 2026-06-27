-- Vendue MVP schema v1.1.1
-- Apply on a fresh Supabase project via SQL Editor or: supabase db push
--
-- Safe for: empty database (no existing Vendue tables)
-- WARNING: Re-running on an existing schema will fail on duplicate types/tables.
--           This script has NO DROP statements — it is not a reset/migration patch.
--
-- Onboarding flow after signup:
--   1. User signs up → profile row created via auth trigger
--   2. INSERT INTO venues (...) → owner membership auto-created
--   3. INSERT spaces / event_types for that venue_id
--   4. INSERT enquiries, events, team_members, rota_shifts, event_function_sheets

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE public.venue_member_role AS ENUM ('owner', 'admin', 'manager', 'staff');

CREATE TYPE public.venue_type AS ENUM (
  'hotel', 'restaurant', 'bar', 'conference_centre',
  'wedding_venue', 'private_members_club', 'other'
);

CREATE TYPE public.event_status AS ENUM (
  'draft', 'confirmed', 'in_progress', 'completed', 'cancelled'
);

CREATE TYPE public.team_member_status AS ENUM ('active', 'invited', 'inactive');

CREATE TYPE public.team_role AS ENUM (
  'manager', 'supervisor', 'bartender', 'waiter', 'runner',
  'reception', 'kitchen', 'security'
);

CREATE TYPE public.employment_type AS ENUM ('full_time', 'part_time', 'casual', 'agency');

CREATE TYPE public.availability_status AS ENUM ('available', 'limited', 'unavailable');

CREATE TYPE public.rota_shift_status AS ENUM (
  'scheduled', 'confirmed', 'completed', 'cancelled'
);

CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

CREATE TYPE public.enquiry_status AS ENUM (
  'new', 'contacted', 'proposal_sent', 'confirmed', 'lost'
);

CREATE TYPE public.enquiry_priority AS ENUM ('low', 'medium', 'high');

CREATE TYPE public.enquiry_source AS ENUM (
  'website', 'phone', 'email', 'referral', 'walk_in', 'agency'
);

CREATE TYPE public.function_sheet_status AS ENUM ('draft', 'in_progress', 'ready');

-- ---------------------------------------------------------------------------
-- Trigger helper (no table dependencies)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX profiles_email_idx ON public.profiles (email);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- venues
-- ---------------------------------------------------------------------------

CREATE TABLE public.venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  venue_type public.venue_type NOT NULL DEFAULT 'other',
  address_line_1 text,
  address_line_2 text,
  city text,
  postcode text,
  country text NOT NULL DEFAULT 'GB',
  timezone text NOT NULL DEFAULT 'Europe/London',
  logo_url text,
  accent_colour text,
  default_opening_hours text,
  onboarding_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT venues_slug_unique UNIQUE (slug)
);

CREATE INDEX venues_slug_idx ON public.venues (slug);
CREATE INDEX venues_venue_type_idx ON public.venues (venue_type);

CREATE TRIGGER venues_set_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- venue_members
-- ---------------------------------------------------------------------------

CREATE TABLE public.venue_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role public.venue_member_role NOT NULL DEFAULT 'staff',
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT venue_members_unique UNIQUE (venue_id, profile_id)
);

CREATE INDEX venue_members_venue_id_idx ON public.venue_members (venue_id);
CREATE INDEX venue_members_profile_id_idx ON public.venue_members (profile_id);
CREATE INDEX venue_members_role_idx ON public.venue_members (venue_id, role);

CREATE TRIGGER venue_members_set_updated_at
  BEFORE UPDATE ON public.venue_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_venue()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.venue_members (venue_id, profile_id, role, joined_at)
    VALUES (NEW.id, auth.uid(), 'owner', timezone('utc', now()))
    ON CONFLICT (venue_id, profile_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_venue_created
  AFTER INSERT ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_venue();

-- ---------------------------------------------------------------------------
-- spaces
-- ---------------------------------------------------------------------------

CREATE TABLE public.spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  name text NOT NULL,
  capacity integer CHECK (capacity IS NULL OR capacity > 0),
  floor text,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX spaces_venue_id_idx ON public.spaces (venue_id);
CREATE INDEX spaces_venue_active_idx ON public.spaces (venue_id, is_active);

CREATE TRIGGER spaces_set_updated_at
  BEFORE UPDATE ON public.spaces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- event_types
-- ---------------------------------------------------------------------------

CREATE TABLE public.event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  default_duration_minutes integer CHECK (
    default_duration_minutes IS NULL OR default_duration_minutes > 0
  ),
  colour text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX event_types_venue_id_idx ON public.event_types (venue_id);
CREATE INDEX event_types_venue_active_idx ON public.event_types (venue_id, is_active);

CREATE TRIGGER event_types_set_updated_at
  BEFORE UPDATE ON public.event_types
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- enquiries
-- ---------------------------------------------------------------------------

CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  event_name text NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  company text,
  client_preferences text,
  requested_date date,
  preferred_start_time time,
  preferred_end_time time,
  event_type_id uuid REFERENCES public.event_types (id) ON DELETE SET NULL,
  space_id uuid REFERENCES public.spaces (id) ON DELETE SET NULL,
  guest_count integer CHECK (guest_count IS NULL OR guest_count >= 0),
  budget_estimate numeric(12, 2) CHECK (budget_estimate IS NULL OR budget_estimate >= 0),
  estimated_value numeric(12, 2) CHECK (estimated_value IS NULL OR estimated_value >= 0),
  status public.enquiry_status NOT NULL DEFAULT 'new',
  source public.enquiry_source NOT NULL DEFAULT 'website',
  priority public.enquiry_priority NOT NULL DEFAULT 'medium',
  assigned_profile_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  last_contact_at timestamptz,
  next_follow_up_at timestamptz,
  notes text,
  internal_notes text,
  activity jsonb NOT NULL DEFAULT '[]'::jsonb,
  converted_event_id uuid,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX enquiries_venue_id_idx ON public.enquiries (venue_id);
CREATE INDEX enquiries_venue_status_idx ON public.enquiries (venue_id, status);
CREATE INDEX enquiries_venue_requested_date_idx ON public.enquiries (venue_id, requested_date);
CREATE INDEX enquiries_assigned_profile_id_idx ON public.enquiries (assigned_profile_id);
CREATE INDEX enquiries_converted_event_id_idx ON public.enquiries (converted_event_id);

CREATE TRIGGER enquiries_set_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  enquiry_id uuid REFERENCES public.enquiries (id) ON DELETE SET NULL,
  space_id uuid REFERENCES public.spaces (id) ON DELETE SET NULL,
  event_type_id uuid REFERENCES public.event_types (id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status public.event_status NOT NULL DEFAULT 'draft',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  guest_count integer CHECK (guest_count IS NULL OR guest_count >= 0),
  client_name text,
  client_email text,
  client_phone text,
  notes text,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT events_ends_after_starts CHECK (ends_at > starts_at)
);

CREATE INDEX events_venue_id_idx ON public.events (venue_id);
CREATE INDEX events_venue_starts_at_idx ON public.events (venue_id, starts_at);
CREATE INDEX events_venue_status_idx ON public.events (venue_id, status);
CREATE INDEX events_space_id_idx ON public.events (space_id);
CREATE INDEX events_enquiry_id_idx ON public.events (enquiry_id);

CREATE TRIGGER events_set_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.enquiries
  ADD CONSTRAINT enquiries_converted_event_id_fkey
  FOREIGN KEY (converted_event_id) REFERENCES public.events (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- team_members
-- ---------------------------------------------------------------------------

CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  role public.team_role,
  job_title text,
  department text,
  employment_type public.employment_type,
  availability_status public.availability_status NOT NULL DEFAULT 'available',
  status public.team_member_status NOT NULL DEFAULT 'invited',
  hourly_rate numeric(10, 2) CHECK (hourly_rate IS NULL OR hourly_rate >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT team_members_venue_email_unique UNIQUE (venue_id, email)
);

CREATE INDEX team_members_venue_id_idx ON public.team_members (venue_id);
CREATE INDEX team_members_profile_id_idx ON public.team_members (profile_id);
CREATE INDEX team_members_venue_status_idx ON public.team_members (venue_id, status);
CREATE INDEX team_members_venue_role_idx ON public.team_members (venue_id, role);

CREATE TRIGGER team_members_set_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- invitations
-- ---------------------------------------------------------------------------

CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.venue_member_role NOT NULL DEFAULT 'staff',
  invited_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  token_hash text NOT NULL,
  status public.invitation_status NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT invitations_token_hash_unique UNIQUE (token_hash)
);

CREATE INDEX invitations_venue_id_idx ON public.invitations (venue_id);
CREATE INDEX invitations_email_idx ON public.invitations (email);
CREATE INDEX invitations_status_idx ON public.invitations (venue_id, status);

CREATE TRIGGER invitations_set_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- rota_shifts
-- ---------------------------------------------------------------------------

CREATE TABLE public.rota_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events (id) ON DELETE SET NULL,
  team_member_id uuid NOT NULL REFERENCES public.team_members (id) ON DELETE CASCADE,
  role_label text,
  section text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  break_minutes integer NOT NULL DEFAULT 0 CHECK (break_minutes >= 0),
  status public.rota_shift_status NOT NULL DEFAULT 'scheduled',
  hourly_rate numeric(10, 2) CHECK (hourly_rate IS NULL OR hourly_rate >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT rota_shifts_ends_after_starts CHECK (ends_at > starts_at)
);

CREATE INDEX rota_shifts_venue_id_idx ON public.rota_shifts (venue_id);
CREATE INDEX rota_shifts_venue_starts_at_idx ON public.rota_shifts (venue_id, starts_at);
CREATE INDEX rota_shifts_event_id_idx ON public.rota_shifts (event_id);
CREATE INDEX rota_shifts_team_member_id_idx ON public.rota_shifts (team_member_id);
CREATE INDEX rota_shifts_venue_status_idx ON public.rota_shifts (venue_id, status);

CREATE TRIGGER rota_shifts_set_updated_at
  BEFORE UPDATE ON public.rota_shifts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- event_function_sheets (one sheet per event; structured sections in jsonb)
-- ---------------------------------------------------------------------------

CREATE TABLE public.event_function_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  status public.function_sheet_status NOT NULL DEFAULT 'draft',
  running_order jsonb NOT NULL DEFAULT '[]'::jsonb,
  setup jsonb NOT NULL DEFAULT '{}'::jsonb,
  food_and_beverage jsonb NOT NULL DEFAULT '{}'::jsonb,
  staffing_plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  internal_notes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT event_function_sheets_event_unique UNIQUE (event_id)
);

CREATE INDEX event_function_sheets_venue_id_idx ON public.event_function_sheets (venue_id);
CREATE INDEX event_function_sheets_venue_status_idx ON public.event_function_sheets (venue_id, status);
CREATE INDEX event_function_sheets_event_id_idx ON public.event_function_sheets (event_id);

CREATE TRIGGER event_function_sheets_set_updated_at
  BEFORE UPDATE ON public.event_function_sheets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX notifications_profile_id_idx ON public.notifications (profile_id);
CREATE INDEX notifications_venue_id_idx ON public.notifications (venue_id);
CREATE INDEX notifications_unread_idx ON public.notifications (profile_id, read_at)
  WHERE read_at IS NULL;

CREATE TRIGGER notifications_set_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- audit_log (append-only)
-- ---------------------------------------------------------------------------

CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX audit_log_venue_id_idx ON public.audit_log (venue_id);
CREATE INDEX audit_log_venue_created_at_idx ON public.audit_log (venue_id, created_at DESC);
CREATE INDEX audit_log_entity_idx ON public.audit_log (entity_type, entity_id);
CREATE INDEX audit_log_actor_id_idx ON public.audit_log (actor_id);

-- ---------------------------------------------------------------------------
-- RLS helper functions (must run after venue_members exists)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.user_venue_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT venue_id FROM public.venue_members
  WHERE profile_id = auth.uid() AND joined_at IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.is_venue_member(p_venue_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.venue_members
    WHERE venue_id = p_venue_id AND profile_id = auth.uid() AND joined_at IS NOT NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.has_venue_role(
  p_venue_id uuid,
  p_roles public.venue_member_role[]
)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.venue_members
    WHERE venue_id = p_venue_id AND profile_id = auth.uid()
      AND joined_at IS NOT NULL AND role = ANY (p_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_venue(p_venue_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_venue_role(
    p_venue_id, ARRAY['owner', 'admin', 'manager']::public.venue_member_role[]
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rota_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_function_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_own_or_shared_venue" ON public.profiles
  FOR SELECT TO authenticated USING (
    id = auth.uid() OR id IN (
      SELECT vm.profile_id FROM public.venue_members vm
      WHERE vm.venue_id IN (SELECT public.user_venue_ids())
    )
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- venues
CREATE POLICY "venues_select_member" ON public.venues
  FOR SELECT TO authenticated USING (public.is_venue_member(id));

CREATE POLICY "venues_insert_authenticated" ON public.venues
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "venues_update_managers" ON public.venues
  FOR UPDATE TO authenticated
  USING (public.can_manage_venue(id)) WITH CHECK (public.can_manage_venue(id));

CREATE POLICY "venues_delete_owner" ON public.venues
  FOR DELETE TO authenticated
  USING (public.has_venue_role(id, ARRAY['owner']::public.venue_member_role[]));

-- venue_members
CREATE POLICY "venue_members_select_member" ON public.venue_members
  FOR SELECT TO authenticated USING (public.is_venue_member(venue_id));

CREATE POLICY "venue_members_insert_admins" ON public.venue_members
  FOR INSERT TO authenticated WITH CHECK (
    public.has_venue_role(venue_id, ARRAY['owner', 'admin']::public.venue_member_role[])
    OR (profile_id = auth.uid() AND role = 'owner' AND NOT EXISTS (
      SELECT 1 FROM public.venue_members existing WHERE existing.venue_id = venue_members.venue_id
    ))
  );

CREATE POLICY "venue_members_update_admins" ON public.venue_members
  FOR UPDATE TO authenticated
  USING (public.has_venue_role(venue_id, ARRAY['owner', 'admin']::public.venue_member_role[]))
  WITH CHECK (public.has_venue_role(venue_id, ARRAY['owner', 'admin']::public.venue_member_role[]));

CREATE POLICY "venue_members_delete_admins" ON public.venue_members
  FOR DELETE TO authenticated
  USING (
    public.has_venue_role(venue_id, ARRAY['owner', 'admin']::public.venue_member_role[])
    AND role <> 'owner'
  );

-- spaces
CREATE POLICY "spaces_select_member" ON public.spaces
  FOR SELECT TO authenticated USING (public.is_venue_member(venue_id));
CREATE POLICY "spaces_insert_manager" ON public.spaces
  FOR INSERT TO authenticated WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "spaces_update_manager" ON public.spaces
  FOR UPDATE TO authenticated
  USING (public.can_manage_venue(venue_id)) WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "spaces_delete_manager" ON public.spaces
  FOR DELETE TO authenticated USING (public.can_manage_venue(venue_id));

-- event_types
CREATE POLICY "event_types_select_member" ON public.event_types
  FOR SELECT TO authenticated USING (public.is_venue_member(venue_id));
CREATE POLICY "event_types_insert_manager" ON public.event_types
  FOR INSERT TO authenticated WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "event_types_update_manager" ON public.event_types
  FOR UPDATE TO authenticated
  USING (public.can_manage_venue(venue_id)) WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "event_types_delete_manager" ON public.event_types
  FOR DELETE TO authenticated USING (public.can_manage_venue(venue_id));

-- enquiries
CREATE POLICY "enquiries_select_member" ON public.enquiries
  FOR SELECT TO authenticated USING (public.is_venue_member(venue_id));
CREATE POLICY "enquiries_insert_manager" ON public.enquiries
  FOR INSERT TO authenticated WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "enquiries_update_manager" ON public.enquiries
  FOR UPDATE TO authenticated
  USING (public.can_manage_venue(venue_id)) WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "enquiries_delete_manager" ON public.enquiries
  FOR DELETE TO authenticated USING (public.can_manage_venue(venue_id));

-- events
CREATE POLICY "events_select_member" ON public.events
  FOR SELECT TO authenticated USING (public.is_venue_member(venue_id));
CREATE POLICY "events_insert_manager" ON public.events
  FOR INSERT TO authenticated WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "events_update_manager" ON public.events
  FOR UPDATE TO authenticated
  USING (public.can_manage_venue(venue_id)) WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "events_delete_manager" ON public.events
  FOR DELETE TO authenticated USING (public.can_manage_venue(venue_id));

-- team_members
CREATE POLICY "team_members_select_member" ON public.team_members
  FOR SELECT TO authenticated USING (public.is_venue_member(venue_id));
CREATE POLICY "team_members_insert_manager" ON public.team_members
  FOR INSERT TO authenticated WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "team_members_update_manager" ON public.team_members
  FOR UPDATE TO authenticated
  USING (public.can_manage_venue(venue_id)) WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "team_members_delete_manager" ON public.team_members
  FOR DELETE TO authenticated USING (public.can_manage_venue(venue_id));

-- invitations
CREATE POLICY "invitations_select_member_or_invitee" ON public.invitations
  FOR SELECT TO authenticated USING (
    public.is_venue_member(venue_id) OR lower(email) = lower(auth.jwt() ->> 'email')
  );
CREATE POLICY "invitations_insert_manager" ON public.invitations
  FOR INSERT TO authenticated WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "invitations_update_manager" ON public.invitations
  FOR UPDATE TO authenticated
  USING (public.can_manage_venue(venue_id)) WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "invitations_delete_manager" ON public.invitations
  FOR DELETE TO authenticated USING (public.can_manage_venue(venue_id));

-- rota_shifts
CREATE POLICY "rota_shifts_select_member" ON public.rota_shifts
  FOR SELECT TO authenticated USING (public.is_venue_member(venue_id));
CREATE POLICY "rota_shifts_insert_manager" ON public.rota_shifts
  FOR INSERT TO authenticated WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "rota_shifts_update_manager" ON public.rota_shifts
  FOR UPDATE TO authenticated
  USING (public.can_manage_venue(venue_id)) WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "rota_shifts_delete_manager" ON public.rota_shifts
  FOR DELETE TO authenticated USING (public.can_manage_venue(venue_id));

-- event_function_sheets
CREATE POLICY "event_function_sheets_select_member" ON public.event_function_sheets
  FOR SELECT TO authenticated USING (public.is_venue_member(venue_id));
CREATE POLICY "event_function_sheets_insert_manager" ON public.event_function_sheets
  FOR INSERT TO authenticated WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "event_function_sheets_update_manager" ON public.event_function_sheets
  FOR UPDATE TO authenticated
  USING (public.can_manage_venue(venue_id)) WITH CHECK (public.can_manage_venue(venue_id));
CREATE POLICY "event_function_sheets_delete_manager" ON public.event_function_sheets
  FOR DELETE TO authenticated USING (public.can_manage_venue(venue_id));

-- notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "notifications_insert_manager" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (
    public.can_manage_venue(venue_id) AND public.is_venue_member(venue_id)
  );
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- audit_log (append-only for members; no update/delete policies)
CREATE POLICY "audit_log_select_member" ON public.audit_log
  FOR SELECT TO authenticated USING (public.is_venue_member(venue_id));
CREATE POLICY "audit_log_insert_member" ON public.audit_log
  FOR INSERT TO authenticated WITH CHECK (
    public.is_venue_member(venue_id) AND (actor_id IS NULL OR actor_id = auth.uid())
  );

-- Staff unavailability periods (date/time blocks for rota planning).

CREATE TABLE IF NOT EXISTS public.unavailability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  team_member_id uuid NOT NULL REFERENCES public.team_members (id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  start_time text,
  end_time text,
  reason text,
  status text NOT NULL DEFAULT 'approved',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT unavailability_end_on_or_after_start CHECK (end_date >= start_date),
  CONSTRAINT unavailability_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS unavailability_venue_id_idx ON public.unavailability (venue_id);
CREATE INDEX IF NOT EXISTS unavailability_team_member_id_idx ON public.unavailability (team_member_id);
CREATE INDEX IF NOT EXISTS unavailability_venue_dates_idx ON public.unavailability (venue_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS unavailability_team_member_dates_idx ON public.unavailability (team_member_id, start_date, end_date);

CREATE TRIGGER unavailability_set_updated_at
  BEFORE UPDATE ON public.unavailability
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.unavailability IS 'Staff-declared or manager-recorded unavailable date/time periods.';
COMMENT ON COLUMN public.unavailability.start_time IS 'Optional HH:MM; when omitted with end_time, blocks full days.';
COMMENT ON COLUMN public.unavailability.end_time IS 'Optional HH:MM; may roll to the next calendar day when earlier than start_time.';

ALTER TABLE public.unavailability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "unavailability_select_venue_or_self" ON public.unavailability
  FOR SELECT TO authenticated
  USING (
    public.can_manage_venue(venue_id)
    OR team_member_id IN (SELECT public.user_team_member_ids())
  );

CREATE POLICY "unavailability_insert_managers" ON public.unavailability
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_venue(venue_id));

CREATE POLICY "unavailability_insert_self_pending" ON public.unavailability
  FOR INSERT TO authenticated
  WITH CHECK (
    team_member_id IN (SELECT public.user_team_member_ids())
    AND status = 'pending'
    AND venue_id IN (
      SELECT tm.venue_id
      FROM public.team_members tm
      WHERE tm.id = team_member_id
    )
  );

CREATE POLICY "unavailability_update_managers" ON public.unavailability
  FOR UPDATE TO authenticated
  USING (public.can_manage_venue(venue_id))
  WITH CHECK (public.can_manage_venue(venue_id));

CREATE POLICY "unavailability_update_self_pending" ON public.unavailability
  FOR UPDATE TO authenticated
  USING (
    team_member_id IN (SELECT public.user_team_member_ids())
    AND status = 'pending'
  )
  WITH CHECK (
    team_member_id IN (SELECT public.user_team_member_ids())
    AND status = 'pending'
  );

CREATE POLICY "unavailability_delete_managers" ON public.unavailability
  FOR DELETE TO authenticated
  USING (public.can_manage_venue(venue_id));

CREATE POLICY "unavailability_delete_self" ON public.unavailability
  FOR DELETE TO authenticated
  USING (
    team_member_id IN (SELECT public.user_team_member_ids())
    AND status IN ('pending', 'approved')
  );

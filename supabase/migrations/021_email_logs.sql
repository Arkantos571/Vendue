-- Email logs for enquiry/proposal outbound messages (MVP prep).

CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
  enquiry_id uuid REFERENCES public.enquiries (id) ON DELETE SET NULL,
  event_id uuid REFERENCES public.events (id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  provider text,
  provider_message_id text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'email_logs_status_check'
  ) THEN
    ALTER TABLE public.email_logs
      ADD CONSTRAINT email_logs_status_check
      CHECK (status IN ('draft', 'sent', 'failed', 'copied'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS email_logs_venue_id_idx ON public.email_logs (venue_id);
CREATE INDEX IF NOT EXISTS email_logs_enquiry_id_idx ON public.email_logs (enquiry_id);
CREATE INDEX IF NOT EXISTS email_logs_created_at_idx ON public.email_logs (venue_id, created_at DESC);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_logs_select_manager" ON public.email_logs;
DROP POLICY IF EXISTS "email_logs_insert_manager" ON public.email_logs;
DROP POLICY IF EXISTS "email_logs_update_manager" ON public.email_logs;

CREATE POLICY "email_logs_select_manager" ON public.email_logs
  FOR SELECT TO authenticated
  USING (public.can_manage_venue(venue_id));

CREATE POLICY "email_logs_insert_manager" ON public.email_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_venue(venue_id));

CREATE POLICY "email_logs_update_manager" ON public.email_logs
  FOR UPDATE TO authenticated
  USING (public.can_manage_venue(venue_id))
  WITH CHECK (public.can_manage_venue(venue_id));

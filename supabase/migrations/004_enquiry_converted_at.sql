-- Track when an enquiry was converted to an event.
-- converted_event_id already exists on enquiries (001_initial_schema.sql).

ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS converted_at timestamptz;

COMMENT ON COLUMN public.enquiries.converted_at IS
  'Timestamp when this enquiry was converted into a booked event.';

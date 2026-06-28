-- Vendue demo seed data
-- ---------------------------------------------------------------------------
-- Populates staff, enquiries, and events for the first venue in your project.
-- Safe to re-run: skips duplicates (team by email, enquiries/events by title).
--
-- How to run:
--   Supabase Dashboard → SQL Editor → New query → paste this file → Run
--
-- Prerequisites:
--   At least one venue (complete onboarding first).
-- ---------------------------------------------------------------------------

BEGIN;

DO $$
DECLARE
  v_venue_id uuid;
  v_space_ballroom uuid;
  v_space_terrace uuid;
  v_space_boardroom uuid;
  v_space_private uuid;
  v_etype_wedding uuid;
  v_etype_corporate uuid;
  v_etype_private uuid;
  v_etype_conference uuid;
  v_etype_gala uuid;
BEGIN
  SELECT id INTO v_venue_id
  FROM public.venues
  ORDER BY created_at
  LIMIT 1;

  IF v_venue_id IS NULL THEN
    RAISE EXCEPTION 'No venue found. Complete venue onboarding in the app first.';
  END IF;

  RAISE NOTICE 'Seeding demo data for venue %', v_venue_id;

  -- Spaces -----------------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1 FROM public.spaces WHERE venue_id = v_venue_id AND name = 'Main Ballroom'
  ) THEN
    INSERT INTO public.spaces (venue_id, name, capacity, sort_order)
    VALUES (v_venue_id, 'Main Ballroom', 250, 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.spaces WHERE venue_id = v_venue_id AND name = 'Garden Terrace'
  ) THEN
    INSERT INTO public.spaces (venue_id, name, capacity, sort_order)
    VALUES (v_venue_id, 'Garden Terrace', 120, 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.spaces WHERE venue_id = v_venue_id AND name = 'Boardroom Suite'
  ) THEN
    INSERT INTO public.spaces (venue_id, name, capacity, sort_order)
    VALUES (v_venue_id, 'Boardroom Suite', 40, 3);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.spaces WHERE venue_id = v_venue_id AND name = 'Private Dining Room'
  ) THEN
    INSERT INTO public.spaces (venue_id, name, capacity, sort_order)
    VALUES (v_venue_id, 'Private Dining Room', 32, 4);
  END IF;

  SELECT id INTO v_space_ballroom FROM public.spaces
  WHERE venue_id = v_venue_id AND name = 'Main Ballroom' LIMIT 1;

  SELECT id INTO v_space_terrace FROM public.spaces
  WHERE venue_id = v_venue_id AND name = 'Garden Terrace' LIMIT 1;

  SELECT id INTO v_space_boardroom FROM public.spaces
  WHERE venue_id = v_venue_id AND name = 'Boardroom Suite' LIMIT 1;

  SELECT id INTO v_space_private FROM public.spaces
  WHERE venue_id = v_venue_id AND name = 'Private Dining Room' LIMIT 1;

  -- Event types ------------------------------------------------------------
  IF NOT EXISTS (
    SELECT 1 FROM public.event_types WHERE venue_id = v_venue_id AND name = 'Wedding reception'
  ) THEN
    INSERT INTO public.event_types (venue_id, name, sort_order)
    VALUES (v_venue_id, 'Wedding reception', 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.event_types WHERE venue_id = v_venue_id AND name = 'Corporate dinner'
  ) THEN
    INSERT INTO public.event_types (venue_id, name, sort_order)
    VALUES (v_venue_id, 'Corporate dinner', 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.event_types WHERE venue_id = v_venue_id AND name = 'Private dining'
  ) THEN
    INSERT INTO public.event_types (venue_id, name, sort_order)
    VALUES (v_venue_id, 'Private dining', 3);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.event_types WHERE venue_id = v_venue_id AND name = 'Conference day'
  ) THEN
    INSERT INTO public.event_types (venue_id, name, sort_order)
    VALUES (v_venue_id, 'Conference day', 4);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.event_types WHERE venue_id = v_venue_id AND name = 'Charity gala'
  ) THEN
    INSERT INTO public.event_types (venue_id, name, sort_order)
    VALUES (v_venue_id, 'Charity gala', 5);
  END IF;

  SELECT id INTO v_etype_wedding FROM public.event_types
  WHERE venue_id = v_venue_id AND name = 'Wedding reception' LIMIT 1;

  SELECT id INTO v_etype_corporate FROM public.event_types
  WHERE venue_id = v_venue_id AND name = 'Corporate dinner' LIMIT 1;

  SELECT id INTO v_etype_private FROM public.event_types
  WHERE venue_id = v_venue_id AND name = 'Private dining' LIMIT 1;

  SELECT id INTO v_etype_conference FROM public.event_types
  WHERE venue_id = v_venue_id AND name = 'Conference day' LIMIT 1;

  SELECT id INTO v_etype_gala FROM public.event_types
  WHERE venue_id = v_venue_id AND name = 'Charity gala' LIMIT 1;

  -- Team members -----------------------------------------------------------
  INSERT INTO public.team_members (
    venue_id, full_name, email, phone, role, job_title, department,
    employment_type, availability_status, status, hourly_rate, notes
  ) VALUES
    (v_venue_id, 'Jordan Lee', 'jordan.lee@grandassembly.com', '+44 7700 901001', 'manager', 'Events manager', 'Operations', 'full_time', 'available', 'active', 18.50, 'Lead events coordinator. Certified first aider.'),
    (v_venue_id, 'Sam Patel', 'sam.patel@grandassembly.com', '+44 7700 901002', 'bartender', 'Senior bartender', 'Bar', 'part_time', 'limited', 'active', 14.00, 'Available Thu–Sun evenings only.'),
    (v_venue_id, 'Alex Morgan', 'alex.morgan@grandassembly.com', '+44 7700 901003', 'waiter', 'Senior waiter', 'Front of house', 'full_time', 'available', 'active', 13.50, NULL),
    (v_venue_id, 'Priya Shah', 'priya.shah@grandassembly.com', '+44 7700 901004', 'waiter', 'Waiter', 'Front of house', 'casual', 'available', 'active', 12.75, 'Prefers floor service over bar work.'),
    (v_venue_id, 'Marcus Okafor', 'marcus.okafor@agency-staff.co.uk', '+44 7700 901005', 'security', 'Security officer', 'Security', 'agency', 'available', 'active', 16.00, 'Agency contact: BrightStaff Ltd.'),
    (v_venue_id, 'Elena Russo', 'elena.russo@email.com', NULL, 'kitchen', 'Prep chef', 'Kitchen', 'part_time', 'unavailable', 'invited', 13.00, 'Invite sent — awaiting account setup.'),
    (v_venue_id, 'Tom Hughes', 'tom.hughes@grandassembly.com', '+44 7700 901007', 'runner', 'Runner', 'Front of house', 'casual', 'unavailable', 'inactive', 11.50, 'On leave until September.'),
    (v_venue_id, 'Sophie Clarke', 'sophie.clarke@grandassembly.com', '+44 7700 901008', 'reception', 'Reception lead', 'Front of house', 'full_time', 'limited', 'active', 14.25, 'Front-of-house lead for guest arrivals.'),
    (v_venue_id, 'Daniel Frost', 'daniel.frost@grandassembly.com', '+44 7700 901009', 'supervisor', 'Floor supervisor', 'Operations', 'full_time', 'available', 'active', 17.00, 'Floor supervisor for large-format events.')
  ON CONFLICT (venue_id, email) DO NOTHING;

  -- Enquiries --------------------------------------------------------------
  INSERT INTO public.enquiries (
    venue_id, event_name, client_name, client_email, client_phone, company,
    client_preferences, requested_date, preferred_start_time, preferred_end_time,
    event_type_id, space_id, guest_count, budget_estimate, estimated_value,
    status, source, priority, last_contact_at, next_follow_up_at, notes, internal_notes, activity
  )
  SELECT
    v_venue_id, 'Summer Product Launch Dinner', 'Tom Bradley', 'tom@novatech.io', '+44 7700 902101', 'NovaTech Ltd',
    'Prefers modern plating and minimal branding in room.', '2026-07-15'::date, '18:30'::time, '23:00'::time,
    v_etype_corporate, v_space_ballroom, 85, 12000, 14500,
    'new', 'website', 'high', NULL, '2026-06-28 09:00:00+00'::timestamptz,
    'Interested in AV package and vegetarian menu for 12 guests.', 'Strong lead — respond within 24 hours.',
    '[{"id":"enq-1-a1","type":"received","title":"Enquiry received","description":"Submitted via website contact form.","timestamp":"2026-06-26T08:30:00Z","actor":"System"}]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM public.enquiries
    WHERE venue_id = v_venue_id AND client_email = 'tom@novatech.io' AND event_name = 'Summer Product Launch Dinner'
  );

  INSERT INTO public.enquiries (
    venue_id, event_name, client_name, client_email, client_phone, company,
    client_preferences, requested_date, preferred_start_time, preferred_end_time,
    event_type_id, space_id, guest_count, budget_estimate, estimated_value,
    status, source, priority, last_contact_at, next_follow_up_at, notes, internal_notes, activity
  )
  SELECT
    v_venue_id, 'Autumn Wedding Reception', 'Emily Walsh', 'emily.walsh@email.com', '+44 7700 902102', NULL,
    'Garden ceremony followed by terrace reception.', '2026-09-12'::date, '16:00'::time, '23:30'::time,
    v_etype_wedding, v_space_terrace, 90, 22000, 26500,
    'contacted', 'referral', 'high', '2026-06-25 11:30:00+00'::timestamptz, '2026-06-29 10:00:00+00'::timestamptz,
    'Referred by Chen & Walsh wedding. Wants tasting session.', 'Send brochure and sample menu options.',
    '[{"id":"enq-2-a1","type":"received","title":"Enquiry received","description":"Referral from previous client.","timestamp":"2026-06-24T14:00:00Z","actor":"System"}]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM public.enquiries
    WHERE venue_id = v_venue_id AND client_email = 'emily.walsh@email.com' AND event_name = 'Autumn Wedding Reception'
  );

  INSERT INTO public.enquiries (
    venue_id, event_name, client_name, client_email, client_phone, company,
    client_preferences, requested_date, preferred_start_time, preferred_end_time,
    event_type_id, space_id, guest_count, budget_estimate, estimated_value,
    status, source, priority, last_contact_at, next_follow_up_at, notes, internal_notes, activity
  )
  SELECT
    v_venue_id, 'Executive Board Dinner', 'James Wright', 'j.wright@apexholdings.com', '+44 7700 902103', 'Apex Holdings',
    'Private dining, discrete service, no photography.', '2026-07-08'::date, '19:00'::time, '22:30'::time,
    v_etype_corporate, v_space_boardroom, 18, 4500, 5200,
    'proposal_sent', 'email', 'medium', '2026-06-26 09:45:00+00'::timestamptz, '2026-07-01 10:00:00+00'::timestamptz,
    'Wine pairing required. Two board members gluten-free.', 'Proposal v2 sent with updated wine list.',
    '[{"id":"enq-3-a3","type":"proposal_sent","title":"Proposal sent","description":"Sent board dinner package proposal (£5,200).","timestamp":"2026-06-26T09:45:00Z","actor":"Alex Morgan"}]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM public.enquiries
    WHERE venue_id = v_venue_id AND client_email = 'j.wright@apexholdings.com' AND event_name = 'Executive Board Dinner'
  );

  INSERT INTO public.enquiries (
    venue_id, event_name, client_name, client_email, client_phone, company,
    client_preferences, requested_date, preferred_start_time, preferred_end_time,
    event_type_id, space_id, guest_count, budget_estimate, estimated_value,
    status, source, priority, last_contact_at, notes, internal_notes, activity
  )
  SELECT
    v_venue_id, 'Charity Fundraiser Gala', 'Helen Foster', 'helen@brightfuture.org', '+44 7700 902104', 'Bright Future Foundation',
    'Silent auction area and VIP reception.', '2026-10-18'::date, '18:30'::time, '00:30'::time,
    v_etype_gala, v_space_ballroom, 180, 35000, 42000,
    'confirmed', 'phone', 'high', '2026-06-24 16:30:00+00'::timestamptz,
    'Deposit received. Converted to confirmed booking.', 'Linked to Charity Gala Evening event planning.',
    '[{"id":"enq-4-a3","type":"confirmed","title":"Booking confirmed","description":"Contract signed and deposit paid.","timestamp":"2026-06-24T16:30:00Z","actor":"Jordan Lee"}]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM public.enquiries
    WHERE venue_id = v_venue_id AND client_email = 'helen@brightfuture.org' AND event_name = 'Charity Fundraiser Gala'
  );

  INSERT INTO public.enquiries (
    venue_id, event_name, client_name, client_email, client_phone,
    client_preferences, requested_date, preferred_start_time, preferred_end_time,
    event_type_id, space_id, guest_count, budget_estimate, estimated_value,
    status, source, priority, last_contact_at, next_follow_up_at, notes, internal_notes, activity
  )
  SELECT
    v_venue_id, 'Private Birthday Celebration', 'David Morrison', 'david.morrison@email.com', '+44 7700 902105',
    'Intimate dinner, champagne toast at 20:00.', '2026-08-22'::date, '19:00'::time, '23:00'::time,
    v_etype_private, v_space_private, 28, 6000, 7200,
    'contacted', 'walk_in', 'medium', '2026-06-23 10:00:00+00'::timestamptz, '2026-06-30 10:00:00+00'::timestamptz,
    'Visited venue after anniversary dinner.', 'Awaiting guest count confirmation.',
    '[{"id":"enq-5-a2","type":"contacted","title":"Client contacted","description":"Follow-up email sent with private dining options.","timestamp":"2026-06-23T10:00:00Z","actor":"Sophie Clarke"}]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM public.enquiries
    WHERE venue_id = v_venue_id AND client_email = 'david.morrison@email.com' AND event_name = 'Private Birthday Celebration'
  );

  INSERT INTO public.enquiries (
    venue_id, event_name, client_name, client_email, client_phone, company,
    requested_date, preferred_start_time, preferred_end_time,
    event_type_id, space_id, guest_count, budget_estimate, estimated_value,
    status, source, priority, last_contact_at, notes, internal_notes, activity
  )
  SELECT
    v_venue_id, 'Agency Summer Party', 'Rachel Green', 'rachel.green@agency.com', '+44 7700 902106', 'Green & Co Agency',
    '2026-07-20'::date, '14:00'::time, '22:00'::time,
    v_etype_private, v_space_terrace, 70, 9000, 11000,
    'lost', 'agency', 'low', '2026-06-18 14:00:00+00'::timestamptz,
    'Client chose competitor venue due to date conflict.', 'Archive — may re-engage next year.',
    '[{"id":"enq-6-a3","type":"lost","title":"Marked as lost","description":"Client confirmed booking elsewhere.","timestamp":"2026-06-18T14:00:00Z","actor":"Alex Morgan"}]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM public.enquiries
    WHERE venue_id = v_venue_id AND client_email = 'rachel.green@agency.com' AND event_name = 'Agency Summer Party'
  );

  INSERT INTO public.enquiries (
    venue_id, event_name, client_name, client_email, client_phone, company,
    client_preferences, requested_date, preferred_start_time, preferred_end_time,
    event_type_id, space_id, guest_count, budget_estimate, estimated_value,
    status, source, priority, last_contact_at, next_follow_up_at, notes, internal_notes, activity
  )
  SELECT
    v_venue_id, 'Conference Day Catering', 'Sarah Chen', 'sarah.chen@meridiangroup.com', '+44 7700 902107', 'Meridian Group',
    'Breakout lunches and all-day coffee stations.', '2026-08-05'::date, '08:00'::time, '17:00'::time,
    v_etype_conference, v_space_boardroom, 55, 8500, 9800,
    'proposal_sent', 'email', 'medium', '2026-06-26 10:30:00+00'::timestamptz, '2026-07-02 10:00:00+00'::timestamptz,
    'Multi-room setup. AV partner to be confirmed by client.', 'Proposal includes AM/PM catering breakdown.',
    '[{"id":"enq-7-a3","type":"proposal_sent","title":"Proposal sent","description":"Conference catering proposal sent.","timestamp":"2026-06-26T10:30:00Z","actor":"Jordan Lee"}]'::jsonb
  WHERE NOT EXISTS (
    SELECT 1 FROM public.enquiries
    WHERE venue_id = v_venue_id AND client_email = 'sarah.chen@meridiangroup.com' AND event_name = 'Conference Day Catering'
  );

  -- Events -----------------------------------------------------------------
  INSERT INTO public.events (
    venue_id, title, client_name, client_email, client_phone,
    space_id, event_type_id, status, starts_at, ends_at, guest_count, notes,
    rota_status
  )
  SELECT
    v_venue_id, 'Corporate Dinner — Meridian Group', 'Sarah Chen', 'sarah.chen@meridiangroup.com', '+44 7700 900123',
    v_space_ballroom, v_etype_corporate, 'confirmed',
    '2026-06-27 18:30:00+01'::timestamptz, '2026-06-27 23:00:00+01'::timestamptz, 120,
    'Vegetarian menu required for 18 guests. AV setup from 16:00.', 'draft'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.events
    WHERE venue_id = v_venue_id AND title = 'Corporate Dinner — Meridian Group'
  );

  INSERT INTO public.events (
    venue_id, title, client_name, client_email, client_phone,
    space_id, event_type_id, status, starts_at, ends_at, guest_count, notes,
    rota_status
  )
  SELECT
    v_venue_id, 'Wedding Reception — Chen & Walsh', 'Emily Walsh', 'emily.walsh@email.com', '+44 7700 900456',
    v_space_terrace, v_etype_wedding, 'confirmed',
    '2026-06-28 17:00:00+01'::timestamptz, '2026-06-28 23:30:00+01'::timestamptz, 85,
    'First dance at 20:00. Sparkler send-off planned for 23:15.', 'draft'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.events
    WHERE venue_id = v_venue_id AND title = 'Wedding Reception — Chen & Walsh'
  );

  INSERT INTO public.events (
    venue_id, title, client_name, client_email,
    space_id, event_type_id, status, starts_at, ends_at, guest_count, notes,
    rota_status
  )
  SELECT
    v_venue_id, 'Product Launch Breakfast', 'Tom Bradley', 'tom@novatech.io',
    v_space_boardroom, v_etype_conference, 'draft',
    '2026-06-29 08:00:00+01'::timestamptz, '2026-06-29 11:00:00+01'::timestamptz, 40,
    'Awaiting final guest count. Branding assets due Friday.', 'draft'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.events
    WHERE venue_id = v_venue_id AND title = 'Product Launch Breakfast'
  );

  INSERT INTO public.events (
    venue_id, title, client_name, client_email, client_phone,
    space_id, event_type_id, status, starts_at, ends_at, guest_count, notes,
    rota_status, rota_published_at
  )
  SELECT
    v_venue_id, 'Charity Gala Evening', 'Helen Foster', 'helen@brightfuture.org', '+44 7700 900789',
    v_space_ballroom, v_etype_gala, 'confirmed',
    '2026-07-02 19:00:00+01'::timestamptz, '2026-07-03 00:30:00+01'::timestamptz, 200,
    'Silent auction tables in foyer. VIP reception from 18:00.', 'published', '2026-06-26 12:00:00+00'::timestamptz
  WHERE NOT EXISTS (
    SELECT 1 FROM public.events
    WHERE venue_id = v_venue_id AND title = 'Charity Gala Evening'
  );

  INSERT INTO public.events (
    venue_id, title, client_name, client_email, client_phone,
    space_id, event_type_id, status, starts_at, ends_at, guest_count, notes,
    rota_status
  )
  SELECT
    v_venue_id, 'Anniversary Dinner — Morrison Family', 'David Morrison', 'david.morrison@email.com', '+44 7700 900321',
    v_space_private, v_etype_private, 'completed',
    '2026-05-18 19:30:00+01'::timestamptz, '2026-05-18 22:30:00+01'::timestamptz, 24,
    'Champagne toast at 20:00. Cake service at 21:30.', 'published'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.events
    WHERE venue_id = v_venue_id AND title = 'Anniversary Dinner — Morrison Family'
  );

  INSERT INTO public.events (
    venue_id, title, client_name, client_email, client_phone,
    space_id, event_type_id, status, starts_at, ends_at, guest_count, notes,
    rota_status
  )
  SELECT
    v_venue_id, 'Summer Garden Party — Cancelled', 'Rachel Green', 'rachel.green@email.com', '+44 7700 900654',
    v_space_terrace, v_etype_private, 'cancelled',
    '2026-07-10 14:00:00+01'::timestamptz, '2026-07-10 18:00:00+01'::timestamptz, 60,
    'Cancelled due to weather contingency. Deposit refund processed.', 'draft'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.events
    WHERE venue_id = v_venue_id AND title = 'Summer Garden Party — Cancelled'
  );

  INSERT INTO public.events (
    venue_id, title, client_name, client_email, client_phone,
    space_id, event_type_id, status, starts_at, ends_at, guest_count, notes,
    rota_status, rota_published_at
  )
  SELECT
    v_venue_id, 'Board Strategy Lunch', 'James Wright', 'j.wright@apexholdings.com', '+44 7700 900987',
    v_space_boardroom, v_etype_corporate, 'in_progress',
    '2026-06-27 12:30:00+01'::timestamptz, '2026-06-27 15:00:00+01'::timestamptz, 16,
    'Dietary: 2 gluten-free, 1 nut allergy.', 'ready_to_publish', NULL
  WHERE NOT EXISTS (
    SELECT 1 FROM public.events
    WHERE venue_id = v_venue_id AND title = 'Board Strategy Lunch'
  );

  RAISE NOTICE 'Demo seed complete.';
END $$;

COMMIT;

-- Verification ---------------------------------------------------------------
SELECT 'team_members' AS table_name, count(*) AS row_count
FROM public.team_members
WHERE venue_id = (SELECT id FROM public.venues ORDER BY created_at LIMIT 1)
UNION ALL
SELECT 'enquiries', count(*)
FROM public.enquiries
WHERE venue_id = (SELECT id FROM public.venues ORDER BY created_at LIMIT 1)
UNION ALL
SELECT 'events', count(*)
FROM public.events
WHERE venue_id = (SELECT id FROM public.venues ORDER BY created_at LIMIT 1);

-- Venudue MVP schema v1.1.3 — expanded venue types + custom label for "other"
-- Run in Supabase SQL Editor after 002_venue_setup_rls_fixes.sql

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS venue_type_custom text;

ALTER TYPE public.venue_type ADD VALUE IF NOT EXISTS 'pub';
ALTER TYPE public.venue_type ADD VALUE IF NOT EXISTS 'event_venue';
ALTER TYPE public.venue_type ADD VALUE IF NOT EXISTS 'cafe';
ALTER TYPE public.venue_type ADD VALUE IF NOT EXISTS 'nightclub';
ALTER TYPE public.venue_type ADD VALUE IF NOT EXISTS 'gallery_museum';
ALTER TYPE public.venue_type ADD VALUE IF NOT EXISTS 'outdoor_space';
ALTER TYPE public.venue_type ADD VALUE IF NOT EXISTS 'coworking_space';
ALTER TYPE public.venue_type ADD VALUE IF NOT EXISTS 'theatre_performance_space';

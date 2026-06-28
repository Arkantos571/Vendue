-- venues.venue_type_custom (from 003; safe if that migration was skipped).

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

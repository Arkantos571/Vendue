-- Run this file FIRST, then 006_shift_confirmation_notifications.sql
-- PostgreSQL requires new enum values to be committed before use in the same session.

ALTER TYPE public.rota_shift_status ADD VALUE IF NOT EXISTS 'declined';

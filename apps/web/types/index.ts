export type ProfileRole = "owner" | "manager" | "coordinator" | "staff";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export type VenueType =
  | "hotel"
  | "restaurant"
  | "bar"
  | "conference_centre"
  | "wedding_venue"
  | "private_members_club"
  | "other";

export interface Venue {
  id: string;
  name: string;
  slug: string;
  venue_type: VenueType;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  postcode: string | null;
  country: string;
  timezone: string;
  logo_url: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type VenueMemberRole = "owner" | "admin" | "manager" | "coordinator" | "viewer";

export interface VenueMember {
  id: string;
  venue_id: string;
  profile_id: string;
  role: VenueMemberRole;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Space {
  id: string;
  venue_id: string;
  name: string;
  capacity: number | null;
  floor: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventType {
  id: string;
  venue_id: string;
  name: string;
  description: string | null;
  default_duration_minutes: number | null;
  colour: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type EventStatus =
  | "draft"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Event {
  id: string;
  venue_id: string;
  space_id: string | null;
  event_type_id: string | null;
  title: string;
  description: string | null;
  status: EventStatus;
  starts_at: string;
  ends_at: string;
  guest_count: number | null;
  client_name: string | null;
  client_email: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type TeamMemberStatus = "active" | "invited" | "inactive";

export interface TeamMember {
  id: string;
  venue_id: string;
  profile_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  job_title: string | null;
  department: string | null;
  status: TeamMemberStatus;
  hourly_rate: number | null;
  created_at: string;
  updated_at: string;
}

export type RotaShiftStatus = "scheduled" | "confirmed" | "completed" | "cancelled";

export interface RotaShift {
  id: string;
  venue_id: string;
  event_id: string | null;
  team_member_id: string;
  role_label: string | null;
  starts_at: string;
  ends_at: string;
  status: RotaShiftStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VenueOnboardingDraft {
  name: string;
  venue_type: VenueType;
  spaces: Array<Pick<Space, "name" | "capacity" | "description">>;
  event_types: Array<Pick<EventType, "name" | "description" | "default_duration_minutes">>;
}

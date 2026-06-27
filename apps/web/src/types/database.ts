export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type VenueMemberRole = "owner" | "admin" | "manager" | "staff";

export type VenueType =
  | "hotel"
  | "restaurant"
  | "bar"
  | "conference_centre"
  | "wedding_venue"
  | "private_members_club"
  | "other";

export type EventStatus =
  | "draft"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TeamMemberStatus = "active" | "invited" | "inactive";

export type RotaShiftStatus = "scheduled" | "confirmed" | "completed" | "cancelled";

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      venues: {
        Row: {
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
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          venue_type?: VenueType;
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          postcode?: string | null;
          country?: string;
          timezone?: string;
          logo_url?: string | null;
          onboarding_completed_at?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          venue_type?: VenueType;
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          postcode?: string | null;
          country?: string;
          timezone?: string;
          logo_url?: string | null;
          onboarding_completed_at?: string | null;
        };
        Relationships: [];
      };
      venue_members: {
        Row: {
          id: string;
          venue_id: string;
          profile_id: string;
          role: VenueMemberRole;
          invited_at: string | null;
          joined_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          profile_id: string;
          role?: VenueMemberRole;
          invited_at?: string | null;
          joined_at?: string | null;
        };
        Update: {
          role?: VenueMemberRole;
          invited_at?: string | null;
          joined_at?: string | null;
        };
        Relationships: [];
      };
      spaces: {
        Row: {
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
        };
        Insert: {
          id?: string;
          venue_id: string;
          name: string;
          capacity?: number | null;
          floor?: string | null;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          capacity?: number | null;
          floor?: string | null;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      event_types: {
        Row: {
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
        };
        Insert: {
          id?: string;
          venue_id: string;
          name: string;
          description?: string | null;
          default_duration_minutes?: number | null;
          colour?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          default_duration_minutes?: number | null;
          colour?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      events: {
        Row: {
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
        };
        Insert: {
          id?: string;
          venue_id: string;
          space_id?: string | null;
          event_type_id?: string | null;
          title: string;
          description?: string | null;
          status?: EventStatus;
          starts_at: string;
          ends_at: string;
          guest_count?: number | null;
          client_name?: string | null;
          client_email?: string | null;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          space_id?: string | null;
          event_type_id?: string | null;
          title?: string;
          description?: string | null;
          status?: EventStatus;
          starts_at?: string;
          ends_at?: string;
          guest_count?: number | null;
          client_name?: string | null;
          client_email?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
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
        };
        Insert: {
          id?: string;
          venue_id: string;
          profile_id?: string | null;
          full_name: string;
          email: string;
          phone?: string | null;
          job_title?: string | null;
          department?: string | null;
          status?: TeamMemberStatus;
          hourly_rate?: number | null;
        };
        Update: {
          profile_id?: string | null;
          full_name?: string;
          email?: string;
          phone?: string | null;
          job_title?: string | null;
          department?: string | null;
          status?: TeamMemberStatus;
          hourly_rate?: number | null;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          venue_id: string;
          email: string;
          role: VenueMemberRole;
          invited_by: string | null;
          token_hash: string;
          status: InvitationStatus;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          email: string;
          role?: VenueMemberRole;
          invited_by?: string | null;
          token_hash: string;
          status?: InvitationStatus;
          expires_at: string;
          accepted_at?: string | null;
        };
        Update: {
          email?: string;
          role?: VenueMemberRole;
          status?: InvitationStatus;
          expires_at?: string;
          accepted_at?: string | null;
        };
        Relationships: [];
      };
      rota_shifts: {
        Row: {
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
        };
        Insert: {
          id?: string;
          venue_id: string;
          event_id?: string | null;
          team_member_id: string;
          role_label?: string | null;
          starts_at: string;
          ends_at: string;
          status?: RotaShiftStatus;
          notes?: string | null;
        };
        Update: {
          event_id?: string | null;
          team_member_id?: string;
          role_label?: string | null;
          starts_at?: string;
          ends_at?: string;
          status?: RotaShiftStatus;
          notes?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          venue_id: string;
          profile_id: string;
          type: string;
          title: string;
          body: string | null;
          metadata: Json;
          read_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          profile_id: string;
          type: string;
          title: string;
          body?: string | null;
          metadata?: Json;
          read_at?: string | null;
        };
        Update: {
          read_at?: string | null;
          body?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          venue_id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
        };
        Update: {
          metadata?: Json;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_venue_member: { Args: { p_venue_id: string }; Returns: boolean };
      can_manage_venue: { Args: { p_venue_id: string }; Returns: boolean };
      has_venue_role: {
        Args: { p_venue_id: string; p_roles: VenueMemberRole[] };
        Returns: boolean;
      };
      user_venue_ids: { Args: Record<string, never>; Returns: string[] };
    };
    Enums: {
      venue_member_role: VenueMemberRole;
      venue_type: VenueType;
      event_status: EventStatus;
      team_member_status: TeamMemberStatus;
      rota_shift_status: RotaShiftStatus;
      invitation_status: InvitationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Venue = Database["public"]["Tables"]["venues"]["Row"];
export type VenueMember = Database["public"]["Tables"]["venue_members"]["Row"];
export type Space = Database["public"]["Tables"]["spaces"]["Row"];
export type EventType = Database["public"]["Tables"]["event_types"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];
export type Invitation = Database["public"]["Tables"]["invitations"]["Row"];
export type RotaShift = Database["public"]["Tables"]["rota_shifts"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type AuditLogEntry = Database["public"]["Tables"]["audit_log"]["Row"];

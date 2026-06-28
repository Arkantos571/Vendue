export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type VenueMemberRole = "owner" | "admin" | "manager" | "staff";

export type VenueType =
  | "restaurant"
  | "bar"
  | "pub"
  | "hotel"
  | "event_venue"
  | "private_members_club"
  | "wedding_venue"
  | "conference_centre"
  | "cafe"
  | "nightclub"
  | "gallery_museum"
  | "outdoor_space"
  | "coworking_space"
  | "theatre_performance_space"
  | "other";

export type EventStatus =
  | "draft"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TeamMemberStatus = "active" | "invited" | "inactive";

export type TeamRole =
  | "manager"
  | "supervisor"
  | "bartender"
  | "waiter"
  | "runner"
  | "reception"
  | "kitchen"
  | "security";

export type EmploymentType = "full_time" | "part_time" | "casual" | "agency";

export type AvailabilityStatus = "available" | "limited" | "unavailable";

export type RotaShiftStatus = "scheduled" | "confirmed" | "declined" | "completed" | "cancelled";

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export type EnquiryStatus =
  | "new"
  | "contacted"
  | "proposal_sent"
  | "confirmed"
  | "lost";

export type EnquiryPriority = "low" | "medium" | "high";

export type EnquirySource =
  | "website"
  | "phone"
  | "email"
  | "referral"
  | "walk_in"
  | "agency";

export type FunctionSheetStatus = "draft" | "in_progress" | "ready";

export type UnavailabilityStatus = "pending" | "approved" | "rejected";

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
          venue_type_custom: string | null;
          address_line_1: string | null;
          address_line_2: string | null;
          city: string | null;
          postcode: string | null;
          country: string;
          timezone: string;
          logo_url: string | null;
          accent_colour: string | null;
          default_opening_hours: string | null;
          public_slug: string | null;
          enquiry_form_enabled: boolean;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          venue_type?: VenueType;
          venue_type_custom?: string | null;
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          postcode?: string | null;
          country?: string;
          timezone?: string;
          logo_url?: string | null;
          accent_colour?: string | null;
          default_opening_hours?: string | null;
          public_slug?: string | null;
          enquiry_form_enabled?: boolean;
          onboarding_completed_at?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          venue_type?: VenueType;
          venue_type_custom?: string | null;
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          postcode?: string | null;
          country?: string;
          timezone?: string;
          logo_url?: string | null;
          accent_colour?: string | null;
          default_opening_hours?: string | null;
          public_slug?: string | null;
          enquiry_form_enabled?: boolean;
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
      enquiries: {
        Row: {
          id: string;
          venue_id: string;
          event_name: string;
          client_name: string;
          client_email: string;
          client_phone: string | null;
          company: string | null;
          client_preferences: string | null;
          requested_date: string | null;
          preferred_start_time: string | null;
          preferred_end_time: string | null;
          event_type_id: string | null;
          space_id: string | null;
          guest_count: number | null;
          budget_estimate: number | null;
          estimated_value: number | null;
          status: EnquiryStatus;
          source: EnquirySource;
          priority: EnquiryPriority;
          assigned_profile_id: string | null;
          last_contact_at: string | null;
          next_follow_up_at: string | null;
          notes: string | null;
          internal_notes: string | null;
          activity: Json;
          converted_event_id: string | null;
          converted_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          event_name: string;
          client_name: string;
          client_email: string;
          client_phone?: string | null;
          company?: string | null;
          client_preferences?: string | null;
          requested_date?: string | null;
          preferred_start_time?: string | null;
          preferred_end_time?: string | null;
          event_type_id?: string | null;
          space_id?: string | null;
          guest_count?: number | null;
          budget_estimate?: number | null;
          estimated_value?: number | null;
          status?: EnquiryStatus;
          source?: EnquirySource;
          priority?: EnquiryPriority;
          assigned_profile_id?: string | null;
          last_contact_at?: string | null;
          next_follow_up_at?: string | null;
          notes?: string | null;
          internal_notes?: string | null;
          activity?: Json;
          converted_event_id?: string | null;
          converted_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          event_name?: string;
          client_name?: string;
          client_email?: string;
          client_phone?: string | null;
          company?: string | null;
          client_preferences?: string | null;
          requested_date?: string | null;
          preferred_start_time?: string | null;
          preferred_end_time?: string | null;
          event_type_id?: string | null;
          space_id?: string | null;
          guest_count?: number | null;
          budget_estimate?: number | null;
          estimated_value?: number | null;
          status?: EnquiryStatus;
          source?: EnquirySource;
          priority?: EnquiryPriority;
          assigned_profile_id?: string | null;
          last_contact_at?: string | null;
          next_follow_up_at?: string | null;
          notes?: string | null;
          internal_notes?: string | null;
          activity?: Json;
          converted_event_id?: string | null;
          converted_at?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          venue_id: string;
          enquiry_id: string | null;
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
          client_phone: string | null;
          notes: string | null;
          rota_status: string;
          rota_published_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          enquiry_id?: string | null;
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
          client_phone?: string | null;
          notes?: string | null;
          rota_status?: string;
          rota_published_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          enquiry_id?: string | null;
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
          client_phone?: string | null;
          notes?: string | null;
          rota_status?: string;
          rota_published_at?: string | null;
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
          role: TeamRole | null;
          job_title: string | null;
          department: string | null;
          employment_type: EmploymentType | null;
          availability_status: AvailabilityStatus;
          status: TeamMemberStatus;
          hourly_rate: number | null;
          notes: string | null;
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
          role?: TeamRole | null;
          job_title?: string | null;
          department?: string | null;
          employment_type?: EmploymentType | null;
          availability_status?: AvailabilityStatus;
          status?: TeamMemberStatus;
          hourly_rate?: number | null;
          notes?: string | null;
        };
        Update: {
          profile_id?: string | null;
          full_name?: string;
          email?: string;
          phone?: string | null;
          role?: TeamRole | null;
          job_title?: string | null;
          department?: string | null;
          employment_type?: EmploymentType | null;
          availability_status?: AvailabilityStatus;
          status?: TeamMemberStatus;
          hourly_rate?: number | null;
          notes?: string | null;
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
          section: string | null;
          starts_at: string;
          ends_at: string;
          break_minutes: number;
          status: RotaShiftStatus;
          hourly_rate: number | null;
          notes: string | null;
          confirmed_at: string | null;
          declined_at: string | null;
          response_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          event_id?: string | null;
          team_member_id: string;
          role_label?: string | null;
          section?: string | null;
          starts_at: string;
          ends_at: string;
          break_minutes?: number;
          status?: RotaShiftStatus;
          hourly_rate?: number | null;
          notes?: string | null;
          confirmed_at?: string | null;
          declined_at?: string | null;
          response_note?: string | null;
        };
        Update: {
          event_id?: string | null;
          team_member_id?: string;
          role_label?: string | null;
          section?: string | null;
          starts_at?: string;
          ends_at?: string;
          break_minutes?: number;
          status?: RotaShiftStatus;
          hourly_rate?: number | null;
          notes?: string | null;
          confirmed_at?: string | null;
          declined_at?: string | null;
          response_note?: string | null;
        };
        Relationships: [];
      };
      event_function_sheets: {
        Row: {
          id: string;
          venue_id: string;
          event_id: string;
          status: FunctionSheetStatus;
          running_order: Json;
          setup: Json;
          food_and_beverage: Json;
          staffing_plan: Json;
          checklist: Json;
          internal_notes: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          event_id: string;
          status?: FunctionSheetStatus;
          running_order?: Json;
          setup?: Json;
          food_and_beverage?: Json;
          staffing_plan?: Json;
          checklist?: Json;
          internal_notes?: Json;
        };
        Update: {
          status?: FunctionSheetStatus;
          running_order?: Json;
          setup?: Json;
          food_and_beverage?: Json;
          staffing_plan?: Json;
          checklist?: Json;
          internal_notes?: Json;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          venue_id: string;
          profile_id: string | null;
          recipient_team_member_id: string | null;
          type: string;
          title: string;
          body: string | null;
          metadata: Json;
          related_enquiry_id: string | null;
          related_event_id: string | null;
          related_shift_id: string | null;
          read_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          profile_id?: string | null;
          recipient_team_member_id?: string | null;
          type: string;
          title: string;
          body?: string | null;
          metadata?: Json;
          related_enquiry_id?: string | null;
          related_event_id?: string | null;
          related_shift_id?: string | null;
          read_at?: string | null;
        };
        Update: {
          read_at?: string | null;
          body?: string | null;
          metadata?: Json;
          related_enquiry_id?: string | null;
          related_event_id?: string | null;
          related_shift_id?: string | null;
        };
        Relationships: [];
      };
      unavailability: {
        Row: {
          id: string;
          venue_id: string;
          team_member_id: string;
          start_date: string;
          end_date: string;
          start_time: string | null;
          end_time: string | null;
          reason: string | null;
          status: UnavailabilityStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          team_member_id: string;
          start_date: string;
          end_date: string;
          start_time?: string | null;
          end_time?: string | null;
          reason?: string | null;
          status?: UnavailabilityStatus;
        };
        Update: {
          start_date?: string;
          end_date?: string;
          start_time?: string | null;
          end_time?: string | null;
          reason?: string | null;
          status?: UnavailabilityStatus;
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
      notify_managers_shift_confirmed: { Args: { p_shift_id: string }; Returns: undefined };
      notify_managers_shift_declined: { Args: { p_shift_id: string }; Returns: undefined };
      notify_staff_rota_published: { Args: { p_event_id: string }; Returns: undefined };
      notify_staff_shift_added: { Args: { p_shift_id: string }; Returns: undefined };
      notify_staff_shift_updated: {
        Args: {
          p_shift_id: string;
          p_team_member_id: string;
          p_event_id: string;
          p_venue_id: string;
          p_event_title: string;
        };
        Returns: undefined;
      };
      list_public_venues: {
        Args: Record<PropertyKey, never>;
        Returns: { id: string; name: string }[];
      };
      get_public_enquiry_form_options: {
        Args: { p_venue_id: string };
        Returns: Json;
      };
      submit_public_enquiry: {
        Args: {
          p_venue_id: string;
          p_event_name: string;
          p_client_name: string;
          p_client_email: string;
          p_client_phone: string | null;
          p_requested_date: string | null;
          p_preferred_start_time: string | null;
          p_preferred_end_time: string | null;
          p_end_is_next_day: boolean;
          p_event_type_id: string | null;
          p_space_id: string | null;
          p_guest_count: number | null;
          p_budget_estimate: number | null;
          p_notes: string | null;
        };
        Returns: string;
      };
      get_public_venue_by_slug: {
        Args: { p_public_slug: string };
        Returns: Json;
      };
    };
    Enums: {
      venue_member_role: VenueMemberRole;
      venue_type: VenueType;
      event_status: EventStatus;
      team_member_status: TeamMemberStatus;
      team_role: TeamRole;
      employment_type: EmploymentType;
      availability_status: AvailabilityStatus;
      rota_shift_status: RotaShiftStatus;
      invitation_status: InvitationStatus;
      enquiry_status: EnquiryStatus;
      enquiry_priority: EnquiryPriority;
      enquiry_source: EnquirySource;
      function_sheet_status: FunctionSheetStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Venue = Database["public"]["Tables"]["venues"]["Row"];
export type VenueMember = Database["public"]["Tables"]["venue_members"]["Row"];
export type Space = Database["public"]["Tables"]["spaces"]["Row"];
export type EventType = Database["public"]["Tables"]["event_types"]["Row"];
export type Enquiry = Database["public"]["Tables"]["enquiries"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];
export type Invitation = Database["public"]["Tables"]["invitations"]["Row"];
export type RotaShift = Database["public"]["Tables"]["rota_shifts"]["Row"];
export type EventFunctionSheet = Database["public"]["Tables"]["event_function_sheets"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type AuditLogEntry = Database["public"]["Tables"]["audit_log"]["Row"];

import { createAdminClient } from "./helpers/supabase-admin";
import { hasSupabaseE2EEnv } from "./helpers/env";

const DEFAULT_PROPOSAL_TOKEN = "e2e-test-proposal-token";

async function globalSetup() {
  if (!hasSupabaseE2EEnv()) {
    console.warn("Skipping E2E global setup: Supabase env vars not configured.");
    return;
  }

  const supabase = createAdminClient();
  const proposalToken = process.env.E2E_PROPOSAL_TOKEN?.trim() || DEFAULT_PROPOSAL_TOKEN;

  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("id, public_slug, enquiry_form_enabled")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (venueError || !venue) {
    console.warn("E2E global setup: no venue found. Complete onboarding before running E2E.");
    return;
  }

  if (!process.env.E2E_VENUE_SLUG?.trim() && venue.public_slug) {
    process.env.E2E_VENUE_SLUG = venue.public_slug;
  }

  if (!process.env.E2E_PROPOSAL_TOKEN?.trim()) {
    process.env.E2E_PROPOSAL_TOKEN = proposalToken;
  }

  const { data: existingEnquiry } = await supabase
    .from("enquiries")
    .select("id")
    .eq("proposal_token", proposalToken)
    .maybeSingle();

  if (existingEnquiry) {
    return;
  }

  const { data: seedEnquiry } = await supabase
    .from("enquiries")
    .select("id")
    .eq("venue_id", venue.id)
    .in("status", ["proposal_sent", "qualified", "new"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (seedEnquiry) {
    await supabase
      .from("enquiries")
      .update({
        proposal_token: proposalToken,
        proposal_status: "shared",
        proposal_title: "E2E Test Proposal",
        proposal_intro: "This proposal is used by Playwright E2E tests.",
        proposal_inclusions: "Room hire, canapés, and service staff.",
        proposal_terms: "Subject to venue availability.",
        proposal_valid_until: "2026-12-31",
        estimated_value: 8500,
        proposed_package: "Standard package",
      })
      .eq("id", seedEnquiry.id);
    return;
  }

  const { data: space } = await supabase
    .from("spaces")
    .select("id")
    .eq("venue_id", venue.id)
    .limit(1)
    .maybeSingle();

  const { data: eventType } = await supabase
    .from("event_types")
    .select("id")
    .eq("venue_id", venue.id)
    .limit(1)
    .maybeSingle();

  await supabase.from("enquiries").insert({
    venue_id: venue.id,
    event_name: "E2E Proposal Fixture",
    client_name: "E2E Client",
    client_email: "e2e-proposal@example.com",
    requested_date: "2026-09-20",
    guest_count: 50,
    status: "proposal_sent",
    source: "website",
    priority: "medium",
    proposal_token: proposalToken,
    proposal_status: "shared",
    proposal_title: "E2E Test Proposal",
    proposal_intro: "This proposal is used by Playwright E2E tests.",
    proposal_inclusions: "Room hire, canapés, and service staff.",
    proposal_terms: "Subject to venue availability.",
    proposal_valid_until: "2026-12-31",
    estimated_value: 8500,
    proposed_package: "Standard package",
    space_id: space?.id ?? null,
    event_type_id: eventType?.id ?? null,
  });
}

export default globalSetup;

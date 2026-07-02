import { expect, test } from "@playwright/test";
import { createAdminClient } from "./helpers/supabase-admin";
import { getProposalToken, getVenueSlug, hasSupabaseE2EEnv } from "./helpers/env";

test.describe("Public enquiry → proposal workflow", () => {
  test.beforeEach(() => {
    test.skip(!hasSupabaseE2EEnv(), "Supabase E2E environment variables are not configured.");
  });

  test("submits a public enquiry and verifies it reaches the pipeline", async ({ page }) => {
    const venueSlug = getVenueSlug();
    const uniqueEmail = `e2e+${Date.now()}@example.com`;
    const eventName = `E2E Enquiry ${Date.now()}`;

    await page.goto(`/enquire/${venueSlug}`);
    await expect(page.getByRole("heading", { name: /event enquiry/i })).toBeVisible();

    await page.locator("#event_name").fill(eventName);
    await page.locator("#client_name").fill("Playwright Tester");
    await page.locator("#client_email").fill(uniqueEmail);
    await page.locator("#requested_date").fill("2026-09-15");
    await page.locator("#guest_count").fill("40");
    await page.getByRole("button", { name: "Send enquiry" }).click();

    await expect(page.getByRole("heading", { name: "Enquiry sent" })).toBeVisible();

    const supabase = createAdminClient();
    const { data: enquiry, error } = await supabase
      .from("enquiries")
      .select("id, status, event_name, client_email")
      .eq("client_email", uniqueEmail)
      .eq("event_name", eventName)
      .maybeSingle();

    expect(error).toBeNull();
    expect(enquiry).toBeTruthy();
    expect(enquiry?.status).toBeTruthy();
  });

  test("renders a public proposal and accepts a client response", async ({ page }) => {
    const proposalToken = getProposalToken();

    await page.goto(`/proposal/${proposalToken}`);
    await expect(page.getByRole("heading", { name: /your event proposal/i })).toBeVisible();
    await expect(page.getByText(/prepared for/i)).toBeVisible();

    await page.getByRole("button", { name: "Looks good" }).click();
    await page.getByLabel(/message to the venue team/i).fill("Looking forward to discussing details.");
    await page.getByRole("button", { name: /send response/i }).click();

    await expect(page.getByText(/response sent/i)).toBeVisible();

    const supabase = createAdminClient();
    const { data: enquiry, error } = await supabase
      .from("enquiries")
      .select("proposal_client_response, proposal_client_message")
      .eq("proposal_token", proposalToken)
      .maybeSingle();

    expect(error).toBeNull();
    expect(enquiry?.proposal_client_response).toBe("interested");
    expect(enquiry?.proposal_client_message).toContain("Looking forward");
  });
});

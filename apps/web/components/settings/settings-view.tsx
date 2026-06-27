"use client";

import { Bell, Building2, Palette, Settings2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { VenueOnboardingForm } from "@/components/onboarding/venue-onboarding-form";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const settingsTabs = [
  { id: "general", label: "General", hash: "general", icon: Settings2 },
  { id: "venue-setup", label: "Venue Setup", hash: "venue-setup", icon: Building2 },
  { id: "appearance", label: "Appearance", hash: "appearance", icon: Palette },
  { id: "users", label: "Users & Roles", hash: "users", icon: Users },
  { id: "notifications", label: "Notifications", hash: "notifications", icon: Bell },
] as const;

type SettingsTabId = (typeof settingsTabs)[number]["id"];

function tabFromHash(hash: string): SettingsTabId {
  const normalized = hash.replace(/^#/, "").toLowerCase();

  if (normalized === "users-roles") {
    return "users";
  }

  const match = settingsTabs.find((tab) => tab.hash === normalized);
  return match?.id ?? "general";
}

function hashForTab(tabId: SettingsTabId): string {
  return tabId === "general" ? "#general" : `#${tabId}`;
}

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("general");
  const [appearanceAccent, setAppearanceAccent] = useState("#5c4b8a");
  const [appearanceSaved, setAppearanceSaved] = useState(false);

  const syncFromHash = useCallback(() => {
    setActiveTab(tabFromHash(window.location.hash));
  }, []);

  useEffect(() => {
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [syncFromHash]);

  function selectTab(tabId: SettingsTabId) {
    setActiveTab(tabId);
    window.history.replaceState(null, "", hashForTab(tabId));
  }

  async function handleSaveAppearance() {
    setAppearanceSaved(false);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setAppearanceSaved(true);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-7rem)] lg:w-56 lg:shrink-0 lg:self-start lg:overflow-y-auto">
          <nav
            className="flex gap-1 overflow-x-auto rounded-xl border border-stone-200 bg-white p-1 dark:border-stone-700 dark:bg-stone-900 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto"
            aria-label="Settings sections"
          >
          {settingsTabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => selectTab(id)}
                className={cn(
                  "flex w-full shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:justify-start",
                  isActive
                    ? "bg-brand-700 text-white shadow-sm dark:bg-brand-600"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            );
          })}
          </nav>
        </div>

        <div className="min-w-0 flex-1">
      {activeTab === "general" && (
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Account details and workspace preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings_email">Email</Label>
              <Input id="settings_email" type="email" placeholder="you@venue.com" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings_name">Full name</Label>
              <Input id="settings_name" placeholder="Alex Morgan" disabled />
            </div>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Profile settings will sync with Supabase Auth in a later release.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === "venue-setup" && (
        <Card id="venue-setup">
          <CardHeader>
            <CardTitle>Venue Setup</CardTitle>
            <CardDescription>
              Configure your venue, spaces, and event types. These settings change rarely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VenueOnboardingForm />
          </CardContent>
        </Card>
      )}

      {activeTab === "appearance" && (
        <Card id="appearance">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Theme and branding preferences for the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Theme</h3>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  Choose light, dark, or match your system preference.
                </p>
              </div>
              <ThemeSelector />
            </section>

            <section className="space-y-4 border-t border-stone-100 pt-8 dark:border-stone-800">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Accent colour
                </h3>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  Placeholder for dashboard accent colour. Venue branding lives under Venue Setup.
                </p>
              </div>
              <div className="flex max-w-md items-center gap-3">
                <Input
                  type="color"
                  value={appearanceAccent}
                  onChange={(event) => setAppearanceAccent(event.target.value)}
                  className="h-10 w-14 cursor-pointer p-1"
                />
                <Input
                  value={appearanceAccent}
                  onChange={(event) => setAppearanceAccent(event.target.value)}
                  placeholder="#5c4b8a"
                  className="flex-1"
                />
              </div>
            </section>

            <div className="flex flex-col gap-3 border-t border-stone-100 pt-6 dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between">
              {appearanceSaved && (
                <p className="text-sm text-brand-700 dark:text-brand-300">
                  Appearance saved locally.
                </p>
              )}
              <Button type="button" className="sm:ml-auto" onClick={handleSaveAppearance}>
                Save appearance
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "users" && (
        <Card>
          <CardHeader>
            <CardTitle>Users & Roles</CardTitle>
            <CardDescription>Invite teammates and manage venue permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Role management will connect to Supabase and venue membership. For now, use the Team
              section to review your roster.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Email and in-app alerts for enquiries, events, and rota.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Notification preferences are mocked for this MVP. Postmark integration comes later.
            </p>
          </CardContent>
        </Card>
      )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const themeOptions = [
  { value: "light", label: "Light mode", icon: Sun },
  { value: "dark", label: "Dark mode", icon: Moon },
  { value: "system", label: "System preference", icon: Monitor },
] as const;

interface ThemeSelectorProps {
  compact?: boolean;
}

export function ThemeSelector({ compact = false }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={compact ? "h-9" : "grid gap-3 sm:grid-cols-3"} aria-hidden />
    );
  }

  if (compact) {
    const current = themeOptions.find((option) => option.value === theme) ?? themeOptions[2];

    return (
      <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
        {themeOptions.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "rounded-md p-2 text-stone-400 transition-colors hover:bg-white/10 hover:text-white",
              theme === value && "bg-white/10 text-white",
            )}
            aria-label={label}
            title={label}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <span className="sr-only">Current theme: {current.label}</span>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {themeOptions.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors",
              isActive
                ? "border-brand-600 bg-brand-50 ring-2 ring-brand-600/20 dark:border-brand-500 dark:bg-brand-950/40 dark:ring-brand-500/30"
                : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600 dark:hover:bg-stone-800",
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5",
                isActive ? "text-brand-700 dark:text-brand-300" : "text-stone-500",
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                isActive ? "text-stone-900 dark:text-stone-100" : "text-stone-700 dark:text-stone-300",
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

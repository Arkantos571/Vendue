import { Logo } from "@/components/layout/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <Logo />
        <p className="text-sm text-stone-500">
          Hospitality events, from venue setup to staff rota.
        </p>
        <p className="text-sm text-stone-400">
          © {new Date().getFullYear()} Venudue
        </p>
      </div>
    </footer>
  );
}

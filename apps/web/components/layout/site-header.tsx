import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex">
          <Link href="#workflow" className="transition-colors hover:text-stone-900">
            Workflow
          </Link>
          <Link href="#features" className="transition-colors hover:text-stone-900">
            Features
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden text-sm font-medium text-stone-600 hover:text-stone-900 sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-700 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-800"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

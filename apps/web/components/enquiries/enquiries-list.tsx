"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EnquiryStatusBadge } from "@/components/enquiries/enquiry-status-badge";
import { Input } from "@/components/ui/input";
import { cn, formatDate } from "@/lib/utils";
import {
  enquirySourceLabels,
  enquiryStatusFilters,
  formatEnquiryCurrency,
  
  type EnquiryStatusFilter,
  type MockEnquiry,
} from "@/lib/mock/enquiries";

interface EnquiriesListProps {
  enquiries: MockEnquiry[];
}

function EnquiryTableRow({ enquiry }: { enquiry: MockEnquiry }) {
  const router = useRouter();

  function navigate() {
    router.push(`/dashboard/enquiries/${enquiry.id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate();
    }
  }

  return (
    <tr
      role="link"
      tabIndex={0}
      onClick={navigate}
      onKeyDown={handleKeyDown}
      className="cursor-pointer transition-colors hover:bg-stone-50/80 focus-visible:bg-stone-50/80 dark:hover:bg-stone-800/50 dark:focus-visible:bg-stone-800/50 focus-visible:outline-none"
      aria-label={`View ${enquiry.eventName}`}
    >
      <td className="px-6 py-4 font-medium text-stone-900">{enquiry.eventName}</td>
      <td className="px-4 py-4 text-stone-700">{enquiry.clientName}</td>
      <td className="px-4 py-4">
        <p className="text-stone-700">{enquiry.clientEmail}</p>
        <p className="text-xs text-stone-500">{enquiry.clientPhone ?? "—"}</p>
      </td>
      <td className="px-4 py-4 text-stone-600">{formatDate(enquiry.requestedDate)}</td>
      <td className="px-4 py-4 text-stone-600">{enquiry.eventType}</td>
      <td className="px-4 py-4 text-stone-600">{enquiry.guestCount}</td>
      <td className="px-4 py-4 font-medium text-stone-900">
        {formatEnquiryCurrency(enquiry.estimatedValue)}
      </td>
      <td className="px-4 py-4">
        <EnquiryStatusBadge status={enquiry.status} />
      </td>
      <td className="px-4 py-4 text-stone-600">{enquirySourceLabels[enquiry.source]}</td>
      <td className="px-4 py-4 text-stone-600">{enquiry.assignedOwner}</td>
      <td className="px-6 py-4 text-stone-600">
        {enquiry.lastContactDate ? formatDate(enquiry.lastContactDate) : "—"}
      </td>
    </tr>
  );
}

function EnquiryCard({ enquiry }: { enquiry: MockEnquiry }) {
  const router = useRouter();

  function navigate() {
    router.push(`/dashboard/enquiries/${enquiry.id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate();
    }
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={navigate}
      onKeyDown={handleKeyDown}
      className="cursor-pointer v-card p-5 transition-all hover:border-stone-300 hover:bg-stone-50/80"
      aria-label={`View ${enquiry.eventName}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-stone-900">{enquiry.eventName}</p>
          <p className="mt-1 text-sm text-stone-500">{enquiry.clientName}</p>
        </div>
        <EnquiryStatusBadge status={enquiry.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-stone-500">Requested date</dt>
          <dd className="text-stone-700">{formatDate(enquiry.requestedDate)}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500">Est. value</dt>
          <dd className="font-medium text-stone-900">{formatEnquiryCurrency(enquiry.estimatedValue)}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500">Source</dt>
          <dd className="text-stone-700">{enquirySourceLabels[enquiry.source]}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500">Owner</dt>
          <dd className="text-stone-700">{enquiry.assignedOwner}</dd>
        </div>
      </dl>
    </div>
  );
}

export function EnquiriesList({ enquiries }: EnquiriesListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnquiryStatusFilter>("all");

  const filteredEnquiries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return enquiries.filter((enquiry) => {
      const matchesStatus = statusFilter === "all" || enquiry.status === statusFilter;
      const matchesSearch =
        !query ||
        enquiry.eventName.toLowerCase().includes(query) ||
        enquiry.clientName.toLowerCase().includes(query) ||
        enquiry.clientEmail.toLowerCase().includes(query) ||
        (enquiry.clientPhone?.toLowerCase().includes(query) ?? false);

      return matchesStatus && matchesSearch;
    });
  }, [enquiries, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            type="search"
            placeholder="Search enquiries, clients, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Link
          href="/dashboard/enquiries/new"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-800"
        >
          <Plus className="h-4 w-4" />
          New enquiry
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {enquiryStatusFilters.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              statusFilter === value
                ? "bg-brand-700 text-white"
                : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-700 dark:hover:bg-stone-800",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredEnquiries.length === 0 ? (
        <div className="v-empty">
          <p className="text-sm font-medium text-stone-900">No enquiries found</p>
          <p className="mt-1 text-sm text-stone-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto v-card lg:block">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50 text-xs font-medium uppercase tracking-wide text-stone-500">
                  <th className="px-6 py-3">Enquiry</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Requested date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Guests</th>
                  <th className="px-4 py-3">Est. value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-6 py-3">Last contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEnquiries.map((enquiry) => (
                  <EnquiryTableRow key={enquiry.id} enquiry={enquiry} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 lg:hidden">
            {filteredEnquiries.map((enquiry) => (
              <EnquiryCard key={enquiry.id} enquiry={enquiry} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

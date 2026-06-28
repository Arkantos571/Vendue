"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EnquiryStatusBadge } from "@/components/enquiries/enquiry-status-badge";
import { Input } from "@/components/ui/input";
import { isFollowUpOverdue } from "@/lib/enquiries/mappers";
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

function FollowUpCell({ enquiry }: { enquiry: MockEnquiry }) {
  const overdue = isFollowUpOverdue(enquiry);

  if (!enquiry.nextFollowUpDate) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <span
      className={cn(
        overdue && "font-medium text-red-700 dark:text-red-300",
        !overdue && "text-muted-foreground",
      )}
    >
      {formatDate(enquiry.nextFollowUpDate)}
      {overdue && <span className="ml-1.5 text-xs uppercase tracking-wide">Overdue</span>}
    </span>
  );
}

function EnquiryTableRow({ enquiry }: { enquiry: MockEnquiry }) {
  const router = useRouter();
  const overdue = isFollowUpOverdue(enquiry);

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
      className={cn(
        "cursor-pointer transition-colors hover:bg-muted/80 focus-visible:bg-muted/80 focus-visible:outline-none",
        overdue && "bg-red-50/40 dark:bg-red-950/20",
      )}
      aria-label={`View ${enquiry.eventName}`}
    >
      <td className="px-6 py-4 font-medium text-foreground">{enquiry.eventName}</td>
      <td className="px-4 py-4 text-foreground/90">{enquiry.clientName}</td>
      <td className="px-4 py-4">
        <p className="text-foreground/90">{enquiry.clientEmail}</p>
        <p className="text-xs text-muted-foreground">{enquiry.clientPhone ?? "—"}</p>
      </td>
      <td className="px-4 py-4 text-muted-foreground">{formatDate(enquiry.requestedDate)}</td>
      <td className="px-4 py-4 text-muted-foreground">{enquiry.eventType}</td>
      <td className="px-4 py-4 text-muted-foreground">{enquiry.guestCount}</td>
      <td className="px-4 py-4 font-medium text-foreground">
        {formatEnquiryCurrency(enquiry.estimatedValue)}
      </td>
      <td className="px-4 py-4">
        <EnquiryStatusBadge status={enquiry.status} />
      </td>
      <td className="px-4 py-4">
        <FollowUpCell enquiry={enquiry} />
      </td>
      <td className="px-4 py-4 text-muted-foreground">{enquirySourceLabels[enquiry.source]}</td>
      <td className="px-4 py-4 text-muted-foreground">{enquiry.assignedOwner}</td>
      <td className="px-6 py-4 text-muted-foreground">
        {enquiry.lastContactDate ? formatDate(enquiry.lastContactDate) : "—"}
      </td>
    </tr>
  );
}

function EnquiryCard({ enquiry }: { enquiry: MockEnquiry }) {
  const router = useRouter();
  const overdue = isFollowUpOverdue(enquiry);

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
      className={cn(
        "cursor-pointer v-card p-5 transition-all hover:border-slate-300 hover:bg-muted/80",
        overdue && "border-red-200 dark:border-red-900",
      )}
      aria-label={`View ${enquiry.eventName}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{enquiry.eventName}</p>
          <p className="mt-1 text-sm text-muted-foreground">{enquiry.clientName}</p>
        </div>
        <EnquiryStatusBadge status={enquiry.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Requested date</dt>
          <dd className="text-foreground/90">{formatDate(enquiry.requestedDate)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Est. value</dt>
          <dd className="font-medium text-foreground">
            {formatEnquiryCurrency(enquiry.estimatedValue)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Follow-up</dt>
          <dd>
            <FollowUpCell enquiry={enquiry} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Owner</dt>
          <dd className="text-foreground/90">{enquiry.assignedOwner}</dd>
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
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                : "bg-white text-muted-foreground ring-1 ring-border hover:bg-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredEnquiries.length === 0 ? (
        <div className="v-empty">
          <p className="text-sm font-medium text-foreground">No enquiries found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto v-card lg:block">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-medium uppercase tracking-wide text-muted-foreground dark:border-slate-800 /50">
                  <th className="px-6 py-3">Enquiry</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Requested date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Guests</th>
                  <th className="px-4 py-3">Est. value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Follow-up</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-6 py-3">Last contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
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

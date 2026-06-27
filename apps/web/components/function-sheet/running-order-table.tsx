import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RunningOrderItem } from "@/lib/mock/function-sheet";

interface RunningOrderTableProps {
  items: RunningOrderItem[];
}

export function RunningOrderTable({ items }: RunningOrderTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline / running order</CardTitle>
        <CardDescription>Chronological plan for the event day.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:px-0">
        {items.length === 0 ? (
          <p className="px-6 pb-5 text-sm text-stone-500">No running order items yet.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/50 text-xs font-medium uppercase tracking-wide text-stone-500">
                    <th className="px-6 py-3">Time</th>
                    <th className="px-4 py-3">Item / activity</th>
                    <th className="px-4 py-3">Owner / team</th>
                    <th className="px-6 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {items.map((item, index) => (
                    <tr key={`${item.time}-${index}`} className="hover:bg-stone-50/50">
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-stone-900">{item.time}</td>
                      <td className="px-4 py-4 text-stone-900">{item.activity}</td>
                      <td className="px-4 py-4 text-stone-600">{item.owner}</td>
                      <td className="px-6 py-4 text-stone-500">{item.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-4 sm:hidden">
              {items.map((item, index) => (
                <div key={`${item.time}-${index}`} className="rounded-lg border border-stone-100 p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium text-stone-900">{item.time}</span>
                    <span className="text-xs text-stone-500">{item.owner}</span>
                  </div>
                  <p className="mt-1 text-sm text-stone-900">{item.activity}</p>
                  {item.notes && <p className="mt-2 text-sm text-stone-500">{item.notes}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

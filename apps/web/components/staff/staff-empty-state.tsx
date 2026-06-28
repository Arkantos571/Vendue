export function StaffEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-10 text-center dark:border-stone-700 dark:bg-stone-900">
      <p className="text-base font-medium text-stone-900 dark:text-stone-100">{title}</p>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">{description}</p>
    </div>
  );
}

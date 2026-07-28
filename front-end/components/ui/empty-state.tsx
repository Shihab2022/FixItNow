import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "No results found",
  message = "We couldn't find anything matching your search criteria.",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-900 shadow-xs">
      <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-500">
        <SearchX className="h-8 w-8" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-slate-500">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

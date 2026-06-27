import { PaginationMeta } from "@/types/order";

interface Props {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export default function Pagination({ meta, onPageChange }: Props) {
  const { page, total_pages, total } = meta;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
      <span>
        Page {page} of {total_pages} · {total} orders
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded border border-slate-300 px-3 py-1 font-medium hover:border-brand-500 hover:text-brand-600 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= total_pages}
          className="rounded border border-slate-300 px-3 py-1 font-medium hover:border-brand-500 hover:text-brand-600 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

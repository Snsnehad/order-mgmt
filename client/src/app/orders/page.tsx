"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import { useOrderSocket } from "@/hooks/useOrderSocket";
import { OrderStatus, ORDER_STATUSES } from "@/types/order";
import OrderRow from "./OrderRow";
import Pagination from "@/components/Pagination";
import LiveStatusIndicator from "@/components/LiveStatusIndicator";

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const storeIdParam = searchParams.get("store_id") || "";
  const [storeIdInput, setStoreIdInput] = useState(storeIdParam);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");

  const { data, isLoading, isError, error } = useOrders({
    store_id: storeIdParam,
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const { status: socketStatus } = useOrderSocket(storeIdParam);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    router.push(`/orders?store_id=${encodeURIComponent(storeIdInput.trim())}`);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
        {storeIdParam && <LiveStatusIndicator status={socketStatus} />}
      </div>

      <form onSubmit={handleFilterSubmit} className="mb-4 flex flex-wrap gap-3">
        <input
          value={storeIdInput}
          onChange={(e) => setStoreIdInput(e.target.value)}
          placeholder="Filter by store_id"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as OrderStatus | "");
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Search
        </button>
      </form>

      {!storeIdParam && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Enter a store_id above to view its orders.
        </p>
      )}

      {storeIdParam && isLoading && (
        <p className="px-4 py-6 text-sm text-slate-500">Loading orders…</p>
      )}

      {storeIdParam && isError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {(error as Error)?.message || "Failed to load orders"}
        </p>
      )}

      {storeIdParam && data && data.orders.length === 0 && (
        <p className="px-4 py-6 text-sm text-slate-500">No orders found for this store.</p>
      )}

      {storeIdParam && data && data.orders.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">ID</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">
                  Items
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">
                  Total
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">
                  Created
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order) => (
                <OrderRow key={order._id} order={order} />
              ))}
            </tbody>
          </table>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<p className="px-4 py-6 text-sm text-slate-500">Loading…</p>}>
      <OrdersPageContent />
    </Suspense>
  );
}

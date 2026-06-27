"use client";

import { Suspense, useState } from "react";
import {
  useOrdersPerDay,
  useRevenuePerStore,
  useTopSellingItems,
  useArchiveOldOrders,
} from "@/hooks/useAnalytics";

function AnalyticsContent() {
  const [storeFilter, setStoreFilter] = useState("");
  const { data: ordersPerDay, isLoading: loadingDays } = useOrdersPerDay(storeFilter || undefined);
  const { data: revenuePerStore, isLoading: loadingRevenue } = useRevenuePerStore();
  const { data: topItems, isLoading: loadingItems } = useTopSellingItems(storeFilter || undefined);
  const { mutate: runArchive, isPending: archiving } = useArchiveOldOrders();

  const maxOrders = Math.max(1, ...(ordersPerDay?.map((d) => d.order_count) ?? [1]));
  const maxRevenue = Math.max(1, ...(revenuePerStore?.map((r) => r.total_revenue) ?? [1]));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <button
          onClick={() => runArchive()}
          disabled={archiving}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-brand-500 hover:text-brand-600 disabled:opacity-50"
        >
          {archiving ? "Archiving…" : "Archive orders older than 30 days"}
        </button>
      </div>

      <div className="flex gap-3">
        <input
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          placeholder="Optional: filter orders-per-day & top-items by store_id"
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {/* Orders per day */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Orders per day
        </h2>
        {loadingDays ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : !ordersPerDay || ordersPerDay.length === 0 ? (
          <p className="text-sm text-slate-400">No data yet.</p>
        ) : (
          <div className="space-y-2">
            {ordersPerDay.map((d) => (
              <div key={d.date} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-slate-500">{d.date}</span>
                <div className="h-3 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-brand-500"
                    style={{ width: `${(d.order_count / maxOrders) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right font-medium text-slate-700">
                  {d.order_count}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Revenue per store */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Revenue per store
        </h2>
        {loadingRevenue ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : !revenuePerStore || revenuePerStore.length === 0 ? (
          <p className="text-sm text-slate-400">No data yet.</p>
        ) : (
          <div className="space-y-2">
            {revenuePerStore.map((r) => (
              <div key={r.store_id} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 truncate text-slate-500">{r.store_id}</span>
                <div className="h-3 flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-emerald-500"
                    style={{ width: `${(r.total_revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="w-24 text-right font-medium text-slate-700">
                  ₹{r.total_revenue.toFixed(2)}
                </span>
                <span className="w-16 text-right text-xs text-slate-400">
                  {r.order_count} orders
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top 5 selling items */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Top 5 selling items
        </h2>
        {loadingItems ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : !topItems || topItems.length === 0 ? (
          <p className="text-sm text-slate-400">No data yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-400">
                <th className="py-1.5 font-medium">Item</th>
                <th className="py-1.5 font-medium">Qty sold</th>
                <th className="py-1.5 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topItems.map((item) => (
                <tr key={item.item_id} className="border-t border-slate-100">
                  <td className="py-2 text-slate-800">{item.name}</td>
                  <td className="py-2 text-slate-600">{item.total_qty_sold}</td>
                  <td className="py-2 font-medium text-slate-900">
                    ₹{item.total_revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<p className="px-4 py-6 text-sm text-slate-500">Loading…</p>}>
      <AnalyticsContent />
    </Suspense>
  );
}

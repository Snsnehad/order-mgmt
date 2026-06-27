"use client";

import { useParams, useRouter } from "next/navigation";
import { useOrder, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useOrderSocket } from "@/hooks/useOrderSocket";
import StatusBadge from "@/components/StatusBadge";
import LiveStatusIndicator from "@/components/LiveStatusIndicator";
import { ALLOWED_STATUS_TRANSITIONS } from "@/types/order";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: order, isLoading, isError } = useOrder(params.id);
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();
  const { status: socketStatus } = useOrderSocket(order?.store_id || "");

  if (isLoading) return <p className="px-4 py-6 text-sdockm text-slate-500">Loading order…</p>;

  if (isError || !order)
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        Order not found.{" "}
        <button onClick={() => router.push("/orders")} className="font-medium underline">
          Back to orders
        </button>
      </div>
    );

  const nextOptions = ALLOWED_STATUS_TRANSITIONS[order.status];

  return (
    <div className="mx-auto max-w-xl">
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        ← Back
      </button>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">
            Order #{order._id.slice(-6)}
          </h1>
          <div className="flex items-center gap-3">
            <LiveStatusIndicator status={socketStatus} />
            <StatusBadge status={order.status} />
          </div>
        </div>

        <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">Store</dt>
            <dd className="font-medium text-slate-900">{order.store_id}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Created</dt>
            <dd className="font-medium text-slate-900">
              {new Date(order.created_at).toLocaleString()}
            </dd>
          </div>
        </dl>

        <div className="mb-4">
          <h2 className="mb-2 text-sm font-medium text-slate-700">Items</h2>
          <ul className="divide-y divide-slate-100 rounded border border-slate-200">
            {order.items.map((it) => (
              <li key={it.item_id} className="flex justify-between px-3 py-2 text-sm">
                <span>
                  {it.name} <span className="text-slate-400">x{it.qty}</span>
                </span>
                <span className="font-medium">₹{(it.qty * it.price).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-5 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
          <span className="text-sm font-medium text-slate-600">Total</span>
          <span className="text-lg font-semibold text-slate-900">
            ₹{order.total_amount.toFixed(2)}
          </span>
        </div>

        {nextOptions.length > 0 ? (
          <div className="flex gap-3">
            {nextOptions.map((next) => (
              <button
                key={next}
                disabled={isPending}
                onClick={() => updateStatus({ id: order._id, status: next })}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Mark as {next}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">This order is complete. No further updates.</p>
        )}
      </div>
    </div>
  );
}

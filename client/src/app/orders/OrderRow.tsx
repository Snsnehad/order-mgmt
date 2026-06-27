"use client";

import Link from "next/link";
import { Order, OrderStatus, ALLOWED_STATUS_TRANSITIONS } from "@/types/order";
import StatusBadge from "@/components/StatusBadge";
import { useUpdateOrderStatus } from "@/hooks/useOrders";

interface Props {
  order: Order;
}

export default function OrderRow({ order }: Props) {
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();
  const nextOptions = ALLOWED_STATUS_TRANSITIONS[order.status];

  const handleAdvance = (status: OrderStatus) => {
    updateStatus({ id: order._id, status });
  };

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-3 text-sm font-mono">
        <Link href={`/orders/${order._id}`} className="text-brand-600 hover:underline">
          {order._id.slice(-6)}
        </Link>
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">
        {order.items.map((it) => `${it.name} x${it.qty}`).join(", ")}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-slate-900">
        ₹{order.total_amount.toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-4 py-3 text-sm text-slate-500">
        {new Date(order.created_at).toLocaleString()}
      </td>
      <td className="px-4 py-3">
        {nextOptions.length > 0 ? (
          <div className="flex gap-2">
            {nextOptions.map((next) => (
              <button
                key={next}
                disabled={isPending}
                onClick={() => handleAdvance(next)}
                className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:border-brand-500 hover:text-brand-600 disabled:opacity-50"
              >
                Mark {next}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
    </tr>
  );
}

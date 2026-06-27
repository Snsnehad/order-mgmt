import { OrderStatus } from "@/types/order";

const STYLES: Record<OrderStatus, string> = {
  PLACED: "bg-amber-100 text-amber-800 border-amber-200",
  PREPARING: "bg-blue-100 text-blue-800 border-blue-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}

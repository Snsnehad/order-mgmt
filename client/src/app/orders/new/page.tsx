"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateOrder } from "@/hooks/useOrders";
import { OrderItem } from "@/types/order";

const emptyItem = (): OrderItem => ({ item_id: "", name: "", qty: 1, price: 0 });

export default function NewOrderPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState("");
  const [items, setItems] = useState<OrderItem[]>([emptyItem()]);
  const { mutate: createOrder, isPending } = useCreateOrder();

  const updateItem = (index: number, patch: Partial<OrderItem>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const total = items.reduce((sum, it) => sum + (it.qty || 0) * (it.price || 0), 0);

  const isValid =
    storeId.trim().length > 0 &&
    items.length > 0 &&
    items.every((it) => it.item_id.trim() && it.name.trim() && it.qty > 0 && it.price >= 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    createOrder(
      { store_id: storeId.trim(), items },
      {
        onSuccess: () => router.push(`/orders?store_id=${encodeURIComponent(storeId.trim())}`),
      }
    );
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Create Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Store ID</label>
          <input
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            placeholder="e.g. store-01"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Items</label>
            <button
              type="button"
              onClick={addItem}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              + Add item
            </button>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 rounded-lg border border-slate-200 bg-white p-3"
            >
              <input
                placeholder="Item ID"
                value={item.item_id}
                onChange={(e) => updateItem(index, { item_id: e.target.value })}
                className="col-span-3 rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
              <input
                placeholder="Name"
                value={item.name}
                onChange={(e) => updateItem(index, { name: e.target.value })}
                className="col-span-4 rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
              <input
                type="number"
                min={1}
                placeholder="Qty"
                value={item.qty}
                onChange={(e) => updateItem(index, { qty: Number(e.target.value) })}
                className="col-span-2 rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Price"
                value={item.price}
                onChange={(e) => updateItem(index, { price: Number(e.target.value) })}
                className="col-span-2 rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="col-span-1 rounded text-slate-400 hover:text-red-500 disabled:opacity-30"
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3">
          <span className="text-sm font-medium text-slate-600">Total</span>
          <span className="text-lg font-semibold text-slate-900">₹{total.toFixed(2)}</span>
        </div>

        <button
          type="submit"
          disabled={!isValid || isPending}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}

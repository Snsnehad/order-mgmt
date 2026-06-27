import { Order } from "../models/order.model";

export interface OrdersPerDay {
  date: string;
  order_count: number;
}

export interface RevenuePerStore {
  store_id: string;
  total_revenue: number;
  order_count: number;
}

export interface TopSellingItem {
  item_id: string;
  name: string;
  total_qty_sold: number;
  total_revenue: number;
}

interface DateRangeFilter {
  store_id?: string;
  from?: Date;
  to?: Date;
}

const buildMatchStage = (filter: DateRangeFilter) => {
  const match: Record<string, unknown> = {};
  if (filter.store_id) match.store_id = filter.store_id;
  if (filter.from || filter.to) {
    const created_at: Record<string, Date> = {};
    if (filter.from) created_at.$gte = filter.from;
    if (filter.to) created_at.$lte = filter.to;
    match.created_at = created_at;
  }
  return match;
};

export const getOrdersPerDay = async (filter: DateRangeFilter = {}): Promise<OrdersPerDay[]> => {
  const match = buildMatchStage(filter);

  const pipeline = [
    ...(Object.keys(match).length ? [{ $match: match }] : []),
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
        order_count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 as const } },
    { $project: { _id: 0, date: "$_id", order_count: 1 } },
  ];

  return Order.aggregate<OrdersPerDay>(pipeline);
};

export const getRevenuePerStore = async (
  filter: DateRangeFilter = {}
): Promise<RevenuePerStore[]> => {
  const match = buildMatchStage(filter);

  const pipeline = [
    ...(Object.keys(match).length ? [{ $match: match }] : []),
    {
      $group: {
        _id: "$store_id",
        total_revenue: { $sum: "$total_amount" },
        order_count: { $sum: 1 },
      },
    },
    { $sort: { total_revenue: -1 as const } },
    { $project: { _id: 0, store_id: "$_id", total_revenue: 1, order_count: 1 } },
  ];

  return Order.aggregate<RevenuePerStore>(pipeline);
};

export const getTopSellingItems = async (
  filter: DateRangeFilter = {},
  limit = 5
): Promise<TopSellingItem[]> => {
  const match = buildMatchStage(filter);

  const pipeline = [
    ...(Object.keys(match).length ? [{ $match: match }] : []),
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.item_id",
        name: { $first: "$items.name" },
        total_qty_sold: { $sum: "$items.qty" },
        total_revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
      },
    },
    { $sort: { total_qty_sold: -1 as const } },
    { $limit: limit },
    { $project: { _id: 0, item_id: "$_id", name: 1, total_qty_sold: 1, total_revenue: 1 } },
  ];

  return Order.aggregate<TopSellingItem>(pipeline);
};

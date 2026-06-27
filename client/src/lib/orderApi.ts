import { apiClient } from "./apiClient";
import { ApiSuccess, Order, OrderItem, OrderStatus, PaginationMeta } from "@/types/order";

export interface CreateOrderPayload {
  store_id: string;
  items: OrderItem[];
}

export interface ListOrdersParams {
  store_id: string;
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const res = await apiClient.post<ApiSuccess<Order>>("/orders", payload);
  return res.data.data;
};

export const listOrders = async (
  params: ListOrdersParams
): Promise<{ orders: Order[]; meta: PaginationMeta }> => {
  const res = await apiClient.get<ApiSuccess<Order[]>>("/orders", { params });
  return { orders: res.data.data, meta: res.data.meta as PaginationMeta };
};

export const getOrder = async (id: string): Promise<Order> => {
  const res = await apiClient.get<ApiSuccess<Order>>(`/orders/${id}`);
  return res.data.data;
};

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

export const getOrdersPerDay = async (store_id?: string): Promise<OrdersPerDay[]> => {
  const res = await apiClient.get<ApiSuccess<OrdersPerDay[]>>("/analytics/orders-per-day", {
    params: store_id ? { store_id } : undefined,
  });
  return res.data.data;
};

export const getRevenuePerStore = async (): Promise<RevenuePerStore[]> => {
  const res = await apiClient.get<ApiSuccess<RevenuePerStore[]>>("/analytics/revenue-per-store");
  return res.data.data;
};

export const getTopSellingItems = async (store_id?: string): Promise<TopSellingItem[]> => {
  const res = await apiClient.get<ApiSuccess<TopSellingItem[]>>("/analytics/top-items", {
    params: store_id ? { store_id, limit: 5 } : { limit: 5 },
  });
  return res.data.data;
};

export const archiveOldOrders = async (): Promise<{ archived_count: number; cutoff_date: string }> => {
  const res = await apiClient.post<ApiSuccess<{ archived_count: number; cutoff_date: string }>>(
    "/archive-old-orders"
  );
  return res.data.data;
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  const res = await apiClient.patch<ApiSuccess<Order>>(`/orders/${id}/status`, { status });
  return res.data.data;
};

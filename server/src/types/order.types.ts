export type OrderStatus = "PLACED" | "PREPARING" | "COMPLETED";

export const ORDER_STATUSES: OrderStatus[] = ["PLACED", "PREPARING", "COMPLETED"];

export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ["PREPARING"],
  PREPARING: ["COMPLETED"],
  COMPLETED: [],
};

export interface OrderItem {
  item_id: string;
  name: string;
  qty: number;
  price: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

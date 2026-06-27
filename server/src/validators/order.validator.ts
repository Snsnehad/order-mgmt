import { z } from "zod";
import { OrderStatus, ORDER_STATUSES } from "../types/order.types";

const statusTuple = ORDER_STATUSES as unknown as [OrderStatus, ...OrderStatus[]];

export const orderItemSchema = z.object({
  item_id: z.string().min(1, "item_id is required"),
  name: z.string().min(1, "name is required"),
  qty: z.number().int().positive("qty must be a positive integer"),
  price: z.number().nonnegative("price cannot be negative"),
});

export const createOrderSchema = z.object({
  store_id: z.string().min(1, "store_id is required"),
  items: z.array(orderItemSchema).min(1, "at least one item is required"),
});

export const updateStatusSchema = z.object({
  status: z.enum(statusTuple, {
    errorMap: () => ({ message: `status must be one of ${ORDER_STATUSES.join(", ")}` }),
  }),
});

export const listOrdersQuerySchema = z.object({
  store_id: z.string().min(1, "store_id is required"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(statusTuple).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;

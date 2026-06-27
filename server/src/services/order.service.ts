import { Order, OrderDoc } from "../models/order.model";
import { AppError } from "../utils/AppError";
import { ALLOWED_STATUS_TRANSITIONS, OrderStatus, PaginationMeta } from "../types/order.types";
import { CreateOrderInput, ListOrdersQuery } from "../validators/order.validator";

export const createOrder = async (input: CreateOrderInput): Promise<OrderDoc> => {
  const total_amount = input.items.reduce((sum, item) => sum + item.qty * item.price, 0);

  const order = await Order.create({
    store_id: input.store_id,
    items: input.items,
    total_amount,
    status: "PLACED",
  });

  return order;
};

export const listOrdersByStore = async (
  query: ListOrdersQuery
): Promise<{ orders: OrderDoc[]; meta: PaginationMeta }> => {
  const { store_id, page, limit, status } = query;

  const filter: Record<string, unknown> = { store_id };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  const meta: PaginationMeta = {
    page,
    limit,
    total,
    total_pages: Math.max(1, Math.ceil(total / limit)),
  };

  return { orders: orders as unknown as OrderDoc[], meta };
};

export const getOrderById = async (id: string): Promise<OrderDoc> => {
  const order = await Order.findById(id);
  if (!order) throw AppError.notFound(`Order ${id} not found`);
  return order;
};

export const updateOrderStatus = async (
  id: string,
  nextStatus: OrderStatus
): Promise<OrderDoc> => {
  const order = await Order.findById(id);
  if (!order) throw AppError.notFound(`Order ${id} not found`);

  const allowedNext = ALLOWED_STATUS_TRANSITIONS[order.status];
  if (!allowedNext.includes(nextStatus)) {
    throw AppError.conflict(
      `Cannot transition order from ${order.status} to ${nextStatus}. Allowed: [${allowedNext.join(", ") || "none"}]`
    );
  }

  order.status = nextStatus;
  await order.save();
  return order;
};

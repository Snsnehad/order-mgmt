import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as orderService from "../services/order.service";
import { emitToStore } from "../config/socket";
import { CreateOrderInput, ListOrdersQuery, UpdateStatusInput } from "../validators/order.validator";

export const createOrderHandler = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateOrderInput;
  const order = await orderService.createOrder(input);

  emitToStore(order.store_id, "order:created", order);

  res.status(201).json({ success: true, data: order });
});

export const listOrdersHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListOrdersQuery;
  const { orders, meta } = await orderService.listOrdersByStore(query);

  res.status(200).json({ success: true, data: orders, meta });
});

export const getOrderHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await orderService.getOrderById(id);
  res.status(200).json({ success: true, data: order });
});

export const updateOrderStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as UpdateStatusInput;

  const order = await orderService.updateOrderStatus(id, status);

  emitToStore(order.store_id, "order:status_updated", order);

  res.status(200).json({ success: true, data: order });
});

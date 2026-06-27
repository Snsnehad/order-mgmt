"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  CreateOrderPayload,
  ListOrdersParams,
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
} from "@/lib/orderApi";
import { OrderStatus } from "@/types/order";
import { getErrorMessage } from "@/lib/apiClient";

export const orderKeys = {
  all: ["orders"] as const,
  list: (params: ListOrdersParams) => ["orders", "list", params] as const,
  detail: (id: string) => ["orders", "detail", id] as const,
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrder(id),
    enabled: Boolean(id),
  });
};

export const useOrders = (params: ListOrdersParams) => {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => listOrders(params),
    enabled: Boolean(params.store_id),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      toast.success("Order created");
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: (order) => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(order._id) });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

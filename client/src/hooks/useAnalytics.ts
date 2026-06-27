"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  archiveOldOrders,
  getOrdersPerDay,
  getRevenuePerStore,
  getTopSellingItems,
} from "@/lib/orderApi";
import { getErrorMessage } from "@/lib/apiClient";
import { orderKeys } from "./useOrders";

export const analyticsKeys = {
  ordersPerDay: (storeId?: string) => ["analytics", "orders-per-day", storeId] as const,
  revenuePerStore: ["analytics", "revenue-per-store"] as const,
  topItems: (storeId?: string) => ["analytics", "top-items", storeId] as const,
};

export const useOrdersPerDay = (storeId?: string) =>
  useQuery({
    queryKey: analyticsKeys.ordersPerDay(storeId),
    queryFn: () => getOrdersPerDay(storeId),
  });

export const useRevenuePerStore = () =>
  useQuery({
    queryKey: analyticsKeys.revenuePerStore,
    queryFn: () => getRevenuePerStore(),
  });

export const useTopSellingItems = (storeId?: string) =>
  useQuery({
    queryKey: analyticsKeys.topItems(storeId),
    queryFn: () => getTopSellingItems(storeId),
  });

export const useArchiveOldOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveOldOrders,
    onSuccess: (result) => {
      toast.success(`Archived ${result.archived_count} order(s)`);
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getSocket } from "@/lib/socket";
import { Order } from "@/types/order";
import { orderKeys } from "./useOrders";

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

export const useOrderSocket = (storeId: string) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const currentStoreRef = useRef<string | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const socket = getSocket();

    const joinStore = (id: string) => {
      socket.emit("join_store", id);
      currentStoreRef.current = id;
    };

    const handleConnect = () => {
      setStatus("connected");
      // (Re)join on every connect — covers both the first connection and
      // any reconnect after a dropped connection, where rooms are not preserved.
      joinStore(storeId);
    };

    const handleDisconnect = () => setStatus("disconnected");
    const handleReconnectAttempt = () => setStatus("reconnecting");

    const handleOrderCreated = (order: Order) => {
      toast.success(`New order #${order._id.slice(-6)} placed`);
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    };

    const handleStatusUpdated = (order: Order) => {
      toast(`Order #${order._id.slice(-6)} → ${order.status}`, { icon: "🔄" });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(order._id) });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.on("order:created", handleOrderCreated);
    socket.on("order:status_updated", handleStatusUpdated);

    if (!socket.connected) {
      socket.connect();
    } else {
      // Already connected (e.g. navigated from another store's page) —
      // leave the old room before joining the new one.
      if (currentStoreRef.current && currentStoreRef.current !== storeId) {
        socket.emit("leave_store", currentStoreRef.current);
      }
      joinStore(storeId);
      setStatus("connected");
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.off("order:created", handleOrderCreated);
      socket.off("order:status_updated", handleStatusUpdated);

      if (currentStoreRef.current) {
        socket.emit("leave_store", currentStoreRef.current);
        currentStoreRef.current = null;
      }
    };
  }, [storeId, queryClient]);

  return { status };
};

import { ConnectionStatus } from "@/hooks/useOrderSocket";

const CONFIG: Record<ConnectionStatus, { label: string; dot: string; text: string }> = {
  connected: { label: "Live", dot: "bg-emerald-500", text: "text-emerald-700" },
  connecting: { label: "Connecting…", dot: "bg-amber-400 animate-pulse", text: "text-amber-700" },
  reconnecting: {
    label: "Reconnecting…",
    dot: "bg-amber-400 animate-pulse",
    text: "text-amber-700",
  },
  disconnected: { label: "Offline", dot: "bg-red-500", text: "text-red-700" },
};

export default function LiveStatusIndicator({ status }: { status: ConnectionStatus }) {
  const cfg = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}>
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

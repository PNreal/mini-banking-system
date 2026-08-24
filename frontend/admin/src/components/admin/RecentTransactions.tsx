import { ArrowUpRight, ArrowDownLeft, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TransactionItem } from "@/lib/api";

type Props = {
  transactions?: TransactionItem[];
};

// Mock data for when no real data is available
const mockTransactions = [
  {
    transactionId: "TXN001",
    type: "DEPOSIT" as const,
    amount: 5000000,
    status: "SUCCESS" as const,
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    transactionId: "TXN002",
    type: "TRANSFER" as const,
    amount: 2500000,
    status: "PENDING" as const,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    transactionId: "TXN003",
    type: "WITHDRAW" as const,
    amount: 1000000,
    status: "SUCCESS" as const,
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
  },
];

const typeConfig = {
  DEPOSIT: {
    icon: ArrowDownLeft,
    label: "Nạp tiền",
    color: "text-success",
    bg: "bg-success/10",
  },
  COUNTER_DEPOSIT: {
    icon: Building2,
    label: "Nạp tại quầy",
    color: "text-success",
    bg: "bg-success/10",
  },
  WITHDRAW: {
    icon: ArrowUpRight,
    label: "Rút tiền",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  TRANSFER: {
    icon: Building2,
    label: "Chuyển khoản",
    color: "text-info",
    bg: "bg-info/10",
  },
};

const statusConfig = {
  SUCCESS: { label: "Hoàn thành", variant: "default" as const },
  PENDING: { label: "Đang xử lý", variant: "secondary" as const },
  FAILED: { label: "Thất bại", variant: "destructive" as const },
  CANCELLED: { label: "Đã hủy", variant: "outline" as const },
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
}

export function RecentTransactions({ transactions }: Props) {
  const displayTransactions = transactions && transactions.length > 0
    ? transactions.slice(0, 5)
    : mockTransactions;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Giao dịch gần đây
        </h3>
        <a href="/admin/transactions" className="text-sm font-medium text-primary hover:underline">
          Xem tất cả
        </a>
      </div>

      <div className="space-y-4">
        {displayTransactions.map((tx, index) => {
          const config = typeConfig[tx.type as keyof typeof typeConfig] || typeConfig.DEPOSIT;
          const status = statusConfig[tx.status as keyof typeof statusConfig] || statusConfig.PENDING;
          const Icon = config.icon;

          return (
            <div
              key={tx.transactionId}
              className="flex items-center justify-between animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    config.bg
                  )}
                >
                  <Icon className={cn("h-5 w-5", config.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {tx.transactionCode || tx.transactionId.slice(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {config.label} • {formatTimeAgo(tx.timestamp)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    tx.type === "WITHDRAW" ? "text-destructive" : "text-success"
                  )}
                >
                  {tx.type === "WITHDRAW" ? "-" : "+"}
                  {tx.amount.toLocaleString("vi-VN")}đ
                </p>
                <Badge variant={status.variant} className="text-xs">
                  {status.label}
                </Badge>
              </div>
            </div>
          );
        })}

        {displayTransactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Chưa có giao dịch nào
          </div>
        )}
      </div>
    </div>
  );
}

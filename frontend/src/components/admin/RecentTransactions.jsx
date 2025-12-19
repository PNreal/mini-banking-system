import { ArrowUpRight, ArrowDownLeft, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const typeConfig = {
  deposit: {
    icon: ArrowDownLeft,
    label: "Nạp tiền",
    color: "text-success",
    bg: "bg-success/10",
  },
  withdraw: {
    icon: ArrowUpRight,
    label: "Rút tiền",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  transfer: {
    icon: Building2,
    label: "Chuyển khoản",
    color: "text-info",
    bg: "bg-info/10",
  },
};

const statusConfig = {
  completed: { label: "Hoàn thành", variant: "default" },
  pending: { label: "Đang xử lý", variant: "secondary" },
  failed: { label: "Thất bại", variant: "destructive" },
};

export function RecentTransactions({ transactions = [] }) {
  // Demo data nếu không có transactions
  const demoTransactions = [
    {
      id: "TXN001",
      type: "deposit",
      amount: 5000000,
      user: "Nguyễn Văn A",
      status: "completed",
      time: "2 phút trước",
    },
    {
      id: "TXN002",
      type: "transfer",
      amount: 2500000,
      user: "Trần Thị B",
      status: "pending",
      time: "15 phút trước",
    },
    {
      id: "TXN003",
      type: "withdraw",
      amount: 1000000,
      user: "Lê Văn C",
      status: "completed",
      time: "32 phút trước",
    },
    {
      id: "TXN004",
      type: "deposit",
      amount: 10000000,
      user: "Phạm Thị D",
      status: "completed",
      time: "1 giờ trước",
    },
    {
      id: "TXN005",
      type: "transfer",
      amount: 500000,
      user: "Hoàng Văn E",
      status: "failed",
      time: "2 giờ trước",
    },
  ];

  const displayTransactions = transactions.length > 0 ? transactions : demoTransactions;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Giao dịch gần đây
        </h3>
        <button className="text-sm font-medium text-primary hover:underline">
          Xem tất cả
        </button>
      </div>

      <div className="space-y-4">
        {displayTransactions.map((tx, index) => {
          const config = typeConfig[tx.type];
          const status = statusConfig[tx.status];
          const Icon = config.icon;

          return (
            <div
              key={tx.id}
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
                    {tx.user}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {config.label} • {tx.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    tx.type === "withdraw" ? "text-destructive" : "text-success"
                  )}
                >
                  {tx.type === "withdraw" ? "-" : "+"}
                  {tx.amount.toLocaleString("vi-VN")}đ
                </p>
                <Badge variant={status.variant} className="text-xs">
                  {status.label}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


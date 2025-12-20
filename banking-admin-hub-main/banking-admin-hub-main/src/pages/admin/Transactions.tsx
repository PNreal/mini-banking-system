import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Download,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "transfer";
  amount: number;
  fromUser: string;
  toUser?: string;
  status: "completed" | "pending" | "failed";
  method: string;
  createdAt: string;
}

const transactions: Transaction[] = [
  {
    id: "TXN20241219001",
    type: "deposit",
    amount: 5000000,
    fromUser: "Nguyễn Văn An",
    status: "completed",
    method: "Nạp tại quầy",
    createdAt: "2024-12-19T10:30:00",
  },
  {
    id: "TXN20241219002",
    type: "transfer",
    amount: 2500000,
    fromUser: "Trần Thị Bình",
    toUser: "Lê Văn Cường",
    status: "pending",
    method: "Chuyển khoản nội bộ",
    createdAt: "2024-12-19T09:45:00",
  },
  {
    id: "TXN20241219003",
    type: "withdraw",
    amount: 1000000,
    fromUser: "Phạm Thị Dung",
    status: "completed",
    method: "Rút tại quầy",
    createdAt: "2024-12-19T09:15:00",
  },
  {
    id: "TXN20241218004",
    type: "deposit",
    amount: 10000000,
    fromUser: "Hoàng Văn Em",
    status: "completed",
    method: "Ví điện tử",
    createdAt: "2024-12-18T16:20:00",
  },
  {
    id: "TXN20241218005",
    type: "transfer",
    amount: 500000,
    fromUser: "Nguyễn Văn An",
    toUser: "Trần Thị Bình",
    status: "failed",
    method: "Chuyển khoản nội bộ",
    createdAt: "2024-12-18T14:00:00",
  },
  {
    id: "TXN20241218006",
    type: "deposit",
    amount: 3000000,
    fromUser: "Lê Văn Cường",
    status: "completed",
    method: "Quét QR",
    createdAt: "2024-12-18T11:30:00",
  },
];

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
    icon: ArrowLeftRight,
    label: "Chuyển khoản",
    color: "text-info",
    bg: "bg-info/10",
  },
};

const statusConfig = {
  completed: {
    label: "Hoàn thành",
    className: "bg-success/10 text-success border-success/20",
  },
  pending: {
    label: "Đang xử lý",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  failed: {
    label: "Thất bại",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.fromUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.toUser?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Quản lý giao dịch"
        subtitle="Theo dõi và quản lý các giao dịch"
      />

      <main className="p-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm theo mã GD, người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Loại giao dịch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="deposit">Nạp tiền</SelectItem>
                <SelectItem value="withdraw">Rút tiền</SelectItem>
                <SelectItem value="transfer">Chuyển khoản</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="pending">Đang xử lý</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Mã giao dịch</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Người gửi</TableHead>
                <TableHead>Người nhận</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx, index) => {
                const type = typeConfig[tx.type];
                const status = statusConfig[tx.status];
                const Icon = type.icon;

                return (
                  <TableRow
                    key={tx.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono text-sm">
                      {tx.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg",
                            type.bg
                          )}
                        >
                          <Icon className={cn("h-4 w-4", type.color)} />
                        </div>
                        <span className="text-sm">{type.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{tx.fromUser}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {tx.toUser || "-"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold",
                        tx.type === "withdraw"
                          ? "text-destructive"
                          : "text-success"
                      )}
                    >
                      {tx.type === "withdraw" ? "-" : "+"}
                      {tx.amount.toLocaleString("vi-VN")}đ
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tx.method}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("border", status.className)}
                      >
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect } from "react";
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
  RefreshCw,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthContext";
import { getAdminTransactions, TransactionItem } from "@/lib/api";

const typeConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  DEPOSIT: {
    icon: ArrowDownLeft,
    label: "Nạp tiền",
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
    icon: ArrowLeftRight,
    label: "Chuyển khoản",
    color: "text-info",
    bg: "bg-info/10",
  },
  COUNTER_DEPOSIT: {
    icon: Building2,
    label: "Nạp tại quầy",
    color: "text-primary",
    bg: "bg-primary/10",
  },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  SUCCESS: {
    label: "Hoàn thành",
    className: "bg-success/10 text-success border-success/20",
  },
  PENDING: {
    label: "Đang xử lý",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  FAILED: {
    label: "Thất bại",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-muted text-muted-foreground border-muted",
  },
};

export default function Transactions() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchTransactions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params: any = { page, size: 20 };
      if (typeFilter !== "all") params.type = typeFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await getAdminTransactions(token, params);
      setTransactions(response.data.items || []);
      setTotal(response.data.total || 0);
      setTotalPages(Math.ceil((response.data.total || 0) / 20));
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token, page, typeFilter, statusFilter]);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.transactionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.fromAccountId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.toAccountId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatAccountId = (id: string | null) => {
    if (!id) return "-";
    return id.substring(0, 8) + "...";
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Quản lý giao dịch"
        subtitle="Theo dõi và quản lý các giao dịch"
      />

      <main className="p-8">
        {/* Stats */}
        <div className="mb-6 flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            Tổng: {total} giao dịch
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Làm mới
          </Button>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm theo mã GD, tài khoản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Loại giao dịch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="DEPOSIT">Nạp tiền</SelectItem>
                <SelectItem value="WITHDRAW">Rút tiền</SelectItem>
                <SelectItem value="TRANSFER">Chuyển khoản</SelectItem>
                <SelectItem value="COUNTER_DEPOSIT">Nạp tại quầy</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="SUCCESS">Hoàn thành</SelectItem>
                <SelectItem value="PENDING">Đang xử lý</SelectItem>
                <SelectItem value="FAILED">Thất bại</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
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
                <TableHead>Từ tài khoản</TableHead>
                <TableHead>Đến tài khoản</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Không có giao dịch nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx, index) => {
                  const type = typeConfig[tx.type] || typeConfig.DEPOSIT;
                  const status = statusConfig[tx.status] || statusConfig.PENDING;
                  const Icon = type.icon;

                  return (
                    <TableRow
                      key={tx.transactionId}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell className="font-mono text-sm">
                        {tx.transactionCode || tx.transactionId?.substring(0, 8)}
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
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {formatAccountId(tx.fromAccountId)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {formatAccountId(tx.toAccountId)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-semibold",
                          tx.type === "WITHDRAW"
                            ? "text-destructive"
                            : "text-success"
                        )}
                      >
                        {tx.type === "WITHDRAW" ? "-" : "+"}
                        {tx.amount?.toLocaleString("vi-VN")}đ
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
                        {new Date(tx.timestamp).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Trước
            </Button>
            <span className="text-sm text-muted-foreground">
              Trang {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Sau
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

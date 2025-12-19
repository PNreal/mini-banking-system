import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Eye } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function Transactions() {
  const { user, onLogout } = useOutletContext() || {};
  const [searchTerm, setSearchTerm] = useState("");
  
  const transactions = [
    {
      id: "TXN001",
      type: "deposit",
      amount: 5000000,
      fromUser: "Nguyễn Văn A",
      status: "completed",
      method: "Nạp tại quầy",
      createdAt: "2024-12-19T10:30:00",
    },
    {
      id: "TXN002",
      type: "transfer",
      amount: 2500000,
      fromUser: "Trần Thị B",
      toUser: "Lê Văn C",
      status: "completed",
      method: "Chuyển khoản online",
      createdAt: "2024-12-19T09:15:00",
    },
  ];

  const filteredTransactions = transactions.filter(
    (t) =>
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fromUser.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusConfig = {
    completed: { label: "Hoàn thành", variant: "default" },
    pending: { label: "Đang xử lý", variant: "secondary" },
    failed: { label: "Thất bại", variant: "destructive" },
  };

  const typeConfig = {
    deposit: "Nạp tiền",
    withdraw: "Rút tiền",
    transfer: "Chuyển khoản",
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Giao dịch"
        subtitle="Xem và quản lý giao dịch"
        user={user}
        onLogout={onLogout}
      />
      <main className="p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã GD</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Người gửi</TableHead>
                <TableHead>Người nhận</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => {
                const status = statusConfig[tx.status];
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-sm">{tx.id}</TableCell>
                    <TableCell>{typeConfig[tx.type]}</TableCell>
                    <TableCell>{tx.fromUser}</TableCell>
                    <TableCell>{tx.toUser || "-"}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {tx.amount.toLocaleString("vi-VN")}đ
                    </TableCell>
                    <TableCell>{tx.method}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
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


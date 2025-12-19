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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreHorizontal,
  Lock,
  Unlock,
  Snowflake,
  Eye,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOutletContext } from "react-router-dom";

const statusConfig = {
  active: { label: "Hoạt động", className: "bg-success/10 text-success border-success/20" },
  locked: { label: "Bị khóa", className: "bg-destructive/10 text-destructive border-destructive/20" },
  frozen: { label: "Đóng băng", className: "bg-warning/10 text-warning border-warning/20" },
};

export default function Users() {
  const { user, onLogout } = useOutletContext() || {};
  const [searchTerm, setSearchTerm] = useState("");
  
  // Demo data - sẽ thay bằng API call thực tế
  const users = [
    {
      id: "USR001",
      name: "Nguyễn Văn An",
      email: "an.nguyen@email.com",
      phone: "0901234567",
      balance: 15000000,
      status: "active",
      createdAt: "2024-01-15",
    },
    {
      id: "USR002",
      name: "Trần Thị Bình",
      email: "binh.tran@email.com",
      phone: "0912345678",
      balance: 8500000,
      status: "active",
      createdAt: "2024-02-20",
    },
    {
      id: "USR003",
      name: "Lê Văn Cường",
      email: "cuong.le@email.com",
      phone: "0923456789",
      balance: 2300000,
      status: "locked",
      createdAt: "2024-01-10",
    },
    {
      id: "USR004",
      name: "Phạm Thị Dung",
      email: "dung.pham@email.com",
      phone: "0934567890",
      balance: 45000000,
      status: "frozen",
      createdAt: "2023-12-05",
    },
    {
      id: "USR005",
      name: "Hoàng Văn Em",
      email: "em.hoang@email.com",
      phone: "0945678901",
      balance: 12800000,
      status: "active",
      createdAt: "2024-03-01",
    },
  ];

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Quản lý người dùng"
        subtitle="Quản lý và theo dõi tài khoản người dùng"
        user={user}
        onLogout={onLogout}
      />

      <main className="p-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm theo tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Bộ lọc
            </Button>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Mã</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead className="text-right">Số dư</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u, index) => {
                const status = statusConfig[u.status];
                return (
                  <TableRow
                    key={u.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {u.id}
                    </TableCell>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.phone}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {u.balance.toLocaleString("vi-VN")}đ
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("border", status.className)}
                      >
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {u.status === "locked" ? (
                            <DropdownMenuItem>
                              <Unlock className="mr-2 h-4 w-4" />
                              Mở khóa
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-destructive">
                              <Lock className="mr-2 h-4 w-4" />
                              Khóa tài khoản
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-warning">
                            <Snowflake className="mr-2 h-4 w-4" />
                            {u.status === "frozen"
                              ? "Mở đóng băng"
                              : "Đóng băng"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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


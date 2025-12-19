import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserPlus } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function Employees() {
  const { user, onLogout } = useOutletContext() || {};
  const [searchTerm, setSearchTerm] = useState("");
  
  const employees = [
    {
      id: "1",
      code: "EMP001",
      name: "Nguyễn Văn A",
      email: "a.nguyen@bank.com",
      phone: "0901234567",
      role: "staff",
      counter: "Q001",
      status: "active",
    },
    {
      id: "2",
      code: "EMP002",
      name: "Trần Thị B",
      email: "b.tran@bank.com",
      phone: "0912345678",
      role: "counter_admin",
      counter: "Q002",
      status: "active",
    },
  ];

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Quản lý nhân viên"
        subtitle="Quản lý tài khoản nhân viên"
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
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Thêm nhân viên
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Quầy</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-mono text-sm">{emp.code}</TableCell>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {emp.role === "staff" ? "Nhân viên" : "Quản lý quầy"}
                    </Badge>
                  </TableCell>
                  <TableCell>{emp.counter}</TableCell>
                  <TableCell>
                    <Badge variant={emp.status === "active" ? "default" : "secondary"}>
                      {emp.status === "active" ? "Hoạt động" : "Tạm ngưng"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}


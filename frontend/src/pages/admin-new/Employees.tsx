import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, MoreHorizontal, Edit, Trash2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  role: "staff" | "counter_admin";
  counter: string;
  status: "active" | "inactive";
}

const employees: Employee[] = [
  {
    id: "1",
    code: "NV001",
    name: "Nguyễn Văn Minh",
    email: "minh.nv@minibank.com",
    phone: "0901111222",
    role: "counter_admin",
    counter: "Quầy Trung tâm",
    status: "active",
  },
  {
    id: "2",
    code: "NV002",
    name: "Trần Thị Hoa",
    email: "hoa.tt@minibank.com",
    phone: "0902222333",
    role: "staff",
    counter: "Quầy Trung tâm",
    status: "active",
  },
  {
    id: "3",
    code: "NV003",
    name: "Lê Văn Hùng",
    email: "hung.lv@minibank.com",
    phone: "0903333444",
    role: "staff",
    counter: "Quầy Thủ Đức",
    status: "active",
  },
  {
    id: "4",
    code: "NV004",
    name: "Phạm Thị Lan",
    email: "lan.pt@minibank.com",
    phone: "0904444555",
    role: "counter_admin",
    counter: "Quầy Bình Thạnh",
    status: "inactive",
  },
  {
    id: "5",
    code: "NV005",
    name: "Hoàng Văn Nam",
    email: "nam.hv@minibank.com",
    phone: "0905555666",
    role: "staff",
    counter: "Quầy Quận 7",
    status: "active",
  },
];

const roleConfig = {
  staff: { label: "Nhân viên", className: "bg-info/10 text-info border-info/20" },
  counter_admin: { label: "Admin quầy", className: "bg-primary/10 text-primary border-primary/20" },
};

const statusConfig = {
  active: { label: "Hoạt động", className: "bg-success/10 text-success" },
  inactive: { label: "Nghỉ việc", className: "bg-muted text-muted-foreground" },
};

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.counter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Quản lý nhân viên"
        subtitle="Thêm, sửa, xóa thông tin nhân viên"
      />

      <main className="p-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm theo tên, mã NV, quầy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Thêm nhân viên
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm nhân viên mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin cho nhân viên mới
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="emp-code">Mã nhân viên</Label>
                    <Input id="emp-code" placeholder="VD: NV006" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="emp-role">Vai trò</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Nhân viên</SelectItem>
                        <SelectItem value="counter_admin">Admin quầy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emp-name">Họ tên</Label>
                  <Input id="emp-name" placeholder="Nhập họ tên nhân viên" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emp-email">Email</Label>
                  <Input id="emp-email" type="email" placeholder="email@minibank.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emp-phone">Số điện thoại</Label>
                  <Input id="emp-phone" placeholder="0901234567" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emp-counter">Quầy giao dịch</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn quầy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="q001">Quầy Trung tâm</SelectItem>
                      <SelectItem value="q002">Quầy Thủ Đức</SelectItem>
                      <SelectItem value="q003">Quầy Bình Thạnh</SelectItem>
                      <SelectItem value="q004">Quầy Quận 7</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  Thêm nhân viên
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nhân viên</TableHead>
                <TableHead>Mã NV</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Quầy</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp, index) => {
                const role = roleConfig[emp.role];
                const status = statusConfig[emp.status];
                const initials = emp.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(-2)
                  .join("");

                return (
                  <TableRow
                    key={emp.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{emp.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {emp.code}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{emp.email}</p>
                        <p className="text-xs text-muted-foreground">{emp.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("border", role.className)}
                      >
                        {role.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {emp.counter}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.className}>{status.label}</Badge>
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
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
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

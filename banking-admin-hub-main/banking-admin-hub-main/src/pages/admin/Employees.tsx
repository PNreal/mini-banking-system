import { useState, useEffect } from "react";
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
import { getAdminUsers } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";

interface Employee {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  role: "staff" | "counter_admin" | "admin" | "custom";
  counter: string;
  status: "active" | "inactive";
}

const roleConfig = {
  staff: { label: "Nhân viên", className: "bg-info/10 text-info border-info/20" },
  counter_admin: { label: "Admin quầy", className: "bg-primary/10 text-primary border-primary/20" },
  admin: { label: "Admin", className: "bg-destructive/10 text-destructive border-destructive/20" },
  custom: { label: "Custom", className: "bg-warning/10 text-warning border-warning/20" },
};

const statusConfig = {
  active: { label: "Hoạt động", className: "bg-success/10 text-success" },
  inactive: { label: "Nghỉ việc", className: "bg-muted text-muted-foreground" },
};

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [counters, setCounters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    role: "staff",
    counter: "",
  });
  const { token } = useAuth();

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const response = await getAdminUsers(token);
        
        // Chỉ lấy users có vai trò nhân viên (không phải CUSTOMER)
        const staffUsers = (response.data || []).filter((user: any) => 
          user.role && user.role !== "CUSTOMER"
        );
        
        // Map dữ liệu từ API sang format Employee
        const mappedEmployees: Employee[] = staffUsers.map((user: any) => ({
          id: user.userId || user.id,
          code: user.employeeCode || user.userCode || "N/A",
          name: user.fullName || user.username || "Unknown",
          email: user.email || "",
          phone: user.phoneNumber || user.phone || "N/A",
          role: user.role?.toLowerCase() || "staff",
          counter: user.counterName || user.counter || "N/A",
          status: user.status === "ACTIVE" || user.isActive ? "active" : "inactive",
        }));
        
        setEmployees(mappedEmployees);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCounters = async () => {
      if (!token) return;
      
      try {
        const { getCounters } = await import("@/lib/api");
        const response = await getCounters(token, "ADMIN");
        setCounters(response.data || []);
      } catch (error) {
        console.error("Error fetching counters:", error);
      }
    };

    fetchEmployees();
    fetchCounters();
  }, [token]);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.counter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      code: employee.code,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      counter: employee.counter,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (employee: Employee) => {
    if (!token) return;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa nhân viên "${employee.name}"?`)) {
      return;
    }

    try {
      const { deleteUser } = await import("@/lib/api");
      await deleteUser(token, employee.id);
      
      // Refresh danh sách
      setEmployees(employees.filter(emp => emp.id !== employee.id));
      alert("Xóa nhân viên thành công!");
    } catch (error: any) {
      alert(`Lỗi khi xóa nhân viên: ${error.message}`);
    }
  };

  const handleSaveEdit = async () => {
    if (!token || !selectedEmployee) return;

    try {
      const { updateUser } = await import("@/lib/api");
      await updateUser(token, selectedEmployee.id, {
        fullName: formData.name,
        role: formData.role.toUpperCase(),
        employeeCode: formData.code,
        email: formData.email,
        phoneNumber: formData.phone,
      });

      // Refresh danh sách
      const response = await getAdminUsers(token);
      const staffUsers = (response.data || []).filter((user: any) => 
        user.role && user.role !== "CUSTOMER"
      );
      const mappedEmployees: Employee[] = staffUsers.map((user: any) => ({
        id: user.userId || user.id,
        code: user.employeeCode || user.userCode || "N/A",
        name: user.fullName || user.username || "Unknown",
        email: user.email || "",
        phone: user.phoneNumber || user.phone || "N/A",
        role: user.role?.toLowerCase() || "staff",
        counter: user.counterName || user.counter || "N/A",
        status: user.status === "ACTIVE" || user.isActive ? "active" : "inactive",
      }));
      setEmployees(mappedEmployees);

      setIsEditDialogOpen(false);
      alert("Cập nhật nhân viên thành công!");
    } catch (error: any) {
      alert(`Lỗi khi cập nhật nhân viên: ${error.message}`);
    }
  };

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
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-muted-foreground">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy nhân viên nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp, index) => {
                  const role = roleConfig[emp.role] || roleConfig.staff;
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
                            <DropdownMenuItem onClick={() => handleEdit(emp)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(emp)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa nhân viên</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin nhân viên
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-emp-code">Mã nhân viên</Label>
                  <Input 
                    id="edit-emp-code" 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-emp-role">Vai trò</Label>
                  <Select 
                    value={formData.role}
                    onValueChange={(value) => setFormData({...formData, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Nhân viên</SelectItem>
                      <SelectItem value="counter_admin">Admin quầy</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="counter_staff">Counter Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-emp-name">Họ tên</Label>
                <Input 
                  id="edit-emp-name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-emp-email">Email</Label>
                <Input 
                  id="edit-emp-email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-emp-phone">Số điện thoại</Label>
                <Input 
                  id="edit-emp-phone" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-emp-counter">Quầy giao dịch</Label>
                <Select 
                  value={formData.counter}
                  onValueChange={(value) => setFormData({...formData, counter: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quầy" />
                  </SelectTrigger>
                  <SelectContent>
                    {counters.map((counter) => (
                      <SelectItem key={counter.counterId} value={counter.counterId}>
                        {counter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveEdit}>
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

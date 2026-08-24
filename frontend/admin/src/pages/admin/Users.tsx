import { useEffect, useState } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Filter,
  MoreHorizontal,
  Lock,
  Unlock,
  Snowflake,
  UserPlus,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getAdminUsers, 
  deleteUser, 
  lockUser, 
  unlockUser, 
  freezeUser, 
  unfreezeUser,
  getAccountByUserId 
} from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";
import { CreateUserDialog } from "@/components/admin/CreateUserDialog";
import { EditUserDialog } from "@/components/admin/EditUserDialog";

interface User {
  userId: string;
  fullName?: string | null;
  email?: string | null;
  status?: string | null;
  role?: string | null;
  citizenId?: string | null;
  accountNumber?: string | null;
  employeeCode?: string | null;
  createdAt?: string | null;
}

const statusConfig = {
  ACTIVE: { label: "Hoạt động", className: "bg-success/10 text-success border-success/20" },
  LOCKED: { label: "Bị khóa", className: "bg-destructive/10 text-destructive border-destructive/20" },
  FROZEN: { label: "Đóng băng", className: "bg-warning/10 text-warning border-warning/20" },
};

export default function Users() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = async () => {
    if (!token) {
      setError("Missing auth token. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await getAdminUsers(token);
      console.log("API Response:", res);
      const data = Array.isArray(res?.data) ? res.data : [];
      // Chỉ hiển thị users có vai trò CUSTOMER
      const customerUsers = data.filter((u: User) => u.role === "CUSTOMER");
      
      // Lấy STK cho mỗi customer
      const usersWithAccounts = await Promise.all(
        customerUsers.map(async (user: User) => {
          try {
            const account = await getAccountByUserId(user.userId);
            return {
              ...user,
              accountNumber: account?.accountNumber || null,
            };
          } catch {
            return { ...user, accountNumber: null };
          }
        })
      );
      
      console.log("Users data:", data);
      console.log("Total users:", data.length);
      console.log("Customer users:", usersWithAccounts.length);
      setUsers(usersWithAccounts);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !userToDelete) return;

    try {
      await deleteUser(token, userToDelete.userId);
      await fetchUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      setError(err?.message || "Failed to delete user");
    }
  };

  const handleStatusChange = async (userId: string, action: string) => {
    if (!token) return;

    try {
      switch (action) {
        case "lock":
          await lockUser(token, userId);
          break;
        case "unlock":
          await unlockUser(token, userId);
          break;
        case "freeze":
          await freezeUser(token, userId);
          break;
        case "unfreeze":
          await unfreezeUser(token, userId);
          break;
      }
      await fetchUsers();
    } catch (err: any) {
      setError(err?.message || "Failed to update user status");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.userId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.citizenId || "").includes(searchTerm) ||
      (user.employeeCode || "").includes(searchTerm)
  );

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Quản lý người dùng"
        subtitle="Quản lý và theo dõi tài khoản người dùng"
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
            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Button>
          </div>
        </div>

        {/* Table */}
        {error ? (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {loading ? (
          <div className="mb-4 text-sm text-muted-foreground">Loading users...</div>
        ) : (
          <div className="mb-4 text-sm text-muted-foreground">
            Tổng số: {filteredUsers.length} người dùng
          </div>
        )}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Mã</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>CCCD</TableHead>
                <TableHead>STK</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, index) => {
                const statusKey = (user.status || "").toUpperCase();
                const status =
                  statusConfig[statusKey as keyof typeof statusConfig] || {
                    label: user.status || "Unknown",
                    className: "bg-muted/50 text-muted-foreground border-border",
                  };
                return (
                  <TableRow
                    key={user.userId}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {user.userId?.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">{user.fullName || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border">
                        {user.role || "CUSTOMER"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.citizenId || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {user.accountNumber || "-"}
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
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          {statusKey === "LOCKED" ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(user.userId, "unlock")}>
                              <Unlock className="mr-2 h-4 w-4" />
                              Mở khóa
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleStatusChange(user.userId, "lock")}
                            >
                              <Lock className="mr-2 h-4 w-4" />
                              Khóa tài khoản
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-warning"
                            onClick={() => handleStatusChange(
                              user.userId, 
                              statusKey === "FROZEN" ? "unfreeze" : "freeze"
                            )}
                          >
                            <Snowflake className="mr-2 h-4 w-4" />
                            {statusKey === "FROZEN" ? "Mở đóng băng" : "Đóng băng"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteClick(user)}
                          >
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

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchUsers}
      />

      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchUsers}
        user={selectedUser}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete?.fullName}</strong> ({userToDelete?.email})?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

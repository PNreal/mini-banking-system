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
import { getAdminUsers } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";

interface User {
  userId: string;
  fullName?: string | null;
  email?: string | null;
  status?: string | null;
  citizenId?: string | null;
  employeeCode?: string | null;
  createdAt?: string | null;
}

const statusConfig = {
  active: { label: "Hoạt động", className: "bg-success/10 text-success border-success/20" },
  locked: { label: "Bị khóa", className: "bg-destructive/10 text-destructive border-destructive/20" },
  frozen: { label: "Đóng băng", className: "bg-warning/10 text-warning border-warning/20" },
};

export default function Users() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      setError("Missing auth token. Please log in again.");
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const fetchUsers = async () => {
      try {
        const res = await getAdminUsers(token);
        const data = Array.isArray(res?.data) ? res.data : [];
        if (isMounted) {
          setUsers(data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Failed to load users.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [token]);

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
            <Button size="sm">
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
        ) : null}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>M?</TableHead>
                <TableHead>H? t?n</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>CCCD</TableHead>
                <TableHead>M? nh?n vi?n</TableHead>
                <TableHead>Tr?ng th?i</TableHead>
                <TableHead>Ng?y t?o</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, index) => {
                const statusKey = (user.status || "").toLowerCase();
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
                      {user.userId}
                    </TableCell>
                    <TableCell className="font-medium">{user.fullName || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.citizenId || "-"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {user.balance.toLocaleString("vi-VN")}đ
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {statusKey === "locked" ? (
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
                            {statusKey === "frozen"
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

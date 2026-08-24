import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCog,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Wallet,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Quản lý người dùng", path: "/admin/users" },
  { icon: Building2, label: "Quản lý quầy", path: "/admin/counters" },
  { icon: UserCog, label: "Quản lý nhân viên", path: "/admin/employees" },
  { icon: FileCheck, label: "Quản lý KYC", path: "/admin/kyc" },
  { icon: Receipt, label: "Giao dịch", path: "/admin/transactions" },
  { icon: BarChart3, label: "Thống kê", path: "/admin/statistics" },
];

const bottomNavItems = [
  { icon: Settings, label: "Cài đặt", path: "/admin/settings" },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 gradient-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Wallet className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-sidebar-foreground">
              Mini Bank
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Menu chính
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="border-t border-sidebar-border p-3">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/admin/login", { replace: true });
            }}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive/80 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
}

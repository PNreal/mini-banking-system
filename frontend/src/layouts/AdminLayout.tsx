import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  user?: any;
  onLogout?: () => void;
}

export function AdminLayout({ user, onLogout }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar onLogout={onLogout} />
      <div className="pl-64">
        <Outlet context={{ user, onLogout }} />
      </div>
    </div>
  );
}

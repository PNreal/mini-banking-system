import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { RecentTransactions } from "@/components/admin/RecentTransactions";
import { UserStatusChart } from "@/components/admin/UserStatusChart";
import { TransactionChart } from "@/components/admin/TransactionChart";
import { Users, Wallet, ArrowRightLeft, Building2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function Dashboard() {
  const { user, onLogout } = useOutletContext() || {};
  
  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Dashboard"
        subtitle="Tổng quan hệ thống Mini Banking"
        user={user}
        onLogout={onLogout}
      />

      <main className="p-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="animate-slide-up" style={{ animationDelay: "0ms" }}>
            <StatCard
              title="Tổng người dùng"
              value="1,324"
              change={12.5}
              changeLabel="so với tuần trước"
              icon={Users}
              variant="primary"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <StatCard
              title="Tổng số dư"
              value="₫2.45B"
              change={8.2}
              changeLabel="so với tuần trước"
              icon={Wallet}
              variant="success"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <StatCard
              title="Giao dịch hôm nay"
              value="847"
              change={-3.1}
              changeLabel="so với hôm qua"
              icon={ArrowRightLeft}
              variant="info"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
            <StatCard
              title="Quầy hoạt động"
              value="12/15"
              icon={Building2}
              variant="warning"
            />
          </div>
        </div>

        {/* Charts Row */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <div
            className="lg:col-span-2 animate-slide-up"
            style={{ animationDelay: "400ms" }}
          >
            <TransactionChart />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "500ms" }}>
            <UserStatusChart />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="animate-slide-up" style={{ animationDelay: "600ms" }}>
          <RecentTransactions />
        </div>
      </main>
    </div>
  );
}


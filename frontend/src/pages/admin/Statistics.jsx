import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { TransactionChart } from "@/components/admin/TransactionChart";
import { UserStatusChart } from "@/components/admin/UserStatusChart";
import { TrendingUp, DollarSign, Users, Activity } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function Statistics() {
  const { user, onLogout } = useOutletContext() || {};
  
  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Thống kê"
        subtitle="Phân tích và báo cáo hệ thống"
        user={user}
        onLogout={onLogout}
      />
      <main className="p-8">
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Doanh thu tháng"
            value="₫45.2B"
            change={15.3}
            changeLabel="so với tháng trước"
            icon={DollarSign}
            variant="success"
          />
          <StatCard
            title="Người dùng mới"
            value="324"
            change={8.7}
            changeLabel="so với tháng trước"
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Giao dịch"
            value="12,847"
            change={12.1}
            changeLabel="so với tháng trước"
            icon={Activity}
            variant="info"
          />
          <StatCard
            title="Tăng trưởng"
            value="+18.5%"
            change={5.2}
            changeLabel="so với tháng trước"
            icon={TrendingUp}
            variant="warning"
          />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TransactionChart />
          </div>
          <div>
            <UserStatusChart />
          </div>
        </div>
      </main>
    </div>
  );
}


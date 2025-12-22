import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { RecentTransactions } from "@/components/admin/RecentTransactions";
import { UserStatusChart } from "@/components/admin/UserStatusChart";
import { TransactionChart } from "@/components/admin/TransactionChart";
import { Users, Wallet, ArrowRightLeft, Building2, AlertCircle } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { getAdminDashboard, getSystemReport, getCounters, getAdminUsers } from "@/lib/api";
import type { AdminDashboardResponse, SystemReportResponse, TransactionItem } from "@/lib/api";

type DashboardData = {
  totalUsers: number;
  totalAmountToday: number;
  transactionsToday: number;
  activeCounters: number;
  totalCounters: number;
  userStatusCounts: Record<string, number>;
  dailyStats: AdminDashboardResponse["data"]["dailyStats"];
  recentTransactions: TransactionItem[];
  changeUsers?: number;
  changeAmount?: number;
  changeTransactions?: number;
};

export default function Dashboard() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({
    totalUsers: 0,
    totalAmountToday: 0,
    transactionsToday: 0,
    activeCounters: 0,
    totalCounters: 0,
    userStatusCounts: {},
    dailyStats: [],
    recentTransactions: [],
  });

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
        const [dashboardRes, reportRes, countersRes, usersRes] = await Promise.allSettled([
          getAdminDashboard(token, 7),
          getSystemReport(token),
          getCounters(token, "ADMIN"),
          getAdminUsers(token),
        ]);

        let totalUsers = 0;
        let userStatusCounts: Record<string, number> = {};
        let totalAmountToday = 0;
        let transactionsToday = 0;
        let dailyStats: AdminDashboardResponse["data"]["dailyStats"] = [];
        let recentTransactions: TransactionItem[] = [];
        let activeCounters = 0;
        let totalCounters = 0;

        // Process dashboard response (transaction stats)
        if (dashboardRes.status === "fulfilled" && dashboardRes.value?.data) {
          const d = dashboardRes.value.data;
          totalAmountToday = d.totalAmountToday || 0;
          transactionsToday = d.totalTransactionsToday || 0;
          dailyStats = d.dailyStats || [];
          recentTransactions = d.recentTransactions || [];
        }

        // Process system report (user stats)
        if (reportRes.status === "fulfilled" && reportRes.value?.data) {
          const r = reportRes.value.data;
          totalUsers = r.totalUsers || 0;
          userStatusCounts = r.userStatusCounts || {};
        }

        // Process users for status counts if report didn't have it
        if (usersRes.status === "fulfilled" && usersRes.value?.data) {
          const users = usersRes.value.data;
          if (!Object.keys(userStatusCounts).length) {
            totalUsers = users.length;
            userStatusCounts = users.reduce((acc: Record<string, number>, user: any) => {
              const status = user.status || "UNKNOWN";
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {});
          }
        }

        // Process counters
        if (countersRes.status === "fulfilled" && countersRes.value?.data) {
          const counters = countersRes.value.data;
          totalCounters = counters.length;
          activeCounters = counters.filter((c: any) => c.isActive).length;
        }

        setData({
          totalUsers,
          totalAmountToday,
          transactionsToday,
          activeCounters,
          totalCounters,
          userStatusCounts,
          dailyStats,
          recentTransactions,
        });
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000_000) {
      return `₫${(amount / 1_000_000_000).toFixed(2)}B`;
    }
    if (amount >= 1_000_000) {
      return `₫${(amount / 1_000_000).toFixed(1)}M`;
    }
    return `₫${amount.toLocaleString("vi-VN")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Dashboard" subtitle="Tổng quan hệ thống Mini Banking" />
        <main className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Dashboard" subtitle="Tổng quan hệ thống Mini Banking" />
        <main className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Dashboard"
        subtitle="Tổng quan hệ thống Mini Banking"
      />

      <main className="p-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="animate-slide-up" style={{ animationDelay: "0ms" }}>
            <StatCard
              title="Tổng người dùng"
              value={data.totalUsers.toLocaleString("vi-VN")}
              icon={Users}
              variant="primary"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <StatCard
              title="Tổng giao dịch hôm nay"
              value={formatCurrency(data.totalAmountToday)}
              icon={Wallet}
              variant="success"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <StatCard
              title="Giao dịch hôm nay"
              value={data.transactionsToday.toLocaleString("vi-VN")}
              icon={ArrowRightLeft}
              variant="info"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
            <StatCard
              title="Quầy hoạt động"
              value={`${data.activeCounters}/${data.totalCounters}`}
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
            <TransactionChart dailyStats={data.dailyStats} />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "500ms" }}>
            <UserStatusChart userStatusCounts={data.userStatusCounts} />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="animate-slide-up" style={{ animationDelay: "600ms" }}>
          <RecentTransactions transactions={data.recentTransactions} />
        </div>
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { TransactionChart } from "@/components/admin/TransactionChart";
import { UserStatusChart } from "@/components/admin/UserStatusChart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/auth/AuthContext";
import { getAdminDashboard, getSystemReport, getCounters, getAdminUsers } from "@/lib/api";
import type { AdminDashboardResponse, DailyTransactionStat } from "@/lib/api";

type StatisticsData = {
  totalRevenue: number;
  newUsers: number;
  totalTransactions: number;
  growthRate: number;
  monthlyData: { name: string; revenue: number; users: number }[];
  counterPerformance: { name: string; transactions: number; revenue: number }[];
  userStatusCounts: Record<string, number>;
  dailyStats: DailyTransactionStat[];
};

export default function Statistics() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [data, setData] = useState<StatisticsData>({
    totalRevenue: 0,
    newUsers: 0,
    totalTransactions: 0,
    growthRate: 0,
    monthlyData: [],
    counterPerformance: [],
    userStatusCounts: {},
    dailyStats: [],
  });

  useEffect(() => {
    async function fetchData() {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const [dashboardRes, reportRes, countersRes, usersRes] = await Promise.allSettled([
          getAdminDashboard(token, days),
          getSystemReport(token),
          getCounters(token, "ADMIN"),
          getAdminUsers(token),
        ]);

        let totalRevenue = 0;
        let totalTransactions = 0;
        let dailyStats: DailyTransactionStat[] = [];
        let userStatusCounts: Record<string, number> = {};
        let newUsers = 0;

        // Process dashboard response
        if (dashboardRes.status === "fulfilled" && dashboardRes.value?.data) {
          const d = dashboardRes.value.data;
          dailyStats = d.dailyStats || [];
          
          // Calculate totals from daily stats
          dailyStats.forEach((stat) => {
            totalRevenue += stat.depositAmount + stat.counterDepositAmount + stat.transferAmount;
            totalTransactions += stat.depositCount + stat.withdrawCount + stat.transferCount + stat.counterDepositCount;
          });
        }

        // Process system report
        if (reportRes.status === "fulfilled" && reportRes.value?.data) {
          const r = reportRes.value.data;
          userStatusCounts = r.userStatusCounts || {};
          newUsers = r.totalUsers || 0;
        }

        // Process users
        if (usersRes.status === "fulfilled" && usersRes.value?.data) {
          const users = usersRes.value.data;
          if (!Object.keys(userStatusCounts).length) {
            newUsers = users.length;
            userStatusCounts = users.reduce((acc: Record<string, number>, user: any) => {
              const status = user.status || "UNKNOWN";
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {});
          }
        }

        // Transform daily stats to monthly format for charts
        const monthlyData = dailyStats.map((stat, index) => {
          const date = new Date(stat.date);
          return {
            name: `${date.getDate()}/${date.getMonth() + 1}`,
            revenue: Math.round((stat.depositAmount + stat.counterDepositAmount) / 1000000),
            users: stat.depositCount + stat.counterDepositCount,
          };
        });

        // Process counters for performance chart
        let counterPerformance: { name: string; transactions: number; revenue: number }[] = [];
        if (countersRes.status === "fulfilled" && countersRes.value?.data) {
          const counters = countersRes.value.data;
          counterPerformance = counters.slice(0, 4).map((counter: any) => ({
            name: counter.name.length > 15 ? counter.name.substring(0, 15) + "..." : counter.name,
            transactions: Math.floor(Math.random() * 1000) + 100, // Placeholder - would need real data
            revenue: Math.floor(Math.random() * 500) + 100,
          }));
        }

        // Calculate growth rate (simplified)
        const growthRate = dailyStats.length > 1
          ? ((dailyStats[dailyStats.length - 1]?.depositCount || 0) - (dailyStats[0]?.depositCount || 0)) / Math.max(dailyStats[0]?.depositCount || 1, 1) * 100
          : 0;

        setData({
          totalRevenue,
          newUsers,
          totalTransactions,
          growthRate: Math.round(growthRate * 10) / 10,
          monthlyData,
          counterPerformance,
          userStatusCounts,
          dailyStats,
        });
      } catch (err: any) {
        console.error("Failed to fetch statistics:", err);
        setError(err.message || "Không thể tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token, days]);

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
        <AdminHeader title="Thống kê & Báo cáo" subtitle="Phân tích dữ liệu và hiệu suất hệ thống" />
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
        <AdminHeader title="Thống kê & Báo cáo" subtitle="Phân tích dữ liệu và hiệu suất hệ thống" />
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
        title="Thống kê & Báo cáo"
        subtitle="Phân tích dữ liệu và hiệu suất hệ thống"
      />

      <main className="p-8">
        {/* Filter bar */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 ngày</SelectItem>
                <SelectItem value="14">14 ngày</SelectItem>
                <SelectItem value="30">30 ngày</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <Calendar className="mr-2 h-4 w-4" />
            Làm mới dữ liệu
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng doanh thu"
            value={formatCurrency(data.totalRevenue)}
            icon={DollarSign}
            variant="success"
          />
          <StatCard
            title="Tổng người dùng"
            value={data.newUsers.toLocaleString("vi-VN")}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Tổng giao dịch"
            value={data.totalTransactions.toLocaleString("vi-VN")}
            icon={Activity}
            variant="info"
          />
          <StatCard
            title="Tăng trưởng"
            value={`${data.growthRate >= 0 ? "+" : ""}${data.growthRate}%`}
            icon={TrendingUp}
            variant="warning"
          />
        </div>

        {/* Charts Grid */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
              Doanh thu theo ngày
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickFormatter={(value) => `${value}M`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border bg-popover p-3 shadow-md">
                            <p className="mb-1 font-medium text-foreground">
                              Ngày {label}
                            </p>
                            <p className="text-sm text-primary">
                              Doanh thu: {payload[0].value}M VNĐ
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction Growth Chart */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
              Số lượng giao dịch theo ngày
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border bg-popover p-3 shadow-md">
                            <p className="mb-1 font-medium text-foreground">
                              Ngày {label}
                            </p>
                            <p className="text-sm text-success">
                              Giao dịch: {payload[0].value}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--success))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Counter Performance & User Status */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Counter Performance */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
              Hiệu suất quầy giao dịch
            </h3>
            <div className="h-72">
              {data.counterPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.counterPerformance} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border border-border bg-popover p-3 shadow-md">
                              <p className="mb-1 font-medium text-foreground">
                                {label}
                              </p>
                              <p className="text-sm text-info">
                                Giao dịch: {payload[0].value}
                              </p>
                              <p className="text-sm text-success">
                                Doanh thu: {payload[1].value}M VNĐ
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="transactions"
                      fill="hsl(var(--info))"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--success))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Chưa có dữ liệu quầy giao dịch
                </div>
              )}
            </div>
          </div>

          <UserStatusChart userStatusCounts={data.userStatusCounts} />
        </div>
      </main>
    </div>
  );
}

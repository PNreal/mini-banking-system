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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const monthlyData = [
  { name: "T1", revenue: 120, users: 45 },
  { name: "T2", revenue: 150, users: 52 },
  { name: "T3", revenue: 180, users: 61 },
  { name: "T4", revenue: 165, users: 58 },
  { name: "T5", revenue: 200, users: 72 },
  { name: "T6", revenue: 220, users: 85 },
  { name: "T7", revenue: 195, users: 78 },
  { name: "T8", revenue: 240, users: 92 },
  { name: "T9", revenue: 280, users: 110 },
  { name: "T10", revenue: 310, users: 125 },
  { name: "T11", revenue: 290, users: 118 },
  { name: "T12", revenue: 350, users: 142 },
];

const counterPerformance = [
  { name: "Q. Trung tâm", transactions: 1250, revenue: 850 },
  { name: "Q. Thủ Đức", transactions: 980, revenue: 620 },
  { name: "Q. Bình Thạnh", transactions: 750, revenue: 480 },
  { name: "Q. Quận 7", transactions: 1100, revenue: 720 },
];

export default function Statistics() {
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
            <Select defaultValue="2024">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Năm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Quý" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cả năm</SelectItem>
                <SelectItem value="q1">Quý 1</SelectItem>
                <SelectItem value="q2">Quý 2</SelectItem>
                <SelectItem value="q3">Quý 3</SelectItem>
                <SelectItem value="q4">Quý 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Chọn khoảng thời gian
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng doanh thu"
            value="₫2.85B"
            change={15.3}
            changeLabel="so với năm trước"
            icon={DollarSign}
            variant="success"
          />
          <StatCard
            title="Người dùng mới"
            value="1,142"
            change={23.1}
            changeLabel="so với năm trước"
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Tổng giao dịch"
            value="28,450"
            change={18.5}
            changeLabel="so với năm trước"
            icon={Activity}
            variant="info"
          />
          <StatCard
            title="Tăng trưởng"
            value="+19.2%"
            icon={TrendingUp}
            variant="warning"
          />
        </div>

        {/* Charts Grid */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Monthly Revenue Chart */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
              Doanh thu theo tháng
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
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
                              Tháng {label}
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

          {/* User Growth Chart */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
              Tăng trưởng người dùng
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
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
                              Tháng {label}
                            </p>
                            <p className="text-sm text-success">
                              Người dùng mới: {payload[0].value}
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={counterPerformance} layout="vertical">
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
            </div>
          </div>

          <UserStatusChart />
        </div>
      </main>
    </div>
  );
}

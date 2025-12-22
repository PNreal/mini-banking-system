import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

type Props = {
  userStatusCounts?: Record<string, number>;
};

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Hoạt động", color: "hsl(142, 71%, 45%)" },
  LOCKED: { label: "Bị khóa", color: "hsl(0, 72%, 51%)" },
  FROZEN: { label: "Đóng băng", color: "hsl(38, 92%, 50%)" },
  PENDING_KYC: { label: "Chờ KYC", color: "hsl(199, 89%, 48%)" },
  INACTIVE: { label: "Không hoạt động", color: "hsl(220, 9%, 46%)" },
};

// Mock data for when no real data is available
const mockData = [
  { name: "Hoạt động", value: 1245, color: "hsl(142, 71%, 45%)" },
  { name: "Bị khóa", value: 23, color: "hsl(0, 72%, 51%)" },
  { name: "Đóng băng", value: 56, color: "hsl(38, 92%, 50%)" },
];

export function UserStatusChart({ userStatusCounts }: Props) {
  // Transform userStatusCounts to chart format
  const chartData = userStatusCounts && Object.keys(userStatusCounts).length > 0
    ? Object.entries(userStatusCounts).map(([status, count]) => {
        const config = statusConfig[status] || { label: status, color: "hsl(220, 9%, 46%)" };
        return {
          name: config.label,
          value: count,
          color: config.color,
        };
      })
    : mockData;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
        Trạng thái người dùng
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
                      <p className="text-sm font-medium text-foreground">
                        {payload[0].name}: {payload[0].value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {chartData.slice(0, 3).map((item) => (
          <div key={item.name} className="text-center">
            <p className="text-2xl font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

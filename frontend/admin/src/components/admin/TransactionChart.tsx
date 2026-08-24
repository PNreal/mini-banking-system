import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyTransactionStat } from "@/lib/api";

type Props = {
  dailyStats?: DailyTransactionStat[];
};

// Mock data for when no real data is available
const mockData = [
  { name: "T2", deposit: 24000000, withdraw: 14000000, transfer: 18000000 },
  { name: "T3", deposit: 13000000, withdraw: 9800000, transfer: 22000000 },
  { name: "T4", deposit: 98000000, withdraw: 39000000, transfer: 35000000 },
  { name: "T5", deposit: 39000000, withdraw: 48000000, transfer: 28000000 },
  { name: "T6", deposit: 48000000, withdraw: 38000000, transfer: 42000000 },
  { name: "T7", deposit: 38000000, withdraw: 43000000, transfer: 35000000 },
  { name: "CN", deposit: 43000000, withdraw: 34000000, transfer: 29000000 },
];

const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function TransactionChart({ dailyStats }: Props) {
  // Transform dailyStats to chart format
  const chartData = dailyStats && dailyStats.length > 0
    ? dailyStats.map((stat) => {
        const date = new Date(stat.date);
        const dayName = dayNames[date.getDay()];
        return {
          name: dayName,
          deposit: stat.depositAmount + stat.counterDepositAmount,
          withdraw: stat.withdrawAmount,
          transfer: stat.transferAmount,
        };
      })
    : mockData;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Biểu đồ giao dịch
          </h3>
          <p className="text-sm text-muted-foreground">7 ngày gần nhất</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Nạp tiền</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">Rút tiền</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-info" />
            <span className="text-xs text-muted-foreground">Chuyển khoản</span>
          </div>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorDeposit" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(142, 71%, 45%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(142, 71%, 45%)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorWithdraw" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(38, 92%, 50%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(38, 92%, 50%)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorTransfer" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(199, 89%, 48%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(199, 89%, 48%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
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
              tickFormatter={(value) => `${value / 1000000}M`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border border-border bg-popover p-3 shadow-md">
                      <p className="mb-2 text-sm font-medium text-foreground">
                        {label}
                      </p>
                      {payload.map((entry: any) => (
                        <p
                          key={entry.dataKey}
                          className="text-sm"
                          style={{ color: entry.stroke }}
                        >
                          {entry.dataKey === "deposit" && "Nạp tiền: "}
                          {entry.dataKey === "withdraw" && "Rút tiền: "}
                          {entry.dataKey === "transfer" && "Chuyển khoản: "}
                          {entry.value.toLocaleString("vi-VN")}đ
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="deposit"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDeposit)"
            />
            <Area
              type="monotone"
              dataKey="withdraw"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorWithdraw)"
            />
            <Area
              type="monotone"
              dataKey="transfer"
              stroke="hsl(199, 89%, 48%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTransfer)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

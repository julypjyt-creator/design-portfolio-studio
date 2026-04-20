"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, CartesianGrid, LineChart, Line } from "recharts";

const colors = ["#0F766E", "#0EA5E9", "#94A3B8", "#22C55E", "#F59E0B"];

export function CategoryPie({ data }: { data: Array<{ name: string; value: number }> }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const rows = data.map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
    percent: total > 0 ? Number(((item.value / total) * 100).toFixed(1)) : 0
  }));

  return (
    <div className="panel h-[320px] p-4">
      <p className="mb-3 text-sm font-medium text-ink">作品类型占比</p>
      <div className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={92} innerRadius={54}>
              {rows.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, _name, item) => {
                const payload = item?.payload as { percent?: number } | undefined;
                const percent = payload?.percent ?? 0;
                return [`${value}（${percent}%）`, "数量"];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MonthlyBar({ data }: { data: Array<{ month: string; count: number }> }) {
  return (
    <div className="panel h-[320px] p-4">
      <p className="mb-3 text-sm font-medium text-ink">每月完成数量</p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#0F766E" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendLine({ data }: { data: Array<{ month: string; count: number }> }) {
  return (
    <div className="panel h-[320px] p-4">
      <p className="mb-3 text-sm font-medium text-ink">近期新增趋势</p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line dataKey="count" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

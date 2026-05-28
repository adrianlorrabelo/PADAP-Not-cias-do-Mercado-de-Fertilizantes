import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../ui/Card";

export function LineChartCard({ title, data, color = "#1dba2c" }: { title: string; data: { label: string; value: number }[]; color?: string }) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid stroke="rgba(255,255,255,.055)" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ stroke: "rgba(29,186,44,.22)" }} contentStyle={{ background: "rgba(15,76,79,.96)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, boxShadow: "0 18px 48px rgba(0,0,0,.28)" }} labelStyle={{ color: "#e2e8f0" }} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

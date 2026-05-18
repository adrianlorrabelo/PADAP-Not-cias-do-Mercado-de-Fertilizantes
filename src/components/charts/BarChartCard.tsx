import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "../ui/Card";

export function BarChartCard({ title, data, color = "#42d7ff" }: { title: string; data: { label: string; value: number }[]; color?: string }) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid stroke="rgba(255,255,255,.055)" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: "rgba(57,211,83,.05)" }} contentStyle={{ background: "rgba(5,18,18,.96)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, boxShadow: "0 18px 48px rgba(0,0,0,.35)" }} labelStyle={{ color: "#e2e8f0" }} />
            <Bar dataKey="value" fill={color} radius={[7, 7, 0, 0]} maxBarSize={42} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

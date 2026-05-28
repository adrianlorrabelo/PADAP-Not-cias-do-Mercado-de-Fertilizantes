import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "../ui/Card";

export function DonutChartCard({ title, data }: { title: string; data: { label: string; value: number; color: string }[] }) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={58} outerRadius={84} paddingAngle={5} stroke="rgba(15,76,79,.9)" strokeWidth={3}>
              {data.map((item) => <Cell key={item.label} fill={item.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "rgba(15,76,79,.96)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, boxShadow: "0 18px 48px rgba(0,0,0,.28)" }} labelStyle={{ color: "#e2e8f0" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

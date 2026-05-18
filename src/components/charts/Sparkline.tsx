import { Line, LineChart, ResponsiveContainer } from "recharts";

export function Sparkline({ data, color = "#39d353" }: { data: { value: number }[]; color?: string }) {
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

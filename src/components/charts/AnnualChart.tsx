import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AnnualPoint } from '../../types/reunion.ts'
import { ChartCard } from './ChartCard.tsx'
import { chartTooltipStyle, gridColor, meetColor, tripColor } from './chartTheme.ts'

export function AnnualChart({ data, className }: { data: AnnualPoint[]; className?: string }) {
  return (
    <ChartCard
      className={className}
      title="Annual frequency"
      subtitle="Meet days as bars, with a line for how many trips happened each year."
    >
      <div className="h-72 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={gridColor} vertical={false} />
            <XAxis dataKey="year" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis yAxisId="days" tickLine={false} axisLine={false} fontSize={12} width={32} />
            <YAxis
              yAxisId="trips"
              orientation="right"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={28}
            />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Legend />
            <Bar
              yAxisId="days"
              dataKey="meetDays"
              name="Meet days"
              fill={meetColor}
              radius={[6, 6, 0, 0]}
              maxBarSize={42}
            />
            <Line
              yAxisId="trips"
              type="monotone"
              dataKey="tripCount"
              name="Trips"
              stroke={tripColor}
              strokeWidth={2.5}
              dot={{ r: 4, fill: tripColor }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { WeekdayPoint } from '../../types/reunion.ts'
import { ChartCard } from './ChartCard.tsx'
import { chartTooltipStyle, gridColor, meetColor } from './chartTheme.ts'

export function WeekdayChart({ data }: { data: WeekdayPoint[] }) {
  return (
    <ChartCard title="Weekday pattern" subtitle="Which days of the week the meet dates fall on.">
      <div className="h-72 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={gridColor} vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} width={32} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="meetDays" name="Meet days" fill={meetColor} radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

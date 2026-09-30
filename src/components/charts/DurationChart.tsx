import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DurationBucket } from '../../types/reunion.ts'
import { ChartCard } from './ChartCard.tsx'
import { chartTooltipStyle, gridColor, tripColor } from './chartTheme.ts'

export function DurationChart({ data }: { data: DurationBucket[] }) {
  return (
    <ChartCard title="Trip length" subtitle="How trips cluster by number of meet days.">
      <div className="h-72 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={gridColor} vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={32} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="tripCount" name="Trips" fill={tripColor} radius={[6, 6, 0, 0]} maxBarSize={42} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

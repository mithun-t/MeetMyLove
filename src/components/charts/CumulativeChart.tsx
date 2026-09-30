import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CumulativePoint } from '../../types/reunion.ts'
import { ChartCard } from './ChartCard.tsx'
import { chartTooltipStyle, gridColor, meetColor } from './chartTheme.ts'

export function CumulativeChart({ data }: { data: CumulativePoint[] }) {
  return (
    <ChartCard title="Cumulative days" subtitle="Running total of meet days after each trip.">
      <div className="h-72 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={gridColor} vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} minTickGap={24} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} width={36} />
            <Tooltip
              contentStyle={chartTooltipStyle}
              labelFormatter={(_label, payload) => {
                const point = payload?.[0]?.payload as CumulativePoint | undefined
                return point ? `${point.tripId} · ${point.label}` : ''
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              name="Cumulative days"
              stroke={meetColor}
              fill={meetColor}
              fillOpacity={0.18}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

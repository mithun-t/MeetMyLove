import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { SeasonPoint } from '../../types/reunion.ts'
import { ChartCard } from './ChartCard.tsx'
import { chartTooltipStyle, meetColor } from './chartTheme.ts'

export function SeasonalRadar({ data }: { data: SeasonPoint[] }) {
  return (
    <ChartCard
      title="Seasonal radar"
      subtitle="Meet days grouped into winter, spring, summer, and autumn."
    >
      <div className="h-72 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="#e7e5e4" />
            <PolarAngleAxis dataKey="season" tick={{ fill: '#57534e', fontSize: 12 }} />
            <PolarRadiusAxis tick={{ fill: '#a8a29e', fontSize: 11 }} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Radar
              dataKey="meetDays"
              name="Meet days"
              stroke={meetColor}
              fill={meetColor}
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

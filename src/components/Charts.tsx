import { useState } from 'react'
import type { Game, PlayerInfo } from '../types'
import { getCumulativeData, getAllPlayerStats, getPlayerColor } from '../utils/stats'
import { useTheme } from '../contexts/ThemeContext'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell, PieChart, Pie,
} from 'recharts'

export function Charts({ games, players }: { games: Game[]; players: PlayerInfo[] }) {
  const { theme } = useTheme()
  const stats = getAllPlayerStats(games, players)
  const activePlayers = stats.map(s => s.name)
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set(activePlayers.slice(0, 5)))

  function togglePlayer(p: string) {
    const next = new Set(selectedPlayers)
    if (next.has(p)) next.delete(p); else next.add(p)
    setSelectedPlayers(next)
  }

  const cumulativeData = getCumulativeData(games, activePlayers)
  const winRateData = stats.filter(s => s.gamesPlayed >= 3).map(s => ({
    name: s.name, winRate: Math.round(s.winRate * 100), color: getPlayerColor(s.name, players),
  }))
  const gamesPlayedData = stats.map(s => ({
    name: s.name, value: s.gamesPlayed, color: getPlayerColor(s.name, players),
  }))

  const monthlyData: Record<string, Record<string, number>> = {}
  for (const g of games) {
    const month = g.date.slice(0, 7)
    if (!monthlyData[month]) monthlyData[month] = {}
    for (const [p, v] of Object.entries(g.results)) monthlyData[month][p] = (monthlyData[month][p] || 0) + v
  }
  const monthlyChartData = Object.keys(monthlyData).sort().map(m => {
    const label = new Date(m + '-01').toLocaleDateString('en-US', { month: 'short' })
    const entry: Record<string, number | string> = { month: label }
    for (const p of activePlayers) if (monthlyData[m][p] !== undefined) entry[p] = Math.round(monthlyData[m][p] * 100) / 100
    return entry
  })

  // Theme-aware chart colors
  const isDark = theme === 'dark'
  const axisColor = isDark ? '#52525b' : '#a1a1aa'
  const axisLabelColor = isDark ? '#a1a1aa' : '#71717a'
  const gridColor = isDark ? '#27272a' : '#e4e4e7'
  const tooltipBg = isDark ? '#18181b' : '#ffffff'
  const tooltipBorder = isDark ? '#27272a' : '#e4e4e7'
  const tooltipText = isDark ? '#fafafa' : '#18181b'
  const pieLabelLine = isDark ? '#3f3f46' : '#d4d4d8'

  const tt = {
    backgroundColor: tooltipBg,
    border: `1px solid ${tooltipBorder}`,
    borderRadius: '10px',
    fontSize: '12px',
    fontFamily: "'JetBrains Mono', monospace",
    color: tooltipText,
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-extrabold tracking-tighter">Charts</h2>
      <div className="flex flex-wrap gap-1.5">
        {activePlayers.map(p => {
          const c = getPlayerColor(p, players)
          return (
            <button key={p} onClick={() => togglePlayer(p)}
              className="px-3 py-1 rounded-full text-[12px] font-medium cursor-pointer transition-all"
              style={selectedPlayers.has(p)
                ? { background: isDark ? c + '35' : c + '18', color: c, border: `1px solid ${c}80`, fontWeight: 600 }
                : { background: 'transparent', color: c + (isDark ? '70' : '90'), border: `1px solid ${c + (isDark ? '30' : '25')}` }}>
              {p}
            </button>
          )
        })}
      </div>

      <Card title="Cumulative Earnings Over Time">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={cumulativeData}>
            <XAxis dataKey="game" tick={{ fill: axisColor, fontSize: 11 }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={v => `$${v}`} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
            <ReferenceLine y={0} stroke={gridColor} strokeDasharray="3 3" />
            <Tooltip contentStyle={tt} cursor={{ stroke: gridColor, strokeDasharray: '3 3' }} formatter={(v: number, n: string) => [`$${v}`, n]} />
            {activePlayers.filter(p => selectedPlayers.has(p)).map(p => (
              <Line key={p} type="monotone" dataKey={p} stroke={getPlayerColor(p, players)} strokeWidth={3} dot={false} connectNulls strokeOpacity={isDark ? 0.95 : 0.85} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Win Rate (min 3 games)">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={winRateData} layout="vertical">
            <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={v => `${v}%`} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
            <YAxis type="category" dataKey="name" tick={{ fill: axisLabelColor, fontSize: 12, fontWeight: 500 }} width={70} axisLine={{ stroke: gridColor }} tickLine={false} />
            <Tooltip contentStyle={tt} cursor={{ fill: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', radius: 4 }} formatter={(v: number) => [`${v}%`, 'Win Rate']} />
            <Bar dataKey="winRate" radius={[0, 6, 6, 0]} barSize={20}>
              {winRateData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={isDark ? 0.9 : 0.8} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Games Played">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={gamesPlayedData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110}
              label={({ name, value }) => `${name} (${value})`} labelLine={{ stroke: pieLabelLine }} fontSize={11}
              stroke={isDark ? '#09090b' : '#fafafa'} strokeWidth={2}>
              {gamesPlayedData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={isDark ? 0.9 : 0.8} />)}
            </Pie>
            <Tooltip contentStyle={tt} />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Monthly Performance">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={monthlyChartData}>
            <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={v => `$${v}`} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
            <ReferenceLine y={0} stroke={gridColor} strokeDasharray="3 3" />
            <Tooltip contentStyle={tt} cursor={{ fill: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }} formatter={(v: number, n: string) => [`$${v}`, n]} />
            {activePlayers.filter(p => selectedPlayers.has(p)).map(p => (
              <Bar key={p} dataKey={p} fill={getPlayerColor(p, players)} fillOpacity={isDark ? 0.9 : 0.8} stackId="a" />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
      <h3 className="text-[15px] font-semibold tracking-tight mb-4">{title}</h3>
      {children}
    </div>
  )
}

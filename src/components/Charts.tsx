import { useState, useEffect, useRef, useMemo } from 'react'
import type { Game, PlayerInfo } from '../types'
import { getCumulativeData, getAllPlayerStats, getPlayerColor, formatMoney } from '../utils/stats'
import { useTheme } from '../contexts/ThemeContext'
import { ChevronDown, Check } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell, PieChart, Pie,
} from 'recharts'

const DEFAULT_TOP_N = 5

export function Charts({ games, players }: { games: Game[]; players: PlayerInfo[] }) {
  const { theme } = useTheme()
  const stats = getAllPlayerStats(games, players)

  // Players ordered by games played (most common first) for the dropdown default
  const playersByFrequency = useMemo(
    () => [...stats].sort((a, b) => b.gamesPlayed - a.gamesPlayed).map(s => s.name),
    [stats]
  )
  const activePlayers = stats.map(s => s.name)

  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(
    () => new Set(playersByFrequency.slice(0, DEFAULT_TOP_N))
  )

  useEffect(() => {
    const valid = new Set(activePlayers)
    setSelectedPlayers(prev => {
      const next = new Set(Array.from(prev).filter(p => valid.has(p)))
      if (next.size === 0) playersByFrequency.slice(0, DEFAULT_TOP_N).forEach(p => next.add(p))
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games])

  const visiblePlayers = activePlayers.filter(p => selectedPlayers.has(p))

  // ---------- Base datasets ----------
  const cumulativeData = getCumulativeData(games, visiblePlayers)
  const winRateData = stats
    .filter(s => s.gamesPlayed >= 3 && selectedPlayers.has(s.name))
    .map(s => ({ name: s.name, winRate: Math.round(s.winRate * 100), color: getPlayerColor(s.name, players) }))
  const gamesPlayedData = stats
    .filter(s => selectedPlayers.has(s.name))
    .map(s => ({ name: s.name, value: s.gamesPlayed, color: getPlayerColor(s.name, players) }))

  const monthlyData: Record<string, Record<string, number>> = {}
  for (const g of games) {
    const month = g.date.slice(0, 7)
    if (!monthlyData[month]) monthlyData[month] = {}
    for (const [p, v] of Object.entries(g.results)) {
      if (!selectedPlayers.has(p)) continue
      monthlyData[month][p] = (monthlyData[month][p] || 0) + v
    }
  }
  const monthlyChartData = Object.keys(monthlyData).sort().map(m => {
    const label = new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const entry: Record<string, number | string> = { month: label }
    for (const p of visiblePlayers) if (monthlyData[m][p] !== undefined) entry[p] = Math.round(monthlyData[m][p] * 100) / 100
    return entry
  })

  // ---------- New analytics ----------
  // Kings Won
  const kingsData = stats
    .filter(s => selectedPlayers.has(s.name) && s.kingTitles > 0)
    .map(s => ({ name: s.name, value: s.kingTitles, color: getPlayerColor(s.name, players) }))
    .sort((a, b) => b.value - a.value)

  // Avg per Game
  const avgData = stats
    .filter(s => selectedPlayers.has(s.name))
    .map(s => ({ name: s.name, value: Math.round(s.avgPerGame * 100) / 100, color: getPlayerColor(s.name, players) }))
    .sort((a, b) => b.value - a.value)

  // Day-of-week average performance across selected players (league-wide by selected)
  const dowAgg: Record<number, { total: number; count: number }> = {}
  for (const g of games) {
    const d = new Date(g.date + 'T00:00:00').getDay()
    for (const [p, v] of Object.entries(g.results)) {
      if (!selectedPlayers.has(p)) continue
      if (!dowAgg[d]) dowAgg[d] = { total: 0, count: 0 }
      dowAgg[d].total += v
      dowAgg[d].count += 1
    }
  }
  const dowLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dowData = dowLabels.map((label, i) => ({
    day: label,
    avg: dowAgg[i] ? Math.round((dowAgg[i].total / dowAgg[i].count) * 100) / 100 : 0,
    games: dowAgg[i]?.count || 0,
  }))

  // Location performance
  const locAgg: Record<string, { total: number; count: number }> = {}
  for (const g of games) {
    const loc = g.location || 'Unknown'
    for (const [p, v] of Object.entries(g.results)) {
      if (!selectedPlayers.has(p)) continue
      if (!locAgg[loc]) locAgg[loc] = { total: 0, count: 0 }
      locAgg[loc].total += v
      locAgg[loc].count += 1
    }
  }
  const locData = Object.entries(locAgg)
    .map(([location, v]) => ({ location, avg: Math.round((v.total / v.count) * 100) / 100, games: v.count }))
    .sort((a, b) => b.avg - a.avg)

  // Biggest single-game swings (wins and losses across selected players)
  const swings: { label: string; value: number; color: string }[] = []
  for (const g of games) {
    for (const [p, v] of Object.entries(g.results)) {
      if (!selectedPlayers.has(p)) continue
      swings.push({ label: `${p} #${g.id}`, value: v, color: getPlayerColor(p, players) })
    }
  }
  const topSwings = [...swings].sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 10)

  // Consistency (std dev of per-game net)
  const consistencyData = stats
    .filter(s => selectedPlayers.has(s.name) && s.gamesPlayed >= 3)
    .map(s => {
      const results = games.filter(g => s.name in g.results).map(g => g.results[s.name])
      const mean = results.reduce((a, b) => a + b, 0) / results.length
      const variance = results.reduce((a, b) => a + (b - mean) ** 2, 0) / results.length
      const std = Math.sqrt(variance)
      return { name: s.name, std: Math.round(std * 10) / 10, color: getPlayerColor(s.name, players) }
    })
    .sort((a, b) => a.std - b.std)

  // ---------- Theme ----------
  const isDark = theme === 'dark'
  const axisColor = isDark ? '#52525b' : '#a1a1aa'
  const axisLabelColor = isDark ? '#a1a1aa' : '#71717a'
  const gridColor = isDark ? '#27272a' : '#e4e4e7'
  const tooltipBg = isDark ? '#18181b' : '#ffffff'
  const tooltipBorder = isDark ? '#27272a' : '#e4e4e7'
  const tooltipText = isDark ? '#fafafa' : '#18181b'
  const pieLabelLine = isDark ? '#3f3f46' : '#d4d4d8'
  const positive = isDark ? '#4ade80' : '#16a34a'
  const negative = isDark ? '#f87171' : '#dc2626'

  const tt = {
    backgroundColor: tooltipBg,
    border: `1px solid ${tooltipBorder}`,
    borderRadius: '10px',
    fontSize: '12px',
    fontFamily: "'JetBrains Mono', monospace",
    color: tooltipText,
    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.12)',
  }
  const ttItemStyle = { color: tooltipText, fontWeight: 500 }
  const ttLabelStyle = { color: tooltipText, fontWeight: 600, marginBottom: 2 }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-2xl font-extrabold tracking-tighter">Charts</h2>
        <PlayerMultiSelect
          allPlayers={playersByFrequency}
          selected={selectedPlayers}
          onChange={setSelectedPlayers}
          players={players}
          topN={DEFAULT_TOP_N}
        />
      </div>

      <Card title="Cumulative Earnings Over Time">
        <ResponsiveContainer key={`cum-${theme}`} width="100%" height={320}>
          <LineChart data={cumulativeData}>
            <XAxis dataKey="game" tick={{ fill: axisColor, fontSize: 11 }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={v => `$${v}`} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
            <ReferenceLine y={0} stroke={gridColor} strokeDasharray="3 3" />
            <Tooltip contentStyle={tt} itemStyle={ttItemStyle} labelStyle={ttLabelStyle} cursor={{ stroke: gridColor, strokeDasharray: '3 3' }} formatter={(v: any, n: any) => [`$${v}`, n]} />
            {visiblePlayers.map(p => (
              <Line key={p} type="monotone" dataKey={p} stroke={getPlayerColor(p, players)} strokeWidth={3} dot={false} connectNulls strokeOpacity={isDark ? 0.95 : 0.85} isAnimationActive animationDuration={800} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Win Rate (min 3 games)">
          <ResponsiveContainer key={`win-${theme}`} width="100%" height={260}>
            <BarChart data={winRateData} layout="vertical">
              <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={v => `${v}%`} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
              <YAxis type="category" dataKey="name" tick={{ fill: axisLabelColor, fontSize: 12, fontWeight: 500 }} width={70} axisLine={{ stroke: gridColor }} tickLine={false} />
              <Tooltip contentStyle={tt} itemStyle={ttItemStyle} labelStyle={ttLabelStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', radius: 4 }} formatter={(v: any) => [`${v}%`, 'Win Rate']} />
              <Bar dataKey="winRate" radius={[0, 6, 6, 0]} barSize={18} isAnimationActive animationDuration={800}>
                {winRateData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={isDark ? 0.9 : 0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Avg / Game">
          <ResponsiveContainer key={`avg-${theme}`} width="100%" height={260}>
            <BarChart data={avgData} layout="vertical">
              <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={v => `$${v}`} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
              <YAxis type="category" dataKey="name" tick={{ fill: axisLabelColor, fontSize: 12, fontWeight: 500 }} width={70} axisLine={{ stroke: gridColor }} tickLine={false} />
              <ReferenceLine x={0} stroke={gridColor} />
              <Tooltip contentStyle={tt} itemStyle={ttItemStyle} labelStyle={ttLabelStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', radius: 4 }} formatter={(v: any) => [formatMoney(v), 'Avg']} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18} isAnimationActive animationDuration={800}>
                {avgData.map((d, i) => <Cell key={i} fill={d.value >= 0 ? positive : negative} fillOpacity={isDark ? 0.9 : 0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Games Played">
          <ResponsiveContainer key={`pie-${theme}`} width="100%" height={280}>
            <PieChart>
              <Pie data={gamesPlayedData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                label={({ name, value }) => `${name} (${value})`} labelLine={{ stroke: pieLabelLine }} fontSize={11}
                stroke={isDark ? '#09090b' : '#fafafa'} strokeWidth={2} isAnimationActive animationDuration={800}>
                {gamesPlayedData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={isDark ? 0.9 : 0.8} />)}
              </Pie>
              <Tooltip contentStyle={tt} itemStyle={ttItemStyle} labelStyle={ttLabelStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="King Titles">
          <ResponsiveContainer key={`king-${theme}`} width="100%" height={280}>
            <BarChart data={kingsData} layout="vertical">
              <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: axisLabelColor, fontSize: 12, fontWeight: 500 }} width={70} axisLine={{ stroke: gridColor }} tickLine={false} />
              <Tooltip contentStyle={tt} itemStyle={ttItemStyle} labelStyle={ttLabelStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', radius: 4 }} formatter={(v: any) => [v, 'Kings']} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18} isAnimationActive animationDuration={800}>
                {kingsData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={isDark ? 0.9 : 0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Monthly Performance">
        <ResponsiveContainer key={`mon-${theme}`} width="100%" height={320}>
          <BarChart data={monthlyChartData}>
            <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={v => `$${v}`} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
            <ReferenceLine y={0} stroke={gridColor} strokeDasharray="3 3" />
            <Tooltip contentStyle={tt} itemStyle={ttItemStyle} labelStyle={ttLabelStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }} formatter={(v: any, n: any) => [`$${v}`, n]} />
            {visiblePlayers.map(p => (
              <Bar key={p} dataKey={p} fill={getPlayerColor(p, players)} fillOpacity={isDark ? 0.9 : 0.8} stackId="a" isAnimationActive animationDuration={800} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Biggest Swings (Top 10)">
        <ResponsiveContainer key={`swings-${theme}`} width="100%" height={320}>
          <BarChart data={topSwings} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={v => `$${v}`} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
            <YAxis type="category" dataKey="label" tick={{ fill: axisLabelColor, fontSize: 11, fontWeight: 500 }} width={100} axisLine={{ stroke: gridColor }} tickLine={false} />
            <ReferenceLine x={0} stroke={gridColor} />
            <Tooltip contentStyle={tt} itemStyle={ttItemStyle} labelStyle={ttLabelStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', radius: 4 }} formatter={(v: any) => [formatMoney(v), 'Net']} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16} isAnimationActive animationDuration={800}>
              {topSwings.map((d, i) => <Cell key={i} fill={d.value >= 0 ? positive : negative} fillOpacity={isDark ? 0.9 : 0.8} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="By Day of Week">
          <ResponsiveContainer key={`dow-${theme}`} width="100%" height={260}>
            <BarChart data={dowData}>
              <XAxis dataKey="day" tick={{ fill: axisColor, fontSize: 11 }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={v => `$${v}`} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
              <ReferenceLine y={0} stroke={gridColor} />
              <Tooltip contentStyle={tt} itemStyle={ttItemStyle} labelStyle={ttLabelStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                formatter={(v: any, _n: any, p: any) => [formatMoney(v), `Avg (${p.payload.games}g)`]} />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]} barSize={28} isAnimationActive animationDuration={800}>
                {dowData.map((d, i) => <Cell key={i} fill={d.avg >= 0 ? positive : negative} fillOpacity={isDark ? 0.9 : 0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="By Location">
          <ResponsiveContainer key={`loc-${theme}`} width="100%" height={260}>
            <BarChart data={locData} layout="vertical">
              <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={v => `$${v}`} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
              <YAxis type="category" dataKey="location" tick={{ fill: axisLabelColor, fontSize: 11, fontWeight: 500 }} width={90} axisLine={{ stroke: gridColor }} tickLine={false} />
              <ReferenceLine x={0} stroke={gridColor} />
              <Tooltip contentStyle={tt} itemStyle={ttItemStyle} labelStyle={ttLabelStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', radius: 4 }}
                formatter={(v: any, _n: any, p: any) => [formatMoney(v), `Avg (${p.payload.games}g)`]} />
              <Bar dataKey="avg" radius={[0, 6, 6, 0]} barSize={18} isAnimationActive animationDuration={800}>
                {locData.map((d, i) => <Cell key={i} fill={d.avg >= 0 ? positive : negative} fillOpacity={isDark ? 0.9 : 0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Consistency (Std Dev / Game · lower = steadier)">
        <ResponsiveContainer key={`std-${theme}`} width="100%" height={280}>
          <BarChart data={consistencyData} layout="vertical">
            <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={v => `$${v}`} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
            <YAxis type="category" dataKey="name" tick={{ fill: axisLabelColor, fontSize: 12, fontWeight: 500 }} width={70} axisLine={{ stroke: gridColor }} tickLine={false} />
            <Tooltip contentStyle={tt} itemStyle={ttItemStyle} labelStyle={ttLabelStyle} cursor={{ fill: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', radius: 4 }} formatter={(v: any) => [`$${v}`, 'Std Dev']} />
            <Bar dataKey="std" radius={[0, 6, 6, 0]} barSize={18} isAnimationActive animationDuration={800}>
              {consistencyData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={isDark ? 0.9 : 0.8} />)}
            </Bar>
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

function PlayerMultiSelect({
  allPlayers,
  selected,
  onChange,
  players,
  topN,
}: {
  allPlayers: string[]
  selected: Set<string>
  onChange: (s: Set<string>) => void
  players: PlayerInfo[]
  topN: number
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function toggle(p: string) {
    const next = new Set(selected)
    if (next.has(p)) next.delete(p); else next.add(p)
    onChange(next)
  }

  const label = selected.size === 0
    ? 'No players'
    : selected.size === allPlayers.length
    ? 'All players'
    : `${selected.size} player${selected.size === 1 ? '' : 's'}`

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-[7px] rounded-[10px] text-[13px] font-medium cursor-pointer transition-colors"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
      >
        {label}
        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 rounded-xl z-50 w-64 max-h-[360px] overflow-hidden flex flex-col"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
        >
          <div className="flex items-center justify-between px-3 py-2 gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="label-upper">Players</span>
            <div className="flex gap-1">
              <button
                onClick={() => onChange(new Set(allPlayers.slice(0, topN)))}
                className="text-[11px] px-2 py-1 rounded-md cursor-pointer hover:opacity-80"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                Top {topN}
              </button>
              <button
                onClick={() => onChange(new Set(allPlayers))}
                className="text-[11px] px-2 py-1 rounded-md cursor-pointer hover:opacity-80"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                All
              </button>
              <button
                onClick={() => onChange(new Set())}
                className="text-[11px] px-2 py-1 rounded-md cursor-pointer hover:opacity-80"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                None
              </button>
            </div>
          </div>
          <div className="overflow-y-auto py-1">
            {allPlayers.map(p => {
              const c = getPlayerColor(p, players)
              const isSel = selected.has(p)
              return (
                <button
                  key={p}
                  onClick={() => toggle(p)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left cursor-pointer transition-colors"
                  style={{ color: 'var(--text)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                    style={{
                      background: isSel ? c : 'transparent',
                      border: `1px solid ${isSel ? c : 'var(--border)'}`,
                    }}
                  >
                    {isSel && <Check size={11} color="#fff" strokeWidth={3} />}
                  </span>
                  <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                  <span className="flex-1">{p}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

import type { Game, Page, PlayerInfo } from '../types'
import { getPlayerStats, formatMoney, formatPercent, formatDate, moneyClass, getPlayerColor } from '../utils/stats'
import { useTheme } from '../contexts/ThemeContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { ArrowLeft, Crown } from 'lucide-react'

export function PlayerProfile({
  games, players, playerName, onNavigate,
}: {
  games: Game[]; players: PlayerInfo[]; playerName: string; onNavigate: (p: Page) => void
}) {
  const { theme } = useTheme()
  const stats = getPlayerStats(games, playerName)
  const color = getPlayerColor(playerName, players)
  const isDark = theme === 'dark'
  const axisColor = isDark ? '#52525b' : '#a1a1aa'
  const gridColor = isDark ? '#27272a' : '#e4e4e7'
  const tooltipBg = isDark ? '#18181b' : '#ffffff'
  const tooltipBorder = isDark ? '#27272a' : '#e4e4e7'
  const tooltipText = isDark ? '#fafafa' : '#18181b'
  const playerGames = games.filter(g => playerName in g.results).sort((a, b) => a.date.localeCompare(b.date))

  let cumulative = 0
  const chartData = playerGames.map(g => {
    cumulative += g.results[playerName]
    return { game: `#${g.id}`, date: formatDate(g.date), cumulative: Math.round(cumulative * 100) / 100 }
  })

  const h2h: Record<string, { games: number; myWins: number }> = {}
  for (const g of playerGames) {
    for (const [other, otherVal] of Object.entries(g.results)) {
      if (other === playerName) continue
      if (!h2h[other]) h2h[other] = { games: 0, myWins: 0 }
      h2h[other].games++
      if (g.results[playerName] > otherVal) h2h[other].myWins++
    }
  }

  const statItems = [
    { label: 'Games', value: String(stats.gamesPlayed) },
    { label: 'Win Rate', value: formatPercent(stats.winRate) },
    { label: 'Streak', value: String(stats.bestStreak) },
    { label: 'Kings', value: String(stats.kingTitles) },
    { label: 'Avg/Game', value: formatMoney(stats.avgPerGame) },
    { label: 'Best Win', value: stats.biggestWin > 0 ? `+$${stats.biggestWin}` : '-' },
    { label: 'Worst Loss', value: stats.biggestLoss < 0 ? `-$${Math.abs(stats.biggestLoss)}` : '-' },
    { label: 'W / L', value: `${stats.winningGames} / ${stats.losingGames}` },
  ]

  return (
    <div className="space-y-6">
      <button onClick={() => onNavigate({ type: 'leaderboard' })}
        className="flex items-center gap-1.5 text-[13px] cursor-pointer" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={13} /> Back
      </button>

      <div>
        <h2 className="text-2xl font-extrabold tracking-tighter flex items-center gap-2">
          {playerName}
          {stats.kingTitles > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md"
              style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}>
              <Crown size={10} /> {stats.kingTitles}
            </span>
          )}
        </h2>
        <p className={`mono text-lg font-bold ${moneyClass(stats.totalWinnings)}`}>{formatMoney(stats.totalWinnings)}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 rounded-2xl overflow-hidden" style={{ gap: '1px', background: 'var(--border)' }}>
        {statItems.map(s => (
          <div key={s.label} className="p-5" style={{ background: 'var(--bg)' }}>
            <p className="label-upper mb-1">{s.label}</p>
            <p className="text-lg font-bold mono tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
        <h3 className="text-[15px] font-semibold tracking-tight mb-4">Cumulative Earnings</h3>
        <div className="h-56">
          <ResponsiveContainer key={`pp-${theme}`} width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="game" tick={{ fill: axisColor, fontSize: 11 }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} tickFormatter={v => `$${v}`} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
              <ReferenceLine y={0} stroke={gridColor} strokeDasharray="3 3" />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '10px', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: tooltipText }}
                formatter={(value: any) => [`$${value}`, 'Cumulative']}
                labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.date ? `${label} - ${payload[0].payload.date}` : label} />
              <Line type="monotone" dataKey="cumulative" stroke={color} strokeWidth={2} dot={{ r: 2.5, fill: color }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-[15px] font-semibold tracking-tight">Game Results</h3>
        </div>
        {[...playerGames].reverse().map((g, i, arr) => (
          <div key={g.id} className="flex items-center justify-between px-5 py-3 text-[13px]"
            style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : undefined }}>
            <div className="flex items-center gap-3">
              <span className="mono w-8" style={{ color: 'var(--text-muted)' }}>#{g.id}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{formatDate(g.date)}</span>
              {g.king === playerName && <Crown size={11} style={{ color: 'var(--gold)' }} />}
            </div>
            <span className={`mono font-semibold ${moneyClass(g.results[playerName])}`}>{formatMoney(g.results[playerName])}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-[15px] font-semibold tracking-tight">Head-to-Head</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4" style={{ gap: '1px', background: 'var(--border)' }}>
          {Object.entries(h2h).sort(([, a], [, b]) => b.games - a.games).map(([other, record]) => (
            <button key={other} onClick={() => onNavigate({ type: 'player', name: other })}
              className="p-4 text-center cursor-pointer" style={{ background: 'var(--bg)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}>
              <p className="text-[13px] font-semibold">{other}</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{record.games} games</p>
              <p className={`mono text-[13px] font-semibold mt-1 ${record.myWins > record.games - record.myWins ? 'positive' : 'negative'}`}>
                {record.myWins}W - {record.games - record.myWins}L
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

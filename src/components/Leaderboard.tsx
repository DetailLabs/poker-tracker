import { useState } from 'react'
import type { Page, PlayerStats, PlayerInfo, Game } from '../types'
import { getAllPlayerStats, formatMoney, formatPercent, moneyClass } from '../utils/stats'
import { Crown, ArrowUpDown } from 'lucide-react'

type SortKey = keyof PlayerStats

export function Leaderboard({
  games, players, onNavigate,
}: {
  games: Game[]; players: PlayerInfo[]; onNavigate: (p: Page) => void
}) {
  const [sortKey, setSortKey] = useState<SortKey>('totalWinnings')
  const [sortAsc, setSortAsc] = useState(false)

  const stats = getAllPlayerStats(games, players).sort((a, b) => {
    const av = a[sortKey] as number, bv = b[sortKey] as number
    return sortAsc ? av - bv : bv - av
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(false) }
  }

  const columns: { key: SortKey; label: string; format: (s: PlayerStats) => string }[] = [
    { key: 'totalWinnings', label: 'Total', format: s => formatMoney(s.totalWinnings) },
    { key: 'gamesPlayed', label: 'Games', format: s => String(s.gamesPlayed) },
    { key: 'winRate', label: 'Win %', format: s => formatPercent(s.winRate) },
    { key: 'avgPerGame', label: 'Avg / Game', format: s => formatMoney(s.avgPerGame) },
    { key: 'kingTitles', label: 'Kings', format: s => String(s.kingTitles) },
    { key: 'bestStreak', label: 'Streak', format: s => String(s.bestStreak) },
    { key: 'biggestWin', label: 'Best Win', format: s => s.biggestWin > 0 ? `+$${s.biggestWin}` : '-' },
    { key: 'biggestLoss', label: 'Worst', format: s => s.biggestLoss < 0 ? `-$${Math.abs(s.biggestLoss)}` : '-' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-extrabold tracking-tighter mb-6">Leaderboard</h2>
      <div className="rounded-2xl overflow-x-auto" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left py-3 px-5 label-upper w-10">#</th>
              <th className="text-left py-3 px-5 label-upper">Player</th>
              {columns.map(col => (
                <th key={col.key} className="py-3 px-4 text-right">
                  <button onClick={() => toggleSort(col.key)}
                    className={`inline-flex items-center gap-1 cursor-pointer label-upper ${sortKey === col.key ? '!text-[var(--text)]' : ''}`}>
                    {col.label} <ArrowUpDown size={10} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map((s, i) => (
              <tr key={s.name} className="transition-colors"
                style={{ borderBottom: i < stats.length - 1 ? '1px solid var(--border-subtle)' : undefined }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}>
                <td className="py-3 px-5 font-semibold tabular-nums" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                <td className="py-3 px-5">
                  <button onClick={() => onNavigate({ type: 'player', name: s.name })}
                    className="font-semibold text-[14px] transition-colors flex items-center gap-2 cursor-pointer"
                    style={{ color: 'var(--text)' }}>
                    {s.name}
                    {s.kingTitles > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                        style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}>
                        <Crown size={9} /> {s.kingTitles}
                      </span>
                    )}
                  </button>
                </td>
                {columns.map(col => (
                  <td key={col.key} className={`py-3 px-4 text-right mono font-medium ${
                    col.key === 'totalWinnings' || col.key === 'avgPerGame' ? moneyClass(s[col.key] as number) : ''
                  }`} style={!(col.key === 'totalWinnings' || col.key === 'avgPerGame') ? { color: 'var(--text-secondary)' } : undefined}>
                    {col.format(s)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

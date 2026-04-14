import type { Game, Page, PlayerInfo } from '../types'
import { formatMoney, moneyClass, getAllPlayerStats, formatDate, getPlayerColor } from '../utils/stats'
import { Crown } from 'lucide-react'

export function Dashboard({
  games,
  players,
  onNavigate,
}: {
  games: Game[]
  players: PlayerInfo[]
  onNavigate: (p: Page) => void
}) {
  const stats = getAllPlayerStats(games, players)
  const leader = stats[0]
  const recentGame = [...games].sort((a, b) => b.date.localeCompare(a.date))[0]
  const biggestSingleWin = stats.reduce(
    (best, s) => (s.biggestWin > best.value ? { name: s.name, value: s.biggestWin } : best),
    { name: '', value: 0 }
  )
  const longestStreak = stats.reduce(
    (best, s) => (s.bestStreak > best.value ? { name: s.name, value: s.bestStreak } : best),
    { name: '', value: 0 }
  )

  return (
    <div className="space-y-6">
      {/* Hero Grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 rounded-2xl overflow-hidden"
        style={{ gap: '1px', background: 'var(--border)' }}
      >
        {leader && (
          <div className="row-span-2 p-7 flex flex-col justify-center" style={{ background: 'var(--surface-gradient)' }}>
            <p className="label-upper mb-2">Current King</p>
            <button
              onClick={() => onNavigate({ type: 'player', name: leader.name })}
              className="text-4xl font-extrabold tracking-tighter text-left cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text)' }}
            >
              {leader.name}
            </button>
            <p className="mono text-2xl font-extrabold tracking-tight mt-1" style={{ color: 'var(--positive)' }}>
              {formatMoney(leader.totalWinnings)}
            </p>
            <p className="text-[13px] mt-2" style={{ color: 'var(--text-muted)' }}>
              {leader.gamesPlayed} games &middot; {(leader.winRate * 100).toFixed(1)}% win rate &middot; {leader.bestStreak} game streak
            </p>
          </div>
        )}
        <StatCell label="Games Played" value={String(games.length)} sub="Current season" />
        <StatCell label="Active Players" value={String(stats.length)} sub="across all sessions" />
        <StatCell label="Biggest Win" value={`$${biggestSingleWin.value}`} sub={biggestSingleWin.name} positive />
        <StatCell label="Best Streak" value={`${longestStreak.value}`} sub={longestStreak.name} />
      </div>

      {/* Player Carousel (mobile) */}
      <div className="sm:hidden">
        <p className="label-upper mb-3">Top Players</p>
        <div className="flex gap-3 overflow-x-auto snap-x hide-scrollbar pb-2">
          {stats.slice(0, 8).map((s, i) => (
            <button
              key={s.name}
              onClick={() => onNavigate({ type: 'player', name: s.name })}
              className="shrink-0 w-[140px] rounded-xl p-4 snap-start cursor-pointer"
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold text-white mb-2"
                style={{ background: getPlayerColor(s.name, players) }}>
                {s.name[0]}
              </div>
              <p className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{s.name}</p>
              <p className={`mono text-[12px] font-medium ${moneyClass(s.totalWinnings)}`}>
                {formatMoney(s.totalWinnings)}
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>#{i + 1} &middot; {s.gamesPlayed}g</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Standings */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-[15px] font-semibold tracking-tight">Standings</h2>
            <button onClick={() => onNavigate({ type: 'leaderboard' })}
              className="text-[13px] cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
              View All
            </button>
          </div>
          <div>
            {stats.slice(0, 6).map((s, i) => (
              <button
                key={s.name}
                onClick={() => onNavigate({ type: 'player', name: s.name })}
                className="flex items-center w-full text-left px-5 py-3 transition-colors cursor-pointer"
                style={{
                  borderBottom: i < 5 ? '1px solid var(--border-subtle)' : undefined,
                  ['--tw-bg-opacity' as string]: 1,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <span className="w-7 text-[13px] font-semibold tabular-nums" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                <span className="flex-1 text-[14px] font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  {s.name}
                  {s.kingTitles > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}>
                      <Crown size={10} /> {s.kingTitles}
                    </span>
                  )}
                </span>
                <span className={`mono text-[13px] font-medium ${moneyClass(s.totalWinnings)}`}>
                  {formatMoney(s.totalWinnings)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Game */}
        {recentGame && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-[15px] font-semibold tracking-tight">Latest Game</h2>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Game #{recentGame.id} &middot; {formatDate(recentGame.date)} &middot; {recentGame.location}
              </p>
            </div>
            <div>
              {Object.entries(recentGame.results)
                .sort(([, a], [, b]) => b - a)
                .map(([name, val], i, arr) => (
                  <div key={name} className="flex items-center justify-between px-5 py-3 text-[14px]"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : undefined }}>
                    <span className="flex items-center gap-2">
                      {name === recentGame.king && <Crown size={13} style={{ color: 'var(--gold)' }} />}
                      <span className="font-medium">{name}</span>
                    </span>
                    <span className={`mono text-[13px] font-medium ${moneyClass(val)}`}>{formatMoney(val)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCell({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="p-7" style={{ background: 'var(--bg)' }}>
      <p className="label-upper mb-2">{label}</p>
      <p className="mono text-4xl font-extrabold tracking-tight" style={{ color: positive ? 'var(--positive)' : 'var(--text)' }}>{value}</p>
      {sub && <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

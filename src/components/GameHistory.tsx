import { useState } from 'react'
import type { Game, Page, PlayerInfo } from '../types'
import { formatMoney, formatDate, moneyClass } from '../utils/stats'
import { useAdmin } from '../contexts/AdminContext'
import { Crown, ChevronDown, ChevronUp, MapPin, Trash2 } from 'lucide-react'

export function GameHistory({
  games, players, onNavigate, onDeleteGame,
}: {
  games: Game[]; players: PlayerInfo[]; onNavigate: (p: Page) => void; onDeleteGame: (id: number) => void
}) {
  const { isAdmin } = useAdmin()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filterPlayer, setFilterPlayer] = useState('')

  const sorted = [...games].sort((a, b) => b.date.localeCompare(a.date))
  const filtered = filterPlayer ? sorted.filter(g => filterPlayer in g.results) : sorted
  const activePlayers = players.filter(p => games.some(g => p.name in g.results)).map(p => p.name).sort()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold tracking-tighter">Game History</h2>
        <select value={filterPlayer} onChange={e => setFilterPlayer(e.target.value)}
          className="text-[13px] font-medium px-3 py-1.5 rounded-lg cursor-pointer"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          <option value="">All Players</option>
          {activePlayers.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(game => {
          const expanded = expandedId === game.id
          const sortedResults = Object.entries(game.results).sort(([, a], [, b]) => b - a)
          return (
            <div key={game.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button
                onClick={() => setExpandedId(expanded ? null : game.id)}
                className="w-full px-5 py-3.5 flex items-center gap-4 transition-colors cursor-pointer text-left"
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <span className="text-[13px] mono w-8" style={{ color: 'var(--text-muted)' }}>#{game.id}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold">{formatDate(game.date)}</span>
                    {game.location && (
                      <span className="text-[12px] flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                        <MapPin size={10} /> {game.location}
                      </span>
                    )}
                  </div>
                  {game.notes && <p className="text-[12px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{game.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  {game.king && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1"
                      style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}>
                      <Crown size={10} /> {game.king}
                    </span>
                  )}
                  <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{Object.keys(game.results).length}p</span>
                  {expanded ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                </div>
              </button>
              {expanded && (
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  {sortedResults.map(([name, val], i) => (
                    <button key={name} onClick={() => onNavigate({ type: 'player', name })}
                      className="flex items-center justify-between w-full px-5 py-2.5 text-[13px] cursor-pointer"
                      style={{ borderBottom: i < sortedResults.length - 1 ? '1px solid var(--border-subtle)' : undefined }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <span className="flex items-center gap-2">
                        {name === game.king && <Crown size={11} style={{ color: 'var(--gold)' }} />}
                        <span className="font-medium">{name}</span>
                      </span>
                      <span className={`mono font-medium ${moneyClass(val)}`}>{formatMoney(val)}</span>
                    </button>
                  ))}
                  {isAdmin && (
                    <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                      <button
                        onClick={() => { if (confirm(`Delete Game #${game.id}?`)) onDeleteGame(game.id) }}
                        className="flex items-center gap-1.5 text-[12px] font-medium cursor-pointer"
                        style={{ color: 'var(--negative)' }}>
                        <Trash2 size={12} /> Delete Game
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

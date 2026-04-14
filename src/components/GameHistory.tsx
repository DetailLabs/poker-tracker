import { useState, useEffect, useMemo } from 'react'
import type { Game, Page, PlayerInfo } from '../types'
import { formatMoney, formatDate, moneyClass } from '../utils/stats'
import { useAdmin } from '../contexts/AdminContext'
import { PlayerMultiSelect } from './PlayerMultiSelect'
import { Crown, ChevronDown, ChevronUp, MapPin, Trash2 } from 'lucide-react'

export function GameHistory({
  games, players, onNavigate, onDeleteGame,
}: {
  games: Game[]; players: PlayerInfo[]; onNavigate: (p: Page) => void; onDeleteGame: (id: number) => void
}) {
  const { isAdmin } = useAdmin()
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // Players ordered by game count (most common first) — matches Charts default
  const playersByFrequency = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const g of games) for (const p of Object.keys(g.results)) counts[p] = (counts[p] || 0) + 1
    return Object.entries(counts).sort(([, a], [, b]) => b - a).map(([n]) => n)
  }, [games])

  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(() => new Set(playersByFrequency))

  // Keep selection in sync when filtered range changes
  useEffect(() => {
    const valid = new Set(playersByFrequency)
    setSelectedPlayers(prev => {
      const next = new Set(Array.from(prev).filter(p => valid.has(p)))
      if (next.size === 0) playersByFrequency.forEach(p => next.add(p))
      return next
    })
  }, [playersByFrequency])

  const sorted = [...games].sort((a, b) => b.date.localeCompare(a.date))
  const allSelected = selectedPlayers.size === playersByFrequency.length
  const filtered = allSelected
    ? sorted
    : sorted.filter(g => Object.keys(g.results).some(p => selectedPlayers.has(p)))

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h2 className="text-2xl font-extrabold tracking-tighter">Game History</h2>
        <PlayerMultiSelect
          allPlayers={playersByFrequency}
          selected={selectedPlayers}
          onChange={setSelectedPlayers}
          players={players}
        />
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

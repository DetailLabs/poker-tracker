import { useEffect, useRef, useState } from 'react'
import type { PlayerInfo } from '../types'
import { getPlayerColor } from '../utils/stats'
import { ChevronDown, Check } from 'lucide-react'

export function PlayerMultiSelect({
  allPlayers,
  selected,
  onChange,
  players,
  topN = 5,
}: {
  allPlayers: string[]
  selected: Set<string>
  onChange: (s: Set<string>) => void
  players: PlayerInfo[]
  topN?: number
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

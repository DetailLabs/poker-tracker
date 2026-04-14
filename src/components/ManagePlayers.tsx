import { useState } from 'react'
import type { Game, PlayerInfo } from '../types'
import { playerGamesCount } from '../utils/stats'
import { Trash2, UserPlus, Eye, EyeOff } from 'lucide-react'

export function ManagePlayers({
  games,
  players,
  onUpdatePlayers,
}: {
  games: Game[]
  players: PlayerInfo[]
  onUpdatePlayers: (players: PlayerInfo[]) => void
}) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#22c55e')
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  function addPlayer() {
    if (!newName.trim() || players.some(p => p.name === newName.trim())) return
    onUpdatePlayers([...players, { name: newName.trim(), color: newColor, active: true }])
    setNewName('')
  }

  function deletePlayer(idx: number) {
    const p = players[idx]
    if (playerGamesCount(games, p.name) > 0) return
    onUpdatePlayers(players.filter((_, i) => i !== idx))
  }

  function toggleActive(idx: number) {
    const updated = [...players]
    updated[idx] = { ...updated[idx], active: !updated[idx].active }
    onUpdatePlayers(updated)
  }

  function startEdit(idx: number) {
    setEditingIdx(idx)
    setEditName(players[idx].name)
    setEditColor(players[idx].color)
  }

  function saveEdit() {
    if (editingIdx === null || !editName.trim()) return
    const updated = [...players]
    updated[editingIdx] = { ...updated[editingIdx], name: editName.trim(), color: editColor }
    onUpdatePlayers(updated)
    setEditingIdx(null)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-extrabold tracking-tighter mb-6">Manage Players</h2>

      {/* Add Player */}
      <div className="rounded-2xl p-5 mb-6" style={{ border: '1px solid var(--border)' }}>
        <p className="label-upper mb-3">Add New Player</p>
        <div className="flex gap-2">
          <input
            type="color"
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5"
            style={{ background: 'var(--input-bg)' }}
          />
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPlayer()}
            placeholder="Player name..."
            className="flex-1 rounded-lg px-3 py-2 text-[13px] outline-none"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          <button
            onClick={addPlayer}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer"
            style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
          >
            <UserPlus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Player List */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="grid grid-cols-[auto_1fr_80px_80px_40px_40px] gap-3 items-center text-[11px]">
            <span className="w-4"></span>
            <span className="label-upper">Player</span>
            <span className="label-upper text-center">Games</span>
            <span className="label-upper text-center">Status</span>
            <span></span>
            <span></span>
          </div>
        </div>
        {players.map((p, i) => {
          const gameCount = playerGamesCount(games, p.name)
          const canDelete = gameCount === 0
          const isEditing = editingIdx === i

          return (
            <div
              key={`${p.name}-${i}`}
              className="px-5 py-3 grid grid-cols-[auto_1fr_80px_80px_40px_40px] gap-3 items-center"
              style={{ borderBottom: i < players.length - 1 ? '1px solid var(--border-subtle)' : undefined }}
            >
              <div className="w-4 h-4 rounded" style={{ background: p.color }} />
              {isEditing ? (
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={editColor}
                    onChange={e => setEditColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                    className="flex-1 rounded px-2 py-1 text-[13px] outline-none"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    autoFocus
                  />
                  <button onClick={saveEdit} className="text-[11px] font-semibold cursor-pointer" style={{ color: 'var(--positive)' }}>Save</button>
                  <button onClick={() => setEditingIdx(null)} className="text-[11px] cursor-pointer" style={{ color: 'var(--text-muted)' }}>Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(i)}
                  className="text-[14px] font-semibold text-left cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ color: p.active ? 'var(--text)' : 'var(--text-muted)', opacity: p.active ? 1 : 0.5 }}
                >
                  {p.name}
                </button>
              )}
              <span className="text-center mono text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                {gameCount}
              </span>
              <span className="text-center text-[11px] font-medium" style={{ color: p.active ? 'var(--positive)' : 'var(--text-muted)' }}>
                {p.active ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => toggleActive(i)}
                className="p-1 rounded cursor-pointer hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
                title={p.active ? 'Deactivate' : 'Activate'}
              >
                {p.active ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => canDelete && deletePlayer(i)}
                className={`p-1 rounded ${canDelete ? 'cursor-pointer hover:opacity-70' : 'cursor-not-allowed opacity-20'}`}
                style={{ color: canDelete ? 'var(--negative)' : 'var(--text-muted)' }}
                title={canDelete ? 'Delete player' : `Can't delete — ${gameCount} games recorded`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

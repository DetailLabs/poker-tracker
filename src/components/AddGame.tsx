import { useState } from 'react'
import type { Game, PlayerInfo } from '../types'
import { PlusCircle, Trash2, AlertCircle, CheckCircle } from 'lucide-react'

export function AddGame({
  games, players, onAddGame,
}: {
  games: Game[]; players: PlayerInfo[]; onAddGame: (game: Game) => void
}) {
  const nextId = Math.max(...games.map(g => g.id), 0) + 1
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [rows, setRows] = useState<{ player: string; amount: string }[]>([
    { player: '', amount: '' }, { player: '', amount: '' },
  ])
  const [submitted, setSubmitted] = useState(false)

  const activePlayers = players.filter(p => p.active).map(p => p.name).sort()
  const usedPlayers = rows.map(r => r.player).filter(Boolean)
  const total = rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  const isBalanced = Math.abs(total) < 0.5
  const validRows = rows.filter(r => r.player && r.amount)

  function addRow() { setRows([...rows, { player: '', amount: '' }]) }
  function removeRow(i: number) { setRows(rows.filter((_, idx) => idx !== i)) }
  function updateRow(i: number, field: 'player' | 'amount', value: string) {
    const updated = [...rows]; updated[i] = { ...updated[i], [field]: value }; setRows(updated)
  }

  function handleSubmit() {
    if (validRows.length < 2) return
    const results: Record<string, number> = {}
    for (const r of validRows) results[r.player] = parseFloat(r.amount)
    const king = Object.entries(results).sort(([, a], [, b]) => b - a)[0][0]
    onAddGame({ id: nextId, date, results, location, notes, king })
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); setRows([{ player: '', amount: '' }, { player: '', amount: '' }]); setNotes('') }, 2000)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <CheckCircle size={40} style={{ color: 'var(--positive)' }} className="mb-4" />
        <h2 className="text-lg font-semibold">Game #{nextId} Added</h2>
        <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>The leaderboard has been updated.</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-extrabold tracking-tighter mb-6">Add New Game</h2>
      <div className="rounded-2xl p-6 space-y-5" style={{ border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-upper block mb-1.5">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
          <div>
            <label className="label-upper block mb-1.5">Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Nathan's"
              className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          </div>
        </div>
        <div>
          <label className="label-upper block mb-1.5">Notes</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Game night notes..."
            className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        </div>
        <div>
          <label className="label-upper block mb-2">Player Results</label>
          <div className="space-y-2">
            {rows.map((row, i) => (
              <div key={i} className="flex gap-2">
                <select value={row.player} onChange={e => updateRow(i, 'player', e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2.5 text-[13px]"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option value="">Select player...</option>
                  {activePlayers.filter(p => p === row.player || !usedPlayers.includes(p)).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <input type="number" value={row.amount} onChange={e => updateRow(i, 'amount', e.target.value)}
                  placeholder="$0" step="0.5"
                  className="w-28 rounded-lg px-3 py-2.5 text-[13px] text-right mono outline-none"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                {rows.length > 2 && (
                  <button onClick={() => removeRow(i)} className="p-2 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addRow} className="mt-2 flex items-center gap-1 text-[13px] cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
            <PlusCircle size={13} /> Add Player
          </button>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg mono text-[13px]"
          style={{
            color: isBalanced ? 'var(--positive)' : 'var(--gold)',
            background: isBalanced ? 'rgba(74,222,128,0.06)' : 'rgba(234,179,8,0.06)',
            border: `1px solid ${isBalanced ? 'rgba(74,222,128,0.15)' : 'rgba(234,179,8,0.15)'}`,
          }}>
          {isBalanced ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          Net: ${total.toFixed(1)} {isBalanced ? '(balanced)' : '(not balanced)'}
        </div>
        <button onClick={handleSubmit} disabled={validRows.length < 2}
          className="w-full py-2.5 rounded-lg text-[14px] font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
          style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}>
          Save Game #{nextId}
        </button>
      </div>
    </div>
  )
}

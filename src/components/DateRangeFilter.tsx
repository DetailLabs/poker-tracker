import { useEffect, useRef, useState } from 'react'
import { Calendar } from 'lucide-react'
import type { DateRange } from '../types'

export function DateRangeFilter({
  range,
  onChange,
  years,
}: {
  range: DateRange
  onChange: (r: DateRange) => void
  years: number[]
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

  function setYear(y: number) {
    onChange({ from: `${y}-01-01`, to: `${y}-12-31` })
  }
  const activeYear = range.from.slice(0, 4) === range.to.slice(0, 4) ? range.from.slice(0, 4) : ''
  const label = activeYear || `${range.from} → ${range.to}`

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-lg cursor-pointer hover:opacity-70 transition-opacity"
        style={{ color: 'var(--text-secondary)' }}
        title={`Date range: ${label}`}
      >
        <Calendar size={15} />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 p-3 rounded-xl z-50 min-w-[260px]"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
        >
          <p className="label-upper mb-2">Date Range</p>
          {years.length > 0 && (
            <div className="flex flex-wrap p-[3px] rounded-[10px] mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className="px-3 py-[6px] rounded-[7px] text-[12px] font-medium cursor-pointer transition-colors"
                  style={{
                    color: activeYear === String(y) ? 'var(--text)' : 'var(--text-secondary)',
                    background: activeYear === String(y) ? 'var(--nav-active)' : undefined,
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="flex items-center justify-between gap-2 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              <span>From</span>
              <input
                type="date"
                value={range.from}
                onChange={e => onChange({ ...range, from: e.target.value })}
                className="px-2 py-[6px] rounded-[7px] text-[12px] mono cursor-pointer"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              <span>To</span>
              <input
                type="date"
                value={range.to}
                onChange={e => onChange({ ...range, to: e.target.value })}
                className="px-2 py-[6px] rounded-[7px] text-[12px] mono cursor-pointer"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import { X } from 'lucide-react'

export function AdminLogin({ onClose }: { onClose: () => void }) {
  const { login } = useAdmin()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (login(password)) {
      onClose()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm mx-4 rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold">Admin Access</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter admin password"
            autoFocus
            className="w-full rounded-lg px-3 py-2.5 text-[13px] mb-3 outline-none"
            style={{ background: 'var(--input-bg)', border: `1px solid ${error ? 'var(--negative)' : 'var(--border)'}`, color: 'var(--text)' }}
          />
          {error && <p className="text-[12px] mb-3" style={{ color: 'var(--negative)' }}>Incorrect password</p>}
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-[13px] font-medium cursor-pointer"
            style={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  )
}

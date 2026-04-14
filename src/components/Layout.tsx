import { useState } from 'react'
import type { Page } from '../types'
import { useTheme } from '../contexts/ThemeContext'
import { useAdmin } from '../contexts/AdminContext'
import { AdminLogin } from './AdminLogin'
import { LayoutDashboard, Trophy, History, PlusCircle, BarChart3, Users, Sun, Moon, Lock, Unlock } from 'lucide-react'

const viewerTabs: { type: Page['type']; label: string; icon: typeof LayoutDashboard }[] = [
  { type: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { type: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { type: 'history', label: 'Games', icon: History },
  { type: 'charts', label: 'Charts', icon: BarChart3 },
]

const adminTabs: { type: Page['type']; label: string; icon: typeof LayoutDashboard }[] = [
  { type: 'addGame', label: '+ Game', icon: PlusCircle },
  { type: 'managePlayers', label: 'Players', icon: Users },
]

export function Layout({
  page,
  onNavigate,
  children,
  headerExtra,
}: {
  page: Page
  onNavigate: (p: Page) => void
  children: React.ReactNode
  headerExtra?: React.ReactNode
}) {
  const { theme, toggleTheme } = useTheme()
  const { isAdmin, logout } = useAdmin()
  const [showLogin, setShowLogin] = useState(false)

  const tabs = isAdmin ? [...viewerTabs, ...adminTabs] : viewerTabs

  function isTabActive(t: Page['type']) {
    return page.type === t || (t === 'leaderboard' && page.type === 'player')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3 flex sm:grid sm:grid-cols-[1fr_auto_1fr] items-center gap-2">
          <button
            onClick={() => onNavigate({ type: 'dashboard' })}
            className="flex items-center gap-2.5 cursor-pointer shrink-0 flex-1 sm:flex-initial justify-self-start"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[16px]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text)' }}>&#9824;</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Poker Tracker</span>
          </button>

          {/* Desktop tab bar */}
          <nav className="hidden sm:flex p-[3px] rounded-[10px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {tabs.map(t => {
              const isActive = isTabActive(t.type)
              return (
                <button
                  key={t.type}
                  onClick={() => onNavigate({ type: t.type } as Page)}
                  className="flex items-center gap-1.5 px-3.5 py-[7px] rounded-[7px] text-[13px] font-medium transition-colors cursor-pointer"
                  style={{
                    color: isActive ? 'var(--text)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--nav-active)' : undefined,
                  }}
                >
                  <span>{t.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-1 shrink-0 sm:justify-self-end">
            {headerExtra}
            <button onClick={toggleTheme} className="p-2 rounded-lg cursor-pointer hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={() => isAdmin ? logout() : setShowLogin(true)}
              className="p-2 rounded-lg cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: isAdmin ? 'var(--positive)' : 'var(--text-muted)' }}
              title={isAdmin ? 'Admin mode (click to logout)' : 'Viewer mode (click to login)'}
            >
              {isAdmin ? <Unlock size={15} /> : <Lock size={15} />}
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-5 py-6 sm:py-8 pb-24 sm:pb-8 animate-in">
        {children}
      </main>

      {/* Mobile floating pill nav */}
      <nav
        className="sm:hidden fixed left-1/2 z-50 flex items-center gap-0.5 p-1.5 rounded-full"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
          transform: 'translateX(-50%)',
          background: 'var(--float-nav-bg)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {tabs.map(t => {
          const Icon = t.icon
          const isActive = isTabActive(t.type)
          return (
            <button
              key={t.type}
              onClick={() => onNavigate({ type: t.type } as Page)}
              className="flex items-center justify-center cursor-pointer transition-colors rounded-full"
              aria-label={t.label}
              title={t.label}
              style={{
                width: 44,
                height: 32,
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                background: isActive ? 'var(--nav-active)' : 'transparent',
              }}
            >
              <Icon size={16} />
            </button>
          )
        })}
      </nav>

      {showLogin && <AdminLogin onClose={() => setShowLogin(false)} />}
    </div>
  )
}

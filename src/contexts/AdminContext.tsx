import { createContext, useContext, useState } from 'react'

const ADMIN_HASH = 'poker2025'

const AdminContext = createContext<{
  isAdmin: boolean
  login: (password: string) => boolean
  logout: () => void
}>({ isAdmin: false, login: () => false, logout: () => {} })

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('poker-admin') === 'true'
  })

  const login = (password: string) => {
    if (password === ADMIN_HASH) {
      setIsAdmin(true)
      localStorage.setItem('poker-admin', 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAdmin(false)
    localStorage.removeItem('poker-admin')
  }

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)

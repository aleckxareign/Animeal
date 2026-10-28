import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type AuthContextType = {
  isLoggedIn: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('animeal-logged-in') === 'true',
  )

  const login = () => {
    localStorage.setItem('animeal-logged-in', 'true')
    setIsLoggedIn(true)
  }

  const logout = () => {
    localStorage.removeItem('animeal-logged-in')
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
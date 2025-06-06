import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { authApi } from '../auth.api'

type AuthContextType = {
  isAuthenticated: boolean
  login: (tgUsername: string, code?: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tgUsername, setTgUsername] = useState<string>('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (username: string, code?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      if (!code) {
        await authApi.sendCode({ tg_username: username })
        setTgUsername(username)
      } else {
        const response = await authApi.verify({ tg_username: username, code })

        localStorage.setItem('access_token', response.access_token)
        localStorage.setItem('refresh_token', response.refresh_token)
        setIsAuthenticated(true)
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при авторизации')
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const accessToken = localStorage.getItem('access_token')
      const refreshToken = localStorage.getItem('refresh_token')

      if (!accessToken || !refreshToken) {
        throw new Error('No access token found')
      }

      // Отправляем запрос на выход
      await authApi.logout(accessToken, refreshToken)
      
      // Очищаем локальное хранилище
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setIsAuthenticated(false)
    } catch (err) {
      console.error('Ошибка при выходе:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, error, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

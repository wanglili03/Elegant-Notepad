"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { User, AuthContextType } from '@/types'
import toast from 'react-hot-toast'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const token = Cookies.get('auth-token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
        } else {
          Cookies.remove('auth-token')
        }
      } else {
        Cookies.remove('auth-token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      Cookies.remove('auth-token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        Cookies.set('auth-token', data.token, { expires: 7 }) // 7天过期
        toast.success('登录成功！')
        return true
      } else {
        toast.error(data.error || '登录失败')
        return false
      }
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('登录失败，请重试')
      return false
    }
  }

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        Cookies.set('auth-token', data.token, { expires: 7 })
        toast.success('注册成功！')
        return true
      } else {
        toast.error(data.error || '注册失败')
        return false
      }
    } catch (error) {
      console.error('Register failed:', error)
      toast.error('注册失败，请重试')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    Cookies.remove('auth-token')
    toast.success('已退出登录')
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 
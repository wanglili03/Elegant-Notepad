export interface Note {
  id: string
  title: string
  content: string
  isPasswordProtected: boolean
  passwordHash?: string
  createdAt: string
  updatedAt: string
  shortUrl?: string
  userId?: string  // 添加用户ID字段
}

export interface CreateNoteRequest {
  title: string
  content: string
  password?: string
}

export interface UpdateNoteRequest {
  title?: string
  content?: string
  password?: string
}

export interface NoteAccess {
  noteId: string
  hasAccess: boolean
  isPasswordProtected: boolean
}

export interface ShareableNote {
  id: string
  title: string
  content: string
  shortUrl: string
  createdAt: string
  isPasswordProtected: boolean
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface RedisConfig {
  url: string
  token: string
}

export type Theme = 'light' | 'dark' | 'system'

export interface ToastOptions {
  type: 'success' | 'error' | 'loading' | 'info'
  title: string
  description?: string
}

// 新增用户认证相关类型
export interface User {
  id: string
  username: string
  passwordHash: string
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: {
    id: string
    username: string
  }
  token?: string
  error?: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
}
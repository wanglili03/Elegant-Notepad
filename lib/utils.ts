import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ID generation
export function generateId(): string {
  return nanoid(12)
}

// Short URL generation
export function generateShortUrl(): string {
  return nanoid(8)
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Password verification
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// Content sanitization
export function sanitizeTitle(title: string): string {
  return title.trim().slice(0, 200)
}

export function sanitizeContent(content: string): string {
  // Limit content to 50KB
  const maxLength = 50 * 1024
  return content.slice(0, maxLength)
}

// Date utilities
export function calculateExpiryDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

export function isExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

export function formatDate(dateString: string): string {
  if (!dateString) return '未知时间'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '未知时间'
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatRelativeTime(dateString: string): string {
  if (!dateString) return '未知时间'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '未知时间'
  
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) return '刚刚'
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
  if (diffInHours < 24) return `${diffInHours}小时前`
  if (diffInDays < 7) return `${diffInDays}天前`
  
  return formatDate(dateString)
}

// File download utilities
export function downloadMarkdown(title: string, content: string): void {
  const markdown = `# ${title}\n\n${content}\n\n---\n*由优雅记事本创建*`
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitizeFilename(title)}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^\w\s-]/g, '').trim().slice(0, 50) || 'untitled'
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    return success
  }
}

// URL utilities
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export function getShareUrl(shortUrl: string): string {
  return `${getBaseUrl()}/s/${shortUrl}`
}

// Validation utilities
export function validateTitle(title: string): { isValid: boolean; error?: string } {
  if (!title.trim()) {
    return { isValid: false, error: '标题不能为空' }
  }
  if (title.length > 200) {
    return { isValid: false, error: '标题不能超过200个字符' }
  }
  return { isValid: true }
}

export function validateContent(content: string): { isValid: boolean; error?: string } {
  if (content.length > 50 * 1024) {
    return { isValid: false, error: '内容不能超过50KB' }
  }
  return { isValid: true }
}

export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < 4) {
    return { isValid: false, error: '密码至少需要4个字符' }
  }
  if (password.length > 128) {
    return { isValid: false, error: '密码不能超过128个字符' }
  }
  return { isValid: true }
}

// Theme utilities
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Error handling
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return '发生未知错误'
} 
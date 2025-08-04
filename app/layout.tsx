import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/components/AuthProvider'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: '优雅记事本 - 现代化、安全、美观的记事本应用',
  description: '现代化、安全、美观的记事本应用，支持密码保护、分享功能和优雅设计。基于 Next.js 14 构建，部署在 Vercel 上，使用 Upstash Redis 存储。',
  keywords: ['记事本', '笔记', '密码保护', '分享', 'Next.js', 'React'],
  authors: [{ name: '优雅记事本团队' }],
  openGraph: {
    title: '优雅记事本',
    description: '现代化、安全、美观的记事本应用',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: '优雅记事本',
    description: '现代化、安全、美观的记事本应用',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
              {children}
            </div>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 
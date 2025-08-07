"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun, FileText, Home, List, User, LogOut, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/LoginModal"
import { useAuth } from "@/components/AuthProvider"
import { cn } from "@/lib/utils"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { user, logout, isLoading } = useAuth()
  const [mounted, setMounted] = React.useState(false)
  const [showLoginModal, setShowLoginModal] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <span className="text-xl font-bold text-gradient">金金咩记事本</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <Link
                  href="/"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  <Home className="h-4 w-4 inline mr-1" />
                  首页
                </Link>
                <Link
                  href="/notes"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  <List className="h-4 w-4 inline mr-1" />
                  我的笔记
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-2">
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                      欢迎, {user.username}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="h-9"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">退出</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLoginModal(true)}
                    className="h-9"
                  >
                    <LogIn className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">登录</span>
                  </Button>
                )}
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">切换主题</span>
            </Button>
          </div>
        </div>
      </header>

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />
    </>
  )
} 

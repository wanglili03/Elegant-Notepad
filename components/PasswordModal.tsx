"use client"

import * as React from "react"
import { Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/ui/loading"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerify: (password: string) => Promise<boolean>
  title?: string
  description?: string
}

export function PasswordModal({ 
  open, 
  onOpenChange, 
  onVerify,
  title = "输入密码",
  description = "此内容受密码保护，请输入正确的密码"
}: PasswordModalProps) {
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim()) {
      setError('请输入密码')
      return
    }

    setIsVerifying(true)
    setError('')
    
    try {
      const success = await onVerify(password)
      if (success) {
        setPassword('')
        setError('')
      } else {
        setError('密码错误，请重试')
      }
    } catch (error) {
      setError('验证失败，请重试')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    setShowPassword(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="输入密码..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                className={error ? 'border-destructive pr-10' : 'pr-10'}
                disabled={isVerifying}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isVerifying}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "隐藏密码" : "显示密码"}
                </span>
              </Button>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isVerifying}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isVerifying || !password.trim()}
            >
              {isVerifying ? (
                <Loading size="sm" text="验证中..." />
              ) : (
                '确认'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
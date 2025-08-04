"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MarkdownEditor } from "@/components/ui/markdown-editor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/ui/loading"
import { LoginModal } from "@/components/LoginModal"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/components/AuthProvider"
import { validateTitle, validateContent, validatePassword } from "@/lib/utils"
import toast from "react-hot-toast"

interface CreateNoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateNoteModal({ open, onOpenChange }: CreateNoteModalProps) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showLoginModal, setShowLoginModal] = React.useState(false)
  const [formData, setFormData] = React.useState({
    title: '',
    content: '',
    password: ''
  })
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // 保存表单数据，用于登录后恢复
  const [savedFormData, setSavedFormData] = React.useState<typeof formData | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 检查用户是否已登录
    if (!user && !authLoading) {
      // 保存当前表单数据
      setSavedFormData(formData)
      // 显示登录模态框
      setShowLoginModal(true)
      return
    }
    
    // Validate form
    const newErrors: Record<string, string> = {}
    
    const titleValidation = validateTitle(formData.title)
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error!
    }
    
    const contentValidation = validateContent(formData.content)
    if (!contentValidation.isValid) {
      newErrors.content = contentValidation.error!
    }
    
    if (formData.password) {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.error!
      }
    }
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0] || ''}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          password: formData.password || undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('笔记创建成功！')
        handleClose()
        router.push(`/note/${result.data.id}`)
      } else {
        toast.error(result.error || '创建笔记失败')
      }
    } catch (error) {
      console.error('创建笔记出错:', error)
      toast.error('创建笔记失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ title: '', content: '', password: '' })
    setSavedFormData(null)
    setShowAdvanced(false)
    setErrors({})
    onOpenChange(false)
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    // 恢复之前保存的表单数据
    if (savedFormData) {
      setFormData(savedFormData)
      setSavedFormData(null)
      // 自动提交表单
      setTimeout(() => {
        const form = document.querySelector('form') as HTMLFormElement
        if (form) {
          form.requestSubmit()
        }
      }, 100)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">创建新笔记</DialogTitle>
            <DialogDescription>
              填写笔记信息，可选择设置密码保护和过期时间
              {!user && !authLoading && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400">
                  提示：需要登录才能创建笔记
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                标题 <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                placeholder="输入笔记标题..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                内容
              </label>
              <MarkdownEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value || '' })}
                placeholder="开始写作..."
                className={errors.content ? 'border-destructive' : ''}
                height={300}
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.content.length} / 51200 字符
              </p>
            </div>

            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full"
              >
                {showAdvanced ? '隐藏' : '显示'}高级选项
              </Button>

              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        密码保护
                      </CardTitle>
                      <CardDescription>
                        设置密码后，只有知道密码的人才能查看笔记
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Input
                        type="password"
                        placeholder="设置访问密码（可选）"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={errors.password ? 'border-destructive' : ''}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive mt-1">{errors.password}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                取消
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || authLoading}
              >
                {isLoading ? (
                  <Loading size="sm" text="创建中..." />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {!user && !authLoading ? '登录并创建' : '创建笔记'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccess={handleLoginSuccess}
      />
    </>
  )
} 
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Download, 
  Lock, 
  Calendar,
  Clock,
  Share2,
  Copy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loading } from "@/components/ui/loading"
import { Header } from "@/components/Header"
import { PasswordModal } from "@/components/PasswordModal"
import { Note } from "@/types"
import { 
  formatDate, 
  formatRelativeTime, 
  downloadMarkdown, 
  copyToClipboard, 
  getShareUrl
} from "@/lib/utils"
import toast from "react-hot-toast"

interface SharePageProps {
  params: { shortUrl: string }
}

export default function SharePage({ params }: SharePageProps) {
  const router = useRouter()
  const [note, setNote] = React.useState<Note | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [showPassword, setShowPassword] = React.useState(false)
  const [hasAccess, setHasAccess] = React.useState(false)
  
  // 内容统计状态
  const [totalLines, setTotalLines] = React.useState(0)
  const [totalCharacters, setTotalCharacters] = React.useState(0)

  // 计算内容统计
  const calculateStats = (content: string) => {
    const lines = content.split('\n').length
    const characters = content.length
    setTotalLines(lines)
    setTotalCharacters(characters)
  }

  // Load note data
  React.useEffect(() => {
    loadNote()
  }, [params.shortUrl])

  const loadNote = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/short/${params.shortUrl}`)
      const result = await response.json()

      if (result.success && result.note) {
        setNote(result.note)
        
        if (result.note.isPasswordProtected) {
          setHasAccess(false)
          setShowPassword(true)
        } else {
          setHasAccess(true)
          // 计算内容统计
          calculateStats(result.note.content || '')
        }
      } else {
        setNote(null)
      }
    } catch (error) {
      console.error('加载笔记出错:', error)
      toast.error('加载笔记失败')
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordVerify = async (password: string) => {
    if (!note) return false

    try {
      const response = await fetch(`/api/notes/${note.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const result = await response.json()
      
      if (result.success) {
        setHasAccess(true)
        setShowPassword(false)
        
        // 密码验证成功后，重新获取完整笔记内容
        try {
          const fullNoteResponse = await fetch(`/api/notes/${note.id}`)
          const fullNoteResult = await fullNoteResponse.json()
          
          console.log('获取完整笔记内容响应:', fullNoteResult)
          
          if (fullNoteResult.success && fullNoteResult.data) {
            setNote(fullNoteResult.data)
            setHasAccess(true)
            setShowPassword(false)
            // 计算内容统计
            calculateStats(fullNoteResult.data.content || '')
            toast.success('密码验证成功')
          } else {
            console.error('获取笔记内容失败:', fullNoteResult)
            toast.error('获取笔记内容失败')
          }
        } catch (error) {
          console.error('获取完整笔记内容失败:', error)
          toast.error('获取笔记内容失败')
        }
        
        return true
      } else {
        toast.error('密码错误')
        return false
      }
    } catch (error) {
      toast.error('验证失败，请重试')
      return false
    }
  }

  const handleShare = async () => {
    if (!note?.shortUrl) return
    
    const shareUrl = getShareUrl(note.shortUrl)
    const success = await copyToClipboard(shareUrl)
    
    if (success) {
      toast.success('分享链接已复制到剪贴板')
    } else {
      toast.error('复制失败，请手动复制')
    }
  }

  const handleDownload = () => {
    if (!note) return
    downloadMarkdown(note.title, note.content)
    toast.success('文件下载成功')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Loading size="lg" text="加载中..." />
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">笔记不存在</h1>
          <p className="text-muted-foreground mb-6">
            此笔记可能已被删除或链接已过期
          </p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Button>

            {hasAccess && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  复制链接
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  下载
                </Button>
              </div>
            )}
          </div>

          {hasAccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Share Info Banner */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm font-medium">通过分享链接访问</span>
                  </div>
                </CardHeader>
              </Card>

              {/* Note Info */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        创建于 {formatDate(note.createdAt)}
                      </div>
                      {note.updatedAt !== note.createdAt && (
                        <span>• 更新于 {formatRelativeTime(note.updatedAt)}</span>
                      )}
                      {/* 添加统计信息 */}
                      <div className="flex items-center gap-4 text-xs">
                        <span>{totalLines} 行</span>
                        <span>{totalCharacters} 字符</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {note.isPasswordProtected && (
                        <div className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                          <Lock className="h-3 w-3" />
                          受保护
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Note Content */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <h1 className="text-3xl font-bold">{note.title}</h1>
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                        {note.content || '这个笔记还没有内容...'}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Footer */}
              <Card className="border-muted">
                <CardContent className="p-4">
                  <div className="text-center text-sm text-muted-foreground">
                    <p>此笔记通过 <span className="font-medium text-primary">优雅记事本</span> 分享</p>
                    <p className="mt-1">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => router.push('/')}
                        className="h-auto p-0 text-xs"
                      >
                        创建您自己的笔记 →
                      </Button>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">此笔记受密码保护</h2>
              <p className="text-muted-foreground mb-6">请输入密码以查看内容</p>
              <Button onClick={() => setShowPassword(true)}>
                输入密码
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 优雅记事本. Made with ❤️ for secure and elegant note-taking.</p>
          </div>
        </div>
      </footer>

      <PasswordModal
        open={showPassword}
        onOpenChange={setShowPassword}
        onVerify={handlePasswordVerify}
        title="输入密码"
        description="此笔记受密码保护，请输入正确的密码以查看内容"
      />
    </div>
  )
} 
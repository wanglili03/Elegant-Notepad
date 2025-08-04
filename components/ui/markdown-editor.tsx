"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"

// 动态导入MDEditor以避免SSR问题
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
)

interface MarkdownEditorProps {
  value?: string
  onChange?: (value?: string) => void
  placeholder?: string
  className?: string
  preview?: 'edit' | 'preview' | 'live'
  height?: number
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "开始写作...",
  className,
  preview = 'edit',
  height = 400
}: MarkdownEditorProps) {
  const [mounted, setMounted] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (mounted && containerRef.current) {
      // 动态添加选中样式
      const style = document.createElement('style')
      style.textContent = `
        .custom-md-editor .w-md-editor-text-textarea::selection,
        .custom-md-editor .w-md-editor-text-pre::selection,
        .custom-md-editor .w-md-editor-text-input::selection,
        .custom-md-editor .w-md-editor-text::selection,
        .custom-md-editor textarea::selection {
          background: #3b82f6 !important;
          color: #ffffff !important;
        }
        .custom-md-editor .w-md-editor-text-textarea::-moz-selection,
        .custom-md-editor .w-md-editor-text-pre::-moz-selection,
        .custom-md-editor .w-md-editor-text-input::-moz-selection,
        .custom-md-editor .w-md-editor-text::-moz-selection,
        .custom-md-editor textarea::-moz-selection {
          background: #3b82f6 !important;
          color: #ffffff !important;
        }
      `
      document.head.appendChild(style)
      return () => {
        document.head.removeChild(style)
      }
    }
  }, [mounted])

  if (!mounted) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center border border-input rounded-md",
          className
        )}
        style={{ 
          height,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
        }}
      >
        <div className="text-gray-300">加载编辑器中...</div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn("w-full custom-md-editor", className)}>
      <MDEditor
        value={value}
        onChange={onChange}
        preview={preview}
        height={height}
        data-color-mode="dark"
        textareaProps={{
          placeholder,
          style: {
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            color: '#e2e8f0',
            border: 'none',
            resize: 'none'
          }
        }}
        previewOptions={{
          style: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            color: '#e2e8f0'
          }
        }}
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        }}
      />
    </div>
  )
} 
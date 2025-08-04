import { NextRequest, NextResponse } from 'next/server'
import { Note, ApiResponse } from '@/types'
import { getNote, saveNote, getRedisInstance } from '@/lib/redis'
import { hashPassword } from '@/lib/utils'
import { getUserFromRequest } from '@/lib/auth'

// 设置笔记密码
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Note>>> {
  try {
    const noteId = params.id
    
    if (!noteId) {
      return NextResponse.json(
        { success: false, error: '笔记 ID 是必需的' },
        { status: 400 }
      )
    }

    // 验证用户身份
    const userPayload = await getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const note = await getNote(noteId)
    
    if (!note) {
      return NextResponse.json(
        { success: false, error: '笔记未找到' },
        { status: 404 }
      )
    }

    // 检查权限
    if (note.userId !== userPayload.userId) {
      return NextResponse.json(
        { success: false, error: '没有权限修改此笔记' },
        { status: 403 }
      )
    }

    const { password } = await request.json()
    
    if (!password || password.length < 4) {
      return NextResponse.json(
        { success: false, error: '密码长度至少4位' },
        { status: 400 }
      )
    }

    // 加密密码并更新笔记
    const hashedPassword = await hashPassword(password)
    const updatedNote: Note = {
      ...note,
      passwordHash: hashedPassword,
      isPasswordProtected: true,
      updatedAt: new Date().toISOString()
    }

    await saveNote(updatedNote)

    // 返回时不包含密码哈希
    const { passwordHash: _, ...noteWithoutPassword } = updatedNote

    return NextResponse.json({
      success: true,
      data: noteWithoutPassword
    })

  } catch (error) {
    console.error('设置密码失败:', error)
    return NextResponse.json(
      { success: false, error: '设置密码失败' },
      { status: 500 }
    )
  }
}

// 移除笔记密码
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Note>>> {
  try {
    const noteId = params.id
    
    if (!noteId) {
      return NextResponse.json(
        { success: false, error: '笔记 ID 是必需的' },
        { status: 400 }
      )
    }

    // 验证用户身份
    const userPayload = await getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const note = await getNote(noteId)
    
    if (!note) {
      return NextResponse.json(
        { success: false, error: '笔记未找到' },
        { status: 404 }
      )
    }

    // 检查权限
    if (note.userId !== userPayload.userId) {
      return NextResponse.json(
        { success: false, error: '没有权限修改此笔记' },
        { status: 403 }
      )
    }

    // 移除密码
    const updatedNote: Note = {
      ...note,
      passwordHash: undefined,
      isPasswordProtected: false,
      updatedAt: new Date().toISOString()
    }

    await saveNote(updatedNote)

    return NextResponse.json({
      success: true,
      data: updatedNote
    })

  } catch (error) {
    console.error('移除密码失败:', error)
    return NextResponse.json(
      { success: false, error: '移除密码失败' },
      { status: 500 }
    )
  }
} 
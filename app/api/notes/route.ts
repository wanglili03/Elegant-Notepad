import { NextRequest, NextResponse } from 'next/server'
import { saveNote, getRedisInstance, getNotesByIds } from '@/lib/redis'
import { getUserFromRequest } from '@/lib/auth'
import { generateId, generateShortUrl, sanitizeTitle, sanitizeContent, hashPassword } from '@/lib/utils'
import { CreateNoteRequest, Note, ApiResponse } from '@/types'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Note>>> {
  try {
    // 验证用户认证
    const userPayload = getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: '需要登录才能创建笔记' },
        { status: 401 }
      )
    }

    const body = await request.json() as CreateNoteRequest
    
    // Validate input
    if (!body.title?.trim()) {
      return NextResponse.json(
        { success: false, error: '标题是必需的' },
        { status: 400 }
      )
    }

    // Create new note
    const noteId = generateId()
    const now = new Date().toISOString()
    
    const note: Note = {
      id: noteId,
      title: sanitizeTitle(body.title),
      content: sanitizeContent(body.content || ''),
      isPasswordProtected: false,
      createdAt: now,
      updatedAt: now,
      userId: userPayload.userId, // 添加用户ID
    }

    // Handle password protection
    if (body.password?.trim()) {
      note.isPasswordProtected = true
      note.passwordHash = await hashPassword(body.password)
    }

    // Generate short URL
    note.shortUrl = generateShortUrl()

    // Save to Redis
    await saveNote(note)

    // Add to user's notes index
    const redis = getRedisInstance()
    await redis.sadd(`user:${userPayload.userId}:notes`, noteId)

    // Don't return password hash in response
    const responseNote = { ...note }
    delete responseNote.passwordHash

    return NextResponse.json({
      success: true,
      data: responseNote
    })

  } catch (error) {
    console.error('创建笔记出错:', error)
    return NextResponse.json(
      { success: false, error: '创建笔记失败，请重试' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Note[]>>> {
  try {
    // 验证用户认证
    const userPayload = getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: '需要登录才能查看笔记列表' },
        { status: 401 }
      )
    }

    const redis = getRedisInstance()

    // 获取用户的笔记ID列表
    const userNoteIds = await redis.smembers(`user:${userPayload.userId}:notes`)
    
    if (!Array.isArray(userNoteIds) || userNoteIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // 获取笔记详情
    const notes = await getNotesByIds(userNoteIds.map(id => String(id)))
    
    // 过滤掉密码哈希，并按创建时间排序
    const safeNotes = notes
      .filter(note => note.userId === userPayload.userId) // 额外安全检查
      .map(note => {
        const safeNote = { ...note }
        delete safeNote.passwordHash
        return safeNote
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      success: true,
      data: safeNotes
    })

  } catch (error) {
    console.error('获取笔记列表出错:', error)
    return NextResponse.json(
      { success: false, error: '获取笔记列表失败，请重试' },
      { status: 500 }
    )
  }
}
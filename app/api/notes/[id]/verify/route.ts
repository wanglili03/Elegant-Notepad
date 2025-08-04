import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, NoteAccess } from '@/types'
import { getNote, deleteNote } from '@/lib/redis'
import { verifyPassword } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<NoteAccess>>> {
  try {
    const noteId = params.id
    const { password } = await request.json()
    
    if (!noteId) {
      return NextResponse.json(
        { success: false, error: '笔记 ID 是必需的' },
        { status: 400 }
      )
    }

    const note = await getNote(noteId)
    
    if (!note) {
      return NextResponse.json(
        { success: false, error: '笔记未找到' },
        { status: 404 }
      )
    }



    // Check if note is password protected
    if (!note.isPasswordProtected) {
      return NextResponse.json({
        success: true,
        data: {
          noteId,
          hasAccess: true,
          isPasswordProtected: false
        },
        message: '笔记没有密码保护'
      })
    }

    // Verify password
    if (!password) {
      return NextResponse.json({
        success: true,
        data: {
          noteId,
          hasAccess: false,
          isPasswordProtected: true
        },
        message: '需要密码'
      })
    }

    if (!note.passwordHash) {
      console.log('笔记密码哈希未找到，笔记数据:', { id: noteId, isPasswordProtected: note.isPasswordProtected, hasPasswordHash: !!note.passwordHash })
      return NextResponse.json(
        { success: false, error: '笔记密码哈希未找到' },
        { status: 500 }
      )
    }

    console.log('开始验证密码:', { noteId, password, hasPasswordHash: !!note.passwordHash })
    
    try {
      const isValidPassword = await verifyPassword(password, note.passwordHash)
      console.log('密码验证结果:', { isValidPassword, password, passwordHashLength: note.passwordHash.length })
      
      if (isValidPassword) {
        return NextResponse.json({
          success: true,
          data: {
            noteId,
            hasAccess: true,
            isPasswordProtected: true
          },
          message: '密码验证成功'
        })
      } else {
        return NextResponse.json({
          success: false,
          data: {
            noteId,
            hasAccess: false,
            isPasswordProtected: true
          },
          error: '密码错误'
        }, { status: 401 })
      }
    } catch (verifyError) {
      console.error('密码验证过程中出错:', verifyError)
      return NextResponse.json({
        success: false,
        error: '密码验证失败'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('验证笔记密码出错:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '验证密码失败',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
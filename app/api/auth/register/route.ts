import { NextRequest, NextResponse } from 'next/server'
import { getRedisInstance } from '@/lib/redis'
import { hashPassword, generateToken } from '@/lib/auth'
import { generateId } from '@/lib/utils'
import { RegisterRequest, AuthResponse, User } from '@/types'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { username, password } = body

    // 验证输入
    if (!username || !password) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户名和密码不能为空'
      }, { status: 400 })
    }

    if (username.length < 3) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户名至少3个字符'
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '密码至少6个字符'
      }, { status: 400 })
    }

    const redis = getRedisInstance()

    // 检查用户名是否已存在
    const existingUser = await redis.get(`user:username:${username}`)
    if (existingUser) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户名已存在'
      }, { status: 409 })
    }

    // 创建新用户
    const userId = generateId()
    const hashedPassword = hashPassword(password)
    const now = new Date().toISOString()

    const user: User = {
      id: userId,
      username,
      passwordHash: hashedPassword,
      createdAt: now,
      updatedAt: now
    }

    // 保存到Redis
    await redis.set(`user:${userId}`, JSON.stringify(user))
    await redis.set(`user:username:${username}`, userId)

    // 生成JWT令牌
    const token = generateToken({ userId, username })

    return NextResponse.json<AuthResponse>({
      success: true,
      user: {
        id: userId,
        username
      },
      token
    })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json<AuthResponse>({
      success: false,
      error: '注册失败，请重试'
    }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { getRedisInstance } from '@/lib/redis'
import { comparePassword, generateToken } from '@/lib/auth'
import { LoginRequest, AuthResponse } from '@/types'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { username, password } = body

    // 验证输入
    if (!username || !password) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户名和密码不能为空'
      }, { status: 400 })
    }

    const redis = getRedisInstance()

    // 通过用户名查找用户ID
    const userId = await redis.get(`user:username:${username}`)
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户名或密码错误'
      }, { status: 401 })
    }

    // 获取用户信息
    const userData = await redis.get(`user:${userId}`)
    if (!userData) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户不存在'
      }, { status: 401 })
    }

    const user = typeof userData === 'string' ? JSON.parse(userData) : userData

    // 验证密码
    if (!comparePassword(password, user.passwordHash)) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户名或密码错误'
      }, { status: 401 })
    }

    // 生成JWT令牌
    const token = generateToken({ userId: user.id, username: user.username })

    return NextResponse.json<AuthResponse>({
      success: true,
      user: {
        id: user.id,
        username: user.username
      },
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json<AuthResponse>({
      success: false,
      error: '登录失败，请重试'
    }, { status: 500 })
  }
} 
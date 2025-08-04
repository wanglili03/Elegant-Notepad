import { NextRequest, NextResponse } from 'next/server'
import { getRedisInstance } from '@/lib/redis'
import { getUserFromRequest } from '@/lib/auth'
import { User, AuthResponse } from '@/types'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 验证JWT令牌
    const userPayload = getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '未授权访问'
      }, { status: 401 })
    }

    const redis = getRedisInstance()

    // 获取用户信息
    const userData = await redis.get(`user:${userPayload.userId}`)
    if (!userData) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: '用户不存在'
      }, { status: 404 })
    }

    const user: User = typeof userData === 'string' ? JSON.parse(userData) : userData

    return NextResponse.json<AuthResponse>({
      success: true,
      user: {
        id: user.id,
        username: user.username
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json<AuthResponse>({
      success: false,
      error: '获取用户信息失败'
    }, { status: 500 })
  }
} 
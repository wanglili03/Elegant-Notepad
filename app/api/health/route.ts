import { NextRequest, NextResponse } from 'next/server'
import { redisHealthCheck, getRedisInfo } from '@/lib/redis'
import { ApiResponse } from '@/types'

interface HealthCheckResponse {
  status: string
  redis: boolean
  timestamp: string
  info?: any
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<HealthCheckResponse>>> {
  try {
    const redisOk = await redisHealthCheck()
    
    const health: HealthCheckResponse = {
      status: redisOk ? 'healthy' : 'unhealthy',
      redis: redisOk,
      timestamp: new Date().toISOString(),
    }

    // Include Redis info in development
    if (process.env.NODE_ENV === 'development') {
      health.info = await getRedisInfo()
    }

    const statusCode = redisOk ? 200 : 503

    return NextResponse.json({
      success: redisOk,
      data: health,
      message: redisOk ? '服务健康' : '服务不健康'
    }, { status: statusCode })

  } catch (error: any) {
    console.error('健康检查失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '健康检查失败',
      message: error.message,
      data: {
        status: 'error',
        redis: false,
        timestamp: new Date().toISOString(),
      }
    }, { status: 500 })
  }
}
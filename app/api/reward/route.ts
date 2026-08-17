import { NextResponse } from 'next/server'
import { getReward, DEFAULT_REWARD } from '@/lib/storage'

export const dynamic = 'force-static'

export async function GET() {
  const config = await getReward()
  // 空字符串时也返回，让前端判断展示占位图
  return NextResponse.json({ ...DEFAULT_REWARD, ...config })
}
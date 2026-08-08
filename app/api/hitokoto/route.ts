import { NextResponse } from 'next/server'
import { hitokotoList } from '@/lib/data'

export async function GET() {
  // 按日期取索引，每天显示不同一言
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  )
  const index = dayOfYear % hitokotoList.length
  const hitokoto = hitokotoList[index]

  return NextResponse.json(hitokoto)
}

import { NextResponse } from 'next/server'
import { getAnimeList } from '@/lib/storage'

// 公开接口：获取追番列表
export async function GET() {
  const list = await getAnimeList()
  return NextResponse.json({ anime: list })
}

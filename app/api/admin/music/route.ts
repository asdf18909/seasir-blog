import { NextRequest, NextResponse } from 'next/server'
import { getPlaylist, addTrack, type MusicTrack } from '@/lib/storage'

export const dynamic = 'force-static'

// 获取播放列表
export async function GET() {
  const playlist = await getPlaylist()
  return NextResponse.json({ playlist })
}

// 添加歌曲
export async function POST(req: NextRequest) {
  const body = await req.json()
  const playlist = await getPlaylist()
  const newId = playlist.length > 0 ? Math.max(...playlist.map(t => t.id)) + 1 : 1

  const track: MusicTrack = {
    id: newId,
    title: body.title || '未知歌曲',
    artist: body.artist || '未知歌手',
    duration: body.duration || 0,
    url: body.url || '',
    cover: body.cover || '/cover-1.png',
  }

  await addTrack(track)
  return NextResponse.json({ success: true, track })
}

import { NextRequest, NextResponse } from 'next/server'
import { deleteTrack } from '@/lib/storage'
import { promises as fs } from 'fs'
import path from 'path'

// 删除歌曲
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trackId = parseInt(id, 10)
  if (isNaN(trackId)) return NextResponse.json({ error: '无效 ID' }, { status: 400 })

  // 尝试删除文件（如果是本地文件）
  try {
    const { getPlaylist } = await import('@/lib/storage')
    const playlist = await getPlaylist()
    const track = playlist.find(t => t.id === trackId)
    if (track && track.url.startsWith('/music/')) {
      const filePath = path.join(process.cwd(), 'public', track.url)
      try { await fs.unlink(filePath) } catch {}
    }
  } catch {}

  await deleteTrack(trackId)
  return NextResponse.json({ success: true })
}

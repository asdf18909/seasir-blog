import { NextResponse } from 'next/server'
import { getPlaylist } from '@/lib/storage'
import { playlist as defaultPlaylist } from '@/lib/data'

export const dynamic = 'force-static'

export async function GET() {
  const stored = await getPlaylist()
  const playlist = stored.length > 0 ? stored : defaultPlaylist
  return NextResponse.json({
    total: playlist.length,
    playlist,
  })
}

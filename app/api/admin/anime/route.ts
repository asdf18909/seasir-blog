import { NextRequest, NextResponse } from 'next/server'
import { getAnimeList, saveAnime, deleteAnime, generateId, type AnimeItem } from '@/lib/storage'

// 管理接口：获取全部追番
export async function GET() {
  const list = await getAnimeList()
  return NextResponse.json({ anime: list })
}

// 管理接口：新增追番
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const now = new Date().toISOString()
    const item: AnimeItem = {
      id: generateId(),
      title: body.title || '未命名',
      cover: body.cover || '',
      score: Number(body.score) || 0,
      status: body.status || '想看',
      episodes: Number(body.episodes) || 0,
      watchedEpisodes: Number(body.watchedEpisodes) || 0,
      year: Number(body.year) || new Date().getFullYear(),
      tags: Array.isArray(body.tags) ? body.tags : [],
      videoUrl: body.videoUrl || '',
      videoType: body.videoType || 'local',
      summary: body.summary || '',
      createdAt: now,
      updatedAt: now,
    }
    await saveAnime(item)
    return NextResponse.json({ ok: true, anime: item })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || '创建失败' }, { status: 500 })
  }
}

// 管理接口：更新追番
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...rest } = body
    if (!id) return NextResponse.json({ ok: false, error: '缺少 id' }, { status: 400 })

    const list = await getAnimeList()
    const existing = list.find(a => a.id === id)
    if (!existing) return NextResponse.json({ ok: false, error: '未找到' }, { status: 404 })

    const updated: AnimeItem = {
      ...existing,
      ...rest,
      id,
      score: Number(rest.score) || 0,
      episodes: Number(rest.episodes) || 0,
      watchedEpisodes: Number(rest.watchedEpisodes) || 0,
      year: Number(rest.year) || existing.year,
      tags: Array.isArray(rest.tags) ? rest.tags : existing.tags,
      updatedAt: new Date().toISOString(),
    }
    await saveAnime(updated)
    return NextResponse.json({ ok: true, anime: updated })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || '更新失败' }, { status: 500 })
  }
}

// 管理接口：删除追番
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ ok: false, error: '缺少 id' }, { status: 400 })
    await deleteAnime(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || '删除失败' }, { status: 500 })
  }
}

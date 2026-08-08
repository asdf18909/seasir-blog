import { NextRequest, NextResponse } from 'next/server'
import { articles } from '@/lib/data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const filtered = articles
    .filter((a) => a.tags.includes(decodedTag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return NextResponse.json({
    tag: decodedTag,
    total: filtered.length,
    articles: filtered.map((a) => ({
      slug: a.slug,
      title: a.title,
      date: a.date,
      category: a.category,
      excerpt: a.excerpt,
      tags: a.tags,
      cover: a.cover,
      pinned: a.pinned,
    })),
  })
}

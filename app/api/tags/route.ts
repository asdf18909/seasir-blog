import { NextResponse } from 'next/server'
import { tags, articles } from '@/lib/data'

export async function GET() {
  const tagsWithCount = tags.map((t) => ({
    name: t,
    count: articles.filter((a) => a.tags.includes(t)).length,
  }))

  return NextResponse.json({ tags: tagsWithCount })
}

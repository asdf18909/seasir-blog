import { NextRequest, NextResponse } from 'next/server'
import { getArticles } from '@/lib/storage'
import { articles as defaultArticles } from '@/lib/data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const storedArticles = await getArticles()
  const allArticles = storedArticles.length > 0 ? storedArticles : defaultArticles as any[]

  const article = allArticles.find((a) => a.slug === slug)

  if (!article) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }

  const related = allArticles
    .filter(
      (a) =>
        a.slug !== slug &&
        (a.category === article.category || a.tags.some((t) => article.tags.includes(t)))
    )
    .slice(0, 3)
    .map((a) => ({ slug: a.slug, title: a.title, date: a.date, cover: a.cover }))

  return NextResponse.json({ article, related })
}

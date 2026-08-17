import { NextRequest, NextResponse } from 'next/server'
import { getArticles, type Article } from '@/lib/storage'
import { articles as defaultArticles, categories as defaultCategories, tags as defaultTags } from '@/lib/data'

export const dynamic = 'force-static'

export async function GET() {
  // 静态导出模式：不使用 request.url（否则无法静态渲染）
  // 优先从 JSON 存储读取，没有则用默认数据
  const storedArticles = await getArticles()
  const allArticles: Article[] = storedArticles.length > 0 ? storedArticles : defaultArticles as Article[]

  let result = [...allArticles]
  result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // 动态计算分类和标签
  const cats = [...new Set(allArticles.map(a => a.category))]
  const tagSet = new Set<string>()
  allArticles.forEach(a => a.tags.forEach(t => tagSet.add(t)))

  return NextResponse.json({
    total: result.length,
    articles: result.map((a) => ({
      slug: a.slug,
      title: a.title,
      date: a.date,
      category: a.category,
      excerpt: a.excerpt,
      tags: a.tags,
      cover: a.cover,
      pinned: a.pinned,
    })),
    categories: storedArticles.length > 0 ? cats : defaultCategories,
    tags: storedArticles.length > 0 ? [...tagSet] : defaultTags,
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { getArticles, saveArticle, generateId, slugify, type Article } from '@/lib/storage'

// 获取文章列表
export async function GET() {
  const articles = await getArticles()
  return NextResponse.json({ articles })
}

// 新建文章
export async function POST(req: NextRequest) {
  const body = await req.json()
  const now = new Date().toISOString()

  const article: Article = {
    id: generateId(),
    slug: body.slug || slugify(body.title),
    title: body.title || '无标题',
    date: body.date || now.slice(0, 10),
    category: body.category || '未分类',
    excerpt: body.excerpt || body.content?.slice(0, 120) || '',
    tags: body.tags || [],
    cover: body.cover || '',
    pinned: body.pinned || false,
    content: body.content || '',
    createdAt: now,
    updatedAt: now,
  }

  await saveArticle(article)
  return NextResponse.json({ success: true, article })
}

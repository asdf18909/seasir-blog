import { NextRequest, NextResponse } from 'next/server'
import { getArticles, saveArticle, deleteArticle } from '@/lib/storage'

// 获取单篇文章
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const articles = await getArticles()
  const article = articles.find(a => a.id === id)
  if (!article) return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  return NextResponse.json({ article })
}

// 更新文章
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const articles = await getArticles()
  const idx = articles.findIndex(a => a.id === id)
  if (idx < 0) return NextResponse.json({ error: '文章不存在' }, { status: 404 })

  const body = await req.json()
  articles[idx] = {
    ...articles[idx],
    ...body,
    id,
    updatedAt: new Date().toISOString(),
  }
  await saveArticle(articles[idx])
  return NextResponse.json({ success: true, article: articles[idx] })
}

// 删除文章
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteArticle(id)
  return NextResponse.json({ success: true })
}

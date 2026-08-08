'use client'

import { AdminLayout } from '@/components/admin-layout'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit3, Trash2, Pin, FileText } from 'lucide-react'
import { broadcastStats } from '@/lib/use-stats'

type Article = {
  id: string
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  pinned: boolean
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    fetch('/api/admin/articles')
      .then(r => r.json())
      .then(data => {
        setArticles(data.articles || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`确定删除「${title}」吗？此操作不可撤销。`)) return
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
    broadcastStats() // 通知其他标签页统计已更新
    load()
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">文章管理</h1>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" /> 写新文章
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20">
          <FileText className="size-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">还没有文章，点击右上角写一篇吧～</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">标题</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">分类</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">标签</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">日期</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {a.pinned && <Pin className="size-3.5 text-primary" />}
                      <span className="text-sm font-medium text-foreground">{a.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{a.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {a.tags.map(t => (
                        <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{a.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/articles/${a.id}/edit`}
                        className="grid size-8 place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-secondary hover:text-primary"
                      >
                        <Edit3 className="size-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(a.id, a.title)}
                        className="grid size-8 place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}

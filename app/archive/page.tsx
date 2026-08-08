'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Archive, Calendar, Pin, Search } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { useEffect, useState } from 'react'

function formatDate(date: string) {
  const d = new Date(date)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

function ArchiveContent() {
  const params = useSearchParams()
  const q = params.get('q') || ''
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(data => {
        const list = data.articles || data || []
        setArticles(list)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = q
    ? articles.filter((a: any) =>
        a.title?.toLowerCase().includes(q.toLowerCase()) ||
        a.excerpt?.toLowerCase().includes(q.toLowerCase()) ||
        (a.tags || []).some((t: string) => t.toLowerCase().includes(q.toLowerCase()))
      )
    : articles

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const groups: Record<string, Record<string, any[]>> = {}
  for (const a of sorted) {
    const d = new Date(a.date)
    const year = String(d.getFullYear())
    const month = String(d.getMonth() + 1).padStart(2, '0')
    if (!groups[year]) groups[year] = {}
    if (!groups[year][month]) groups[year][month] = []
    groups[year][month].push(a)
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-[900px] px-4 pb-12 pt-24 lg:px-6">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Archive className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {q ? `搜索：${q}` : '归档'}
            </h1>
            <p className="text-sm text-muted-foreground">
              共 {sorted.length} 篇{q && sorted.length !== articles.length ? `（全部 ${articles.length} 篇）` : ''}
            </p>
          </div>
        </div>

        {q && (
          <Link
            href="/archive"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-secondary/70"
          >
            <Search className="size-3.5" />
            清除搜索
          </Link>
        )}

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">加载中...</div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="mb-3 size-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {q ? `没找到包含「${q}」的文章` : '暂无文章'}
            </p>
            <Link href="/archive" className="mt-3 text-xs text-primary hover:underline">
              返回归档
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groups)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([year, months]) => (
                <div key={year}>
                  <h2 className="mb-4 text-lg font-bold text-foreground">{year} 年</h2>
                  <div className="space-y-6">
                    {Object.entries(months)
                      .sort(([a], [b]) => Number(b) - Number(a))
                      .map(([month, items]) => (
                        <div key={month} className="border-l-2 border-border pl-4">
                          <h3 className="mb-3 text-sm font-medium text-muted-foreground">{month} 月</h3>
                          <div className="space-y-3">
                            {items.map((article: any) => (
                              <Link
                                key={article.slug || article.id}
                                href={`/article/${article.slug || article.id}`}
                                className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
                              >
                                <Calendar className="size-4 shrink-0 text-muted-foreground" />
                                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                  {formatDate(article.date)}
                                </span>
                                {article.pinned && (
                                  <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                                    <Pin className="size-3" />
                                  </span>
                                )}
                                <span className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                                  {article.title}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </>
  )
}

export default function ArchivePage() {
  return (
    <Suspense fallback={null}>
      <ArchiveContent />
    </Suspense>
  )
}
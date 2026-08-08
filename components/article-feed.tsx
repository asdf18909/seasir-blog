'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Home, Archive, Folder, ChevronRight, FileText, Pin, Calendar, ArrowRight,
} from 'lucide-react'
import { categories as defaultCategories } from '@/lib/data'

type ArticleItem = {
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  tags: string[]
  cover?: string
  pinned?: boolean
}

const tagColors = [
  'bg-chart-1/15 text-chart-1',
  'bg-chart-2/15 text-chart-2',
  'bg-chart-3/15 text-chart-3',
  'bg-chart-4/20 text-chart-4',
  'bg-chart-5/15 text-chart-5',
]

function formatDate(date: string) {
  const d = new Date(date)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

function FilterBar() {
  return (
    <div className="card-shadow flex items-center gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-2 no-scrollbar">
      <Link href="/" className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
        <Home className="size-4" />
      </Link>
      <Link href="/archive" className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary">
        <Archive className="size-4" /> 归档 <span className="text-xs text-muted-foreground">13</span>
      </Link>
      <Link href="/categories" className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary">
        <Folder className="size-4" /> 分类 <span className="text-xs text-muted-foreground">3</span>
      </Link>
      <span className="mx-1 h-5 w-px shrink-0 bg-border" />
      {defaultCategories.map((c) => (
        <Link
          key={c.name}
          href={`/categories/${encodeURIComponent(c.name)}`}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
        >
          {c.name} <span className="text-xs text-muted-foreground">{c.count}</span>
        </Link>
      ))}
      <Link href="/categories" className="ml-auto flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-sm text-primary">
        更多 <ChevronRight className="size-4" />
      </Link>
    </div>
  )
}

function ArticleCard({ article }: { article: ArticleItem }) {
  return (
    <article className="card-shadow group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg sm:flex-row">
      {article.cover && (
        <Link
          href={`/article/${article.slug}`}
          className="relative block aspect-[16/9] shrink-0 overflow-hidden sm:aspect-auto sm:w-56"
        >
          <img
            src={article.cover}
            alt={article.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {article.pinned && (
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground backdrop-blur">
              <Pin className="size-3" /> 置顶
            </span>
          )}
        </Link>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          {article.pinned && !article.cover && (
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
              <Pin className="size-3" /> 置顶
            </span>
          )}
          <Link
            href={`/categories/${encodeURIComponent(article.category)}`}
            className="rounded-full bg-secondary px-2 py-0.5 font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-primary"
          >
            {article.category}
          </Link>
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" /> {formatDate(article.date)}
          </span>
        </div>
        <h3 className="mb-2 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
          <Link href={`/article/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="mb-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map((t, i) => (
              <Link
                key={t}
                href={`/tags/${encodeURIComponent(t)}`}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-transform hover:scale-105 ${tagColors[i % tagColors.length]}`}
              >
                {t}
              </Link>
            ))}
          </div>
          <Link
            href={`/article/${article.slug}`}
            className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100"
          >
            阅读全文 <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card-shadow flex animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
          <div className="aspect-[16/9] shrink-0 bg-secondary sm:w-56" />
          <div className="flex-1 space-y-3 p-5">
            <div className="h-4 w-24 rounded bg-secondary" />
            <div className="h-5 w-3/4 rounded bg-secondary" />
            <div className="h-3 w-full rounded bg-secondary" />
            <div className="h-3 w-2/3 rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ArticleFeed() {
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/articles')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="flex w-full flex-col gap-4">
      <FilterBar />
      {loading ? (
        <LoadingState />
      ) : articles.length === 0 ? (
        <div className="card-shadow flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-20 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-secondary text-muted-foreground">
            <FileText className="size-7" />
          </div>
          <p className="text-base font-medium text-foreground">暂无文章</p>
          <p className="text-sm text-muted-foreground">这里还没有发布任何内容</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </main>
  )
}

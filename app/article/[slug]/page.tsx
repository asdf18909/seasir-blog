import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Tag, Folder, ArrowLeft, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { articles as defaultArticles } from '@/lib/data'
import { getArticles, type Article } from '@/lib/storage'

export async function generateStaticParams() {
  // 合并默认数据和存储数据，确保动态路由能被 Next.js 正确识别
  const stored = await getArticles()
  const all: Article[] = stored.length > 0 ? stored : (defaultArticles as Article[])
  return all.map((a) => ({ slug: a.slug }))
}

function formatDate(date: string) {
  const d = new Date(date)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}

const tagColors = [
  'bg-chart-1/15 text-chart-1',
  'bg-chart-2/15 text-chart-2',
  'bg-chart-3/15 text-chart-3',
  'bg-chart-4/20 text-chart-4',
  'bg-chart-5/15 text-chart-5',
]

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: rawSlug } = await params
  // Next.js 不会自动解码 URL 中的中文 slug，需要手动 decode
  const slug = decodeURIComponent(rawSlug)

  // 优先从 JSON 存储读取，没有则用默认数据
  const storedArticles = await getArticles()
  const allArticles: Article[] = storedArticles.length > 0 ? storedArticles : (defaultArticles as Article[])

  const article = allArticles.find((a) => a.slug === slug)

  if (!article) {
    notFound()
  }

  const currentIndex = allArticles.findIndex((a) => a.slug === slug)
  const prev = currentIndex > 0 ? allArticles[currentIndex - 1] : null
  const next = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null

  // 简单的 Markdown 渲染
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('### ')) {
        return <h3 key={i} className="mt-6 mb-3 text-lg font-bold text-foreground">{line.slice(4)}</h3>
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="mt-8 mb-4 text-xl font-bold text-foreground">{line.slice(3)}</h2>
      }
      if (line.startsWith('- [x] ')) {
        return (
          <p key={i} className="mb-2 flex items-center gap-2 text-sm text-foreground/80">
            <span className="grid size-4 place-items-center rounded bg-primary text-primary-foreground text-xs">✓</span>
            {line.slice(6)}
          </p>
        )
      }
      if (line.startsWith('- [ ] ')) {
        return (
          <p key={i} className="mb-2 flex items-center gap-2 text-sm text-foreground/80">
            <span className="grid size-4 place-items-center rounded border border-border text-xs" />
            {line.slice(6)}
          </p>
        )
      }
      if (line.startsWith('- ')) {
        return <p key={i} className="mb-2 pl-4 text-sm text-foreground/80">• {line.slice(2)}</p>
      }
      if (line.startsWith('```')) {
        return null // Skip code fences for simplicity
      }
      if (line.match(/^\d+\. /)) {
        return <p key={i} className="mb-2 pl-4 text-sm text-foreground/80">{line}</p>
      }
      if (line.trim() === '') {
        return <div key={i} className="h-3" />
      }
      return <p key={i} className="mb-3 text-sm leading-relaxed text-foreground/80">{line}</p>
    })
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-[800px] px-4 pb-12 pt-24 lg:px-6">
        <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="size-4" /> 返回首页
        </Link>
        <article>
          <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Link
              href={`/categories/${encodeURIComponent(article.category)}`}
              className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-primary"
            >
              <Folder className="size-3.5" /> {article.category}
            </Link>
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" /> {formatDate(article.date)}
            </span>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-foreground">{article.title}</h1>
          <p className="mb-6 text-base leading-relaxed text-muted-foreground">{article.excerpt}</p>
          {article.cover && (
            <img
              src={article.cover}
              alt={article.title}
              className="mb-8 aspect-[16/9] w-full rounded-2xl object-cover"
            />
          )}
          <div className="article-content">
            {renderContent(article.content)}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((t, i) => (
              <Link
                key={t}
                href={`/tags/${encodeURIComponent(t)}`}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-transform hover:scale-105 ${tagColors[i % tagColors.length]}`}
              >
                <Tag className="size-3" /> {t}
              </Link>
            ))}
          </div>
        </article>
        {/* 上一篇 / 下一篇 */}
        {(prev || next) && (
          <div className="mt-12 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
            {prev && (
              <Link
                href={`/article/${prev.slug}`}
                className="card-shadow group flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-lg"
              >
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowLeft className="size-3" /> 上一篇
                </span>
                <span className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                  {prev.title}
                </span>
              </Link>
            )}
            {next && (
              <Link
                href={`/article/${next.slug}`}
                className="card-shadow group flex flex-col items-end gap-1 rounded-2xl border border-border bg-card p-4 text-right transition-all hover:shadow-lg sm:col-start-2"
              >
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  下一篇 <ArrowRight className="size-3" />
                </span>
                <span className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                  {next.title}
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
      <SiteFooter />
    </>
  )
}

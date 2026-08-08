import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Tag, Calendar, ArrowLeft, Pin } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { tags, articles } from '@/lib/data'

export async function generateStaticParams() {
  return tags.map((t) => ({ tag: encodeURIComponent(t) }))
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

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag: rawTag } = await params
  const tag = decodeURIComponent(rawTag)
  const filtered = articles
    .filter((a) => a.tags.includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (filtered.length === 0) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-[900px] px-4 pb-12 pt-24 lg:px-6">
        <Link href="/tags" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="size-4" /> 返回标签列表
        </Link>
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Tag className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{tag}</h1>
            <p className="text-sm text-muted-foreground">共 {filtered.length} 篇文章</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {filtered.map((article) => (
            <article key={article.slug} className="card-shadow group rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-lg">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                {article.pinned && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                    <Pin className="size-3" /> 置顶
                  </span>
                )}
                <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-foreground/70">
                  {article.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" /> {formatDate(article.date)}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                <Link href={`/article/${article.slug}`}>{article.title}</Link>
              </h3>
              <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {article.excerpt}
              </p>
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
            </article>
          ))}
        </div>
      </div>
      <SiteFooter />
    </>
  )
}

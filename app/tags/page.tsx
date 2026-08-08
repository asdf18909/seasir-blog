import Link from 'next/link'
import { Tag } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { tags, articles } from '@/lib/data'

export const metadata = { title: '标签 - Hyde Blog' }

const tagColors = [
  'bg-chart-1/15 text-chart-1',
  'bg-chart-2/15 text-chart-2',
  'bg-chart-3/15 text-chart-3',
  'bg-chart-4/20 text-chart-4',
  'bg-chart-5/15 text-chart-5',
]

export default function TagsPage() {
  const tagsWithCount = tags.map((t) => ({
    name: t,
    count: articles.filter((a) => a.tags.includes(t)).length,
  }))

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-24 lg:px-6">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Tag className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">标签</h1>
            <p className="text-sm text-muted-foreground">共 {tagsWithCount.length} 个标签</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {tagsWithCount.map((t, i) => (
            <Link
              key={t.name}
              href={`/tags/${encodeURIComponent(t.name)}`}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:scale-105 ${tagColors[i % tagColors.length]}`}
            >
              {t.name}
              <span className="rounded-full bg-white/40 px-1.5 text-xs">{t.count}</span>
            </Link>
          ))}
        </div>
      </div>
      <SiteFooter />
    </>
  )
}

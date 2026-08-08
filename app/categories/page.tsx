import Link from 'next/link'
import { Folder } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { categories, articles } from '@/lib/data'

export const metadata = { title: '分类 - Hyde Blog' }

export default function CategoriesPage() {
  const catsWithCount = categories.map((c) => ({
    ...c,
    count: articles.filter((a) => a.category === c.name).length,
  }))

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-24 lg:px-6">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Folder className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">分类</h1>
            <p className="text-sm text-muted-foreground">共 {catsWithCount.length} 个分类</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catsWithCount.map((c) => (
            <Link
              key={c.name}
              href={`/categories/${encodeURIComponent(c.name)}`}
              className="card-shadow flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Folder className="size-5" />
                </span>
                <span className="text-base font-semibold text-foreground">{c.name}</span>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
                {c.count} 篇
              </span>
            </Link>
          ))}
        </div>
      </div>
      <SiteFooter />
    </>
  )
}

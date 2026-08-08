import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { friendLinks } from '@/lib/data'
import { Link2 } from 'lucide-react'

export const metadata = { title: '友链 - Hyde Blog' }

export default function LinksPage() {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-24 lg:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">友情链接</h1>
          <p className="mt-1 text-sm text-muted-foreground">共 {friendLinks.length} 个友链</p>
        </div>
        {friendLinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Link2 className="mb-4 size-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">还没有友情链接</p>
            <p className="mt-1 text-xs text-muted-foreground/60">添加友链后这里会展示出来</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {friendLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="card-shadow group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-lg hover:border-primary/30"
              >
                <img
                  src={link.avatar}
                  alt={link.name}
                  className="size-14 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                    {link.name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {link.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </>
  )
}

import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'

export function PageShell({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        <div className="mb-6">
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
            {icon}
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {children}
      </div>
      <SiteFooter />
    </>
  )
}

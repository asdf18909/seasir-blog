import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border bg-card/60 py-8">
      <div className="mx-auto max-w-[1600px] px-4 text-center">
        <div className="mb-3 flex items-center justify-center gap-3 text-2xl">
          <span>🦊</span><span>🐱</span><span>🐰</span><span>🐻</span><span>🐶</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary">主页</Link>
          <span className="opacity-40">·</span>
          <Link href="/archive" className="hover:text-primary">归档</Link>
          <span className="opacity-40">·</span>
          <Link href="/links" className="hover:text-primary">友链</Link>
          <span className="opacity-40">·</span>
          <Link href="/tags" className="hover:text-primary">标签</Link>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          © 2025. Hyde All Rights Reserved.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Powered by <span className="font-medium text-foreground/70">Next.js</span> &amp; <span className="font-medium text-foreground/70">Firefly</span>
        </p>
      </div>
    </footer>
  )
}

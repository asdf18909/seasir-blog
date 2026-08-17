'use client'

import Link from 'next/link'
import { Info, Mail, Heart, Link2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { GithubMark } from '@/components/icons'

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-[760px] px-4 pb-12 pt-24 lg:px-6">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Info className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">关于</h1>
            <p className="text-sm text-muted-foreground">关于这个小站，以及它的主人</p>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">你好，我是站主 👋</h2>
            <p className="leading-relaxed text-foreground/80">
              欢迎来到我的小站。这里是我留给往后日子的一个角落——记录折腾项目时踩过的坑、路上的风景，以及那些不值得发朋友圈、却也舍不得扔掉的小情绪。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">这个小站会写些什么</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-foreground/80">
              <li>🛠️ 技术笔记：平时折腾项目时踩过的坑、写过的小工具</li>
              <li>✈️ 路上的事：去过的城市、见过的风景、吃过的馆子</li>
              <li>🎬 看过的剧和书：偶尔追番、偶尔读书，随缘记录</li>
              <li>💭 胡思乱想：生活里那些零碎的小情绪</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-foreground">关于这个站</h2>
            <p className="leading-relaxed text-foreground/80">
              技术栈使用 Next.js 静态导出，部署在 GitHub Pages（自定义域名 airestart.indevs.in）。不追热点、不为流量，只希望真的写下来、留得久。
            </p>
          </section>

          <section className="flex flex-wrap gap-3 pt-2">
            <a
              href="mailto:hello@example.com"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary/70"
            >
              <Mail className="size-4" />
              邮件
            </a>
            <a
              href="https://github.com/asdf18909"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary/70"
            >
              <GithubMark className="size-4" />
              GitHub
            </a>
            <Link
              href="/archive"
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/20"
            >
              <Heart className="size-4" />
              去读读文章
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary/70"
            >
              <Link2 className="size-4" />
              回到首页
            </Link>
          </section>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          写于 2026 年夏天 · 与未来的自己对话
        </p>
      </div>
      <SiteFooter />
    </>
  )
}

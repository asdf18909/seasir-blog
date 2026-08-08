'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { useHeroConfig } from '@/lib/use-hero-config'

export function Hero() {
  const config = useHeroConfig()
  const [tick, setTick] = useState(0) // 强制刷新图片 key

  // 监听更新时刷新图片 key（强制重新加载图片）
  // 由于 useHeroConfig 内部已经处理了，这里只是保险
  void tick

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <img
        src={config.bgImage}
        alt="博客桌面背景图"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-black/10" />

      {/* 右上角编辑入口 */}
      <Link
        href="/admin/hero"
        className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-black/40 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur transition-all hover:bg-primary hover:scale-105 sm:right-6 sm:top-6"
        title="点击编辑 Hero 区"
      >
        <Pencil className="size-3.5" />
        编辑 Hero
      </Link>

      {/* Hero 文案 */}
      <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center text-center text-white">
        <Link
          href="/admin/hero"
          className="group relative block animate-[float-bounce_3s_ease-in-out_infinite]"
          title="点击编辑头像和文字"
        >
          <img
            src={config.avatar}
            alt="avatar"
            className="mx-auto size-28 rounded-full border-4 border-white/30 object-cover shadow-2xl backdrop-blur transition-all group-hover:border-primary group-hover:scale-105 sm:size-32"
          />
          <span className="absolute inset-0 grid size-full place-items-center rounded-full bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
            <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-foreground">
              <Pencil className="size-3" />
              点击编辑
            </span>
          </span>
        </Link>
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight drop-shadow-lg sm:text-5xl">
          {config.greeting}
        </h1>
        <p className="mt-3 max-w-md text-sm text-white/80 drop-shadow sm:text-base">
          {config.subtitle}
        </p>
        <div className="mt-6 flex gap-3">
          <a
            href="#content"
            className="rounded-full bg-white/20 px-6 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/30"
          >
            {config.buttonText}
          </a>
        </div>
      </div>

      {/* wave bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <svg viewBox="0 0 1440 120" className="h-16 w-full fill-background sm:h-24" preserveAspectRatio="none">
          <path d="M0,64 C240,120 480,120 720,80 C960,40 1200,0 1440,48 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  )
}
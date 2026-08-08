'use client'

import { AdminLayout } from '@/components/admin-layout'
import { useEffect, useState } from 'react'
import { FileText, Image as ImageIcon, Music, Plus, Sparkles, Menu as MenuIcon, Gift } from 'lucide-react'
import Link from 'next/link'

type DashboardData = {
  articles: number
  images: number
  music: number
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({ articles: 0, images: 0, music: 0 })

  useEffect(() => {
    Promise.all([
      fetch('/api/articles').then(r => r.json()),
      fetch('/api/admin/images').then(r => r.json()),
      fetch('/api/music').then(r => r.json()),
    ]).then(([arts, imgs, music]) => {
      setData({
        articles: arts.total ?? 0,
        images: imgs.images?.length ?? 0,
        music: music.total ?? 0,
      })
    }).catch(() => {})
  }, [])

  const cards = [
    { label: '文章数', value: data.articles, icon: FileText, color: 'bg-blue-500', href: '/admin/articles' },
    { label: '图片数', value: data.images, icon: ImageIcon, color: 'bg-green-500', href: '/admin/images' },
    { label: '歌曲数', value: data.music, icon: Music, color: 'bg-purple-500', href: '/admin/music' },
  ]

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold text-foreground">仪表盘</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map(c => (
          <Link key={c.label} href={c.href}>
            <div className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
              <div className={`mb-3 grid size-12 place-items-center rounded-xl ${c.color} text-white`}>
                <c.icon className="size-6" />
              </div>
              <p className="text-3xl font-bold text-foreground">{c.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-foreground">快捷操作</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" /> 写新文章
          </Link>
          <Link
            href="/admin/images"
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            <ImageIcon className="size-4" /> 上传图片
          </Link>
          <Link
            href="/admin/music"
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            <Music className="size-4" /> 管理音乐
          </Link>
          <Link
            href="/admin/hero"
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            <Sparkles className="size-4" /> 编辑首页
          </Link>
          <Link
            href="/admin/nav"
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            <MenuIcon className="size-4" /> 编辑导航
          </Link>
          <Link
            href="/admin/reward"
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
          >
            <Gift className="size-4" /> 打赏配置
          </Link>
        </div>
      </div>
    </AdminLayout>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Image as ImageIcon, Music, LayoutDashboard, ArrowLeft, Sparkles, Menu as MenuIcon, Gift, Tv } from 'lucide-react'

const navItems = [
  { href: '/admin', label: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/articles', label: '文章管理', icon: FileText },
  { href: '/admin/images', label: '图片管理', icon: ImageIcon },
  { href: '/admin/music', label: '音乐管理', icon: Music },
  { href: '/admin/anime', label: '追番管理', icon: Tv },
  { href: '/admin/hero', label: '首页编辑', icon: Sparkles },
  { href: '/admin/nav', label: '导航菜单', icon: MenuIcon },
  { href: '/admin/reward', label: '打赏配置', icon: Gift },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* GitHub Pages 静态托管提示 */}
      <div className="bg-amber-500/95 px-4 py-2.5 text-center text-sm text-white shadow-sm">
        <span className="font-medium">⚠️ 当前部署在 GitHub Pages 静态托管，管理功能（上传/编辑/删除）不可用。</span>
        <span className="ml-2 opacity-90">如需管理内容，请编辑 <code className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-xs">public/data/</code> 下的 JSON 文件后提交推送。</span>
      </div>
      {/* 侧边栏 */}
      <aside className="fixed inset-y-0 left-0 z-50 w-60 border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <span className="text-lg font-bold text-foreground">管理后台</span>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            返回博客
          </Link>
        </div>
      </aside>

      {/* 内容区 */}
      <main className="ml-60 min-h-screen p-8">
        {children}
      </main>
    </div>
  )
}

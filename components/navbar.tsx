'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home, FileText, Archive, Folder, Tag, Users, Link as LinkIcon, MessageCircle,
  Zap, Image as ImageIcon, Activity, Book, User, Tv, Calendar, Cpu, Music,
  MapPin, Bookmark, Info, Gift, MoreHorizontal, GitBranch, GitCommit, Star,
  BarChart3, Link2, Cloud, Globe, Search, Play, Sun, Moon, ArrowUp,
  Palette, Check, ChevronDown,
} from 'lucide-react'
import type { NavItemConfig } from '@/lib/storage'
import { useHeroConfig } from '@/lib/use-hero-config'
import { GithubMark } from '@/components/icons'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home, 'file-text': FileText, archive: Archive, folder: Folder, tag: Tag,
  users: Users, link: LinkIcon, 'message-circle': MessageCircle, zap: Zap,
  image: ImageIcon, activity: Activity, book: Book, user: User, tv: Tv,
  calendar: Calendar, cpu: Cpu, music: Music, 'map-pin': MapPin, bookmark: Bookmark,
  info: Info, gift: Gift, 'more-horizontal': MoreHorizontal, 'folder-git': Folder,
  'git-commit': GitCommit, star: Star, 'bar-chart': BarChart3, 'link-2': Link2,
  github: GithubMark, 'git-branch': GitBranch, cloud: Cloud, globe: Globe,
}

// 主题色预设（oklch hue 值变化）
const ACCENTS = [
  { name: '靛蓝', value: '264' },
  { name: '品红', value: '320' },
  { name: '青绿', value: '180' },
  { name: '橙黄', value: '40' },
  { name: '紫红', value: '350' },
  { name: '森林', value: '140' },
]

function Icon({ name, className }: { name: string; className?: string }) {
  const C = iconMap[name] ?? Globe
  return <C className={className} />
}

export function Navbar() {
  const router = useRouter()
  const [open, setOpen] = useState<string | null>(null)
  const [searchQ, setSearchQ] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isDark, setIsDark] = useState(false)
  const [accentHue, setAccentHue] = useState('264')
  const [displayOpen, setDisplayOpen] = useState(false)
  const [navItems, setNavItems] = useState<NavItemConfig[]>([])
  // 跟随 Hero 同步的招呼语（navbar 顶部 logo 和首页 Hero 共用同一份配置）
  const hero = useHeroConfig()
  const displayRef = useRef<HTMLDivElement>(null)

  // 加载导航（从管理后台配置读取，没有则用默认）
  useEffect(() => {
    fetch('/api/nav')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.items)) setNavItems(data.items)
      })
      .catch(() => {})
  }, [])

  // 初始化主题
  useEffect(() => {
    const savedDark = localStorage.getItem('dark') === '1'
    const savedHue = localStorage.getItem('accent') || '264'
    setIsDark(savedDark)
    setAccentHue(savedHue)
    applyTheme(savedDark, savedHue)
  }, [])

  function applyTheme(dark: boolean, hue: string) {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
    root.style.setProperty('--primary-hue', hue)
  }

  function toggleDark() {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('dark', next ? '1' : '0')
    applyTheme(next, accentHue)
  }

  function changeAccent(hue: string) {
    setAccentHue(hue)
    localStorage.setItem('accent', hue)
    applyTheme(isDark, hue)
  }

  // 搜索防抖
  useEffect(() => {
    if (!searchQ.trim()) {
      setSearchResults([])
      setSearchOpen(false)
      return
    }
    const timer = setTimeout(() => {
      fetch('/api/articles')
        .then(r => r.json())
        .then(data => {
          const list = data.articles || data || []
          const filtered = list.filter((a: any) =>
            a.title?.toLowerCase().includes(searchQ.toLowerCase()) ||
            a.excerpt?.toLowerCase().includes(searchQ.toLowerCase())
          ).slice(0, 6)
          setSearchResults(filtered)
          setSearchOpen(true)
        })
        .catch(() => {})
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQ])

  // 点击外部关闭显示设置
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (displayRef.current && !displayRef.current.contains(e.target as Node)) {
        setDisplayOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (searchQ.trim()) {
      router.push(`/archive?q=${encodeURIComponent(searchQ)}`)
      setSearchOpen(false)
      setSearchQ('')
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openMusic() {
    router.push('/music')
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-white/10 backdrop-blur-xl" style={{ backgroundColor: '#49567a' }}>
      <nav className="mx-auto flex h-full max-w-[1600px] items-center gap-1 px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="mr-2 flex shrink-0 items-center gap-2 text-lg font-bold text-white">
          <span className="grid size-8 place-items-center rounded-full"></span>
          <span className="font-display">{hero.greeting || 'hello'}</span>
        </Link>

        {/* Nav items */}
        <ul className="hidden items-center gap-0.5 xl:flex">
          {navItems.map((item) => (
            <li
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children && setOpen(item.label)}
              onMouseLeave={() => setOpen(null)}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <Icon name={item.icon} className="size-4" />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <Icon name={item.icon} className="size-4" />
                  <span>{item.label}</span>
                  {item.children && <ChevronDown className="size-3 opacity-60" />}
                </button>
              )}
              {item.children && open === item.label && (
                <div className="absolute left-0 top-full min-w-40 pt-2">
                  <div className="card-shadow rounded-2xl border border-border bg-white p-2">
                    {item.children.map((c) => (
                      <Link
                        key={c.label}
                        href={c.href}
                        target={c.external ? '_blank' : undefined}
                        rel={c.external ? 'noreferrer' : undefined}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
                      >
                        <Icon name={c.icon} className="size-4" />
                        <span>{c.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 text-white">
          {/* 搜索 */}
          <div className="relative hidden sm:block">
            <form onSubmit={handleSearchSubmit}>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/60" />
              <input
                type="text"
                aria-label="搜索"
                placeholder=""
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className="h-9 w-36 rounded-full border border-white/20 bg-white/10 pl-9 pr-3 text-sm text-white outline-none transition-all placeholder:text-white/60 focus:w-64 focus:border-white/40 focus:bg-white/20"
              />
            </form>
            {/* 搜索结果下拉 */}
            {searchOpen && searchResults.length > 0 && (
              <div className="card-shadow absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border bg-white p-2 text-foreground">
                {searchResults.map((r: any) => (
                  <Link
                    key={r.id || r.slug}
                    href={`/article/${r.slug}`}
                    onClick={() => { setSearchOpen(false); setSearchQ('') }}
                    className="block rounded-xl px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <div className="truncate font-medium">{r.title}</div>
                    {r.excerpt && <div className="mt-0.5 truncate text-xs text-muted-foreground">{r.excerpt}</div>}
                  </Link>
                ))}
                <button
                  onClick={handleSearchSubmit}
                  className="mt-1 w-full rounded-xl border-t border-border px-3 py-2 text-left text-xs text-primary hover:bg-accent"
                >
                  查看「{searchQ}」的全部结果 →
                </button>
              </div>
            )}
          </div>

          {/* 音乐 → /music */}
          <button
            aria-label="音乐"
            title="音乐"
            onClick={openMusic}
            className="grid size-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            <Music className="size-[18px]" />
          </button>

          {/* 回到顶部 */}
          <button
            aria-label="回到顶部"
            title="回到顶部"
            onClick={scrollToTop}
            className="grid size-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            <ArrowUp className="size-[18px]" />
          </button>

          {/* 显示设置：主题色 */}
          <div ref={displayRef} className="relative">
            <button
              aria-label="显示设置"
              title="显示设置"
              onClick={() => setDisplayOpen(!displayOpen)}
              className="grid size-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <Palette className="size-[18px]" />
            </button>
            {displayOpen && (
              <div className="card-shadow absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-white p-3 text-foreground">
                <p className="mb-2 px-1 text-xs font-semibold text-muted-foreground">主题色</p>
                <div className="mb-3 grid grid-cols-6 gap-2">
                  {ACCENTS.map(a => (
                    <button
                      key={a.value}
                      onClick={() => changeAccent(a.value)}
                      title={a.name}
                      className="relative grid size-8 place-items-center rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: `oklch(0.62 0.16 ${a.value})`,
                        borderColor: accentHue === a.value ? '#fff' : 'transparent',
                        boxShadow: accentHue === a.value ? `0 0 0 2px oklch(0.62 0.16 ${a.value})` : 'none',
                      }}
                    >
                      {accentHue === a.value && <Check className="size-3.5 text-white" />}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { toggleDark(); setDisplayOpen(false) }}
                  className="flex w-full items-center justify-between rounded-xl bg-secondary px-3 py-2 text-sm transition-colors hover:bg-secondary/70"
                >
                  <span className="flex items-center gap-2">
                    {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
                    {isDark ? '深色模式' : '浅色模式'}
                  </span>
                  <span className={`relative h-5 w-9 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-muted'}`}>
                    <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${isDark ? 'left-4' : 'left-0.5'}`} />
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* 主题切换（独立按钮）*/}
          <button
            aria-label="切换深色模式"
            title={isDark ? '切换为浅色模式' : '切换为深色模式'}
            onClick={toggleDark}
            className="grid size-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            {isDark ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
          </button>
        </div>
      </nav>
    </header>
  )
}
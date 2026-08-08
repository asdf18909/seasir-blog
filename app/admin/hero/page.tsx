'use client'

import { useEffect, useState, useRef } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import {
  Upload, Loader2, CheckCircle2, RotateCcw, User, Image as ImageIcon,
  Type, MousePointerClick, Cloud, AlertCircle,
} from 'lucide-react'

type HeroConfig = {
  avatar: string
  bgImage: string
  greeting: string
  subtitle: string
  buttonText: string
}

const DEFAULTS: HeroConfig = {
  avatar: '/avatar.png',
  bgImage: '/hero-bg.png',
  greeting: 'hello',
  subtitle: '花有重开日，人无再少年',
  buttonText: '开始阅读',
}

export default function AdminHeroPage() {
  const [config, setConfig] = useState<HeroConfig>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [uploading, setUploading] = useState<'avatar' | 'bgImage' | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<string>('')
  const [dirty, setDirty] = useState(false)
  const avatarInput = useRef<HTMLInputElement>(null)
  const bgInput = useRef<HTMLInputElement>(null)

  // 跨标签页广播频道（同步通知博客首页等）
  const channelRef = useRef<BroadcastChannel | null>(null)

  // 加载配置
  useEffect(() => {
    fetch('/api/admin/hero')
      .then(r => r.json())
      .then(data => {
        if (data && typeof data === 'object') setConfig({ ...DEFAULTS, ...data })
        setLoading(false)
      })
      .catch(() => setLoading(false))
    // 初始化广播频道
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channelRef.current = new BroadcastChannel('hero-updated')
      }
    } catch { /* 旧浏览器兼容 */ }
    return () => { try { channelRef.current?.close() } catch {} }
  }, [])

  // =============== 自动保存逻辑（debounce + 队列） ===============
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingConfig = useRef<HeroConfig | null>(null)
  const savingRef = useRef(false)

  async function persist(cfg: HeroConfig) {
    if (savingRef.current) {
      pendingConfig.current = cfg
      return
    }
    savingRef.current = true
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/admin/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      })
      if (!res.ok) throw new Error('保存失败')
      const now = new Date()
      setSaveStatus('saved')
      setLastSavedAt(now.toLocaleTimeString('zh-CN', { hour12: false }))
      setDirty(false)
      // 广播：通知所有打开的页面（首页等）实时刷新
      try {
        channelRef.current?.postMessage({ ts: now.getTime() })
        // 兼容旧浏览器：localStorage 事件
        localStorage.setItem('hero-updated-time', String(now.getTime()))
      } catch {}
    } catch {
      setSaveStatus('error')
    } finally {
      savingRef.current = false
      // 处理排队的保存请求
      if (pendingConfig.current) {
        const next = pendingConfig.current
        pendingConfig.current = null
        // 短暂延迟避免连续写入冲突
        setTimeout(() => persist(next), 50)
      }
    }
  }

  function updateConfig(next: HeroConfig) {
    setConfig(next)
    setDirty(true)
    setSaveStatus('idle')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    // 600ms debounce，期间多次编辑只会保留最后一次
    saveTimer.current = setTimeout(() => persist(next), 600)
  }

  // 页面卸载前如有未保存的修改，立即同步保存
  useEffect(() => {
    const handler = () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      // 注意：这里不能 await，统一交给浏览器 sendBeacon 更合适
      try {
        navigator.sendBeacon?.(
          '/api/admin/hero',
          new Blob([JSON.stringify(config)], { type: 'application/json' })
        )
      } catch {}
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [config])

  // =============== 上传图片 ===============
  async function handleUpload(file: File, target: 'avatar' | 'bgImage') {
    setUploading(target)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'image')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '上传失败')
      const next = { ...config, [target]: data.url }
      setConfig(next)
      // 上传完立即保存，跳过 debounce
      if (saveTimer.current) clearTimeout(saveTimer.current)
      await persist(next)
    } catch (e: any) {
      alert('上传失败：' + e.message)
    } finally {
      setUploading(null)
    }
  }

  // =============== 恢复默认 ===============
  async function reset() {
    if (!confirm('确定恢复为默认配置？此操作会立刻写入数据文件并同步到博客首页。')) return
    setConfig(DEFAULTS)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    await persist(DEFAULTS)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> 加载中...
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl">
        {/* 标题栏 + 自动保存状态 */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">首页 Hero 编辑</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              配置博客首屏的全屏背景、头像、标题、副标题和按钮
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* 自动保存状态徽章 */}
            <SaveStatusBadge status={saveStatus} lastSavedAt={lastSavedAt} dirty={dirty} />
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground/70 transition-colors hover:bg-secondary"
            >
              <RotateCcw className="size-4" />
              恢复默认
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 左侧：表单 */}
          <div className="space-y-4">
            {/* 头像 */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                <User className="size-4 text-primary" /> 头像图片
              </h3>
              <div className="flex items-center gap-4">
                <div className="size-20 overflow-hidden rounded-full border-2 border-border bg-secondary">
                  {config.avatar ? (
                    <img src={config.avatar} alt="avatar" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <User className="size-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={avatarInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) handleUpload(f, 'avatar')
                      e.target.value = ''
                    }}
                  />
                  <button
                    onClick={() => avatarInput.current?.click()}
                    disabled={uploading === 'avatar'}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 px-3 py-2 text-xs text-foreground/70 transition-colors hover:bg-secondary disabled:opacity-50"
                  >
                    {uploading === 'avatar' ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                    {uploading === 'avatar' ? '上传中...' : '点击上传新头像'}
                  </button>
                  <input
                    type="text"
                    value={config.avatar}
                    onChange={e => updateConfig({ ...config, avatar: e.target.value })}
                    placeholder="或填写图片 URL"
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 背景图 */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                <ImageIcon className="size-4 text-primary" /> 全屏背景图
              </h3>
              <div className="space-y-2">
                <div className="aspect-video overflow-hidden rounded-lg border border-border bg-secondary">
                  {config.bgImage ? (
                    <img src={config.bgImage} alt="bg" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="size-8" />
                    </div>
                  )}
                </div>
                <input
                  ref={bgInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) handleUpload(f, 'bgImage')
                    e.target.value = ''
                  }}
                />
                <button
                  onClick={() => bgInput.current?.click()}
                  disabled={uploading === 'bgImage'}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 px-3 py-2 text-xs text-foreground/70 transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  {uploading === 'bgImage' ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  {uploading === 'bgImage' ? '上传中...' : '点击上传新背景图'}
                </button>
                <input
                  type="text"
                  value={config.bgImage}
                  onChange={e => updateConfig({ ...config, bgImage: e.target.value })}
                  placeholder="或填写图片 URL"
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* 文字配置 */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                <Type className="size-4 text-primary" /> 文字内容
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">主标题（大字）</label>
                  <input
                    type="text"
                    value={config.greeting}
                    onChange={e => updateConfig({ ...config, greeting: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    placeholder="hello"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">副标题（小字描述）</label>
                  <input
                    type="text"
                    value={config.subtitle}
                    onChange={e => updateConfig({ ...config, subtitle: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    placeholder="花有重开日，人无再少年"
                  />
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MousePointerClick className="size-3" /> 按钮文字
                  </label>
                  <input
                    type="text"
                    value={config.buttonText}
                    onChange={e => updateConfig({ ...config, buttonText: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    placeholder="开始阅读"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：实时预览 */}
          <div>
            <div className="sticky top-6">
              <div className="mb-2 flex items-center justify-between px-1">
                <h3 className="text-sm font-medium text-foreground">实时预览</h3>
                <span className="text-xs text-muted-foreground">编辑左侧表单即时刷新</span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                <div className="relative aspect-[9/16] w-full overflow-hidden sm:aspect-video">
                  <img
                    src={config.bgImage}
                    alt="预览背景"
                    className="absolute inset-0 size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                    <img
                      src={config.avatar}
                      alt="预览头像"
                      className="size-20 rounded-full border-4 border-white/30 object-cover shadow-2xl backdrop-blur sm:size-24"
                    />
                    <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight drop-shadow-lg sm:text-3xl">
                      {config.greeting || 'hello'}
                    </h2>
                    <p className="mt-2 max-w-[80%] text-xs text-white/80 drop-shadow sm:text-sm">
                      {config.subtitle || '副标题'}
                    </p>
                    <div className="mt-4">
                      <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-medium text-white backdrop-blur">
                        {config.buttonText || '开始阅读'}
                      </span>
                    </div>
                  </div>
                  <svg viewBox="0 0 1440 120" className="absolute inset-x-0 bottom-0 h-8 w-full fill-card" preserveAspectRatio="none">
                    <path d="M0,64 C240,120 480,120 720,80 C960,40 1200,0 1440,48 L1440,120 L0,120 Z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 px-1 text-center text-xs text-muted-foreground">
                改动会在 0.6 秒内自动保存并实时同步到博客首页
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

// 自动保存状态徽章
function SaveStatusBadge({ status, lastSavedAt, dirty }: {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSavedAt: string
  dirty: boolean
}) {
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground/70">
        <Cloud className="size-3.5 animate-pulse" />
        正在保存...
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
        <AlertCircle className="size-3.5" />
        保存失败
      </span>
    )
  }
  if (status === 'saved' || lastSavedAt) {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-3.5" />
        已自动保存{lastSavedAt ? ` · ${lastSavedAt}` : ''}
      </span>
    )
  }
  // idle
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs text-foreground/60">
      <Cloud className="size-3.5" />
      自动同步{dirty ? ' · 有未保存改动' : ''}
    </span>
  )
}

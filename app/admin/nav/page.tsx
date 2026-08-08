'use client'

import { useEffect, useState } from 'react'
import {
  Home, FileText, Archive, Folder, Tag, Users, Link as LinkIcon, MessageCircle,
  Zap, Image as ImageIcon, Activity, Book, User, Tv, Calendar, Cpu, Music,
  MapPin, Bookmark, Info, Gift, MoreHorizontal, GitBranch, GitCommit, Star,
  BarChart3, Link2, Cloud, Globe, Menu as MenuIcon, ChevronDown, ChevronUp, Trash2,
  Plus, RotateCcw, Save, ExternalLink, Check, Loader2, X,
} from 'lucide-react'
import type { NavItemConfig, NavChild } from '@/lib/storage'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home, 'file-text': FileText, archive: Archive, folder: Folder, tag: Tag,
  users: Users, link: LinkIcon, 'message-circle': MessageCircle, zap: Zap,
  image: ImageIcon, activity: Activity, book: Book, user: User, tv: Tv,
  calendar: Calendar, cpu: Cpu, music: Music, 'map-pin': MapPin, bookmark: Bookmark,
  info: Info, gift: Gift, 'more-horizontal': MoreHorizontal, 'folder-git': Folder,
  'git-commit': GitCommit, star: Star, 'bar-chart': BarChart3, 'link-2': Link2,
  github: Home, 'git-branch': GitBranch, cloud: Cloud, globe: Globe,
}

const ICON_OPTIONS = [
  'home', 'file-text', 'archive', 'folder', 'tag', 'users', 'link', 'message-circle',
  'zap', 'image', 'activity', 'book', 'user', 'tv', 'calendar', 'cpu', 'music',
  'map-pin', 'bookmark', 'info', 'gift', 'more-horizontal', 'folder-git',
  'git-commit', 'star', 'bar-chart', 'link-2', 'git-branch', 'cloud', 'globe',
]

function Icon({ name, className }: { name: string; className?: string }) {
  const C = iconMap[name] ?? Globe
  return <C className={className} />
}

type Editing = { kind: 'item' | 'child'; parentIndex?: number } | null

export default function AdminNavPage() {
  const [items, setItems] = useState<NavItemConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editing, setEditing] = useState<Editing>(null)
  const [draft, setDraft] = useState<any>(null)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)

  useEffect(() => {
    fetch('/api/admin/nav')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.items)) setItems(data.items)
      })
      .catch(() => setMessage({ type: 'error', text: '加载失败' }))
      .finally(() => setLoading(false))
  }, [])

  function showMsg(type: 'success' | 'error', text: string) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 2500)
  }

  function moveItem(index: number, dir: -1 | 1) {
    setItems(prev => {
      const next = [...prev]
      const j = index + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[index], next[j]] = [next[j], next[index]]
      return next
    })
  }

  function deleteItem(index: number) {
    if (!confirm('确认删除这个菜单（含其子菜单）？')) return
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function deleteChild(parentIndex: number, childIndex: number) {
    if (!confirm('确认删除这个子菜单？')) return
    setItems(prev => prev.map((it, i) => {
      if (i !== parentIndex || !it.children) return it
      return { ...it, children: it.children.filter((_, j) => j !== childIndex) }
    }))
  }

  function moveChild(parentIndex: number, childIndex: number, dir: -1 | 1) {
    setItems(prev => prev.map((it, i) => {
      if (i !== parentIndex || !it.children) return it
      const children = [...it.children]
      const j = childIndex + dir
      if (j < 0 || j >= children.length) return it
      ;[children[childIndex], children[j]] = [children[j], children[childIndex]]
      return { ...it, children }
    }))
  }

  function openEditItem(index: number) {
    setEditing({ kind: 'item', index } as any)
    setDraft({ ...items[index], children: items[index].children ? [...items[index].children!] : [] })
  }

  function openEditChild(parentIndex: number, childIndex: number) {
    setEditing({ kind: 'child', parentIndex, childIndex } as any)
    setDraft({ ...items[parentIndex].children![childIndex] })
  }

  function openAddItem() {
    setEditing({ kind: 'item' } as any)
    setDraft({ label: '', href: '', icon: 'home', children: [] })
  }

  function openAddChild(parentIndex: number) {
    setEditing({ kind: 'child', parentIndex } as any)
    setDraft({ label: '', href: '/', icon: 'file-text', external: false })
  }

  function commitItem() {
    if (!editing || editing.kind !== 'item' || !draft) return
    if (!draft.label?.trim()) {
      showMsg('error', '菜单名称不能为空')
      return
    }
    const newItem: NavItemConfig = {
      label: draft.label.trim(),
      icon: draft.icon || 'home',
      href: draft.href?.trim() || undefined,
    }
    if (!newItem.href && Array.isArray(draft.children) && draft.children.length > 0) {
      newItem.children = draft.children.map((c: any) => ({
        label: c.label?.trim() || '',
        href: c.href?.trim() || '#',
        icon: c.icon || 'globe',
        external: !!c.external,
      })).filter((c: NavChild) => c.label)
    }
    setItems(prev => {
      const editIndex = (editing as any).index
      if (typeof editIndex === 'number') {
        const next = [...prev]
        next[editIndex] = newItem
        return next
      }
      return [...prev, newItem]
    })
    setEditing(null)
    setDraft(null)
    showMsg('success', '已添加/更新菜单（记得点底部保存按钮）')
  }

  function commitChild() {
    if (!editing || editing.kind !== 'child' || !draft || editing.parentIndex === undefined) return
    if (!draft.label?.trim()) {
      showMsg('error', '子菜单名称不能为空')
      return
    }
    const newChild: NavChild = {
      label: draft.label.trim(),
      href: draft.href?.trim() || '#',
      icon: draft.icon || 'globe',
      external: !!draft.external,
    }
    const parentIndex = editing.parentIndex
    const editIndex = (editing as any).childIndex
    setItems(prev => prev.map((it, i) => {
      if (i !== parentIndex) return it
      const children = [...(it.children || [])]
      if (typeof editIndex === 'number') {
        children[editIndex] = newChild
      } else {
        children.push(newChild)
      }
      return { ...it, children }
    }))
    setEditing(null)
    setDraft(null)
    showMsg('success', '子菜单已添加/更新')
  }

  async function saveAll() {
    if (editing) {
      showMsg('error', '请先完成正在编辑的菜单项')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/nav', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      if (data.ok) {
        showMsg('success', `保存成功，共 ${data.count} 个一级菜单`)
      } else {
        showMsg('error', data.error || '保存失败')
      }
    } catch (e: any) {
      showMsg('error', e?.message || '网络错误')
    } finally {
      setSaving(false)
    }
  }

  async function resetDefault() {
    if (!confirm('确认重置为默认导航菜单？此操作会覆盖当前所有改动。')) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/nav', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      })
      const data = await res.json()
      if (data.ok && Array.isArray(data.items)) {
        setItems(data.items)
        showMsg('success', '已重置为默认导航')
      } else {
        showMsg('error', data.error || '重置失败')
      }
    } catch (e: any) {
      showMsg('error', e?.message || '网络错误')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 顶部标题栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">导航菜单</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            自定义导航栏的菜单项，保存后即时生效
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetDefault}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <RotateCcw className="size-4" />
            重置默认
          </button>
          <button
            onClick={saveAll}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            保存全部
          </button>
        </div>
      </div>

      {/* 提示消息 */}
      {message && (
        <div className={`rounded-xl border px-4 py-2.5 text-sm ${
          message.type === 'success'
            ? 'border-green-500/30 bg-green-50 text-green-700'
            : 'border-red-500/30 bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 编辑区 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">菜单列表</h2>
            <button
              onClick={openAddItem}
              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Plus className="size-3.5" /> 添加一级菜单
            </button>
          </div>

          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
              还没有菜单，点击「添加一级菜单」开始
            </div>
          )}

          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Icon name={item.icon} className="size-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-foreground">{item.label}</span>
                      {item.href && (
                        <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {item.href === '/' ? '首页' : item.href}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.children && item.children.length > 0
                        ? `${item.children.length} 个子菜单`
                        : '无子菜单（直接链接）'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => moveItem(i, -1)}
                      disabled={i === 0}
                      className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30"
                      title="上移"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      onClick={() => moveItem(i, 1)}
                      disabled={i === items.length - 1}
                      className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30"
                      title="下移"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                    <button
                      onClick={() => openEditItem(i)}
                      className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      title="编辑"
                    >
                      <FileText className="size-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(i)}
                      className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                      title="删除"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {/* 子菜单列表 */}
                {item.children && item.children.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-border pt-3 pl-8">
                    {item.children.map((c, j) => (
                      <div key={j} className="flex items-center gap-2 rounded-lg bg-secondary/40 px-2 py-1.5">
                        <Icon name={c.icon} className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{c.label}</span>
                        <span className="shrink-0 truncate text-xs text-muted-foreground max-w-[140px]">{c.href}</span>
                        {c.external && <ExternalLink className="size-3 shrink-0 text-muted-foreground" />}
                        <button
                          onClick={() => moveChild(i, j, -1)}
                          disabled={j === 0}
                          className="grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30"
                          title="上移"
                        >
                          <ChevronUp className="size-3.5" />
                        </button>
                        <button
                          onClick={() => moveChild(i, j, 1)}
                          disabled={j === item.children!.length - 1}
                          className="grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30"
                          title="下移"
                        >
                          <ChevronDown className="size-3.5" />
                        </button>
                        <button
                          onClick={() => openEditChild(i, j)}
                          className="grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          title="编辑"
                        >
                          <FileText className="size-3.5" />
                        </button>
                        <button
                          onClick={() => deleteChild(i, j)}
                          className="grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                          title="删除"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 添加子菜单按钮 */}
                <button
                  onClick={() => openAddChild(i)}
                  className="mt-3 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-primary transition-colors hover:bg-primary/10"
                >
                  <Plus className="size-3" /> 添加子菜单
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 实时预览 */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <h2 className="mb-3 text-base font-semibold text-foreground">实时预览</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
              模拟导航栏展示
            </div>
            <div className="bg-[#49567a] px-4 py-3">
              <ul className="flex flex-wrap items-center gap-1">
                {items.map((item, i) => (
                  <li key={i} className="relative">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                      <Icon name={item.icon} className="size-3.5" />
                      {item.label}
                      {item.children && item.children.length > 0 && <ChevronDown className="size-3 opacity-60" />}
                    </span>
                  </li>
                ))}
                {items.length === 0 && (
                  <span className="py-2 text-xs text-white/60">暂无菜单</span>
                )}
              </ul>
              <p className="mt-3 text-[10px] text-white/60">
                以上只是视觉效果预览，实际渲染会用主题色
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
            <p className="mb-2 font-semibold text-foreground">使用提示</p>
            <ul className="space-y-1.5 leading-relaxed">
              <li>• <b>一级菜单</b>：填了「链接」就是直接跳转，没填就当作下拉菜单组</li>
              <li>• <b>子菜单</b>：必填链接，勾选「外链」后点击会新窗口打开</li>
              <li>• <b>上下箭头</b>：调换显示顺序</li>
              <li>• 修改后必须点右上角「保存全部」才会写入文件</li>
              <li>• 「重置默认」会清空所有自定义，恢复内置菜单</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 编辑弹窗 */}
      {editing && draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => { setEditing(null); setDraft(null) }}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {editing.kind === 'item' ? '一级菜单' : '子菜单'}
              </h3>
              <button
                onClick={() => { setEditing(null); setDraft(null) }}
                className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">显示名称</label>
                <input
                  type="text"
                  value={draft.label || ''}
                  onChange={e => setDraft({ ...draft, label: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder={editing.kind === 'item' ? '比如：文章' : '比如：归档'}
                />
              </div>

              {editing.kind === 'item' ? (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    直接链接 <span className="text-xs font-normal text-muted-foreground">（留空则作为下拉菜单组）</span>
                  </label>
                  <input
                    type="text"
                    value={draft.href || ''}
                    onChange={e => setDraft({ ...draft, href: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="/article 或 https://..."
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">链接地址</label>
                    <input
                      type="text"
                      value={draft.href || ''}
                      onChange={e => setDraft({ ...draft, href: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      placeholder="/archive"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={!!draft.external}
                      onChange={e => setDraft({ ...draft, external: e.target.checked })}
                      className="size-4 rounded border-border"
                    />
                    外部链接（新窗口打开）
                  </label>
                </>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">图标</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIconPickerOpen(!iconPickerOpen)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:bg-secondary"
                  >
                    <Icon name={draft.icon || 'home'} className="size-4 text-primary" />
                    <span>{draft.icon || 'home'}</span>
                    <ChevronDown className="size-3.5 opacity-60" />
                  </button>
                </div>
                {iconPickerOpen && (
                  <div className="mt-2 grid max-h-48 grid-cols-8 gap-1.5 overflow-y-auto rounded-xl border border-border bg-background p-2">
                    {ICON_OPTIONS.map(key => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setDraft({ ...draft, icon: key })
                          setIconPickerOpen(false)
                        }}
                        className={`grid size-9 place-items-center rounded-lg transition-colors ${
                          draft.icon === key ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                        }`}
                        title={key}
                      >
                        <Icon name={key} className="size-4" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => { setEditing(null); setDraft(null) }}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                取消
              </button>
              <button
                onClick={editing.kind === 'item' ? commitItem : commitChild}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <Check className="size-4" /> 确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

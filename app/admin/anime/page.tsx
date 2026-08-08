'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Tv, Plus, Save, Trash2, Upload, Loader2, X, Star, Play, ExternalLink, Edit3, ChevronDown, Video } from 'lucide-react'

type AnimeItem = {
  id: string
  title: string
  cover: string
  score: number
  status: string
  episodes: number
  watchedEpisodes: number
  year: number
  tags: string[]
  videoUrl: string
  videoType: string
  summary: string
  createdAt: string
  updatedAt: string
}

const STATUSES = ['在看', '已看完', '想看']
const STATUS_COLORS: Record<string, string> = {
  '在看': 'text-blue-500',
  '已看完': 'text-green-500',
  '想看': 'text-yellow-500',
}

export default function AnimeAdminPage() {
  const router = useRouter()
  const [list, setList] = useState<AnimeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<AnimeItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const coverRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchList()
  }, [])

  async function fetchList() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/anime')
      const data = await r.json()
      setList(data.anime || [])
    } catch {
      setErr('加载失败')
    } finally {
      setLoading(false)
    }
  }

  function startCreate() {
    setEditing({
      id: '',
      title: '',
      cover: '',
      score: 0,
      status: '想看',
      episodes: 12,
      watchedEpisodes: 0,
      year: new Date().getFullYear(),
      tags: [],
      videoUrl: '',
      videoType: 'local',
      summary: '',
      createdAt: '',
      updatedAt: '',
    })
    setTagInput('')
    setErr(null)
  }

  function startEdit(item: AnimeItem) {
    setEditing({ ...item })
    setTagInput(item.tags.join(', '))
    setErr(null)
  }

  async function save() {
    if (!editing) return
    if (!editing.title.trim()) {
      setErr('请填写标题')
      return
    }
    setSaving(true)
    setErr(null)
    try {
      const tags = tagInput.split(/[,，、\s]+/).map(t => t.trim()).filter(Boolean)
      const payload = { ...editing, tags }
      const isEdit = !!editing.id
      const r = await fetch('/api/admin/anime', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await r.json()
      if (!data.ok) throw new Error(data.error || '保存失败')
      setEditing(null)
      await fetchList()
    } catch (e: any) {
      setErr(e?.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('确定删除这条追番记录？')) return
    try {
      await fetch(`/api/admin/anime?id=${id}`, { method: 'DELETE' })
      await fetchList()
    } catch {}
  }

  async function uploadCover(file: File) {
    setUploadingCover(true)
    setErr(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'image')
      const r = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await r.json()
      if (!data.success) throw new Error(data.error || '上传失败')
      setEditing(e => e ? { ...e, cover: data.url } : e)
    } catch (e: any) {
      setErr(e?.message || '封面上传失败')
    } finally {
      setUploadingCover(false)
    }
  }

  async function uploadVideo(file: File) {
    setUploadingVideo(true)
    setErr(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'video')
      const r = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await r.json()
      if (!data.success) throw new Error(data.error || '上传失败')
      setEditing(e => e ? { ...e, videoUrl: data.url, videoType: 'local' } : e)
    } catch (e: any) {
      setErr(e?.message || '视频上传失败')
    } finally {
      setUploadingVideo(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> 加载中...
      </div>
    )
  }

  // 编辑/新增面板
  if (editing) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {editing.id ? '编辑追番' : '新增追番'}
          </h1>
          <button onClick={() => setEditing(null)} className="text-sm text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {err && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {err}
          </div>
        )}

        <div className="space-y-5">
          {/* 标题 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">标题 *</label>
            <input
              type="text"
              value={editing.title}
              onChange={e => setEditing(s => s ? { ...s, title: e.target.value } : s)}
              placeholder="动漫/视频标题"
              className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary/60"
            />
          </div>

          {/* 封面上传 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">封面图片</label>
            <div className="flex gap-4">
              <button
                onClick={() => coverRef.current?.click()}
                disabled={uploadingCover}
                className="group relative grid h-44 w-32 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-secondary/40 transition-colors hover:border-primary/50"
              >
                {uploadingCover ? (
                  <Loader2 className="size-5 animate-spin text-primary" />
                ) : editing.cover ? (
                  <>
                    <img src={editing.cover} alt="封面" className="size-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Upload className="size-5 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Upload className="size-6" />
                    <span className="text-xs">点击上传</span>
                  </div>
                )}
              </button>
              <input
                ref={coverRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = '' }}
              />
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={editing.cover}
                  onChange={e => setEditing(s => s ? { ...s, cover: e.target.value } : s)}
                  placeholder="或直接填写图片 URL"
                  className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-xs outline-none focus:border-primary/60"
                />
                {editing.cover && (
                  <button onClick={() => setEditing(s => s ? { ...s, cover: '' } : s)} className="text-xs text-destructive hover:underline">
                    移除封面
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 视频上传 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">视频</label>
            <div className="flex gap-4">
              <button
                onClick={() => videoRef.current?.click()}
                disabled={uploadingVideo}
                className="flex h-20 w-40 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-secondary/40 transition-colors hover:border-primary/50 disabled:opacity-50"
              >
                {uploadingVideo ? (
                  <>
                    <Loader2 className="size-5 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">上传中...</span>
                  </>
                ) : (
                  <>
                    <Video className="size-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">上传视频</span>
                  </>
                )}
              </button>
              <input
                ref={videoRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadVideo(f); e.target.value = '' }}
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={editing.videoType === 'external' ? editing.videoUrl : ''}
                  onChange={e => setEditing(s => s ? { ...s, videoUrl: e.target.value, videoType: 'external' } : s)}
                  placeholder="或填写外链 URL（B站/YouTube等）"
                  className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-xs outline-none focus:border-primary/60"
                />
                {editing.videoUrl && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`rounded-full px-2 py-0.5 ${editing.videoType === 'local' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {editing.videoType === 'local' ? '本地视频' : '外链'}
                    </span>
                    <span className="truncate">{editing.videoUrl}</span>
                    <button onClick={() => setEditing(s => s ? { ...s, videoUrl: '', videoType: 'local' } : s)} className="text-destructive hover:underline">
                      清除
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 评分 + 状态 + 年份 */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">评分 (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={editing.score}
                onChange={e => setEditing(s => s ? { ...s, score: parseFloat(e.target.value) || 0 } : s)}
                className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:border-primary/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">状态</label>
              <select
                value={editing.status}
                onChange={e => setEditing(s => s ? { ...s, status: e.target.value } : s)}
                className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:border-primary/60"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">年份</label>
              <input
                type="number"
                value={editing.year}
                onChange={e => setEditing(s => s ? { ...s, year: parseInt(e.target.value) || 0 } : s)}
                className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:border-primary/60"
              />
            </div>
          </div>

          {/* 集数 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">总集数</label>
              <input
                type="number"
                min="0"
                value={editing.episodes}
                onChange={e => setEditing(s => s ? { ...s, episodes: parseInt(e.target.value) || 0 } : s)}
                className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:border-primary/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">已看集数</label>
              <input
                type="number"
                min="0"
                value={editing.watchedEpisodes}
                onChange={e => setEditing(s => s ? { ...s, watchedEpisodes: parseInt(e.target.value) || 0 } : s)}
                className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:border-primary/60"
              />
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">标签（逗号分隔）</label>
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="热血, 奇幻, 校园"
              className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:border-primary/60"
            />
          </div>

          {/* 简介 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">简介</label>
            <textarea
              value={editing.summary}
              onChange={e => setEditing(s => s ? { ...s, summary: e.target.value } : s)}
              rows={3}
              placeholder="动漫简介..."
              className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:border-primary/60"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setEditing(null)}
              className="rounded-xl border border-border px-5 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-secondary"
            >
              取消
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 列表页
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">追番管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理追番/视频记录，共 {list.length} 条
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/anime')}
            className="text-sm text-primary hover:underline"
          >
            预览前台 →
          </button>
          <button
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" /> 新增追番
          </button>
        </div>
      </div>

      {err && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {list.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Tv className="mx-auto size-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">还没有追番记录，点击右上角「新增追番」添加</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(item => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex gap-4 p-4">
                {/* 封面 */}
                <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {item.cover ? (
                    <img src={item.cover} alt={item.title} className="size-full object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center">
                      <Tv className="size-6 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className={`absolute left-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white ${STATUS_COLORS[item.status]}`}>
                    {item.status}
                  </div>
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-foreground">{item.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" /> {item.score}
                        </span>
                        <span>{item.year}</span>
                        <span>{item.watchedEpisodes}/{item.episodes} 集</span>
                        {item.videoUrl && (
                          <span className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 ${item.videoType === 'local' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {item.videoType === 'local' ? <Play className="size-2.5" /> : <ExternalLink className="size-2.5" />}
                            {item.videoType === 'local' ? '本地视频' : '外链'}
                          </span>
                        )}
                      </div>
                      {item.tags.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {item.tags.map(t => (
                            <span key={t} className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => startEdit(item)}
                        className="grid size-8 place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-secondary hover:text-foreground"
                        title="编辑"
                      >
                        <Edit3 className="size-4" />
                      </button>
                      <button
                        onClick={() => remove(item.id)}
                        className="grid size-8 place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="删除"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  {item.summary && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.summary}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

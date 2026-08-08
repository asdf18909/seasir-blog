'use client'

import { AdminLayout } from '@/components/admin-layout'
import { useEffect, useState, useRef } from 'react'
import { Upload, Trash2, Plus, Music as MusicIcon, Play, ExternalLink } from 'lucide-react'

type Track = {
  id: number
  title: string
  artist: string
  duration: number
  url: string
  cover: string
}

export default function AdminMusic() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [uploading, setUploading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newTrack, setNewTrack] = useState({ title: '', artist: '', url: '', cover: '/cover-1.png' })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const load = () => {
    fetch('/api/admin/music')
      .then(r => r.json())
      .then(data => setTracks(data.playlist || []))
      .catch(() => {})
  }

  useEffect(() => { load() }, [])

  // 上传音乐文件到 public/music/ 并加入播放列表
  const handleFileUpload = async (files: FileList) => {
    setUploading(true)
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'music')
      
      try {
        // 上传文件
        const res = await fetch('/api/admin/upload', { 
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        
        if (data.success) {
          // 添加到播放列表
          const filename = file.name
          const title = filename.replace(/\.[^.]+$/, '').replace(/^[^-]+-/, '').trim()
          const artist = filename.replace(/\.[^.]+$/, '').split('-')[0].trim()
          
          await fetch('/api/admin/music', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: title || filename,
              artist: artist || '未知歌手',
              url: data.url,
              cover: '/cover-1.png',
              duration: 0,
            }),
          })
        }
      } catch (e) {
        console.error('Upload error:', e)
      }
    }
    setUploading(false)
    load()
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`确定删除「${title}」吗？`)) return
    await fetch(`/api/admin/music/${id}`, { method: 'DELETE' })
    load()
  }

  const handleAddManual = async () => {
    if (!newTrack.title || !newTrack.url) return
    await fetch('/api/admin/music', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTrack),
    })
    setNewTrack({ title: '', artist: '', url: '', cover: '/cover-1.png' })
    setShowAdd(false)
    load()
  }

  const formatDuration = (sec: number) => {
    if (!sec) return '--:--'
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">音乐管理</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Plus className="size-4" /> 手动添加
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Upload className="size-4" /> {uploading ? '上传中...' : '上传歌曲'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={e => { if (e.target.files) handleFileUpload(e.target.files) }}
          />
        </div>
      </div>

      {/* 手动添加表单 */}
      {showAdd && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-bold text-foreground">手动添加歌曲（用外链）</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={newTrack.title}
              onChange={e => setNewTrack({ ...newTrack, title: e.target.value })}
              placeholder="歌曲名"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              type="text"
              value={newTrack.artist}
              onChange={e => setNewTrack({ ...newTrack, artist: e.target.value })}
              placeholder="歌手"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              type="text"
              value={newTrack.url}
              onChange={e => setNewTrack({ ...newTrack, url: e.target.value })}
              placeholder="音频 URL（如 /music/xxx.mp3 或外链）"
              className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              type="text"
              value={newTrack.cover}
              onChange={e => setNewTrack({ ...newTrack, cover: e.target.value })}
              placeholder="封面 URL"
              className="col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground">取消</button>
            <button onClick={handleAddManual} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">添加</button>
          </div>
        </div>
      )}

      {/* 歌曲列表 */}
      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20">
          <MusicIcon className="size-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">还没有歌曲，上传几首吧～</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">歌曲</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">歌手</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">时长</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">文件</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map(t => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3 text-sm text-muted-foreground">{t.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="grid size-8 shrink-0 place-items-center rounded bg-secondary">
                        <MusicIcon className="size-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{t.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{t.artist}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDuration(t.duration)}</td>
                  <td className="px-4 py-3">
                    <code className="max-w-[200px] truncate text-xs text-muted-foreground" title={t.url}>{t.url}</code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={t.url}
                        target="_blank"
                        className="grid size-8 place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-secondary hover:text-primary"
                        title="试听"
                      >
                        <Play className="size-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(t.id, t.title)}
                        className="grid size-8 place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <audio ref={audioRef} className="hidden" />
    </AdminLayout>
  )
}

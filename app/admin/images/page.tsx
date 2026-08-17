'use client'

import { AdminLayout } from '@/components/admin-layout'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Upload, Trash2, Copy, Check, Image as ImageIcon } from 'lucide-react'

type ImageItem = {
  id: string
  name: string
  url: string
  size: number
  uploadedAt: string
}

export default function AdminImages() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = () => {
    fetch('/api/admin/images')
      .then(r => r.json())
      .then(data => setImages(data.images || []))
      .catch(() => {})
  }

  useEffect(() => { load() }, [])

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true)
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const formData = new FormData()
      formData.append('file', file)
      try {
        await fetch('/api/admin/upload', { method: 'POST', body: formData })
      } catch {}
    }
    setUploading(false)
    load()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定删除「${name}」吗？`)) return
    await fetch(`/api/admin/image/${id}`, { method: 'DELETE' })
    load()
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(''), 2000)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }, [])

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">图片管理</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Upload className="size-4" /> {uploading ? '上传中...' : '上传图片'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => { if (e.target.files) uploadFiles(e.target.files) }}
        />
      </div>

      {/* 拖拽上传区 */}
      <div
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-12 transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
        }`}
      >
        <ImageIcon className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          {dragging ? '松开上传' : '点击或拖拽图片到此处上传'}
        </p>
        <p className="text-xs text-muted-foreground/60">支持 PNG / JPG / WebP / GIF / SVG，最大 10MB</p>
      </div>

      {/* 图片网格 */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20">
          <ImageIcon className="size-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">还没有上传图片～</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map(img => (
            <div key={img.id} className="group overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative aspect-square overflow-hidden bg-secondary">
                <img src={img.url} alt={img.name} className="size-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => copyUrl(img.url)}
                    className="grid size-9 place-items-center rounded-lg bg-white/90 text-black transition-colors hover:bg-white"
                    title="复制链接"
                  >
                    {copiedUrl === img.url ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(img.id, img.name)}
                    className="grid size-9 place-items-center rounded-lg bg-red-500/90 text-white transition-colors hover:bg-red-500"
                    title="删除"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-medium text-foreground" title={img.name}>{img.name}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{formatSize(img.size)}</span>
                  <code className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">{img.url}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

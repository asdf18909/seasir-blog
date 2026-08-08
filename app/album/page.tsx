'use client'

import { useState, useCallback, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { X, ChevronLeft, ChevronRight, ZoomIn, Images } from 'lucide-react'

type Photo = {
  id: number
  src: string
  title: string
  date: string
  location: string
  category: string
}

const photos: Photo[] = [
  { id: 1, src: '/hero-bg.png',      title: '海边日落',     date: '2026-07-15', location: '深圳 · 大梅沙', category: '风景' },
  { id: 2, src: '/cover-1.png',      title: '城市夜景',     date: '2026-07-10', location: '深圳 · 南山',   category: '风景' },
  { id: 3, src: '/cover-2.png',      title: '山水之间',     date: '2026-07-05', location: '桂林 · 阳朔',   category: '风景' },
  { id: 4, src: '/placeholder.jpg',   title: '街角咖啡',     date: '2026-06-28', location: '深圳 · 华侨城', category: '生活' },
  { id: 5, src: '/placeholder.svg',   title: '极简构图',     date: '2026-06-20', location: '深圳 · 蛇口',   category: '摄影' },
  { id: 6, src: '/avatar.png',        title: '头像',         date: '2026-06-15', location: '深圳',          category: '生活' },
  { id: 7, src: '/placeholder-logo.png', title: 'Logo 设计', date: '2026-06-10', location: '深圳',          category: '设计' },
  { id: 8, src: '/placeholder-user.jpg', title: '人像',      date: '2026-06-05', location: '深圳 · 前海',   category: '摄影' },
  { id: 9, src: '/hero-bg.png',       title: '黄昏漫步',     date: '2026-05-28', location: '深圳 · 深圳湾', category: '风景' },
  { id: 10, src: '/cover-1.png',      title: '光影',         date: '2026-05-20', location: '深圳 · 南山',   category: '摄影' },
  { id: 11, src: '/cover-2.png',      title: '远山',         date: '2026-05-15', location: '张家界',        category: '风景' },
  { id: 12, src: '/placeholder.jpg',   title: '日常',         date: '2026-05-10', location: '深圳',          category: '生活' },
]

const categories = ['全部', '风景', '生活', '摄影', '设计']

export default function AlbumPage() {
  const [activeCat, setActiveCat] = useState('全部')
  const [lightbox, setLightbox] = useState<number | null>(null)

  const filtered = activeCat === '全部' ? photos : photos.filter((p) => p.category === activeCat)

  const closeLightbox = useCallback(() => setLightbox(null), [])
  const prevPhoto = useCallback(() => {
    setLightbox((prev) => {
      if (prev === null) return null
      return prev - 1 < 0 ? filtered.length - 1 : prev - 1
    })
  }, [filtered.length])
  const nextPhoto = useCallback(() => {
    setLightbox((prev) => {
      if (prev === null) return null
      return prev + 1 >= filtered.length ? 0 : prev + 1
    })
  }, [filtered.length])

  useEffect(() => {
    if (lightbox === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prevPhoto()
      if (e.key === 'ArrowRight') nextPhoto()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, closeLightbox, prevPhoto, nextPhoto])

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        {/* 标题 */}
        <div className="mb-6">
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
            <Images className="size-6 text-primary" /> 相册
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">记录生活中的美好瞬间 · 共 {photos.length} 张照片</p>
        </div>

        {/* 分类筛选 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCat === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground/70 hover:bg-secondary/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 照片网格 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setLightbox(i)}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary"
            >
              <img
                src={photo.src}
                alt={photo.title}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-sm font-semibold text-white">{photo.title}</p>
                <p className="text-[11px] text-white/70">{photo.location}</p>
              </div>
              <div className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <ZoomIn className="size-3.5 text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 灯箱 */}
      {lightbox !== null && filtered[lightbox] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* 关闭按钮 */}
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
          {/* 上一张 */}
          <button
            onClick={(e) => { e.stopPropagation(); prevPhoto() }}
            className="absolute left-4 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="size-6" />
          </button>
          {/* 图片 */}
          <div className="flex max-h-[85vh] max-w-[85vw] flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={filtered[lightbox].src}
              alt={filtered[lightbox].title}
              className="max-h-[75vh] max-w-full rounded-xl object-contain"
            />
            <div className="mt-3 text-center">
              <p className="text-sm font-semibold text-white">{filtered[lightbox].title}</p>
              <p className="text-xs text-white/60">
                {filtered[lightbox].location} · {filtered[lightbox].date} · {lightbox + 1} / {filtered.length}
              </p>
            </div>
          </div>
          {/* 下一张 */}
          <button
            onClick={(e) => { e.stopPropagation(); nextPhoto() }}
            className="absolute right-4 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      )}

      <SiteFooter />
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { PageShell } from '@/components/page-shell'
import { Tv, Star, CheckCircle2, PlayCircle, Play, X, ExternalLink, Loader2 } from 'lucide-react'

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
}

const statusIcons: Record<string, React.ReactNode> = {
  '已看完': <CheckCircle2 className="size-3.5 text-green-500" />,
  '在看': <PlayCircle className="size-3.5 text-blue-500" />,
  '想看': <Star className="size-3.5 text-yellow-500" />,
}

export default function AnimePage() {
  const [list, setList] = useState<AnimeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState<AnimeItem | null>(null)

  useEffect(() => {
    fetch('/api/anime')
      .then(r => r.json())
      .then(data => {
        setList(data.anime || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const watching = list.filter(a => a.status === '在看')
  const watched = list.filter(a => a.status === '已看完')
  const want = list.filter(a => a.status === '想看')

  return (
    <PageShell title="追番" subtitle={`共记录 ${list.length} 部作品 · 已看完 ${watched.length} 部`} icon={<Tv className="size-6 text-primary" />}>
      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> 加载中...
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Tv className="mx-auto size-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">还没有追番记录哦～</p>
        </div>
      ) : (
        <div className="space-y-8">
          {[
            { label: '在看', list: watching },
            { label: '已看完', list: watched },
            { label: '想看', list: want },
          ].map(sec => sec.list.length > 0 && (
            <div key={sec.label}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="h-4 w-1 rounded-full bg-primary" /> {sec.label} ({sec.list.length})
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {sec.list.map(a => (
                  <div key={a.id} className="group overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                      {a.cover ? (
                        <img src={a.cover} alt={a.title} className="size-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="grid size-full place-items-center">
                          <Tv className="size-8 text-muted-foreground/30" />
                        </div>
                      )}
                      {/* 评分 */}
                      <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
                        <Star className="size-3 fill-yellow-400 text-yellow-400" /> {a.score}
                      </div>
                      {/* 状态 */}
                      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">
                        {statusIcons[a.status]} {a.status}
                      </div>
                      {/* 播放按钮 */}
                      {a.videoUrl && (
                        <button
                          onClick={() => setPlaying(a)}
                          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <div className="grid size-12 place-items-center rounded-full bg-white/90 shadow-lg">
                            <Play className="ml-0.5 size-5 fill-primary text-primary" />
                          </div>
                        </button>
                      )}
                      {/* 进度条 */}
                      {a.episodes > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min(100, (a.watchedEpisodes / a.episodes) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="truncate text-sm font-semibold text-foreground">{a.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {a.year} · {a.watchedEpisodes}/{a.episodes} 集
                      </p>
                      {a.tags.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {a.tags.map(t => <span key={t} className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 视频播放弹窗 */}
      {playing && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPlaying(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setPlaying(null)}
              className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              <X className="size-5" />
            </button>
            <div className="p-4">
              <h3 className="mb-3 truncate text-lg font-bold text-white">{playing.title}</h3>
              {playing.videoType === 'local' ? (
                <video
                  src={playing.videoUrl}
                  controls
                  autoPlay
                  className="aspect-video w-full rounded-xl bg-black"
                />
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-xl bg-secondary">
                  <ExternalLink className="size-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">这是一个外链视频</p>
                  <a
                    href={playing.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                  >
                    <ExternalLink className="size-4" /> 打开链接
                  </a>
                </div>
              )}
              {playing.summary && (
                <p className="mt-3 text-sm leading-relaxed text-white/70">{playing.summary}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  X, Music, Volume2, VolumeX, SkipBack, SkipForward,
  Play, Pause, ListMusic, Repeat, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useStats } from '@/lib/use-stats'

type Track = {
  id: number
  title: string
  artist: string
  duration: number
  url: string
  cover: string
}

function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
      <span className="h-4 w-1 rounded-full bg-primary" />
      {children}
    </h2>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`card-shadow rounded-2xl border border-border bg-card p-4 ${className}`}>
      {children}
    </div>
  )
}

function Announcement() {
  const [show, setShow] = useState(true)
  if (!show) return null
  return (
    <Card>
      <SectionTitle>📢 欢迎来访者</SectionTitle>
      <div className="rounded-xl bg-accent/60 p-3">
        <p className="text-xs font-semibold text-accent-foreground">公告</p>
        <p className="mt-1 text-sm text-foreground/80">欢迎来到我的博客，动态更新频繁哦</p>
        <div className="mt-2 flex items-center justify-end">
          <button aria-label="关闭公告" onClick={() => setShow(false)} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
      </div>
    </Card>
  )
}

function MusicPlayer() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [muted, setMuted] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 获取播放列表
  useEffect(() => {
    fetch('/api/music')
      .then((res) => res.json())
      .then((data) => {
        if (data.playlist?.length) {
          setTracks(data.playlist)
          setDuration(data.playlist[0].duration)
        }
      })
      .catch(() => {})
  }, [])

  const currentTrack = tracks[currentIndex]

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        // 浏览器可能阻止自动播放
        setIsPlaying(false)
      })
    }
  }, [])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const togglePlay = () => {
    if (isPlaying) pause()
    else play()
  }

  const nextTrack = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1 >= tracks.length ? 0 : prev + 1
      return next
    })
    setCurrentTime(0)
  }, [tracks.length])

  const prevTrack = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev - 1 < 0 ? tracks.length - 1 : prev - 1
      return next
    })
    setCurrentTime(0)
  }, [tracks.length])

  // 切歌时加载新音频
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url
      audioRef.current.load()
      setDuration(currentTrack.duration)
      if (isPlaying) {
        play()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  // 音量变化
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume
    }
  }, [volume, muted])

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = ratio * duration
    setCurrentTime(ratio * duration)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <Card>
      <SectionTitle>🎵 音乐</SectionTitle>
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          if (e.currentTarget.duration && !isNaN(e.currentTarget.duration)) {
            setDuration(e.currentTarget.duration)
          }
        }}
        onEnded={() => {
          if (repeat && audioRef.current) {
            audioRef.current.currentTime = 0
            play()
          } else {
            nextTrack()
          }
        }}
        onError={() => {
          // 播放失败时自动跳到下一首
          if (isPlaying) {
            setTimeout(() => nextTrack(), 1500)
          }
        }}
      />
      <div className="flex items-center gap-3">
        <div
          className={`relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}
        >
          {currentTrack?.cover ? (
            <img src={currentTrack.cover} alt="" className="size-full object-cover" />
          ) : (
            <Music className="size-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-semibold text-foreground">
              {currentTrack?.title ?? '加载中...'}
            </p>
            <button
              aria-label={muted ? '取消静音' : '静音'}
              onClick={() => setMuted(!muted)}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {currentTrack?.artist ?? ''}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {formatTime(currentTime)}
            </span>
            <div
              className="group relative h-1 flex-1 cursor-pointer rounded-full bg-secondary"
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-150"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100"
                style={{ left: `calc(${progress}% - 5px)` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
      {/* 音量条 */}
      <div className="mt-2 flex items-center gap-2 px-1">
        <Volume2 className="size-3 text-muted-foreground" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={muted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value))
            setMuted(false)
          }}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
        />
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-foreground/70">
        <button
          aria-label="播放模式"
          onClick={() => setRepeat(!repeat)}
          className={`transition-colors hover:text-foreground ${repeat ? 'text-primary' : ''}`}
        >
          <Repeat className="size-4" />
        </button>
        <button aria-label="上一首" onClick={prevTrack} className="transition-colors hover:text-foreground">
          <SkipBack className="size-5" />
        </button>
        <button
          aria-label={isPlaying ? '暂停' : '播放'}
          onClick={togglePlay}
          className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
        >
          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
        </button>
        <button aria-label="下一首" onClick={nextTrack} className="transition-colors hover:text-foreground">
          <SkipForward className="size-5" />
        </button>
        <button
          aria-label="播放列表"
          onClick={() => setShowPlaylist(!showPlaylist)}
          className={`transition-colors hover:text-foreground ${showPlaylist ? 'text-primary' : ''}`}
        >
          <ListMusic className="size-4" />
        </button>
      </div>
      {/* 播放列表 */}
      {showPlaylist && (
        <div className="mt-3 max-h-48 space-y-1 overflow-y-auto border-t border-border pt-2">
          {tracks.map((t, i) => (
            <button
              key={t.id}
              onClick={() => {
                setCurrentIndex(i)
                setCurrentTime(0)
                if (!isPlaying) {
                  setTimeout(() => play(), 100)
                }
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                i === currentIndex
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/70 hover:bg-secondary'
              }`}
            >
              <span className="w-4 shrink-0 text-center">
                {i === currentIndex && isPlaying ? '♪' : i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{t.title}</span>
              <span className="shrink-0 text-muted-foreground">{formatTime(t.duration)}</span>
            </button>
          ))}
        </div>
      )}
    </Card>
  )
}

const tagColors = [
  'bg-chart-1/15 text-chart-1',
  'bg-chart-2/15 text-chart-2',
  'bg-chart-3/15 text-chart-3',
  'bg-chart-4/20 text-chart-4',
  'bg-chart-5/15 text-chart-5',
]

function CategoriesTags() {
  const [cats, setCats] = useState<{ name: string; count: number }[]>([])
  const [tagList, setTagList] = useState<{ name: string; count: number }[]>([])

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCats(d.categories || [])).catch(() => {})
    fetch('/api/tags').then((r) => r.json()).then((d) => setTagList(d.tags || [])).catch(() => {})
  }, [])

  return (
    <Card>
      <SectionTitle>分类</SectionTitle>
      <div className="space-y-1">
        {cats.map((c) => (
          <Link
            key={c.name}
            href={`/categories/${encodeURIComponent(c.name)}`}
            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-secondary"
          >
            <span className="text-foreground/80">{c.name}</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{c.count}</span>
          </Link>
        ))}
      </div>
      <div className="mt-4">
        <SectionTitle>标签</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {tagList.map((t, i) => (
            <Link
              key={t.name}
              href={`/tags/${encodeURIComponent(t.name)}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-transform hover:scale-105 ${tagColors[i % tagColors.length]}`}
            >
              {t.name}
            </Link>
          ))}
        </div>
      </div>
    </Card>
  )
}

function Hitokoto() {
  const [quote, setQuote] = useState<{ content: string; author: string } | null>(null)

  useEffect(() => {
    fetch('/api/hitokoto')
      .then((r) => r.json())
      .then((d) => setQuote(d))
      .catch(() => {
        setQuote({ content: '人生最大的幸福，是发现自己爱的人正好也爱着自己。', author: '张爱玲' })
      })
  }, [])

  return (
    <Card>
      <SectionTitle>✨ 今日一言</SectionTitle>
      <blockquote className="border-l-2 border-primary/40 pl-3 text-sm italic text-foreground/80">
        &ldquo;{quote?.content ?? '加载中...'}&rdquo;
      </blockquote>
      <p className="mt-2 text-right text-xs text-muted-foreground">—— {quote?.author ?? ''}</p>
    </Card>
  )
}

function Stats() {
  const { data } = useStats()
  const visitStats = data.visitStats

  const items = [
    { n: visitStats.totalViews, l: '总浏览量' },
    { n: visitStats.visits, l: '访问数' },
    { n: visitStats.visitors, l: '游客数' },
  ]

  return (
    <Card>
      <SectionTitle>统计</SectionTitle>
      <div className="grid grid-cols-3 gap-2 text-center">
        {items.map((s) => (
          <div key={s.l} className="rounded-xl bg-secondary/60 py-2">
            <p className="text-base font-bold text-primary">{s.n}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function LeftSidebar() {
  return (
    <aside className="flex w-full flex-col gap-4">
      <Announcement />
      <MusicPlayer />
      <CategoriesTags />
      <Hitokoto />
      <Stats />
    </aside>
  )
}

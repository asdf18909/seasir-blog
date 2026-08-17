'use client'

import { useState, useEffect, useRef } from 'react'
import { PageShell } from '@/components/page-shell'
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, ListMusic } from 'lucide-react'

type Track = {
  id: number; title: string; artist: string; duration: number; url: string; cover: string
}

function formatTime(s: number) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function MusicPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [dur, setDur] = useState(0)
  const [vol, setVol] = useState(0.7)
  const [muted, setMuted] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [showList, setShowList] = useState(true)
  const audio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // GitHub Pages 静态部署：直接读 JSON
    fetch('/data/playlist.json').then(r => r.json()).then(d => {
      const list = Array.isArray(d) ? d : (d.playlist || [])
      if (list.length) { setTracks(list); setDur(list[0].duration) }
    }).catch(() => {})
  }, [])

  const track = tracks[idx]

  const play = () => { audio.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false)) }
  const pause = () => { audio.current?.pause(); setPlaying(false) }
  const next = () => { setIdx(p => p + 1 >= tracks.length ? 0 : p + 1); setCurrent(0) }
  const prev = () => { setIdx(p => p - 1 < 0 ? tracks.length - 1 : p - 1); setCurrent(0) }

  useEffect(() => {
    if (audio.current && track) { audio.current.src = track.url; audio.current.load(); setDur(track.duration); if (playing) play() }
    // eslint-disable-next-line
  }, [idx])

  useEffect(() => { if (audio.current) audio.current.volume = muted ? 0 : vol }, [vol, muted])

  const progress = dur > 0 ? (current / dur) * 100 : 0

  return (
    <PageShell title="音乐" subtitle="听点好听的～" icon={<Music className="size-6 text-primary" />}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* 播放器主体 */}
        <div className="flex flex-col items-center gap-4 p-6">
          <div className={`relative grid size-48 place-items-center overflow-hidden rounded-full bg-secondary ${playing ? 'animate-[spin_8s_linear_infinite]' : ''}`}>
            {track?.cover ? <img src={track.cover} alt="" className="size-full object-cover" /> : <Music className="size-16 text-muted-foreground" />}
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{track?.title ?? '加载中...'}</p>
            <p className="text-sm text-muted-foreground">{track?.artist ?? ''}</p>
          </div>
          {/* 进度条 */}
          <div className="flex w-full items-center gap-2">
            <span className="text-xs tabular-nums text-muted-foreground">{formatTime(current)}</span>
            <div className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-secondary" onClick={(e) => { if (!audio.current || !dur) return; const r = e.currentTarget.getBoundingClientRect(); const ratio = (e.clientX - r.left) / r.width; audio.current.currentTime = ratio * dur; setCurrent(ratio * dur) }}>
              <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">{formatTime(dur)}</span>
          </div>
          {/* 控制按钮 */}
          <div className="flex items-center gap-6">
            <button onClick={() => setRepeat(!repeat)} className={`transition-colors ${repeat ? 'text-primary' : 'text-foreground/60 hover:text-foreground'}`}><Repeat className="size-5" /></button>
            <button onClick={prev} className="text-foreground/80 hover:text-foreground"><SkipBack className="size-7" /></button>
            <button onClick={() => playing ? pause() : play()} className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95">
              {playing ? <Pause className="size-6" /> : <Play className="size-6 translate-x-0.5" />}
            </button>
            <button onClick={next} className="text-foreground/80 hover:text-foreground"><SkipForward className="size-7" /></button>
            <button onClick={() => setShowList(!showList)} className={`transition-colors ${showList ? 'text-primary' : 'text-foreground/60 hover:text-foreground'}`}><ListMusic className="size-5" /></button>
          </div>
          {/* 音量 */}
          <div className="flex w-full max-w-xs items-center gap-2">
            <button onClick={() => setMuted(!muted)} className="text-muted-foreground hover:text-foreground">
              {muted || vol === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : vol} onChange={(e) => { setVol(parseFloat(e.target.value)); setMuted(false) }} className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-primary" />
          </div>
        </div>
        {/* 播放列表 */}
        {showList && (
          <div className="border-t border-border">
            <div className="max-h-64 overflow-y-auto p-2">
              {tracks.map((t, i) => (
                <button key={t.id} onClick={() => { setIdx(i); setCurrent(0); setTimeout(() => play(), 100) }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${i === idx ? 'bg-primary/10' : 'hover:bg-secondary'}`}>
                  <span className="w-5 text-center text-xs text-muted-foreground">{i === idx && playing ? '♪' : i + 1}</span>
                  <img src={t.cover} alt="" className="size-9 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${i === idx ? 'text-primary' : 'text-foreground'}`}>{t.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.artist}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(t.duration)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <audio ref={audio} onTimeUpdate={e => setCurrent(e.currentTarget.currentTime)} onLoadedMetadata={e => { if (!isNaN(e.currentTarget.duration)) setDur(e.currentTarget.duration) }} onEnded={() => { if (repeat) { audio.current!.currentTime = 0; play() } else next() }} onError={() => { if (playing) setTimeout(() => next(), 1500) }} />
    </PageShell>
  )
}

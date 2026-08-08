'use client'

import { useState } from 'react'
import { PageShell } from '@/components/page-shell'
import { Zap, Heart, MessageCircle, Image as ImageIcon } from 'lucide-react'

type Moment = {
  id: number; author: string; avatar: string; content: string; images: string[]; date: string; likes: number; comments: number
}

const moments: Moment[] = []

export default function MomentsPage() {
  const [liked, setLiked] = useState<Set<number>>(new Set())

  const toggleLike = (id: number) => {
    setLiked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <PageShell title="朋友圈" subtitle="记录生活的点滴～" icon={<Zap className="size-6 text-primary" />}>
      {moments.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Zap className="mx-auto size-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">还没有朋友圈动态哦～</p>
        </div>
      ) : (
      <div className="space-y-4">
        {moments.map(m => (
          <div key={m.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex gap-3">
              <img src={m.avatar} alt={m.author} className="size-10 shrink-0 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-semibold text-foreground">{m.author}</span>
                <p className="mt-1 text-sm text-foreground/80">{m.content}</p>
                {m.images.length > 0 && (
                  <div className={`mt-3 grid gap-1 ${m.images.length === 1 ? 'grid-cols-1 max-w-xs' : m.images.length <= 4 ? 'grid-cols-2 max-w-sm' : 'grid-cols-3 max-w-md'}`}>
                    {m.images.map((img, i) => (
                      <div key={i} className="aspect-square overflow-hidden rounded-xl bg-secondary">
                        <img src={img} alt="" className="size-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{m.date}</span>
                  <button onClick={() => toggleLike(m.id)} className={`flex items-center gap-1 transition-colors ${liked.has(m.id) ? 'text-primary' : 'hover:text-foreground'}`}>
                    <Heart className={`size-3.5 ${liked.has(m.id) ? 'fill-current' : ''}`} /> {m.likes + (liked.has(m.id) ? 1 : 0)}
                  </button>
                  <span className="flex items-center gap-1"><MessageCircle className="size-3.5" /> {m.comments}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </PageShell>
  )
}

'use client'

import { useState } from 'react'
import { PageShell } from '@/components/page-shell'
import { MessageCircle, Send, Heart } from 'lucide-react'

type Comment = {
  id: number
  name: string
  avatar: string
  content: string
  date: string
  likes: number
  replies?: Comment[]
}

const initialComments: Comment[] = [
  {
    id: 1, name: '张三', avatar: '/avatar.png', content: '博客做得很漂亮，文章也很有质量！', date: '2026-08-05', likes: 12,
    replies: [{ id: 2, name: '博主', avatar: '/avatar.png', content: '谢谢支持！', date: '2026-08-05', likes: 3 }],
  },
  { id: 3, name: '李四', avatar: '/placeholder-user.jpg', content: '请问博客用的是什么主题？', date: '2026-08-01', likes: 5 },
  { id: 4, name: '小林', avatar: '/placeholder-user.jpg', content: 'AI 摘要功能很有意思，期待更多分享！', date: '2026-07-28', likes: 8 },
]

export default function CommentsPage() {
  const [comments, setComments] = useState(initialComments)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())

  const submit = () => {
    if (!content.trim()) return
    const newComment: Comment = {
      id: Date.now(),
      name: name.trim() || '匿名访客',
      avatar: '/placeholder-user.jpg',
      content: content.trim(),
      date: new Date().toISOString().split('T')[0],
      likes: 0,
    }
    setComments([newComment, ...comments])
    setContent('')
  }

  const toggleLike = (id: number) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setComments(comments.map(c => c.id === id ? { ...c, likes: c.likes - 1 } : c))
      } else {
        next.add(id)
        setComments(comments.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c))
      }
      return next
    })
  }

  return (
    <PageShell title="留言板" subtitle="有什么想说的，留个言吧～" icon={<MessageCircle className="size-6 text-primary" />}>
      {/* 输入区 */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="昵称（可选）"
          className="mb-3 w-full rounded-xl border border-border bg-secondary/40 px-4 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="说点什么..."
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-secondary/40 px-4 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={submit}
            className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Send className="size-4" /> 发布
          </button>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex gap-3">
              <img src={c.avatar} alt={c.name} className="size-10 shrink-0 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.date}</span>
                </div>
                <p className="mt-1 text-sm text-foreground/80">{c.content}</p>
                <button
                  onClick={() => toggleLike(c.id)}
                  className={`mt-2 flex items-center gap-1 text-xs transition-colors ${likedIds.has(c.id) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Heart className={`size-3.5 ${likedIds.has(c.id) ? 'fill-current' : ''}`} /> {c.likes}
                </button>
                {c.replies && (
                  <div className="mt-3 space-y-3 border-l-2 border-border pl-3">
                    {c.replies.map((r) => (
                      <div key={r.id} className="flex gap-2">
                        <img src={r.avatar} alt={r.name} className="size-8 shrink-0 rounded-full object-cover" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">{r.name}</span>
                            <span className="text-[11px] text-muted-foreground">{r.date}</span>
                          </div>
                          <p className="mt-0.5 text-sm text-foreground/80">{r.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}

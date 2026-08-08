import { PageShell } from '@/components/page-shell'
import { Book } from 'lucide-react'

const entries: { id: number; date: string; weather: string; mood: string; title: string; content: string }[] = []

export default function DiaryPage() {
  return (
    <PageShell title="日记" subtitle="记录每天的心情与故事～" icon={<Book className="size-6 text-primary" />}>
      {entries.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Book className="mx-auto size-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">还没有写日记哦～</p>
        </div>
      ) : (
      <div className="space-y-4">
        {entries.map(e => (
          <div key={e.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-foreground">{e.title}</span>
                <span className="text-xl">{e.mood}</span>
              </div>
              <span className="text-xs text-muted-foreground">{e.weather} · {e.date}</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80">{e.content}</p>
          </div>
        ))}
      </div>
      )}
    </PageShell>
  )
}

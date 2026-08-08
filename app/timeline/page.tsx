import { PageShell } from '@/components/page-shell'
import { GitCommit } from 'lucide-react'

const timeline: { date: string; title: string; desc: string; tag: string }[] = []

export default function TimelinePage() {
  return (
    <PageShell title="时间线" subtitle="记录博客成长历程～" icon={<GitCommit className="size-6 text-primary" />}>
      {timeline.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <GitCommit className="mx-auto size-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">还没有时间线记录哦～</p>
        </div>
      ) : (
      <div className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-1rem)] before:w-0.5 before:bg-border">
        {timeline.map((item, i) => (
          <div key={i} className="relative pl-12">
            <div className="absolute left-0 top-0 grid size-10 place-items-center rounded-full bg-primary/10">
              <span className="size-3 rounded-full bg-primary ring-4 ring-primary/10" />
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{item.date}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${'bg-secondary text-muted-foreground'}`}>{item.tag}</span>
              </div>
              <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-foreground/70">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      )}
    </PageShell>
  )
}

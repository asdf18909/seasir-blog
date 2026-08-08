import { PageShell } from '@/components/page-shell'
import { Activity } from 'lucide-react'

const statuses: { id: number; content: string; date: string; tag: string }[] = []

export default function StatusPage() {
  return (
    <PageShell title="动态" subtitle="随手记下此刻的想法～" icon={<Activity className="size-6 text-primary" />}>
      {statuses.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Activity className="mx-auto size-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">还没有动态记录哦～</p>
        </div>
      ) : (
      <div className="relative space-y-4 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-1rem)] before:w-0.5 before:bg-border">
        {statuses.map(s => (
          <div key={s.id} className="relative pl-12">
            <div className="absolute left-0 top-1 grid size-10 place-items-center rounded-full bg-primary/10">
              <span className="size-3 rounded-full bg-primary" />
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${'bg-secondary text-muted-foreground'}`}>{s.tag}</span>
                <span className="text-xs text-muted-foreground">{s.date}</span>
              </div>
              <p className="text-sm text-foreground/80">{s.content}</p>
            </div>
          </div>
        ))}
      </div>
      )}
    </PageShell>
  )
}

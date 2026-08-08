import { PageShell } from '@/components/page-shell'
import { Calendar, Check } from 'lucide-react'

const schedule: { day: string; items: { name: string; time: string; ep: string }[] }[] = [
  { day: '周一', items: [] },
  { day: '周二', items: [] },
  { day: '周三', items: [] },
  { day: '周四', items: [] },
  { day: '周五', items: [] },
  { day: '周六', items: [] },
  { day: '周日', items: [] },
]

const today = new Date().getDay()
const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default function BangumiPage() {
  const totalToday = schedule[(today === 0 ? 6 : today - 1)]?.items.length || 0

  return (
    <PageShell title="番组计划" subtitle={`今天是${dayNames[today]} · 今日更新 ${totalToday} 部`} icon={<Calendar className="size-6 text-primary" />}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {schedule.map((d) => {
          const isToday = d.day === dayNames[today]
          return (
            <div key={d.day} className={`rounded-2xl border p-3 ${isToday ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
              <div className="mb-2 flex items-center justify-between">
                <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>{d.day}</span>
                {isToday && <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">今天</span>}
              </div>
              {d.items.length === 0 ? (
                <p className="py-3 text-center text-xs text-muted-foreground">无更新</p>
              ) : (
                <div className="space-y-2">
                  {d.items.map((item, i) => (
                    <div key={i} className="rounded-xl bg-secondary/60 p-2">
                      <p className="truncate text-xs font-semibold text-foreground">{item.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{item.ep} · {item.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {/* 已追番统计 */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="font-display text-2xl font-bold text-primary">0</p>
          <p className="mt-1 text-xs text-muted-foreground">已追番</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="font-display text-2xl font-bold text-primary">0</p>
          <p className="mt-1 text-xs text-muted-foreground">总集数</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="font-display text-2xl font-bold text-primary">-</p>
          <p className="mt-1 text-xs text-muted-foreground">平均评分</p>
        </div>
      </div>
    </PageShell>
  )
}

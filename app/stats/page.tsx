'use client'

import { useEffect, useState } from 'react'
import { BarChart3, FileText, Folder, Tag, Type, Clock, CalendarDays, Eye, Users, TrendingUp } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { useStats } from '@/lib/use-stats'

export default function StatsPage() {
  const { data } = useStats()
  const s = data.siteStats
  const v = data.visitStats

  const [monthly, setMonthly] = useState<{ date: string; views: number }[]>([])

  useEffect(() => {
    let stop = false
    const load = async () => {
      try {
        const r = await fetch('/api/stats', { cache: 'no-store' })
        const d = await r.json()
        if (!stop && d.monthlyViews) setMonthly(d.monthlyViews)
      } catch {}
    }
    load()
    const t = setInterval(load, 6000)
    return () => { stop = true; clearInterval(t) }
  }, [])

  const cards = [
    { icon: FileText, label: '文章数', value: s.articles.toLocaleString(), color: 'text-chart-1' },
    { icon: Folder, label: '分类数', value: s.categories.toLocaleString(), color: 'text-chart-2' },
    { icon: Tag, label: '标签数', value: s.tags.toLocaleString(), color: 'text-chart-3' },
    { icon: Type, label: '总字数', value: s.totalWords.toLocaleString(), color: 'text-chart-4' },
    { icon: Eye, label: '总浏览量', value: v.totalViews, color: 'text-chart-5' },
    { icon: Users, label: '访客数', value: v.visitors, color: 'text-chart-1' },
    { icon: TrendingUp, label: '访问数', value: v.visits, color: 'text-chart-2' },
    { icon: Clock, label: '运行天数', value: `${s.runDays} 天`, color: 'text-chart-3' },
  ]

  const maxViews = Math.max(1, ...monthly.map(d => d.views))
  const hasData = monthly.some(d => d.views > 0)

  return (
    <PageShell title="统计" subtitle="站点数据一览～" icon={<BarChart3 className="size-6 text-primary" />}>
      {/* 数据卡片 */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map(c => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-4 text-center">
            <div className="mx-auto mb-2 grid size-10 place-items-center rounded-full bg-secondary">
              <c.icon className={`size-5 ${c.color}`} />
            </div>
            <p className="font-display text-xl font-bold text-foreground">{c.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* 访问趋势 */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
          <span className="h-4 w-1 rounded-full bg-primary" /> 最近 30 天访问趋势
        </h3>
        {!hasData ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <BarChart3 className="size-8 opacity-30" />
            <p className="text-sm">暂无访问数据～浏览任意页面即可开始累计</p>
          </div>
        ) : (
          <div className="flex h-48 items-end gap-1">
            {monthly.map(d => (
              <div key={d.date} className="group flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary/60 to-primary transition-all hover:from-primary hover:to-primary"
                    style={{ height: `${(d.views / maxViews) * 100}%`, minHeight: d.views > 0 ? '4px' : '0' }}
                    title={`${d.date}：${d.views} 次访问`}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {d.date.slice(8)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 最后活动 */}
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <CalendarDays className="size-4 text-primary/70" />
        最后活动时间：{s.lastActive}
      </div>
    </PageShell>
  )
}

import { PageShell } from '@/components/page-shell'
import { MapPin, Navigation } from 'lucide-react'

const footprints: { city: string; province: string; visits: number; lastVisit: string; lat: number; lng: number }[] = []

export default function FootprintPage() {
  const totalCities = footprints.length
  const totalVisits = footprints.reduce((s, f) => s + f.visits, 0)

  return (
    <PageShell title="足迹" subtitle={`到访 ${totalCities} 个城市 · 共 ${totalVisits} 次出行`} icon={<MapPin className="size-6 text-primary" />}>
      {/* 简化版地图（网格示意） */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-6">
        <div className="relative mx-auto aspect-[4/3] max-w-2xl rounded-xl bg-gradient-to-br from-primary/5 via-secondary/30 to-chart-3/5">
          {/* 网格线 */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-30">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="border border-border/50" />
            ))}
          </div>
          {/* 足迹点 */}
          {footprints.map((f, i) => {
            const x = ((f.lng - 100) / 30) * 100
            const y = ((45 - f.lat) / 25) * 100
            return (
              <div
                key={i}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className={`relative grid place-items-center rounded-full ${f.visits > 100 ? 'size-4' : f.visits > 5 ? 'size-3.5' : 'size-3'} bg-primary ${f.visits > 10 ? 'ring-4 ring-primary/20' : ''}`}>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2 py-0.5 text-[10px] font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
                    {f.city} · {f.visits}次
                  </span>
                </div>
              </div>
            )
          })}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Navigation className="size-3" /> 悬停查看城市
          </div>
        </div>
      </div>

      {/* 城市列表 */}
      {footprints.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <MapPin className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">还没有足迹记录，去走走吧～</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {footprints.map(f => (
            <div key={f.city} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10">
                <MapPin className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{f.city}<span className="ml-1 text-xs font-normal text-muted-foreground">{f.province}</span></p>
                <p className="text-xs text-muted-foreground">到访 {f.visits} 次 · 最近 {f.lastVisit}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}

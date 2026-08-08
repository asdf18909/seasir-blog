import { PageShell } from '@/components/page-shell'
import { Cpu, Laptop } from 'lucide-react'

const devices: { category: string; icon: typeof Laptop; items: { name: string; desc: string; date: string }[] }[] = []

export default function DevicesPage() {
  return (
    <PageShell title="设备" subtitle="我的数字工具箱～" icon={<Cpu className="size-6 text-primary" />}>
      {devices.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Cpu className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">还没有添加设备～</p>
        </div>
      ) : (
        <div className="space-y-6">
          {devices.map(d => (
            <div key={d.category}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="h-4 w-1 rounded-full bg-primary" />
                <d.icon className="size-4 text-primary/70" /> {d.category}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {d.items.map(item => (
                  <div key={item.name} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10">
                      <d.icon className="size-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}

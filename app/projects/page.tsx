import { PageShell } from '@/components/page-shell'
import { Folder, Star, GitBranch, ExternalLink } from 'lucide-react'

const projects: { name: string; desc: string; tags: string[]; stars: number; forks: number; url: string; status: string }[] = []

export default function ProjectsPage() {
  return (
    <PageShell title="项目" subtitle={`共 ${projects.length} 个开源项目`} icon={<Folder className="size-6 text-primary" />}>
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Folder className="mx-auto size-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">还没有添加项目哦～</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {projects.map(p => (
          <div key={p.name} className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Folder className="size-5 text-primary" />
                <h3 className="text-base font-bold text-foreground group-hover:text-primary">{p.name}</h3>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${p.status === '活跃' ? 'bg-green-500/15 text-green-600' : 'bg-yellow-500/15 text-yellow-600'}`}>
                {p.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-foreground/70">{p.desc}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.map(t => <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">{t}</span>)}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="size-3.5" /> {p.stars}</span>
                <span className="flex items-center gap-1"><GitBranch className="size-3.5" /> {p.forks}</span>
              </div>
              <a href={p.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                查看 <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
      )}
    </PageShell>
  )
}

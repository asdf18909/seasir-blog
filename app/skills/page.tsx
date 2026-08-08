import { PageShell } from '@/components/page-shell'
import { Star, Code, Wrench, Cloud } from 'lucide-react'

const skillGroups = [
  {
    category: '前端开发', icon: Code, skills: [
      { name: 'TypeScript', level: 90 },
      { name: 'React / Next.js', level: 88 },
      { name: 'Vue.js', level: 75 },
      { name: 'Tailwind CSS', level: 85 },
      { name: 'Astro', level: 80 },
    ]
  },
  {
    category: '后端开发', icon: Wrench, skills: [
      { name: 'Node.js', level: 82 },
      { name: 'Python', level: 75 },
      { name: 'PostgreSQL', level: 70 },
      { name: 'Redis', level: 65 },
    ]
  },
  {
    category: 'DevOps & 云服务', icon: Cloud, skills: [
      { name: 'Docker', level: 78 },
      { name: 'Vercel / EdgeOne', level: 85 },
      { name: 'GitHub Actions', level: 80 },
      { name: 'Linux', level: 75 },
    ]
  },
  {
    category: '工具 & 其他', icon: Star, skills: [
      { name: 'Git', level: 90 },
      { name: 'Figma', level: 70 },
      { name: 'Rust (学习中)', level: 30 },
      { name: 'Go (学习中)', level: 25 },
    ]
  },
]

export default function SkillsPage() {
  return (
    <PageShell title="技能" subtitle="我的技术栈和熟练度～" icon={<Star className="size-6 text-primary" />}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {skillGroups.map(g => (
          <div key={g.category} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
              <span className="h-4 w-1 rounded-full bg-primary" />
              <g.icon className="size-4 text-primary/70" /> {g.category}
            </h3>
            <div className="space-y-3">
              {g.skills.map(s => (
                <div key={s.name}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-foreground/80">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{s.level}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-chart-3 transition-all duration-500"
                      style={{ width: `${s.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}

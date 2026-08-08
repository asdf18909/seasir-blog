import { PageShell } from '@/components/page-shell'
import { Bookmark, ExternalLink } from 'lucide-react'

const categories = [
  {
    name: '开发工具', links: [
      { name: 'GitHub', url: 'https://github.com', desc: '全球最大代码托管平台' },
      { name: 'Gitee', url: 'https://gitee.com', desc: '国内代码托管平台' },
      { name: 'CNB', url: 'https://cnb.cool', desc: '腾讯云原生构建平台' },
      { name: 'VS Code', url: 'https://code.visualstudio.com', desc: '强大的代码编辑器' },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com', desc: '开发者问答社区' },
    ]
  },
  {
    name: '前端框架', links: [
      { name: 'Next.js', url: 'https://nextjs.org', desc: 'React 全栈框架' },
      { name: 'Astro', url: 'https://astro.build', desc: '现代静态站点生成器' },
      { name: 'Vue.js', url: 'https://vuejs.org', desc: '渐进式 JS 框架' },
      { name: 'Tailwind CSS', url: 'https://tailwindcss.com', desc: '原子化 CSS 框架' },
      { name: 'shadcn/ui', url: 'https://ui.shadcn.com', desc: '可定制组件库' },
    ]
  },
  {
    name: '后端 & 数据库', links: [
      { name: 'Node.js', url: 'https://nodejs.org', desc: 'JS 运行时' },
      { name: 'Supabase', url: 'https://supabase.com', desc: '开源 Firebase 替代' },
      { name: 'Vercel', url: 'https://vercel.com', desc: '前端部署平台' },
      { name: 'Cloudflare', url: 'https://cloudflare.com', desc: 'CDN & 边缘计算' },
    ]
  },
  {
    name: '设计 & 素材', links: [
      { name: 'Figma', url: 'https://figma.com', desc: '在线设计工具' },
      { name: 'Unsplash', url: 'https://unsplash.com', desc: '免费高清图片' },
      { name: 'Lucide', url: 'https://lucide.dev', desc: '图标库' },
      { name: 'Google Fonts', url: 'https://fonts.google.com', desc: '免费字体' },
    ]
  },
  {
    name: '学习 & 文档', links: [
      { name: 'MDN', url: 'https://developer.mozilla.org', desc: 'Web 开发文档' },
      { name: 'TypeScript', url: 'https://typescriptlang.org', desc: 'TS 官方文档' },
      { name: 'React', url: 'https://react.dev', desc: 'React 官方文档' },
      { name: 'Rust', url: 'https://rust-lang.org', desc: 'Rust 官方网站' },
    ]
  },
  {
    name: '常用服务', links: [
      { name: 'EdgeOne', url: 'https://edgeone.ai', desc: '腾讯边缘安全加速' },
      { name: 'CloudStudio', url: 'https://cloudstudio.net', desc: '云端 IDE' },
      { name: 'Notion', url: 'https://notion.so', desc: '笔记 & 知识管理' },
    ]
  },
]

export default function NavPage() {
  return (
    <PageShell title="书签导航" subtitle="常用工具和资源收藏～" icon={<Bookmark className="size-6 text-primary" />}>
      <div className="space-y-6">
        {categories.map(cat => (
          <div key={cat.name}>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
              <span className="h-4 w-1 rounded-full bg-primary" /> {cat.name}
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cat.links.map(link => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-foreground/60 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    <ExternalLink className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary">{link.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{link.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Save, Upload, Pin, Eye, Code, X, ImagePlus } from 'lucide-react'
import { broadcastStats } from '@/lib/use-stats'

type ArticleEditorProps = {
  articleId?: string
  onSaved?: () => void
}

type ArticleData = {
  id?: string
  title: string
  slug: string
  date: string
  category: string
  excerpt: string
  tags: string[]
  cover: string
  pinned: boolean
  content: string
}

const emptyArticle: ArticleData = {
  title: '',
  slug: '',
  date: new Date().toISOString().slice(0, 10),
  category: '未分类',
  excerpt: '',
  tags: [],
  cover: '',
  pinned: false,
  content: '',
}

// 简易 Markdown 渲染
function renderMarkdown(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 代码块
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="rounded-lg bg-secondary p-3 overflow-x-auto my-3"><code>$2</code></pre>')
  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-bold mt-4 mb-2">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-4 mb-2">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
  // 粗体/斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  // 行内代码
  html = html.replace(/`(.+?)`/g, '<code class="rounded bg-secondary px-1.5 py-0.5 text-sm">$1</code>')
  // 图片
  html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-3 max-w-full" />')
  // 链接
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" class="text-primary hover:underline">$1</a>')
  // 引用
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 py-1 my-3 text-muted-foreground">$1</blockquote>')
  // 列表
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
  // 分割线
  html = html.replace(/^---$/gm, '<hr class="my-4 border-border" />')
  // 段落
  html = html.replace(/\n\n/g, '</p><p class="my-2">')
  html = `<p class="my-2">${html}</p>`
  // 修复列表
  html = html.replace(/<p class="my-2">(<li[^]*?<\/li>)+<\/p>/g, m => m.replace(/<p[^>]*>|<\/p>/g, ''))
  html = html.replace(/(<li[^]*?<\/li>)(?!<li)/g, '<ul>$1</ul>')

  return html
}

export function ArticleEditor({ articleId, onSaved }: ArticleEditorProps) {
  const [data, setData] = useState<ArticleData>(emptyArticle)
  const [tagInput, setTagInput] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (articleId) {
      fetch(`/api/admin/articles/${articleId}`)
        .then(r => r.json())
        .then(res => {
          if (res.article) {
            setData({ ...res.article, tags: res.article.tags || [] })
          }
        })
    }
  }, [articleId])

  const update = (field: keyof ArticleData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !data.tags.includes(tag)) {
      update('tags', [...data.tags, tag])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    update('tags', data.tags.filter(t => t !== tag))
  }

  // 上传图片（封面或内容图）
  const uploadImage = async (file: File, isCover: boolean) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        if (isCover) {
          update('cover', data.url)
        } else {
          // 在 Markdown 光标处插入图片
          const imgMd = `![${file.name}](${data.url})\n`
          update('content', data.content + imgMd)
        }
      }
    } catch {
      setMessage('上传失败')
    }
    setUploading(false)
  }

  // 拖拽上传到编辑器
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        uploadImage(file, false)
      }
    })
  }, [data.content])

  const handleSave = async () => {
    if (!data.title.trim()) {
      setMessage('请填写标题')
      return
    }
    setSaving(true)
    try {
      const url = articleId ? `/api/admin/articles/${articleId}` : '/api/admin/articles'
      const method = articleId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (result.success) {
        setMessage(articleId ? '保存成功！' : '发布成功！')
        broadcastStats() // 同步通知其他标签页统计已更新
        if (!articleId && onSaved) onSaved()
      } else {
        setMessage('保存失败')
      }
    } catch {
      setMessage('网络错误')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="space-y-4">
      {/* 消息提示 */}
      {message && (
        <div className="fixed right-8 top-8 z-50 rounded-xl bg-foreground px-5 py-3 text-sm text-background shadow-lg">
          {message}
        </div>
      )}

      {/* 标题 */}
      <input
        type="text"
        value={data.title}
        onChange={e => update('title', e.target.value)}
        placeholder="文章标题..."
        className="w-full rounded-xl border border-border bg-card px-5 py-3 text-xl font-bold text-foreground outline-none focus:border-primary"
      />

      {/* 元信息栏 */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={data.category}
          onChange={e => update('category', e.target.value)}
          placeholder="分类"
          className="w-32 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <input
          type="date"
          value={data.date}
          onChange={e => update('date', e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <input
          type="text"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
          placeholder="标签（回车添加）"
          className="w-40 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <div className="flex flex-wrap gap-1.5">
          {data.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
              {tag}
              <button onClick={() => removeTag(tag)}><X className="size-3" /></button>
            </span>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
          <input type="checkbox" checked={data.pinned} onChange={e => update('pinned', e.target.checked)} className="accent-primary" />
          <Pin className="size-3.5" /> 置顶
        </label>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
        >
          {showPreview ? <Code className="size-3.5" /> : <Eye className="size-3.5" />}
          {showPreview ? '纯编辑' : '预览'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="size-3.5" /> {saving ? '保存中...' : articleId ? '保存' : '发布'}
        </button>
      </div>

      {/* 封面图上传 */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={data.cover}
          onChange={e => update('cover', e.target.value)}
          placeholder="封面图 URL（或点击右侧上传）"
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, true) }}
        />
        <button
          onClick={() => coverInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
        >
          <ImagePlus className="size-3.5" /> {uploading ? '上传中...' : '上传封面'}
        </button>
      </div>
      {data.cover && (
        <div className="relative h-40 overflow-hidden rounded-xl">
          <img src={data.cover} alt="封面预览" className="size-full object-cover" />
          <button
            onClick={() => update('cover', '')}
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-lg bg-black/60 text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Markdown 编辑器 + 预览 */}
      <div className={`grid gap-4 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="relative"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Markdown 内容</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Upload className="size-3" /> 插入图片
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => {
                const files = Array.from(e.target.files || [])
                files.forEach(f => uploadImage(f, false))
              }}
            />
          </div>
          <textarea
            value={data.content}
            onChange={e => update('content', e.target.value)}
            placeholder="支持 Markdown 语法...&#10;&#10;## 标题&#10;**粗体** *斜体*&#10;- 列表项&#10;![图片](url)&#10;[链接](url)&#10;&#10;也可以直接拖拽图片到这里上传"
            className="h-[600px] w-full resize-none rounded-xl border border-border bg-card p-4 font-mono text-sm leading-relaxed text-foreground outline-none focus:border-primary"
          />
        </div>

        {showPreview && (
          <div>
            <div className="mb-2 text-xs font-medium text-muted-foreground">预览</div>
            <div
              className="h-[600px] overflow-y-auto rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(data.content || '*预览区域为空*') }}
            />
          </div>
        )}
      </div>

      {/* 摘要 */}
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">摘要（留空则自动截取）</label>
        <textarea
          value={data.excerpt}
          onChange={e => update('excerpt', e.target.value)}
          placeholder="文章摘要..."
          rows={2}
          className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
      </div>
    </div>
  )
}

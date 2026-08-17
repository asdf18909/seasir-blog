'use client'

import { ArticleEditor } from '@/components/article-editor'
import { useRouter } from 'next/navigation'

export function EditArticleClient({ articleId }: { articleId: string }) {
  const router = useRouter()
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-foreground">编辑文章</h1>
      <ArticleEditor articleId={articleId} onSaved={() => router.push('/admin/articles')} />
    </>
  )
}

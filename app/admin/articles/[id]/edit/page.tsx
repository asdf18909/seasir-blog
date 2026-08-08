'use client'

import { AdminLayout } from '@/components/admin-layout'
import { ArticleEditor } from '@/components/article-editor'
import { useRouter } from 'next/navigation'
import { use } from 'react'

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold text-foreground">编辑文章</h1>
      <ArticleEditor articleId={id} onSaved={() => router.push('/admin/articles')} />
    </AdminLayout>
  )
}

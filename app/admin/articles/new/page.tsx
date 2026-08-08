'use client'

import { AdminLayout } from '@/components/admin-layout'
import { ArticleEditor } from '@/components/article-editor'
import { useRouter } from 'next/navigation'

export default function NewArticlePage() {
  const router = useRouter()

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold text-foreground">写新文章</h1>
      <ArticleEditor onSaved={() => router.push('/admin/articles')} />
    </AdminLayout>
  )
}

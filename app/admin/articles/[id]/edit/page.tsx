import { AdminLayout } from '@/components/admin-layout'
import { EditArticleClient } from './edit-client'

// GitHub Pages 静态导出：管理页用于本地编辑，占位参数使其通过构建
export function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <AdminLayout>
      <EditArticleClient articleId={id} />
    </AdminLayout>
  )
}

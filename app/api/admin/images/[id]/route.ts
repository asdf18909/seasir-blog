import { NextRequest, NextResponse } from 'next/server'
import { getImages, deleteImage } from '@/lib/storage'
import { promises as fs } from 'fs'
import path from 'path'

// 删除图片
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const images = await getImages()
  const img = images.find(i => i.id === id || i.name === id)
  if (img) {
    const filePath = path.join(process.cwd(), 'public', img.url)
    try { await fs.unlink(filePath) } catch {}
  }
  await deleteImage(id)
  return NextResponse.json({ success: true })
}

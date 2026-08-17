import { NextRequest, NextResponse } from 'next/server'
import { saveUploadedFile, saveImage, generateId } from '@/lib/storage'

export const dynamic = 'force-static'

// 上传文件（图片、音乐或视频）
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const type = formData.get('type') as string | null

  if (!file) {
    return NextResponse.json({ error: '没有文件' }, { status: 400 })
  }

  const isMusic = type === 'music' || file.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a)$/i.test(file.name)
  const isVideo = type === 'video' || file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(file.name)

  if (isMusic) {
    // 音乐文件上传到 public/music/
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: '文件过大（最大 50MB）' }, { status: 400 })
    }

    const filename = file.name.replace(/[^\w\u4e00-\u9fa5.-]/g, '_')
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await saveUploadedFile(buffer, filename, 'music')

    return NextResponse.json({ success: true, url, name: file.name, type: 'music' })
  }

  if (isVideo) {
    // 视频文件上传到 public/videos/
    if (file.size > 200 * 1024 * 1024) {
      return NextResponse.json({ error: '视频文件过大（最大 200MB）' }, { status: 400 })
    }

    const filename = `${Date.now()}-${file.name.replace(/[^\w\u4e00-\u9fa5.-]/g, '_')}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await saveUploadedFile(buffer, filename, 'videos')

    return NextResponse.json({ success: true, url, name: file.name, type: 'video' })
  }

  // 图片上传到 public/uploads/
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: '文件过大（最大 10MB）' }, { status: 400 })
  }

  const filename = `${Date.now()}-${file.name.replace(/[^\w\u4e00-\u9fa5.-]/g, '_')}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await saveUploadedFile(buffer, filename, 'uploads')

  await saveImage({
    id: generateId(),
    name: file.name,
    url,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  })

  return NextResponse.json({ success: true, url, name: file.name, type: 'image' })
}

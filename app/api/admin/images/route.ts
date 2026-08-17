import { NextResponse } from 'next/server'
import { scanUploadDir } from '@/lib/storage'

export const dynamic = 'force-static'

// 获取已上传图片列表
export async function GET() {
  const images = await scanUploadDir()
  return NextResponse.json({ images })
}

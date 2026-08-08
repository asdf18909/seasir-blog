import { NextResponse } from 'next/server'
import { siteInfo } from '@/lib/data'

export async function GET() {
  return NextResponse.json(siteInfo)
}

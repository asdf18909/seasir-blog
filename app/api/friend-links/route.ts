import { NextResponse } from 'next/server'
import { friendLinks } from '@/lib/data'

export async function GET() {
  return NextResponse.json({
    total: friendLinks.length,
    links: friendLinks,
  })
}

import { NextResponse } from 'next/server'
import { getNav } from '@/lib/storage'

export const dynamic = 'force-static'

export async function GET() {
  const items = await getNav()
  return NextResponse.json({ items, count: items.length })
}

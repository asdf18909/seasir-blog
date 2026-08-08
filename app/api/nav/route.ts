import { NextResponse } from 'next/server'
import { getNav } from '@/lib/storage'

export async function GET() {
  const items = await getNav()
  return NextResponse.json({ items, count: items.length })
}

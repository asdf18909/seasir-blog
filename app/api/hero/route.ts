import { NextResponse } from 'next/server'
import { getHero } from '@/lib/storage'

export const dynamic = 'force-static'

export async function GET() {
  const hero = await getHero()
  return NextResponse.json(hero)
}
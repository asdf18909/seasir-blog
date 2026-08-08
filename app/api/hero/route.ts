import { NextResponse } from 'next/server'
import { getHero } from '@/lib/storage'

export async function GET() {
  const hero = await getHero()
  return NextResponse.json(hero)
}
import { NextRequest, NextResponse } from 'next/server'
import { getHero, saveHero, DEFAULT_HERO } from '@/lib/storage'

export async function GET() {
  const hero = await getHero()
  return NextResponse.json(hero)
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const hero = {
      avatar: typeof body.avatar === 'string' ? body.avatar : DEFAULT_HERO.avatar,
      bgImage: typeof body.bgImage === 'string' ? body.bgImage : DEFAULT_HERO.bgImage,
      greeting: typeof body.greeting === 'string' ? body.greeting : DEFAULT_HERO.greeting,
      subtitle: typeof body.subtitle === 'string' ? body.subtitle : DEFAULT_HERO.subtitle,
      buttonText: typeof body.buttonText === 'string' ? body.buttonText : DEFAULT_HERO.buttonText,
    }
    await saveHero(hero)
    return NextResponse.json({ ok: true, hero })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getReward, saveReward, DEFAULT_REWARD } from '@/lib/storage'

export async function GET() {
  const config = await getReward()
  return NextResponse.json({ ...DEFAULT_REWARD, ...config })
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const current = await getReward()
    const next = {
      wechatQr: typeof body.wechatQr === 'string' ? body.wechatQr : current.wechatQr,
      alipayQr: typeof body.alipayQr === 'string' ? body.alipayQr : current.alipayQr,
      usdtAddress: typeof body.usdtAddress === 'string' ? body.usdtAddress : current.usdtAddress,
    }
    await saveReward(next)
    return NextResponse.json({ ok: true, config: next })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || '保存失败' }, { status: 500 })
  }
}
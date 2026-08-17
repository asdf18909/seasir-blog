import { NextRequest, NextResponse } from 'next/server'
import { getNav, saveNav, resetNav, type NavItemConfig } from '@/lib/storage'

export const dynamic = 'force-static'

export async function GET() {
  const items = await getNav()
  return NextResponse.json({ items, count: items.length })
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const items: NavItemConfig[] = body.items
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'items 必须是数组' }, { status: 400 })
    }
    // 基础字段校验
    for (const it of items) {
      if (typeof it.label !== 'string' || typeof it.icon !== 'string') {
        return NextResponse.json({ error: '菜单项必须包含 label 和 icon' }, { status: 400 })
      }
      if (it.href !== undefined && typeof it.href !== 'string') {
        return NextResponse.json({ error: 'href 必须是字符串' }, { status: 400 })
      }
      if (it.children) {
        if (!Array.isArray(it.children)) {
          return NextResponse.json({ error: 'children 必须是数组' }, { status: 400 })
        }
        for (const c of it.children) {
          if (typeof c.label !== 'string' || typeof c.href !== 'string' || typeof c.icon !== 'string') {
            return NextResponse.json({ error: '子菜单必须包含 label / href / icon' }, { status: 400 })
          }
        }
      }
    }
    await saveNav(items)
    return NextResponse.json({ ok: true, count: items.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || '保存失败' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // 用于"重置默认"操作
  try {
    const body = await req.json().catch(() => ({}))
    if (body?.action === 'reset') {
      const items = await resetNav()
      return NextResponse.json({ ok: true, items, count: items.length })
    }
    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || '重置失败' }, { status: 500 })
  }
}

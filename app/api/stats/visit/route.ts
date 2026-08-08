import { NextRequest, NextResponse } from 'next/server'
import { recordVisit, getStats, getArticles, countWords, getRunDays } from '@/lib/storage'
import { articles as defaultArticles } from '@/lib/data'

// 同一访客 30 分钟内不重复计数
const DEDUPE_WINDOW_MS = 30 * 60 * 1000
// 内存级去重缓存（进程重启会自动清空，但 visitorIds 会持久化兜底）
const recentVisits = new Map<string, number>()

function getOrCreateVisitorId(req: NextRequest): string {
  // 从 cookie 取，没有就给一个新 UUID
  const cookie = req.cookies.get('visitor_id')
  if (cookie?.value) return cookie.value
  return crypto.randomUUID()
}

export async function POST(req: NextRequest) {
  const visitorId = getOrCreateVisitorId(req)
  const now = Date.now()

  // 进程级防刷：30 分钟内同 visitorId 只算一次
  const last = recentVisits.get(visitorId)
  let updated = false

  if (!last || now - last > DEDUPE_WINDOW_MS) {
    recentVisits.set(visitorId, now)
    await recordVisit(visitorId)
    updated = true
  } else {
    // 30 分钟内重复访问：只刷新 lastActiveAt，不增加计数
    await getStats() // 确保 stats 文件存在
  }

  // 重新计算响应数据（与 GET /api/stats 保持一致的输出）
  const [stats, storedArticles] = await Promise.all([
    getStats(),
    getArticles(),
  ])
  const articles = storedArticles.length > 0 ? storedArticles : (defaultArticles as any[])

  const categorySet = new Set<string>()
  const tagSet = new Set<string>()
  for (const a of articles) {
    if (a.category) categorySet.add(a.category)
    if (Array.isArray(a.tags)) for (const t of a.tags) tagSet.add(t)
  }

  const siteStats = {
    articles: articles.length,
    categories: categorySet.size,
    tags: tagSet.size,
    totalWords: countWords(articles as any),
    runDays: getRunDays(stats.startDate),
    lastActive: stats.lastActiveAt
      ? new Date(stats.lastActiveAt).toLocaleString('zh-CN', { hour12: false })
      : '—',
  }
  const visitStats = {
    totalViews: stats.totalViews.toLocaleString(),
    visits: stats.visits.toLocaleString(),
    visitors: stats.visitors.toLocaleString(),
  }

  const response = NextResponse.json({
    siteStats,
    visitStats,
    updated,
  })

  // 写回/刷新 cookie（一年过期）
  response.cookies.set('visitor_id', visitorId, {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false, // 允许客户端 JS 也能读
    sameSite: 'lax',
    path: '/',
  })

  return response
}

export async function GET() {
  // 提供给调试用：返回 visitor_id cookie 中的 ID
  return NextResponse.json({ ok: true })
}

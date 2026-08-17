import { NextResponse } from 'next/server'
import { getStats, getArticles, countWords, getRunDays } from '@/lib/storage'
import { articles as defaultArticles } from '@/lib/data'

export const dynamic = 'force-static'

/**
 * GET /api/stats
 * 返回组合好的站点统计数据：
 * - siteStats: 文章/分类/标签/总字数/运行时长/最后活动
 * - visitStats: 总浏览量/访问数/访客数
 * - monthlyViews: 最近 12 个月每天视图聚合，供趋势图使用
 */
export async function GET() {
  const [stats, storedArticles] = await Promise.all([
    getStats(),
    getArticles(),
  ])

  // 文章数据源：优先 JSON 存储，没存则 fallback 到默认数据
  const articles = storedArticles.length > 0 ? storedArticles : (defaultArticles as any[])

  // 动态统计
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

  // 最近 30 天每日访问量（for 右下柱图/趋势图）
  const dailyViews = stats.dailyViews || {}
  const today = new Date()
  const monthlyViews: { date: string; views: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    monthlyViews.push({ date: key, views: dailyViews[key] || 0 })
  }

  return NextResponse.json({
    siteStats,
    visitStats,
    monthlyViews,
  })
}

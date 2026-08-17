'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

export type SiteStats = {
  articles: number
  categories: number
  tags: number
  totalWords: number
  runDays: number
  lastActive: string
}

export type VisitStats = {
  totalViews: string
  visits: string
  visitors: string
}

export type StatsPayload = {
  siteStats: SiteStats
  visitStats: VisitStats
}

const BC_NAME = 'stats-updated'
const STORAGE_KEY = 'stats-updated-time'

export const STATS_FALLBACK: StatsPayload = {
  siteStats: {
    articles: 0,
    categories: 0,
    tags: 0,
    totalWords: 0,
    runDays: 0,
    lastActive: '—',
  },
  visitStats: {
    totalViews: '0',
    visits: '0',
    visitors: '0',
  },
}

// 模块级去重：即使页面上有多个组件 useStats，
// 也只会在首次挂载时调用一次 /api/stats/visit
let visitRecordedThisSession = false
let activeSubscribers = 0

function notifyVisit() {
  if (typeof window === 'undefined') return
  // GitHub Pages 静态部署：没有写入端点，跳过访问计数
  // 仅在开发环境或自托管时才会真正调用
  if (window.location.hostname === 'localhost' || window.location.hostname.includes('192.168')) {
    fetch('/api/stats/visit', { method: 'POST', cache: 'no-store' }).catch(() => {})
  }
}

/**
 * GitHub Pages 静态部署：直接从 JSON 文件聚合统计
 * - 站点数据（文章数/分类/标签/字数）从 articles.json 计算
 * - 访问数据从 stats.json 读取（最后一次构建时的快照）
 */
async function loadStaticStats(): Promise<StatsPayload | null> {
  try {
    const [articlesRes, statsRes] = await Promise.all([
      fetch('/data/articles.json', { cache: 'no-store' }),
      fetch('/data/stats.json', { cache: 'no-store' }),
    ])
    const articles = (await articlesRes.json()) as any[]
    const stats = (await statsRes.json()) as any

    const cats = new Set<string>()
    const tagSet = new Set<string>()
    let totalWords = 0
    articles.forEach((a: any) => {
      if (a.category) cats.add(a.category)
      ;(a.tags || []).forEach((t: string) => tagSet.add(t))
      // 简单字数统计：CJK 按字，英文按词
      const text = (a.content || a.excerpt || '').replace(/<[^>]+>/g, '')
      const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length
      const en = (text.match(/[a-zA-Z]+/g) || []).length
      totalWords += cjk + en
    })

    const startDate = stats?.startDate ? new Date(stats.startDate) : new Date()
    const runDays = Math.max(1, Math.floor((Date.now() - startDate.getTime()) / 86400000))

    return {
      siteStats: {
        articles: articles.length,
        categories: cats.size,
        tags: tagSet.size,
        totalWords,
        runDays,
        lastActive: stats?.lastActiveAt
          ? new Date(stats.lastActiveAt).toLocaleString('zh-CN', { hour12: false })
          : '—',
      },
      visitStats: {
        totalViews: String(stats?.totalViews || 0),
        visits: String(stats?.visits || 0),
        visitors: String(stats?.visitors || 0),
      },
    }
  } catch {
    return null
  }
}

/**
 * 共享 Hook：获取并订阅实时统计
 * - 首次加载拉一次 /api/stats
 * - 全局只触发一次 /api/stats/visit（去重在模块级）
 * - 监听 BroadcastChannel + storage + 5s 轮询实现多标签页同步
 */
export function useStats(): { data: StatsPayload; loading: boolean; refresh: () => void } {
  const [data, setData] = useState<StatsPayload>(STATS_FALLBACK)
  const [loading, setLoading] = useState(true)
  const recordedRef = useRef(false)

  const load = useCallback(async () => {
    // GitHub Pages 静态部署：从 JSON 文件聚合
    const d = await loadStaticStats()
    if (d) {
      setData(d)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()

    if (typeof window === 'undefined') return

    // 订阅者计数 +1；只有第 1 个订阅者才真正发 visit 请求
    activeSubscribers += 1
    if (!visitRecordedThisSession && !recordedRef.current) {
      recordedRef.current = true
      visitRecordedThisSession = true
      notifyVisit()
    }

    const applyRemoteUpdate = (e: Event) => {
      const ce = e as CustomEvent<StatsPayload>
      if (ce.detail?.siteStats && ce.detail?.visitStats) {
        setData(ce.detail)
        setLoading(false)
      }
    }

    let bc: BroadcastChannel | null = null
    let bcHandler: ((e: MessageEvent) => void) | null = null
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel(BC_NAME)
        bcHandler = () => load()
        bc.addEventListener('message', bcHandler as any)
      }
    } catch {}

    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) load()
    }
    const focusHandler = () => load()
    window.addEventListener('storage', storageHandler)
    window.addEventListener('focus', focusHandler)
    window.addEventListener('stats:visit-recorded', applyRemoteUpdate)

    const poll = setInterval(load, 5000)

    return () => {
      activeSubscribers = Math.max(0, activeSubscribers - 1)
      if (bc && bcHandler) {
        try { bc.removeEventListener('message', bcHandler as any) } catch {}
        try { bc.close() } catch {}
      }
      window.removeEventListener('storage', storageHandler)
      window.removeEventListener('focus', focusHandler)
      window.removeEventListener('stats:visit-recorded', applyRemoteUpdate)
      clearInterval(poll)
    }
  }, [load])

  return { data, loading, refresh: load }
}

/**
 * 触发一次手动广播（管理操作比如发布文章后调用，让所有打开的页面立即刷新）
 */
export function broadcastStats() {
  if (typeof window === 'undefined') return
  try {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel(BC_NAME)
      bc.postMessage({ ts: Date.now() })
      bc.close()
    }
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {}
}

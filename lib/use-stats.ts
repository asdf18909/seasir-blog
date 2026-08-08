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
  fetch('/api/stats/visit', { method: 'POST', cache: 'no-store' })
    .then(r => r.json())
    .then(d => {
      if (d?.siteStats && d?.visitStats) {
        // 通过自定义事件让所有 useStats 实例同步更新
        window.dispatchEvent(new CustomEvent('stats:visit-recorded', {
          detail: { siteStats: d.siteStats, visitStats: d.visitStats }
        }))
      }
    })
    .catch(() => {})
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
    try {
      const r = await fetch('/api/stats', { cache: 'no-store' })
      const d = await r.json()
      if (d?.siteStats && d?.visitStats) {
        setData(d as StatsPayload)
      }
    } catch {} finally {
      setLoading(false)
    }
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

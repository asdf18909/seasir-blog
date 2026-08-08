'use client'

import { useEffect, useState, useCallback } from 'react'

export type HeroConfig = {
  avatar: string
  bgImage: string
  greeting: string
  subtitle: string
  buttonText: string
}

export const HERO_FALLBACK: HeroConfig = {
  avatar: '/avatar.png',
  bgImage: '/hero-bg.png',
  greeting: 'hello',
  subtitle: '花有重开日，人无再少年',
  buttonText: '开始阅读',
}

const STORAGE_KEY = 'hero-updated-time'
const BC_NAME = 'hero-updated'

/**
 * 共享 Hook：在多个组件里订阅同一份 hero 配置。
 * - 首次加载拉一次 /api/hero
 * - 监听 BroadcastChannel('hero-updated') 实现跨标签页实时同步
 * - 兼容旧浏览器的 storage 事件
 * - 5s 轮询 + focus 事件兜底
 */
export function useHeroConfig(): HeroConfig {
  const [config, setConfig] = useState<HeroConfig>(HERO_FALLBACK)

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/hero', { cache: 'no-store' })
      const data = await r.json()
      if (data && typeof data === 'object') {
        setConfig(prev => ({ ...HERO_FALLBACK, ...data }))
      }
    } catch {}
  }, [])

  useEffect(() => {
    load()
    if (typeof window === 'undefined') return

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

    // 兜底轮询
    const poll = setInterval(load, 5000)

    return () => {
      if (bc && bcHandler) {
        try { bc.removeEventListener('message', bcHandler as any) } catch {}
        try { bc.close() } catch {}
      }
      window.removeEventListener('storage', storageHandler)
      window.removeEventListener('focus', focusHandler)
      clearInterval(poll)
    }
  }, [load])

  return config
}
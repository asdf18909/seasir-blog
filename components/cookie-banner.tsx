'use client'

import { useState } from 'react'

export function CookieBanner() {
  const [show, setShow] = useState(true)
  if (!show) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-3 px-4 py-3 text-sm text-foreground/80 sm:flex-row">
        <p className="flex-1 leading-relaxed">
          本站使用 Cookie 进行访问统计，并借助本地存储记住您的主题与界面偏好。您可自由选择是否接受统计类 Cookie。
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setShow(false)}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary"
          >
            拒绝
          </button>
          <button
            onClick={() => setShow(false)}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            接受
          </button>
        </div>
      </div>
    </div>
  )
}

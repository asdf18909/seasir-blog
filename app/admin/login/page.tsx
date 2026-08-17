'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/admin-auth'

export default function AdminLogin() {
  const router = useRouter()
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (login(pwd)) {
      router.replace('/admin')
    } else {
      setError('密码错误')
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/30 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
        <h1 className="mb-1 text-xl font-bold text-foreground">管理后台登录</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          本地管理入口，请输入访问密码。
        </p>

        <label className="mb-1.5 block text-sm font-medium text-foreground">密码</label>
        <input
          type="password"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          autoFocus
          className="mb-4 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          placeholder="请输入密码"
        />

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          进入后台
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          默认密码见 <code className="rounded bg-secondary px-1 py-0.5 font-mono">lib/admin-auth.ts</code>
          （可用 <code className="rounded bg-secondary px-1 py-0.5 font-mono">NEXT_PUBLIC_ADMIN_PASSWORD</code> 覆盖）
        </p>
      </form>
    </div>
  )
}

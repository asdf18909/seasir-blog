'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Save, Loader2, Check, Gift, Copy } from 'lucide-react'

type RewardConfig = {
  wechatQr: string
  alipayQr: string
  usdtAddress: string
}

export default function RewardAdminPage() {
  const router = useRouter()
  const [config, setConfig] = useState<RewardConfig>({
    wechatQr: '',
    alipayQr: '',
    usdtAddress: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [uploading, setUploading] = useState<'' | 'wechat' | 'alipay'>('')

  const wechatRef = useRef<HTMLInputElement>(null)
  const alipayRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/reward')
      .then(r => r.json())
      .then(data => {
        setConfig({
          wechatQr: data.wechatQr || '',
          alipayQr: data.alipayQr || '',
          usdtAddress: data.usdtAddress || '',
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    setErr(null)
    try {
      const r = await fetch('/api/admin/reward', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const data = await r.json()
      if (!data.ok) throw new Error(data.error || '保存失败')
      setSavedAt(new Date().toLocaleTimeString('zh-CN', { hour12: false }))
    } catch (e: any) {
      setErr(e?.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  async function uploadFile(file: File, target: 'wechat' | 'alipay') {
    setUploading(target)
    setErr(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await r.json()
      if (!data.ok) throw new Error(data.error || '上传失败')
      setConfig(c => ({ ...c, [target === 'wechat' ? 'wechatQr' : 'alipayQr']: data.url }))
      setSavedAt(null)
    } catch (e: any) {
      setErr(e?.message || '上传失败')
    } finally {
      setUploading('')
    }
  }

  function onPick(target: 'wechat' | 'alipay') {
    const ref = target === 'wechat' ? wechatRef : alipayRef
    ref.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>, target: 'wechat' | 'alipay') {
    const f = e.target.files?.[0]
    if (f) uploadFile(f, target)
    e.target.value = ''
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> 加载中...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">打赏配置</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            上传微信/支付宝收款码，设置 USDT 钱包地址
          </p>
        </div>
        <button
          onClick={() => router.push('/reward')}
          className="text-sm text-primary hover:underline"
        >
          预览前台 →
        </button>
      </div>

      {err && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {err}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 微信 */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">💚</span>
            <h2 className="font-bold text-foreground">微信收款码</h2>
          </div>
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => onPick('wechat')}
              disabled={uploading === 'wechat'}
              className="group relative grid size-56 cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/40 transition-colors hover:border-primary/50"
            >
              {uploading === 'wechat' ? (
                <Loader2 className="size-6 animate-spin text-primary" />
              ) : config.wechatQr ? (
                <>
                  <img src={config.wechatQr} alt="微信收款码" className="size-full object-contain p-2" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Upload className="size-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="size-8" />
                  <p className="text-xs">点击上传图片</p>
                </div>
              )}
            </button>
            <input
              ref={wechatRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => onFileChange(e, 'wechat')}
            />
            {config.wechatQr && (
              <button
                onClick={() => setConfig(c => ({ ...c, wechatQr: '' }))}
                className="text-xs text-destructive hover:underline"
              >
                移除图片
              </button>
            )}
          </div>
        </div>

        {/* 支付宝 */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">💙</span>
            <h2 className="font-bold text-foreground">支付宝收款码</h2>
          </div>
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => onPick('alipay')}
              disabled={uploading === 'alipay'}
              className="group relative grid size-56 cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/40 transition-colors hover:border-primary/50"
            >
              {uploading === 'alipay' ? (
                <Loader2 className="size-6 animate-spin text-primary" />
              ) : config.alipayQr ? (
                <>
                  <img src={config.alipayQr} alt="支付宝收款码" className="size-full object-contain p-2" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Upload className="size-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="size-8" />
                  <p className="text-xs">点击上传图片</p>
                </div>
              )}
            </button>
            <input
              ref={alipayRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => onFileChange(e, 'alipay')}
            />
            {config.alipayQr && (
              <button
                onClick={() => setConfig(c => ({ ...c, alipayQr: '' }))}
                className="text-xs text-destructive hover:underline"
              >
                移除图片
              </button>
            )}
          </div>
        </div>
      </div>

      {/* USDT 地址 */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 flex items-center gap-2 font-bold text-foreground">
          <Gift className="size-4" /> USDT / 加密货币钱包地址
        </h2>
        <input
          type="text"
          value={config.usdtAddress}
          onChange={e => setConfig(c => ({ ...c, usdtAddress: e.target.value }))}
          placeholder="例如：0x1234...abcd"
          className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary/60"
        />
      </div>

      {/* 保存按钮 */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {savedAt ? (
            <span className="inline-flex items-center gap-1 text-green-600">
              <Check className="size-3.5" /> 已保存 · {savedAt}
            </span>
          ) : (
            <span>改动后点保存即可生效</span>
          )}
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" /> 保存中...
            </>
          ) : (
            <>
              <Save className="size-4" /> 保存配置
            </>
          )}
        </button>
      </div>
    </div>
  )
}
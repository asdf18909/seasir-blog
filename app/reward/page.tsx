'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { Heart, Coffee, QrCode, Copy, Check } from 'lucide-react'

const rewards: { name: string; amount: number; message: string; date: string }[] = []

const qrTabs = [
  { id: 'wechat', label: '微信', emoji: '💚' },
  { id: 'alipay', label: '支付宝', emoji: '💙' },
]

export default function RewardPage() {
  const [activeTab, setActiveTab] = useState('wechat')
  const [copied, setCopied] = useState(false)
  const [reward, setReward] = useState({
    wechatQr: '',
    alipayQr: '',
    usdtAddress: '0x1234...abcd',
  })

  useEffect(() => {
    // GitHub Pages 静态部署：直接读 JSON
    fetch('/data/reward.json')
      .then(r => r.json())
      .then(data => setReward({
        wechatQr: data.wechatQr || '',
        alipayQr: data.alipayQr || '',
        usdtAddress: data.usdtAddress || '0x1234...abcd',
      }))
      .catch(() => {})
  }, [])

  const walletAddr = reward.usdtAddress
  const currentQr = activeTab === 'wechat' ? reward.wechatQr : reward.alipayQr

  const copyWallet = () => {
    navigator.clipboard?.writeText(walletAddr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalAmount = rewards.reduce((s, r) => s + r.amount, 0)

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
        {/* 标题区 */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Coffee className="mr-1.5 size-4" /> 请我喝杯咖啡
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">赞助 & 打赏</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            如果我的文章对你有帮助，可以考虑请我喝杯咖啡 ☕<br />
            你的支持是我持续创作的动力！
          </p>
        </div>

        {/* 二维码区 */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex justify-center gap-2">
            {qrTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground/70 hover:bg-secondary/80'
                }`}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="relative grid size-56 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/40">
              {currentQr ? (
                <img
                  key={currentQr}
                  src={currentQr}
                  alt={activeTab === 'wechat' ? '微信收款码' : '支付宝收款码'}
                  className="size-full object-contain p-2"
                />
              ) : (
                <>
                  <QrCode className="size-20 text-muted-foreground/50" />
                  <p className="absolute bottom-3 text-xs text-muted-foreground">尚未上传</p>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'wechat' ? '微信扫码 · 随心打赏' : '支付宝扫码 · 随心打赏'}
            </p>
          </div>
        </div>

        {/* USDT 地址 */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <span className="h-4 w-1 rounded-full bg-primary" /> USDT / 加密货币
          </h3>
          <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
            <code className="flex-1 truncate text-sm text-foreground/80">{walletAddr}</code>
            <button
              onClick={copyWallet}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
        </div>

        {/* 打赏统计 */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="font-display text-2xl font-bold text-primary">{rewards.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">打赏次数</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="font-display text-2xl font-bold text-primary">¥{totalAmount.toFixed(2)}</p>
            <p className="mt-1 text-xs text-muted-foreground">累计金额</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="font-display text-2xl font-bold text-primary">{rewards.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">支持者</p>
          </div>
        </div>

        {/* 打赏列表 */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
            <span className="h-4 w-1 rounded-full bg-primary" /> 打赏列表
          </h3>
          <div className="space-y-3">
            {rewards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="mb-3 size-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">还没有打赏记录</p>
                <p className="mt-1 text-xs text-muted-foreground/60">成为第一位支持者吧 ❤️</p>
              </div>
            ) : (
              rewards.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3 transition-colors hover:bg-secondary/60"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Heart className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{r.name}</span>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  {r.message && <p className="mt-0.5 truncate text-xs text-foreground/60">"{r.message}"</p>}
                </div>
                <span className="shrink-0 text-sm font-bold text-primary">¥{r.amount}</span>
              </div>
            ))
            )}
          </div>
        </div>

        {/* 感谢语 */}
        <div className="mt-8 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-chart-3/10 p-6 text-center">
          <p className="text-sm text-foreground/80">
            感谢每一位支持我的朋友！你们的支持是我前进的动力 🙏
          </p>
        </div>
      </div>
      <SiteFooter />
    </>
  )
}
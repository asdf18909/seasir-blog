'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Sun, AlertCircle, RotateCw, MoreHorizontal, FileText, Folder, Tag, Type,
  Clock, CalendarDays, Server, GitBranch, Shield, Globe, ChevronLeft, ChevronRight,
  MapPin,
} from 'lucide-react'
import { useStats } from '@/lib/use-stats'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
      <span className="h-4 w-1 rounded-full bg-primary" />
      {children}
    </h2>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`card-shadow rounded-2xl border border-border bg-card p-4 ${className}`}>{children}</div>
  )
}

const weekdays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

function greeting(h: number) {
  if (h < 6) return '凌晨好，早点休息～'
  if (h < 12) return '上午好，元气满满！'
  if (h < 14) return '中午好，记得吃饭！'
  if (h < 18) return '下午好，继续加油！'
  return '晚上好，注意休息！'
}

function ClockCard() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const h = now?.getHours() ?? 0
  const hh = String(h).padStart(2, '0')
  const mm = String(now?.getMinutes() ?? 0).padStart(2, '0')
  const day = String(now?.getDate() ?? 0).padStart(2, '0')
  const month = String((now?.getMonth() ?? 0) + 1).padStart(2, '0')

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card to-chart-3/10">
      <div className="flex items-start justify-between">
        <p className="text-sm text-foreground/80">{now ? greeting(h) : '你好，继续加油！'}</p>
        <Sun className="size-5 text-chart-4" />
      </div>
      <div className="mt-2 flex items-end gap-3">
        <span className="font-display text-4xl font-bold tabular-nums text-foreground">
          {hh}<span className="animate-pulse">:</span>{mm}
        </span>
        <div className="pb-1 text-xs font-medium text-muted-foreground">
          <p>{now ? weekdays[now.getDay()] : ''}</p>
          <p className="tabular-nums">{day}/{month}</p>
        </div>
      </div>
    </Card>
  )
}

function LatestStatus() {
  return (
    <Card>
      <SectionTitle>最新动态</SectionTitle>
      <p className="py-2 text-center text-sm text-muted-foreground">还没有发布动态</p>
      <Link href="/status" className="mt-1 block text-center text-xs font-medium text-primary hover:underline">更多动态</Link>
    </Card>
  )
}

function Weather() {
  const [weather, setWeather] = useState<{
    city: string
    today: {
      temp: number
      feelsLike: number
      condition: string
      conditionIcon: string
      humidity: number
      windSpeed: number
      windDir: string
      airQuality: string
      aqi: number
    }
    forecast: { day: string; icon: string; condition: string; high: number; low: number }[]
  } | null>(null)
  const [showForecast, setShowForecast] = useState(false)
  const [loading, setLoading] = useState(true)
  const [needPermission, setNeedPermission] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCityInput, setShowCityInput] = useState(false)
  const [cityInput, setCityInput] = useState('')
  const [usedIp, setUsedIp] = useState(false)

  const fetchWeather = (lat?: number, lon?: number, city?: string) => {
    setLoading(true)
    setNeedPermission(false)
    setError(null)
    let url = '/api/weather'
    const params = new URLSearchParams()
    if (lat && lon) {
      params.set('lat', String(lat))
      params.set('lon', String(lon))
    } else if (city) {
      params.set('city', city)
    }
    if (params.toString()) url += `?${params.toString()}`

    // 15 秒超时保护
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        clearTimeout(timeoutId)
        if (d.error === 'missing_coords') {
          setNeedPermission(true)
          setShowCityInput(true)
          setLoading(false)
        } else if (d.error === 'city_not_found') {
          setError(d.message || '找不到该城市')
          setShowCityInput(true)
          setLoading(false)
        } else if (d.error) {
          setWeather(null)
          setError(d.message || '天气数据获取失败')
          setLoading(false)
        } else {
          setWeather(d)
          setLoading(false)
        }
      })
      .catch(() => {
        clearTimeout(timeoutId)
        setWeather(null)
        setError('天气数据获取超时，请重试')
        setLoading(false)
      })
  }

  // IP 定位兜底（服务端会通过 IP 反查城市）
  const fetchByIp = () => {
    setLoading(true)
    setUsedIp(true)
    setError(null)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    fetch('/api/weather', { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        clearTimeout(timeoutId)
        if (d.error) {
          setShowCityInput(true)
          setError(d.message || '请手动输入城市名')
          setLoading(false)
        } else {
          setWeather(d)
          setLoading(false)
        }
      })
      .catch(() => {
        clearTimeout(timeoutId)
        setShowCityInput(true)
        setError('IP 定位超时，请手动输入城市名')
        setLoading(false)
      })
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      // 浏览器不支持定位，直接走 IP 兜底
      fetchByIp()
      return
    }
    setLoading(true)
    setError(null)
    setUsedIp(false)

    // 手动超时兜底（某些 Windows 环境下 geolocation 回调可能不触发）
    let resolved = false
    const fallbackTimer = setTimeout(() => {
      if (!resolved) {
        resolved = true
        // 浏览器定位超时，自动切到 IP 定位
        fetchByIp()
      }
    }, 12000)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (resolved) return
        resolved = true
        clearTimeout(fallbackTimer)
        const { latitude, longitude } = pos.coords
        localStorage.setItem('weather_location', JSON.stringify({ lat: latitude, lon: longitude }))
        fetchWeather(latitude, longitude)
      },
      (err) => {
        if (resolved) return
        resolved = true
        clearTimeout(fallbackTimer)
        // 浏览器定位失败，自动切到 IP 定位
        if (err.code === err.PERMISSION_DENIED) {
          console.log('[weather] 浏览器定位被拒绝，切换 IP 定位')
        } else {
          console.log('[weather] 浏览器定位失败:', err.message, '，切换 IP 定位')
        }
        fetchByIp()
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    )
  }

  useEffect(() => {
    // 首次加载尝试用缓存的位置
    const cached = localStorage.getItem('weather_location')
    if (cached) {
      try {
        const { lat, lon } = JSON.parse(cached)
        if (typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
          fetchWeather(lat, lon)
          return
        }
      } catch { /* ignore */ }
    }
    // 没有缓存，请求定位
    requestLocation()
  }, [])

  const submitCity = () => {
    const city = cityInput.trim()
    if (!city) return
    fetchWeather(undefined, undefined, city)
  }

  const iconMap: Record<string, string> = {
    sunny: '☀️', cloudy: '☁️', partly: '⛅', rain: '🌧️', thunder: '⛈️', snow: '❄️', fog: '🌫️',
  }

  if (loading) {
    return (
      <Card>
        <SectionTitle>天气预报</SectionTitle>
        <div className="flex items-center justify-center py-4">
          <RotateCw className="size-5 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  if (needPermission) {
    return (
      <Card>
        <SectionTitle>天气预报</SectionTitle>
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <MapPin className="size-6 text-primary/60" />
          <p className="text-sm text-muted-foreground">
            {error || '需要获取你的位置才能显示本地天气'}
          </p>

          {!showCityInput ? (
            <>
              <button onClick={requestLocation} className="flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <MapPin className="size-3.5" /> 浏览器定位
              </button>
              <button onClick={fetchByIp} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
                或使用 IP 自动定位
              </button>
            </>
          ) : (
            <div className="flex w-full flex-col gap-2">
              <div className="flex gap-1">
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitCity() }}
                  placeholder="输入城市名，如 上海"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                />
                <button onClick={submitCity} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  查询
                </button>
              </div>
              <button onClick={fetchByIp} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
                或使用 IP 自动定位
              </button>
            </div>
          )}
        </div>
      </Card>
    )
  }

  if (!weather) {
    return (
      <Card>
        <SectionTitle>天气预报</SectionTitle>
        <div className="flex flex-col items-center gap-2 py-2">
          <AlertCircle className="size-6 text-destructive" />
          <p className="text-sm text-muted-foreground">{error || '天气数据获取失败'}</p>
          <button onClick={requestLocation} className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-foreground/80 transition-colors hover:bg-secondary">
            <RotateCw className="size-3.5" /> 重试
          </button>
        </div>
      </Card>
    )
  }

  const t = weather.today
  const aqiColor = t.aqi <= 50 ? 'text-green-500' : t.aqi <= 100 ? 'text-yellow-500' : 'text-orange-500'

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <span className="h-4 w-1 rounded-full bg-primary" />
          天气预报
        </h2>
        <button
          onClick={() => {
            localStorage.removeItem('weather_location')
            requestLocation()
          }}
          className="grid size-6 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="重新定位"
        >
          <MapPin className="size-3.5" />
        </button>
      </div>
      {/* 当前天气 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{weather.city}</p>
          <div className="flex items-end gap-1">
            <span className="font-display text-3xl font-bold tabular-nums text-foreground">{t.temp}°</span>
            <span className="pb-1 text-sm text-foreground/70">{t.condition}</span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">体感 {t.feelsLike}° · {t.windDir} {t.windSpeed}km/h</p>
        </div>
        <span className="text-4xl">{iconMap[t.conditionIcon] || iconMap['cloudy']}</span>
      </div>
      {/* 详情 */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-secondary/60 py-1.5">
          <p className="text-[11px] text-muted-foreground">湿度</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">{t.humidity}%</p>
        </div>
        <div className="rounded-lg bg-secondary/60 py-1.5">
          <p className="text-[11px] text-muted-foreground">空气质量</p>
          <p className={`text-sm font-semibold ${aqiColor}`}>{t.airQuality}</p>
        </div>
        <div className="rounded-lg bg-secondary/60 py-1.5">
          <p className="text-[11px] text-muted-foreground">AQI</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">{t.aqi}</p>
        </div>
      </div>
      {/* 预报 */}
      <button
        onClick={() => setShowForecast(!showForecast)}
        className="mt-3 flex w-full items-center justify-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <MoreHorizontal className="size-4" /> {showForecast ? '收起预报' : '查看 7 天预报'}
      </button>
      {showForecast && (
        <div className="mt-2 space-y-1.5 border-t border-border pt-2">
          {weather.forecast.map((f) => (
            <div key={f.day} className="flex items-center justify-between text-xs">
              <span className="w-12 text-foreground/70">{f.day}</span>
              <span className="text-base">{iconMap[f.icon]}</span>
              <span className="flex-1 px-2 text-center text-muted-foreground">{f.condition}</span>
              <span className="tabular-nums text-foreground/80">{f.high}° / {f.low}°</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function SiteStats() {
  const { data } = useStats()
  const stats = data.siteStats

  const rows = [
    { icon: FileText, l: '文章', v: stats.articles.toLocaleString() },
    { icon: Folder, l: '分类', v: stats.categories.toLocaleString() },
    { icon: Tag, l: '标签', v: stats.tags.toLocaleString() },
    { icon: Type, l: '总字数', v: stats.totalWords.toLocaleString() },
    { icon: Clock, l: '运行时长', v: `${stats.runDays} 天` },
    { icon: CalendarDays, l: '最后活动', v: stats.lastActive },
  ]

  return (
    <Card>
      <SectionTitle>站点统计</SectionTitle>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.l} className="flex items-center justify-between py-2 text-sm">
            <span className="flex items-center gap-2 text-foreground/70"><r.icon className="size-4 text-primary/70" />{r.l}</span>
            <span className="font-medium tabular-nums text-foreground">{r.v}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function SiteInfo() {
  const [info, setInfo] = useState<{
    platform: string
    version: string
    license: string
    domain: string
  } | null>(null)

  useEffect(() => {
    fetch('/api/site-info')
      .then((r) => r.json())
      .then((d) => setInfo(d))
      .catch(() => {})
  }, [])

  const rows = [
    { icon: Server, l: '构建平台', v: info?.platform ?? '...' },
    { icon: GitBranch, l: '博客版本', v: info?.version ?? '...' },
    { icon: Shield, l: '文章许可', v: info?.license ?? '...' },
    { icon: Globe, l: '站点域名', v: info?.domain ?? '...' },
  ]

  return (
    <Card>
      <SectionTitle>站点信息</SectionTitle>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div key={r.l} className="flex items-center justify-between py-2 text-sm">
            <span className="flex items-center gap-2 text-foreground/70"><r.icon className="size-4 text-primary/70" />{r.l}</span>
            <span className="font-medium text-foreground">{r.v}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function CalendarCard() {
  const [now] = useState(() => new Date())
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <button aria-label="上个月" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /></button>
        <span className="text-sm font-bold text-foreground">{year} 年 {month + 1} 月</span>
        <button aria-label="下个月" className="text-muted-foreground hover:text-foreground"><ChevronRight className="size-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
        {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
          <span key={d} className="py-1 font-medium text-muted-foreground">{d}</span>
        ))}
        {cells.map((c, i) => (
          <span
            key={i}
            className={`grid aspect-square place-items-center rounded-full tabular-nums ${
              c === today ? 'bg-primary font-bold text-primary-foreground' : c ? 'text-foreground/80 hover:bg-secondary' : ''
            }`}
          >
            {c ?? ''}
          </span>
        ))}
      </div>
    </Card>
  )
}

export function RightSidebar() {
  return (
    <aside className="flex w-full flex-col gap-4">
      <ClockCard />
      <LatestStatus />
      <Weather />
      <SiteStats />
      <SiteInfo />
      <CalendarCard />
    </aside>
  )
}

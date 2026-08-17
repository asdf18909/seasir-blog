import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-static'

// WMO 天气代码 → 中文描述 + 图标 key
const WMO_CODE_MAP: Record<number, { condition: string; icon: string }> = {
  0:   { condition: '晴',       icon: 'sunny' },
  1:   { condition: '晴间多云', icon: 'partly' },
  2:   { condition: '多云',     icon: 'partly' },
  3:   { condition: '阴',       icon: 'cloudy' },
  45:  { condition: '雾',       icon: 'fog' },
  48:  { condition: '雾凇',     icon: 'fog' },
  51:  { condition: '小毛毛雨', icon: 'rain' },
  53:  { condition: '毛毛雨',   icon: 'rain' },
  55:  { condition: '大毛毛雨', icon: 'rain' },
  56:  { condition: '冻毛毛雨', icon: 'rain' },
  57:  { condition: '冻雨',     icon: 'rain' },
  61:  { condition: '小雨',     icon: 'rain' },
  63:  { condition: '中雨',     icon: 'rain' },
  65:  { condition: '大雨',     icon: 'rain' },
  66:  { condition: '冻雨',     icon: 'rain' },
  67:  { condition: '强冻雨',   icon: 'rain' },
  71:  { condition: '小雪',     icon: 'snow' },
  73:  { condition: '中雪',     icon: 'snow' },
  75:  { condition: '大雪',     icon: 'snow' },
  77:  { condition: '霰',       icon: 'snow' },
  80:  { condition: '小阵雨',   icon: 'rain' },
  81:  { condition: '阵雨',     icon: 'rain' },
  82:  { condition: '强阵雨',   icon: 'rain' },
  85:  { condition: '阵雪',     icon: 'snow' },
  86:  { condition: '强阵雪',   icon: 'snow' },
  95:  { condition: '雷阵雨',   icon: 'thunder' },
  96:  { condition: '雷阵雨伴冰雹', icon: 'thunder' },
  99:  { condition: '强雷阵雨伴冰雹', icon: 'thunder' },
}

// 风向角度 → 中文
function windDirText(deg: number): string {
  const dirs = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风']
  return dirs[Math.round(deg / 45) % 8]
}

// AQI 分级（用 PM2.5 近似）
function aqiLevel(pm25: number): { label: string; value: number } {
  if (pm25 <= 35)  return { label: '优', value: Math.round(pm25 * 1.4) }
  if (pm25 <= 75)  return { label: '良', value: Math.round(pm25 * 1.4) }
  if (pm25 <= 115) return { label: '轻度污染', value: Math.round(pm25 * 1.4) }
  if (pm25 <= 150) return { label: '中度污染', value: Math.round(pm25 * 1.4) }
  if (pm25 <= 250) return { label: '重度污染', value: Math.round(pm25 * 1.4) }
  return { label: '严重污染', value: Math.round(pm25 * 1.4) }
}

// 反向地理编码：经纬度 → 城市名
async function getCityName(lat: number, lon: number): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    })
    clearTimeout(timeout)
    if (!res.ok) return '未知城市'
    const d = await res.json()
    // 优先: city → locality → principalSubdivision → countryName
    return d.city || d.locality || d.principalSubdivision || d.countryName || '未知城市'
  } catch {
    return '未知城市'
  }
}

// IP 定位：通过请求 IP 反查城市
async function getLocationByIp(req: NextRequest): Promise<{ lat: number; lon: number; city: string } | null> {
  try {
    // 优先从请求头获取客户端 IP
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || ''

    // 调用 ip-api.com（免费，无需 Key，限 45 次/分钟）
    const url = ip
      ? `http://ip-api.com/json/${ip}?lang=zh-CN`
      : `http://ip-api.com/json/?lang=zh-CN`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) return null
    const d = await res.json()
    if (d.status !== 'success') return null

    return {
      lat: d.lat,
      lon: d.lon,
      city: d.city || d.regionName || '未知城市',
    }
  } catch {
    return null
  }
}

// 城市名 → 经纬度（用 Open-Meteo 免费的 geocoding API）
async function geocodeCity(city: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) return null
    const d = await res.json()
    const hit = d.results?.[0]
    if (!hit) return null
    return { lat: hit.latitude, lon: hit.longitude, name: hit.name }
  } catch {
    return null
  }
}

export async function GET() {
  // 静态导出模式：本路由在 GitHub Pages 上不被调用
  // （客户端已改用 lib/weather-client.ts 直连 Open-Meteo）。
  // 此处仅返回静态占位响应，确保 next build 可静态渲染通过。
  // 本地 `next dev` 下如需天气 API，请改用 lib/weather-client 的客户端实现。
  return NextResponse.json({
    city: '本地开发',
    today: {
      temp: 20,
      feelsLike: 20,
      condition: '晴',
      conditionIcon: 'sunny',
      humidity: 50,
      windSpeed: 5,
      windDir: '北风',
      pressure: 1013,
      airQuality: '优',
      aqi: 30,
    },
    forecast: [],
  })
}

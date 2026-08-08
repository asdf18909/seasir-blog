import { NextRequest, NextResponse } from 'next/server'

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  let lat = searchParams.get('lat')
  let lon = searchParams.get('lon')
  const cityQuery = searchParams.get('city')

  // 情况 1：客户端传了经纬度
  if (lat && lon) {
    // 直接走下面的逻辑
  }
  // 情况 2：客户端传了城市名
  else if (cityQuery) {
    const geo = await geocodeCity(cityQuery)
    if (!geo) {
      return NextResponse.json({
        error: 'city_not_found',
        message: `找不到城市「${cityQuery}」`,
      }, { status: 200 })
    }
    lat = String(geo.lat)
    lon = String(geo.lon)
  }
  // 情况 3：什么都没有，尝试用 IP 定位（兜底）
  else {
    const ipLoc = await getLocationByIp(req)
    if (ipLoc) {
      lat = String(ipLoc.lat)
      lon = String(ipLoc.lon)
      // IP 定位拿到城市名了，后面直接用它，跳过 reverse-geocode
      // 但为了统一流程，还是让 reverse-geocode 跑一遍（会有缓存）
    } else {
      return NextResponse.json({
        error: 'missing_coords',
        message: '无法获取你的位置，请手动输入城市名',
      }, { status: 200 })
    }
  }

  const latitude = parseFloat(lat!)
  const longitude = parseFloat(lon!)

  try {
    // 并行：获取城市名 + 天气数据
    const weatherController = new AbortController()
    const weatherTimeout = setTimeout(() => weatherController.abort(), 10000)

    const [cityName, weatherRes] = await Promise.all([
      getCityName(latitude, longitude),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl` +
        `&hourly=pm2_5` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&timezone=auto&forecast_days=7`,
        {
          signal: weatherController.signal,
          next: { revalidate: 1800 }, // 30分钟缓存
        }
      ),
    ])

    clearTimeout(weatherTimeout)

    if (!weatherRes.ok) {
      throw new Error(`Weather API error: ${weatherRes.status}`)
    }

    const data = await weatherRes.json()
    const current = data.current
    const daily = data.daily

    // 当前 PM2.5（取当前小时）
    const nowHour = new Date().getHours()
    const currentPm25 = data.hourly?.pm2_5?.[nowHour] ?? 0
    const aqi = aqiLevel(currentPm25)

    const wmo = WMO_CODE_MAP[current.weather_code] || { condition: '未知', icon: 'cloudy' }

    const todayForecast = daily.time.map((date: string, i: number) => {
      const wmoF = WMO_CODE_MAP[daily.weather_code[i]] || { condition: '未知', icon: 'cloudy' }
      const dt = new Date(date)
      const today = new Date()
      let label = ''
      if (i === 0) label = '今天'
      else if (i === 1) label = '明天'
      else if (i === 2) label = '后天'
      else label = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dt.getDay()]

      return {
        day: label,
        date: `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`,
        icon: wmoF.icon,
        condition: wmoF.condition,
        high: Math.round(daily.temperature_2m_max[i]),
        low: Math.round(daily.temperature_2m_min[i]),
      }
    })

    const result = {
      city: cityName,
      today: {
        temp: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        condition: wmo.condition,
        conditionIcon: wmo.icon,
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        windDir: windDirText(current.wind_direction_10m),
        pressure: Math.round(current.pressure_msl),
        airQuality: aqi.label,
        aqi: aqi.value,
      },
      forecast: todayForecast,
    }

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({
      error: 'fetch_failed',
      message: err.message || '天气数据获取失败',
    }, { status: 200 })
  }
}

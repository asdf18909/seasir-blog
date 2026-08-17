// GitHub Pages 静态部署：客户端直接调用 Open-Meteo
// 不依赖服务端 API 路由

const WMO_CODE_MAP: Record<number, { condition: string; icon: string }> = {
  0: { condition: '晴', icon: 'sunny' },
  1: { condition: '晴间多云', icon: 'partly' },
  2: { condition: '多云', icon: 'partly' },
  3: { condition: '阴', icon: 'cloudy' },
  45: { condition: '雾', icon: 'fog' },
  48: { condition: '雾凇', icon: 'fog' },
  51: { condition: '小毛毛雨', icon: 'rain' },
  53: { condition: '毛毛雨', icon: 'rain' },
  55: { condition: '大毛毛雨', icon: 'rain' },
  56: { condition: '冻毛毛雨', icon: 'rain' },
  57: { condition: '冻雨', icon: 'rain' },
  61: { condition: '小雨', icon: 'rain' },
  63: { condition: '中雨', icon: 'rain' },
  65: { condition: '大雨', icon: 'rain' },
  66: { condition: '冻雨', icon: 'rain' },
  67: { condition: '强冻雨', icon: 'rain' },
  71: { condition: '小雪', icon: 'snow' },
  73: { condition: '中雪', icon: 'snow' },
  75: { condition: '大雪', icon: 'snow' },
  77: { condition: '霰', icon: 'snow' },
  80: { condition: '小阵雨', icon: 'rain' },
  81: { condition: '阵雨', icon: 'rain' },
  82: { condition: '强阵雨', icon: 'rain' },
  85: { condition: '阵雪', icon: 'snow' },
  86: { condition: '强阵雪', icon: 'snow' },
  95: { condition: '雷阵雨', icon: 'thunder' },
  96: { condition: '雷阵雨伴冰雹', icon: 'thunder' },
  99: { condition: '强雷阵雨伴冰雹', icon: 'thunder' },
}

function windDirText(deg: number): string {
  const dirs = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风']
  return dirs[Math.round(deg / 45) % 8]
}

function aqiLevel(pm25: number): { label: string; value: number } {
  if (pm25 <= 35) return { label: '优', value: Math.round(pm25 * 1.4) }
  if (pm25 <= 75) return { label: '良', value: Math.round(pm25 * 1.4) }
  if (pm25 <= 115) return { label: '轻度污染', value: Math.round(pm25 * 1.4) }
  if (pm25 <= 150) return { label: '中度污染', value: Math.round(pm25 * 1.4) }
  if (pm25 <= 250) return { label: '重度污染', value: Math.round(pm25 * 1.4) }
  return { label: '严重污染', value: Math.round(pm25 * 1.4) }
}

async function geocodeCity(city: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 8000)
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`
    const res = await fetch(url, { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    const d = await res.json()
    const hit = d.results?.[0]
    if (!hit) return null
    return { lat: hit.latitude, lon: hit.longitude, name: hit.name }
  } catch {
    return null
  }
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 8000)
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`
    const res = await fetch(url, { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) return '未知城市'
    const d = await res.json()
    return d.city || d.locality || d.principalSubdivision || d.countryName || '未知城市'
  } catch {
    return '未知城市'
  }
}

export interface WeatherData {
  city: string
  current: {
    temp: number
    condition: string
    icon: string
    humidity: number
    windSpeed: number
    windDir: string
    airQuality: string
    aqi: number
  }
  forecast: { day: string; icon: string; condition: string; high: number; low: number }[]
}

/**
 * GitHub Pages 静态部署：客户端直接调用 Open-Meteo 获取天气
 * @param lat 纬度（可选）
 * @param lon 经度（可选）
 * @param city 城市名（可选，优先级低于 lat/lon）
 */
export async function fetchWeatherClient(
  lat?: number,
  lon?: number,
  city?: string
): Promise<WeatherData | { error: string; message: string }> {
  let finalLat = lat
  let finalLon = lon
  let cityName = city || ''

  // 城市名 → 经纬度
  if ((!finalLat || !finalLon) && city) {
    const geo = await geocodeCity(city)
    if (!geo) {
      return { error: 'city_not_found', message: `找不到城市「${city}」` }
    }
    finalLat = geo.lat
    finalLon = geo.lon
    cityName = geo.name
  }

  if (!finalLat || !finalLon) {
    return { error: 'missing_coords', message: '无法获取位置，请输入城市名' }
  }

  // 1. 获取天气预报
  const forecastCtrl = new AbortController()
  const forecastTimer = setTimeout(() => forecastCtrl.abort(), 10000)
  const forecastRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${finalLat}&longitude=${finalLon}` +
      `&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&timezone=auto&forecast_days=7`,
    { signal: forecastCtrl.signal }
  )
  clearTimeout(forecastTimer)

  if (!forecastRes.ok) {
    return { error: 'fetch_failed', message: '天气服务暂时不可用' }
  }
  const forecastData = await forecastRes.json()

  // 2. 获取空气质量
  let pm25 = 0
  try {
    const aqiCtrl = new AbortController()
    const aqiTimer = setTimeout(() => aqiCtrl.abort(), 8000)
    const aqiRes = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${finalLat}&longitude=${finalLon}&current=pm2_5`,
      { signal: aqiCtrl.signal }
    )
    clearTimeout(aqiTimer)
    if (aqiRes.ok) {
      const aqiData = await aqiRes.json()
      pm25 = aqiData.current?.pm2_5 || 0
    }
  } catch {
    /* 空气质量获取失败不影响主流程 */
  }

  // 3. 反向地理编码（如果还没有城市名）
  if (!cityName) {
    cityName = await reverseGeocode(finalLat, finalLon)
  }

  // 4. 组装响应
  const current = forecastData.current || {}
  const daily = forecastData.daily || {}
  const wmoInfo = WMO_CODE_MAP[current.weather_code || 0] || { condition: '未知', icon: 'partly' }
  const aqi = aqiLevel(pm25)

  const forecast: WeatherData['forecast'] = []
  if (daily.time && Array.isArray(daily.time)) {
    for (let i = 0; i < daily.time.length; i++) {
      const code = daily.weather_code[i]
      const info = WMO_CODE_MAP[code] || { condition: '未知', icon: 'partly' }
      const date = new Date(daily.time[i])
      const dayLabel = i === 0 ? '今天' : i === 1 ? '明天' : `${date.getMonth() + 1}/${date.getDate()}`
      forecast.push({
        day: dayLabel,
        icon: info.icon,
        condition: info.condition,
        high: Math.round(daily.temperature_2m_max[i]),
        low: Math.round(daily.temperature_2m_min[i]),
      })
    }
  }

  return {
    city: cityName,
    current: {
      temp: Math.round(current.temperature_2m || 0),
      condition: wmoInfo.condition,
      icon: wmoInfo.icon,
      humidity: Math.round(current.relative_humidity_2m || 0),
      windSpeed: Math.round(current.wind_speed_10m || 0),
      windDir: windDirText(current.wind_direction_10m || 0),
      airQuality: aqi.label,
      aqi: aqi.value,
    },
    forecast,
  }
}
import { promises as fs } from 'fs'
import path from 'path'

// ===== 路径常量 =====
const DATA_DIR = path.join(process.cwd(), 'data')
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MUSIC_DIR = path.join(process.cwd(), 'public', 'music')

const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json')
const PLAYLIST_FILE = path.join(DATA_DIR, 'playlist.json')
const IMAGES_FILE = path.join(DATA_DIR, 'images.json')
const HERO_FILE = path.join(DATA_DIR, 'hero.json')
const NAV_FILE = path.join(DATA_DIR, 'nav.json')
const REWARD_FILE = path.join(DATA_DIR, 'reward.json')
const ANIME_FILE = path.join(DATA_DIR, 'anime.json')
const VIDEO_DIR = path.join(process.cwd(), 'public', 'videos')
const STATS_FILE = path.join(DATA_DIR, 'stats.json')

// ===== 类型定义 =====
export type Article = {
  id: string
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  tags: string[]
  cover?: string
  pinned?: boolean
  content: string
  createdAt: string
  updatedAt: string
}

export type MusicTrack = {
  id: number
  title: string
  artist: string
  duration: number
  url: string
  cover: string
}

export type ImageItem = {
  id: string
  name: string
  url: string
  size: number
  uploadedAt: string
}

export type HeroConfig = {
  avatar: string         // 头像 URL
  bgImage: string        // 背景图 URL
  greeting: string       // 主标题（hello）
  subtitle: string       // 副标题（花有重开日，人无再少年）
  buttonText: string     // 按钮文字（开始阅读）
}

export type NavChild = {
  label: string
  href: string
  icon: string
  external?: boolean
}

export type NavItemConfig = {
  label: string
  href?: string
  icon: string
  children?: NavChild[]
}

export type RewardConfig = {
  wechatQr: string      // 微信收款码 URL
  alipayQr: string      // 支付宝收款码 URL
  usdtAddress: string   // USDT 钱包地址
}

export type AnimeItem = {
  id: string
  title: string         // 标题
  cover: string         // 封面图 URL
  score: number         // 评分 0-10
  status: string        // 在看 / 已看完 / 想看
  episodes: number      // 总集数
  watchedEpisodes: number // 已看集数
  year: number          // 年份
  tags: string[]        // 标签
  videoUrl: string      // 视频 URL（本地或外链）
  videoType: string     // 'local' | 'external'
  summary: string       // 简介
  createdAt: string
  updatedAt: string
}

// ===== 站点统计 =====
// 持久化在 data/stats.json 中，浏览器访问 + 文章增删都会自动累计
export type StatsRecord = {
  totalViews: number       // 总浏览量（每次有效访问 +1）
  visits: number           // 访问数（同上不去重，纯计数器）
  visitors: number         // 独立访客数（按 visitorId 去重）
  startDate: string        // 站点启动时间（首次写入时记录）
  lastActiveAt: string     // 最后活动时间（ISO）
  // 按天聚合的浏览量，用于月度趋势图；key 形如 "2026-08-08"
  dailyViews: Record<string, number>
  // 已计入的访客 ID 列表（持久化去重，重启不丢）
  visitorIds: string[]
}

// ===== JSON 文件读写 =====
async function readJson<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

async function writeJson<T>(filePath: string, data: T): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// ===== 文章操作 =====
export async function getArticles(): Promise<Article[]> {
  return readJson<Article[]>(ARTICLES_FILE, [])
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const articles = await getArticles()
  return articles.find(a => a.slug === slug) || null
}

export async function saveArticle(article: Article): Promise<void> {
  const articles = await getArticles()
  const idx = articles.findIndex(a => a.id === article.id)
  if (idx >= 0) {
    articles[idx] = { ...article, updatedAt: new Date().toISOString() }
  } else {
    articles.unshift(article)
  }
  await writeJson(ARTICLES_FILE, articles)
  // 同步更新最后活动时间
  await touchActive()
}

export async function deleteArticle(id: string): Promise<void> {
  const articles = await getArticles()
  await writeJson(ARTICLES_FILE, articles.filter(a => a.id !== id))
  await touchActive()
}

// ===== 音乐操作 =====
export async function getPlaylist(): Promise<MusicTrack[]> {
  return readJson<MusicTrack[]>(PLAYLIST_FILE, [])
}

export async function savePlaylist(playlist: MusicTrack[]): Promise<void> {
  await writeJson(PLAYLIST_FILE, playlist)
}

export async function addTrack(track: MusicTrack): Promise<void> {
  const playlist = await getPlaylist()
  playlist.push(track)
  await writeJson(PLAYLIST_FILE, playlist)
}

export async function deleteTrack(id: number): Promise<void> {
  const playlist = await getPlaylist()
  await writeJson(PLAYLIST_FILE, playlist.filter(t => t.id !== id))
}

// ===== 图片操作 =====
export async function getImages(): Promise<ImageItem[]> {
  return readJson<ImageItem[]>(IMAGES_FILE, [])
}

export async function saveImage(image: ImageItem): Promise<void> {
  const images = await getImages()
  images.unshift(image)
  await writeJson(IMAGES_FILE, images)
}

export async function deleteImage(id: string): Promise<void> {
  const images = await getImages()
  const img = images.find(i => i.id === id)
  if (img) {
    const filePath = path.join(process.cwd(), 'public', img.url)
    try { await fs.unlink(filePath) } catch {}
  }
  await writeJson(IMAGES_FILE, images.filter(i => i.id !== id))
}

// ===== 文件保存 =====
export async function saveUploadedFile(
  buffer: Buffer,
  filename: string,
  subdir: 'uploads' | 'music' | 'videos' = 'uploads'
): Promise<string> {
  let dir: string
  if (subdir === 'music') dir = MUSIC_DIR
  else if (subdir === 'videos') dir = VIDEO_DIR
  else dir = UPLOAD_DIR
  await fs.mkdir(dir, { recursive: true })
  const filePath = path.join(dir, filename)
  await fs.writeFile(filePath, buffer)
  return `/${subdir}/${filename}`
}

// ===== Hero 配置 =====
export const DEFAULT_HERO: HeroConfig = {
  avatar: '/avatar.png',
  bgImage: '/hero-bg.png',
  greeting: 'hello',
  subtitle: '花有重开日，人无再少年',
  buttonText: '开始阅读',
}

export async function getHero(): Promise<HeroConfig> {
  return readJson<HeroConfig>(HERO_FILE, DEFAULT_HERO)
}

export async function saveHero(config: HeroConfig): Promise<void> {
  await writeJson(HERO_FILE, config)
}

// ===== 导航菜单 =====
// 默认导航（首次打开或重置时使用）
export const DEFAULT_NAV: NavItemConfig[] = [
  { label: '主页', href: '/', icon: 'home' },
  {
    label: '文章',
    icon: 'file-text',
    children: [
      { label: '归档', href: '/archive', icon: 'archive' },
      { label: '分类', href: '/categories', icon: 'folder' },
      { label: '标签', href: '/tags', icon: 'tag' },
    ],
  },
  {
    label: '社交',
    icon: 'users',
    children: [
      { label: '友链', href: '/links', icon: 'link' },
      { label: '留言', href: '/comments', icon: 'message-circle' },
    ],
  },
  {
    label: '动态',
    icon: 'zap',
    children: [
      { label: '朋友圈', href: '/moments', icon: 'image' },
      { label: '动态', href: '/status', icon: 'activity' },
      { label: '日记', href: '/diary', icon: 'book' },
    ],
  },
  {
    label: '我的',
    icon: 'user',
    children: [
      { label: '相册', href: '/album', icon: 'image' },
      { label: '追番', href: '/anime', icon: 'tv' },
      { label: '番组计划', href: '/bangumi', icon: 'calendar' },
      { label: '设备', href: '/devices', icon: 'cpu' },
      { label: '音乐', href: '/music', icon: 'music' },
      { label: '足迹', href: '/footprint', icon: 'map-pin' },
      { label: '书签导航', href: '/nav', icon: 'bookmark' },
    ],
  },
  {
    label: '更多',
    icon: 'info',
    children: [
      { label: '打赏', href: '/reward', icon: 'gift' },
    ],
  },
  {
    label: '其他',
    icon: 'more-horizontal',
    children: [
      { label: '项目', href: '/projects', icon: 'folder-git' },
      { label: '时间线', href: '/timeline', icon: 'git-commit' },
      { label: '技能', href: '/skills', icon: 'star' },
      { label: '统计', href: '/stats', icon: 'bar-chart' },
    ],
  },
  {
    label: '链接',
    icon: 'link-2',
    children: [
      { label: 'GitHub', href: 'https://github.com', icon: 'github', external: true },
      { label: 'Gitee', href: 'https://gitee.com', icon: 'git-branch', external: true },
      { label: 'CNB', href: 'https://cnb.cool', icon: 'cloud', external: true },
      { label: '个人主页', href: '#', icon: 'globe', external: true },
    ],
  },
]

export async function getNav(): Promise<NavItemConfig[]> {
  return readJson<NavItemConfig[]>(NAV_FILE, DEFAULT_NAV)
}

export async function saveNav(items: NavItemConfig[]): Promise<void> {
  await writeJson(NAV_FILE, items)
}

export async function resetNav(): Promise<NavItemConfig[]> {
  await writeJson(NAV_FILE, DEFAULT_NAV)
  return DEFAULT_NAV
}

// ===== 打赏配置 =====
export const DEFAULT_REWARD: RewardConfig = {
  wechatQr: '',
  alipayQr: '',
  usdtAddress: '0x1234...abcd',
}

export async function getReward(): Promise<RewardConfig> {
  return readJson<RewardConfig>(REWARD_FILE, DEFAULT_REWARD)
}

export async function saveReward(config: RewardConfig): Promise<void> {
  await writeJson(REWARD_FILE, config)
}

// ===== 追番操作 =====
export async function getAnimeList(): Promise<AnimeItem[]> {
  return readJson<AnimeItem[]>(ANIME_FILE, [])
}

export async function getAnimeById(id: string): Promise<AnimeItem | null> {
  const list = await getAnimeList()
  return list.find(a => a.id === id) || null
}

export async function saveAnime(item: AnimeItem): Promise<void> {
  const list = await getAnimeList()
  const idx = list.findIndex(a => a.id === item.id)
  if (idx >= 0) {
    list[idx] = { ...item, updatedAt: new Date().toISOString() }
  } else {
    list.unshift(item)
  }
  await writeJson(ANIME_FILE, list)
}

export async function deleteAnime(id: string): Promise<void> {
  const list = await getAnimeList()
  await writeJson(ANIME_FILE, list.filter(a => a.id !== id))
}

// ===== 统计 =====
export const DEFAULT_STATS: StatsRecord = {
  totalViews: 0,
  visits: 0,
  visitors: 0,
  startDate: '',
  lastActiveAt: '',
  dailyViews: {},
  visitorIds: [],
}

export async function getStats(): Promise<StatsRecord> {
  const stats = await readJson<StatsRecord>(STATS_FILE, DEFAULT_STATS)
  // 容错补字段，避免旧文件缺少新字段时类型报错
  return {
    ...DEFAULT_STATS,
    ...stats,
    dailyViews: stats.dailyViews || {},
    visitorIds: stats.visitorIds || [],
  }
}

export async function saveStats(stats: StatsRecord): Promise<void> {
  await writeJson(STATS_FILE, stats)
}

/**
 * 记录一次访问。
 * @param visitorId  访客唯一标识（一般是 cookie uuid）
 * @returns 最新的统计快照
 */
export async function recordVisit(visitorId: string): Promise<StatsRecord> {
  const stats = await getStats()
  const now = new Date()
  const nowIso = now.toISOString()
  const today = nowIso.slice(0, 10) // YYYY-MM-DD

  // 首次写入时记录站点启动时间
  if (!stats.startDate) {
    stats.startDate = today
  }

  // 浏览量 / 访问数：每次调用都 +1
  stats.totalViews += 1
  stats.visits += 1

  // 访客数：首次见到的 ID 才计入
  if (visitorId && !stats.visitorIds.includes(visitorId)) {
    stats.visitorIds.push(visitorId)
    stats.visitors += 1
  }

  // 按天聚合
  stats.dailyViews[today] = (stats.dailyViews[today] || 0) + 1

  // 最后活动
  stats.lastActiveAt = nowIso

  await saveStats(stats)
  return stats
}

/**
 * 更新最后活动时间（创建/编辑/删除文章等管理操作时调用）
 */
export async function touchActive(): Promise<void> {
  const stats = await getStats()
  if (!stats.startDate) {
    stats.startDate = new Date().toISOString().slice(0, 10)
  }
  stats.lastActiveAt = new Date().toISOString()
  await saveStats(stats)
}

/**
 * 计算文章总字数
 * - 去掉 HTML 标签
 * - 去掉 Markdown 常见标记 (# * > ` [ ] ( ) 等)
 * - 统计剩余字符数（中文按 1 字，英文按 1 字）
 */
export function countWords(articles: Array<{ content?: string; excerpt?: string; title?: string }>): number {
  let total = 0
  for (const a of articles) {
    const raw = (a.content || '') + '\n' + (a.excerpt || '') + '\n' + (a.title || '')
    const stripped = raw
      .replace(/<[^>]+>/g, ' ')           // 去 HTML
      .replace(/[#>*`~\-_|]/g, ' ')        // 去常见 MD 标记
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 图片语法
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接保留文本
      .replace(/\s+/g, ' ')
      .trim()
    // CJK 字符按 1 字算；连续 ASCII 段按词数算
    const cjk = (stripped.match(/[\u4e00-\u9fa5]/g) || []).length
    const ascii = stripped.replace(/[\u4e00-\u9fa5]/g, ' ').match(/\S+/g)?.length || 0
    total += cjk + ascii
  }
  return total
}

/**
 * 计算运行时长（天）
 */
export function getRunDays(startDate: string): number {
  if (!startDate) return 0
  const start = new Date(startDate).getTime()
  const now = Date.now()
  if (Number.isNaN(start)) return 0
  return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)))
}

// ===== ID 生成 =====
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

// ===== 获取上传图片列表（扫描目录）=====
export async function scanUploadDir(): Promise<ImageItem[]> {
  try {
    const files = await fs.readdir(UPLOAD_DIR)
    const images: ImageItem[] = []
    for (const file of files) {
      if (file === '.gitkeep') continue
      const ext = path.extname(file).toLowerCase()
      if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext)) {
        const stat = await fs.stat(path.join(UPLOAD_DIR, file))
        images.push({
          id: file,
          name: file,
          url: `/uploads/${file}`,
          size: stat.size,
          uploadedAt: stat.mtime.toISOString(),
        })
      }
    }
    return images.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
  } catch {
    return []
  }
}

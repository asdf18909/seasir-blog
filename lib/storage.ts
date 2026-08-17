import { promises as fs } from 'fs'
import path from 'path'
import { getDb } from './db'

// ===== 路径常量 =====
// GitHub Pages 静态部署：JSON 文件放在 public/data/ 下，作为部署产物被读取/访问。
// SQLite 是本地后台的增删改查存储；发布时导出为这些 JSON 文件。
const DATA_DIR = path.join(process.cwd(), 'public', 'data')
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
  avatar: string
  bgImage: string
  greeting: string
  subtitle: string
  buttonText: string
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
  wechatQr: string
  alipayQr: string
  usdtAddress: string
}

export type AnimeItem = {
  id: string
  title: string
  cover: string
  score: number
  status: string
  episodes: number
  watchedEpisodes: number
  year: number
  tags: string[]
  videoUrl: string
  videoType: string
  summary: string
  createdAt: string
  updatedAt: string
}

// ===== 站点统计 =====
export type StatsRecord = {
  totalViews: number
  visits: number
  visitors: number
  startDate: string
  lastActiveAt: string
  dailyViews: Record<string, number>
  visitorIds: string[]
}

// ===== 行映射（SQLite -> 业务对象）=====
function safeParseArray(s: any): string[] {
  try {
    const a = JSON.parse(s)
    return Array.isArray(a) ? a : []
  } catch {
    return []
  }
}

function rowToArticle(r: any): Article {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    date: r.date,
    category: r.category,
    excerpt: r.excerpt,
    tags: safeParseArray(r.tags),
    cover: r.cover == null ? '' : r.cover,
    pinned: !!r.pinned,
    content: r.content,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

function rowToAnime(r: any): AnimeItem {
  return {
    id: r.id,
    title: r.title,
    cover: r.cover,
    score: Number(r.score) || 0,
    status: r.status,
    episodes: Number(r.episodes) || 0,
    watchedEpisodes: Number(r.watchedEpisodes) || 0,
    year: Number(r.year) || 0,
    tags: safeParseArray(r.tags),
    videoUrl: r.videoUrl,
    videoType: r.videoType,
    summary: r.summary,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

function rowToImage(r: any): ImageItem {
  return {
    id: r.id,
    name: r.name,
    url: r.url,
    size: Number(r.size) || 0,
    uploadedAt: r.uploadedAt,
  }
}

function rowToMusic(r: any): MusicTrack {
  return {
    id: Number(r.id),
    title: r.title,
    artist: r.artist,
    duration: Number(r.duration) || 0,
    url: r.url,
    cover: r.cover,
  }
}

// ===== JSON 文件读写（回退 / 镜像用）=====
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

// ===== 文章操作（SQLite 优先 + JSON 回退；写入双写）=====
export async function getArticles(): Promise<Article[]> {
  const db = await getDb()
  if (db) {
    try {
      const rows = db.prepare('SELECT * FROM articles ORDER BY date DESC').all()
      if (rows.length) return rows.map(rowToArticle)
    } catch {}
  }
  return readJson<Article[]>(ARTICLES_FILE, [])
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const db = await getDb()
  if (db) {
    try {
      const r = db.prepare('SELECT * FROM articles WHERE slug=?').get(slug)
      if (r) return rowToArticle(r)
    } catch {}
  }
  const articles = await getArticles()
  return articles.find(a => a.slug === slug) || null
}

async function persistArticles(list: Article[]): Promise<void> {
  const db = await getDb()
  if (db) {
    db.prepare('DELETE FROM articles').run()
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO articles (id,slug,title,date,category,excerpt,tags,cover,pinned,content,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
    )
    for (const a of list) {
      stmt.run(
        a.id, a.slug, a.title, a.date, a.category, a.excerpt,
        JSON.stringify(a.tags || []), a.cover || null, a.pinned ? 1 : 0,
        a.content, a.createdAt, a.updatedAt
      )
    }
  }
  await writeJson(ARTICLES_FILE, list)
}

export async function saveArticle(article: Article): Promise<void> {
  const list = await getArticles()
  const idx = list.findIndex(a => a.id === article.id)
  const updated: Article = { ...article, updatedAt: new Date().toISOString() }
  if (idx >= 0) list[idx] = updated
  else list.unshift(updated)
  await persistArticles(list)
  await touchActive()
}

export async function deleteArticle(id: string): Promise<void> {
  const list = await getArticles()
  await persistArticles(list.filter(a => a.id !== id))
  await touchActive()
}

// ===== 音乐操作 =====
export async function getPlaylist(): Promise<MusicTrack[]> {
  const db = await getDb()
  if (db) {
    try {
      const rows = db.prepare('SELECT * FROM music ORDER BY id').all()
      if (rows.length) return rows.map(rowToMusic)
    } catch {}
  }
  return readJson<MusicTrack[]>(PLAYLIST_FILE, [])
}

async function persistMusic(list: MusicTrack[]): Promise<void> {
  const db = await getDb()
  if (db) {
    db.prepare('DELETE FROM music').run()
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO music (id,title,artist,duration,url,cover) VALUES (?,?,?,?,?,?)'
    )
    for (const t of list) {
      stmt.run(t.id, t.title, t.artist, t.duration, t.url, t.cover)
    }
  }
  await writeJson(PLAYLIST_FILE, list)
}

export async function savePlaylist(playlist: MusicTrack[]): Promise<void> {
  await persistMusic(playlist)
}

export async function addTrack(track: MusicTrack): Promise<void> {
  const list = await getPlaylist()
  const id =
    typeof track.id === 'number' && track.id > 0
      ? track.id
      : list.reduce((m, t) => Math.max(m, t.id || 0), 0) + 1
  list.push({ ...track, id })
  await persistMusic(list)
}

export async function deleteTrack(id: number): Promise<void> {
  const list = await getPlaylist()
  await persistMusic(list.filter(t => t.id !== id))
}

// ===== 图片操作 =====
export async function getImages(): Promise<ImageItem[]> {
  const db = await getDb()
  if (db) {
    try {
      const rows = db.prepare('SELECT * FROM images ORDER BY uploadedAt DESC').all()
      if (rows.length) return rows.map(rowToImage)
    } catch {}
  }
  return readJson<ImageItem[]>(IMAGES_FILE, [])
}

async function persistImages(list: ImageItem[]): Promise<void> {
  const db = await getDb()
  if (db) {
    db.prepare('DELETE FROM images').run()
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO images (id,name,url,size,uploadedAt) VALUES (?,?,?,?,?)'
    )
    for (const i of list) {
      stmt.run(i.id, i.name, i.url, i.size, i.uploadedAt)
    }
  }
  await writeJson(IMAGES_FILE, list)
}

export async function saveImage(image: ImageItem): Promise<void> {
  const list = await getImages()
  const idx = list.findIndex(i => i.id === image.id)
  if (idx >= 0) list[idx] = image
  else list.unshift(image)
  await persistImages(list)
}

export async function deleteImage(id: string): Promise<void> {
  const list = await getImages()
  const img = list.find(i => i.id === id)
  if (img) {
    const filePath = path.join(process.cwd(), 'public', img.url)
    try { await fs.unlink(filePath) } catch {}
  }
  await persistImages(list.filter(i => i.id !== id))
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

// ===== Hero 配置（kv）=====
export const DEFAULT_HERO: HeroConfig = {
  avatar: '/avatar.png',
  bgImage: '/hero-bg.png',
  greeting: 'hello',
  subtitle: '花有重开日，人无再少年',
  buttonText: '开始阅读',
}

export async function getHero(): Promise<HeroConfig> {
  const db = await getDb()
  if (db) {
    try {
      const r = db.prepare("SELECT value FROM kv WHERE key='hero'").get()
      if (r) return JSON.parse((r as any).value) as HeroConfig
    } catch {}
  }
  return readJson<HeroConfig>(HERO_FILE, DEFAULT_HERO)
}

export async function saveHero(config: HeroConfig): Promise<void> {
  const db = await getDb()
  if (db) {
    db.prepare("INSERT OR REPLACE INTO kv (key,value) VALUES ('hero',?)").run(JSON.stringify(config))
  }
  await writeJson(HERO_FILE, config)
}

// ===== 导航菜单 =====
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
  const db = await getDb()
  if (db) {
    try {
      const r = db.prepare("SELECT value FROM kv WHERE key='nav'").get()
      if (r) {
        const v = JSON.parse((r as any).value)
        return Array.isArray(v) ? v : (v.items || DEFAULT_NAV)
      }
    } catch {}
  }
  const data = await readJson<any>(NAV_FILE, DEFAULT_NAV)
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.items)) return data.items
  return DEFAULT_NAV
}

export async function saveNav(items: NavItemConfig[]): Promise<void> {
  const db = await getDb()
  if (db) {
    db.prepare("INSERT OR REPLACE INTO kv (key,value) VALUES ('nav',?)").run(JSON.stringify(items))
  }
  await writeJson(NAV_FILE, { items })
}

export async function resetNav(): Promise<NavItemConfig[]> {
  await saveNav(DEFAULT_NAV)
  return DEFAULT_NAV
}

// ===== 打赏配置（kv）=====
export const DEFAULT_REWARD: RewardConfig = {
  wechatQr: '',
  alipayQr: '',
  usdtAddress: '0x1234...abcd',
}

export async function getReward(): Promise<RewardConfig> {
  const db = await getDb()
  if (db) {
    try {
      const r = db.prepare("SELECT value FROM kv WHERE key='reward'").get()
      if (r) return JSON.parse((r as any).value) as RewardConfig
    } catch {}
  }
  return readJson<RewardConfig>(REWARD_FILE, DEFAULT_REWARD)
}

export async function saveReward(config: RewardConfig): Promise<void> {
  const db = await getDb()
  if (db) {
    db.prepare("INSERT OR REPLACE INTO kv (key,value) VALUES ('reward',?)").run(JSON.stringify(config))
  }
  await writeJson(REWARD_FILE, config)
}

// ===== 追番操作 =====
export async function getAnimeList(): Promise<AnimeItem[]> {
  const db = await getDb()
  if (db) {
    try {
      const rows = db.prepare('SELECT * FROM anime ORDER BY updatedAt DESC').all()
      if (rows.length) return rows.map(rowToAnime)
    } catch {}
  }
  return readJson<AnimeItem[]>(ANIME_FILE, [])
}

export async function getAnimeById(id: string): Promise<AnimeItem | null> {
  const db = await getDb()
  if (db) {
    try {
      const r = db.prepare('SELECT * FROM anime WHERE id=?').get(id)
      if (r) return rowToAnime(r)
    } catch {}
  }
  const list = await getAnimeList()
  return list.find(a => a.id === id) || null
}

async function persistAnime(list: AnimeItem[]): Promise<void> {
  const db = await getDb()
  if (db) {
    db.prepare('DELETE FROM anime').run()
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO anime (id,title,cover,score,status,episodes,watchedEpisodes,year,tags,videoUrl,videoType,summary,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    )
    for (const a of list) {
      stmt.run(
        a.id, a.title, a.cover, a.score, a.status, a.episodes, a.watchedEpisodes, a.year,
        JSON.stringify(a.tags || []), a.videoUrl, a.videoType, a.summary, a.createdAt, a.updatedAt
      )
    }
  }
  await writeJson(ANIME_FILE, list)
}

export async function saveAnime(item: AnimeItem): Promise<void> {
  const list = await getAnimeList()
  const idx = list.findIndex(a => a.id === item.id)
  const updated: AnimeItem = { ...item, updatedAt: new Date().toISOString() }
  if (idx >= 0) list[idx] = updated
  else list.unshift(updated)
  await persistAnime(list)
}

export async function deleteAnime(id: string): Promise<void> {
  const list = await getAnimeList()
  await persistAnime(list.filter(a => a.id !== id))
}

// ===== 统计（保持 JSON 文件，GitHub Pages 静态环境无法运行时累计）=====
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

export async function recordVisit(visitorId: string): Promise<StatsRecord> {
  const stats = await getStats()
  const now = new Date()
  const nowIso = now.toISOString()
  const today = nowIso.slice(0, 10)

  if (!stats.startDate) stats.startDate = today
  stats.totalViews += 1
  stats.visits += 1
  if (visitorId && !stats.visitorIds.includes(visitorId)) {
    stats.visitorIds.push(visitorId)
    stats.visitors += 1
  }
  stats.dailyViews[today] = (stats.dailyViews[today] || 0) + 1
  stats.lastActiveAt = nowIso

  await saveStats(stats)
  return stats
}

export async function touchActive(): Promise<void> {
  const stats = await getStats()
  if (!stats.startDate) stats.startDate = new Date().toISOString().slice(0, 10)
  stats.lastActiveAt = new Date().toISOString()
  await saveStats(stats)
}

// ===== 字数统计 =====
export function countWords(articles: Array<{ content?: string; excerpt?: string; title?: string }>): number {
  let total = 0
  for (const a of articles) {
    const raw = (a.content || '') + '\n' + (a.excerpt || '') + '\n' + (a.title || '')
    const stripped = raw
      .replace(/<[^>]+>/g, ' ')
      .replace(/[#>*`~\-_|]/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()
    const cjk = (stripped.match(/[\u4e00-\u9fa5]/g) || []).length
    const ascii = stripped.replace(/[\u4e00-\u9fa5]/g, ' ').match(/\S+/g)?.length || 0
    total += cjk + ascii
  }
  return total
}

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

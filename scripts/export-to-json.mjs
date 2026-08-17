// 把本地 SQLite 数据库（.data/blog.db）导出为 public/data/*.json 部署产物。
// 用途：在本地后台做完增删改查后，发布前运行本脚本，生成 GitHub Pages 实际读取的 JSON。
// 用法：node scripts/export-to-json.mjs
import { DatabaseSync } from 'node:sqlite'
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const DB_PATH = path.join(root, '.data', 'blog.db')
const DATA_DIR = path.join(root, 'public', 'data')

function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(data, null, 2))
}
function safeAll(sql) {
  try { return sql() } catch { return [] }
}

let db
try {
  db = new DatabaseSync(DB_PATH)
} catch (e) {
  console.error('无法打开数据库（可能尚未 seed）：', e.message)
  process.exit(1)
}

// articles
const articles = safeAll(() => db.prepare('SELECT * FROM articles').all())
if (articles.length) {
  writeJson(path.join(DATA_DIR, 'articles.json'), articles.map(r => ({
    id: r.id, slug: r.slug, title: r.title, date: r.date, category: r.category, excerpt: r.excerpt,
    tags: JSON.parse(r.tags || '[]'), cover: r.cover == null ? '' : r.cover, pinned: !!r.pinned,
    content: r.content, createdAt: r.createdAt, updatedAt: r.updatedAt,
  })))
  console.log('articles ->', articles.length)
} else {
  console.log('articles: 表为空，跳过')
}

// anime
const anime = safeAll(() => db.prepare('SELECT * FROM anime').all())
if (anime.length) {
  writeJson(path.join(DATA_DIR, 'anime.json'), anime.map(r => ({
    id: r.id, title: r.title, cover: r.cover, score: Number(r.score) || 0, status: r.status,
    episodes: Number(r.episodes) || 0, watchedEpisodes: Number(r.watchedEpisodes) || 0,
    year: Number(r.year) || 0, tags: JSON.parse(r.tags || '[]'), videoUrl: r.videoUrl,
    videoType: r.videoType, summary: r.summary, createdAt: r.createdAt, updatedAt: r.updatedAt,
  })))
  console.log('anime ->', anime.length)
} else {
  console.log('anime: 表为空，跳过')
}

// images
const images = safeAll(() => db.prepare('SELECT * FROM images').all())
if (images.length) {
  writeJson(path.join(DATA_DIR, 'images.json'), images.map(r => ({
    id: r.id, name: r.name, url: r.url, size: Number(r.size) || 0, uploadedAt: r.uploadedAt,
  })))
  console.log('images ->', images.length)
} else {
  console.log('images: 表为空，跳过')
}

// music
const music = safeAll(() => db.prepare('SELECT * FROM music').all())
if (music.length) {
  writeJson(path.join(DATA_DIR, 'playlist.json'), music.map(r => ({
    id: Number(r.id), title: r.title, artist: r.artist, duration: Number(r.duration) || 0, url: r.url, cover: r.cover,
  })))
  console.log('music ->', music.length)
} else {
  console.log('music: 表为空，跳过')
}

// kv: hero / nav / reward
for (const key of ['hero', 'nav', 'reward']) {
  const r = safeAll(() => db.prepare("SELECT value FROM kv WHERE key=?").get(key))
  if (r && r.value) {
    writeJson(path.join(DATA_DIR, `${key}.json`), JSON.parse(r.value))
    console.log(`kv ${key} -> ok`)
  } else {
    console.log(`kv ${key}: 无数据，跳过`)
  }
}

console.log('export done')

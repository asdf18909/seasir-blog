// 从 public/data/*.json 初始化本地 SQLite 数据库（.data/blog.db）
// 用途：首次克隆仓库、或 JSON 与 DB 不同步时，把已部署的 JSON 内容灌入本地数据库。
// 用法：node scripts/seed-from-json.mjs
import { DatabaseSync } from 'node:sqlite'
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const DB_PATH = path.join(root, '.data', 'blog.db')
const DATA_DIR = path.join(root, 'public', 'data')

const SCHEMA = `
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY, slug TEXT, title TEXT, date TEXT, category TEXT,
  excerpt TEXT, tags TEXT, cover TEXT, pinned INTEGER DEFAULT 0,
  content TEXT, createdAt TEXT, updatedAt TEXT
);
CREATE TABLE IF NOT EXISTS anime (
  id TEXT PRIMARY KEY, title TEXT, cover TEXT, score REAL, status TEXT,
  episodes INTEGER, watchedEpisodes INTEGER, year INTEGER, tags TEXT,
  videoUrl TEXT, videoType TEXT, summary TEXT, createdAt TEXT, updatedAt TEXT
);
CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY, name TEXT, url TEXT, size INTEGER, uploadedAt TEXT
);
CREATE TABLE IF NOT EXISTS music (
  id INTEGER PRIMARY KEY, title TEXT, artist TEXT, duration INTEGER, url TEXT, cover TEXT
);
CREATE TABLE IF NOT EXISTS kv ( key TEXT PRIMARY KEY, value TEXT );
`

function readJson(p, def) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch { return def }
}

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
const db = new DatabaseSync(DB_PATH)
db.exec(SCHEMA)

const articles = readJson(path.join(DATA_DIR, 'articles.json'), [])
const aStmt = db.prepare(
  'INSERT OR REPLACE INTO articles (id,slug,title,date,category,excerpt,tags,cover,pinned,content,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
)
for (const a of articles) {
  aStmt.run(a.id, a.slug, a.title, a.date, a.category, a.excerpt, JSON.stringify(a.tags || []), a.cover || null, a.pinned ? 1 : 0, a.content, a.createdAt, a.updatedAt)
}
console.log(`articles: ${articles.length}`)

const anime = readJson(path.join(DATA_DIR, 'anime.json'), [])
const anStmt = db.prepare(
  'INSERT OR REPLACE INTO anime (id,title,cover,score,status,episodes,watchedEpisodes,year,tags,videoUrl,videoType,summary,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
)
for (const a of anime) {
  anStmt.run(a.id, a.title, a.cover, a.score, a.status, a.episodes, a.watchedEpisodes, a.year, JSON.stringify(a.tags || []), a.videoUrl, a.videoType, a.summary, a.createdAt, a.updatedAt)
}
console.log(`anime: ${anime.length}`)

const images = readJson(path.join(DATA_DIR, 'images.json'), [])
const iStmt = db.prepare('INSERT OR REPLACE INTO images (id,name,url,size,uploadedAt) VALUES (?,?,?,?,?)')
for (const i of images) iStmt.run(i.id, i.name, i.url, i.size, i.uploadedAt)
console.log(`images: ${images.length}`)

const playlist = readJson(path.join(DATA_DIR, 'playlist.json'), [])
const mStmt = db.prepare('INSERT OR REPLACE INTO music (id,title,artist,duration,url,cover) VALUES (?,?,?,?,?,?)')
for (const t of playlist) mStmt.run(t.id, t.title, t.artist, t.duration, t.url, t.cover)
console.log(`music: ${playlist.length}`)

const kvStmt = db.prepare("INSERT OR REPLACE INTO kv (key,value) VALUES (?,?)")
for (const key of ['hero', 'nav', 'reward']) {
  const data = readJson(path.join(DATA_DIR, `${key}.json`), null)
  if (data !== null) {
    kvStmt.run(key, JSON.stringify(data))
    console.log(`kv ${key}: ok`)
  }
}

console.log('seed done ->', DB_PATH)

import path from 'path'
import fs from 'fs'

// 本地 SQLite 数据库（Node 22 内置 node:sqlite，零依赖、CI 无需编译）
// GitHub Pages 是纯静态站点，运行时没有数据库；SQLite 仅用于本地后台增删改查，
// 发布时由 scripts/export-to-json.mjs 导出为 public/data/*.json 再部署。
const DB_PATH = path.join(process.cwd(), '.data', 'blog.db')

const SCHEMA = `
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT,
  title TEXT,
  date TEXT,
  category TEXT,
  excerpt TEXT,
  tags TEXT,
  cover TEXT,
  pinned INTEGER DEFAULT 0,
  content TEXT,
  createdAt TEXT,
  updatedAt TEXT
);
CREATE TABLE IF NOT EXISTS anime (
  id TEXT PRIMARY KEY,
  title TEXT,
  cover TEXT,
  score REAL,
  status TEXT,
  episodes INTEGER,
  watchedEpisodes INTEGER,
  year INTEGER,
  tags TEXT,
  videoUrl TEXT,
  videoType TEXT,
  summary TEXT,
  createdAt TEXT,
  updatedAt TEXT
);
CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  name TEXT,
  url TEXT,
  size INTEGER,
  uploadedAt TEXT
);
CREATE TABLE IF NOT EXISTS music (
  id INTEGER PRIMARY KEY,
  title TEXT,
  artist TEXT,
  duration INTEGER,
  url TEXT,
  cover TEXT
);
CREATE TABLE IF NOT EXISTS kv (
  key TEXT PRIMARY KEY,
  value TEXT
);
`

let _db: any = null
let _init: Promise<any> | null = null

/**
 * 惰性获取数据库连接。
 * - 成功：返回 DatabaseSync 实例（首次调用时建库 + 建表）。
 * - 失败（如老版本 Node 不支持 node:sqlite）：返回 null，调用方自动回退到 JSON 文件模式。
 */
export async function getDb(): Promise<any> {
  if (_db) return _db
  if (_init) return _init
  _init = (async () => {
    try {
      const sqlite = await import('node:sqlite')
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
      const db = new sqlite.DatabaseSync(DB_PATH)
      db.exec(SCHEMA)
      _db = db
      return db
    } catch (e: any) {
      console.warn('[db] SQLite 不可用，回退到 JSON 文件模式：', e?.message || String(e))
      _db = null
      return null
    }
  })()
  return _init
}

export const DB_PATH_STR = DB_PATH

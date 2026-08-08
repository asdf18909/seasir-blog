export type NavItem = {
  label: string
  href?: string
  icon: string
  children?: { label: string; href: string; icon: string; external?: boolean }[]
}

export const navItems: NavItem[] = [
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

export type Article = {
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  tags: string[]
  cover?: string
  pinned?: boolean
  content: string
}

export const articles: Article[] = [
  {
    slug: 'hello-world-这是博客的第一篇文章',
    title: 'Hello, World · 这是博客的第一篇文章',
    date: '2026-08-08',
    category: '随笔',
    excerpt: '花有重开日，人无再少年。开通这个博客的初衷很简单——给往后的日子留一个可以回望的角落。',
    tags: ['开篇', '随笔', '建站'],
    cover: '',
    pinned: true,
    content: `# Hello, World\n\n> 花有重开日，人无再少年。\n\n你好呀，欢迎来到我的小站。\n\n这是这个博客的第一篇文章，写于一个普通的周六上午。\n\n---\n\n## 为什么开这个博客\n\n说起来原因挺简单：\n\n最近在整理旧硬盘，翻到三年前写的一些东西——几篇没发出去的技术笔记、几张旅行时拍的照片、还有几段当时觉得非记不可、现在看却有点傻的感慨。它们散落在各种地方：Notion、微信收藏、备忘录、本地文件夹……时间一久，自己都找不到了。\n\n于是就有了这个博客。\n\n它不打算日更，不追热点，也不为流量。我只是想——**给往后的日子留一个可以回望的角落**。\n\n## 这个博客里会写些什么\n\n大概会有这几类内容：\n\n- 🛠️ **技术笔记**：平时折腾项目时踩过的坑、写过的小工具\n- ✈️ **路上的事**：去过的城市、见过的风景、吃过的馆子\n- 🎬 **看过的剧和书**：偶尔追番、偶尔读书，随缘记录\n- 💭 **胡思乱想**：生活里那些不值得发朋友圈、却也舍不得扔掉的小情绪\n\n写得好不好不重要，重要的是**真的写下来**。\n\n## 关于这个站\n\n技术栈用的是 Next.js + JSON 文件存储，部署在我自己的小服务器上。没有花哨的功能，但每个功能都尽量做到能长期用：\n\n- 文章支持 Markdown，可以拖拽上传图片\n- 后台可以直接在网页上发布文章、上传图片、管理音乐\n- 数据全部存在本地，迁移起来很方便\n\n后期我会在后台 /admin 慢慢完善各种模块，不懂的再来骚扰 AI 老师 😄\n\n## 写在最后\n\n如果未来某天我回头看这篇文章，大概会想：\n\n> 原来那时候的我是这样的啊。\n\n这就是博客对我来说的意义——**和未来的自己对话**。\n\n感谢你点进来，那我们就开始吧。\n\n— 写于 2026 年夏天`,
  },
]

export const categories: { name: string; count: number }[] = []

export const tags: string[] = []

export const socialLinks = [
  { label: 'GitHub', icon: 'github', href: 'https://github.com' },
  { label: 'Email', icon: 'mail', href: 'mailto:hi@seasir.top' },
  { label: 'RSS', icon: 'rss', href: '/rss.xml' },
  { label: 'cnb', icon: 'cloud', href: 'https://cnb.cool' },
  { label: 'Telegram', icon: 'send', href: 'https://telegram.org' },
]

// ===== 音乐播放列表 =====
// ★ 换歌/上传音乐方法：
//   方式一（本地文件）：把 mp3 放到 public/music/ 目录，然后 url 填 '/music/文件名.mp3'
//   方式二（外链）：把 url 换成可访问的音频直链地址（如 OSS / 七牛 / GitHub raw）
//   cover 填封面图路径，如 '/cover-1.png' 或外链
export type MusicTrack = {
  id: number
  title: string
  artist: string
  duration: number // 秒
  url: string
  cover: string
}

export const playlist: MusicTrack[] = [
  {
    id: 1,
    title: '特别的人',
    artist: '方大同',
    duration: 259,
    url: '/music/方大同-特别的人.mp3',
    cover: '/cover-1.png',
  },
]

// ===== 今日一言 =====
export const hitokotoList = [
  { content: '人生最大的幸福，是发现自己爱的人正好也爱着自己。', author: '张爱玲' },
  { content: '愿你出走半生，归来仍是少年。', author: '佚名' },
  { content: '不要因为没有掌声就放弃自己的梦想。', author: '佚名' },
  { content: '生活就像海洋，只有意志坚强的人才能到达彼岸。', author: '马克思' },
  { content: '所有的不甘，都是因为还心存梦想。', author: '佚名' },
  { content: '星光不问赶路人，时光不负有心人。', author: '佚名' },
  { content: '愿你历尽千帆，归来仍是少年。', author: '苏轼' },
  { content: '人生没有白走的路，每一步都算数。', author: '李宗盛' },
  { content: '愿你成为自己的太阳，无需凭借谁的光。', author: '佚名' },
  { content: '既然选择了远方，便只顾风雨兼程。', author: '汪国真' },
]

// ===== 站点统计 =====
export const siteStats = {
  articles: articles.length,
  categories: categories.length,
  tags: tags.length,
  totalWords: 0,
  runDays: 0,
  lastActive: '—',
}

// ===== 访问统计 =====
export const visitStats = {
  totalViews: '0',
  visits: '0',
  visitors: '0',
}

// ===== 站点信息 =====
export const siteInfo = {
  platform: 'EdgeOne',
  version: 'Firefly v6.15.6',
  license: 'CC BY-NC-SA 4.0',
  domain: 'seasir.top',
}

// ===== 友链 =====
export const friendLinks: { name: string; url: string; avatar: string; description: string }[] = []

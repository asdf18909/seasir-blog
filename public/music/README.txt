把你的 mp3 音频文件放到这个目录（public/music/）

然后在 lib/data.ts 的 playlist 数组里修改：
- url 填 '/music/你的歌曲.mp3'
- cover 填封面图路径，如 '/cover-1.png'
- title / artist / duration 按需修改

示例：
{
  id: 1,
  title: '歌曲名',
  artist: '歌手名',
  duration: 240,          // 秒数
  url: '/music/my-song.mp3',
  cover: '/cover-1.png',
}

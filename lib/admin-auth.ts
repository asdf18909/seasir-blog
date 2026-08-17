// 客户端后台鉴权（纯客户端，构建安全）
//
// 项目是 output: 'export' 纯静态导出，路由处理器在构建期被烤成静态 JSON，
// 运行时无法做真正的服务端鉴权（一旦在服务端用 cookies()/headers() 会让
// next build 报错）。因此这里采用「客户端密码闸」：
//   - 密码来自 NEXT_PUBLIC_ADMIN_PASSWORD（构建期内联到前端，不触发动态导出）
//   - 登录态记在 sessionStorage，后台布局统一拦截未登录访问
//
// ⚠️ 这是「本地自用」级别的威慑，不是真正的服务端安全。
//    若要真服务端鉴权：去掉 output: 'export' 或在前端套一层带鉴权的反代。

export const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'seasir-local'

const AUTH_KEY = 'seasir_admin_authed'

// 简单的登录态校验（仅防止误入，可被绕过，仅本地用）
export function isAuthed(): boolean {
  if (typeof window === 'undefined') return false
  return window.sessionStorage.getItem(AUTH_KEY) === '1'
}

export function login(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    window.sessionStorage.setItem(AUTH_KEY, '1')
    return true
  }
  return false
}

export function logout(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(AUTH_KEY)
}

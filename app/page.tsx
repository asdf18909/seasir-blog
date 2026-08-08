import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { LeftSidebar } from '@/components/left-sidebar'
import { ArticleFeed } from '@/components/article-feed'
import { RightSidebar } from '@/components/right-sidebar'
import { SiteFooter } from '@/components/site-footer'
import { CookieBanner } from '@/components/cookie-banner'

export default function Page() {
  return (
    <>
      <Navbar />
      <Hero />
      <div id="content" className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
        <div className="order-2 lg:order-1">
          <LeftSidebar />
        </div>
        <div className="order-1 lg:order-2">
          <ArticleFeed />
        </div>
        <div className="order-3 lg:order-3 lg:col-span-2 xl:col-span-1">
          <RightSidebar />
        </div>
      </div>
      <SiteFooter />
      <CookieBanner />
    </>
  )
}

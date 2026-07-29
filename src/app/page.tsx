'use client'

import dynamic from 'next/dynamic'

// 整个首页依赖本地存储（localforage）与 zustand store，
// 这些只在浏览器中可用。若参与 SSR 预渲染，服务端快照与客户端首屏会不一致，
// 触发 React #438 hydration 错误导致白屏。因此用 ssr:false 让首页仅客户端渲染。
const HomeView = dynamic(() => import('./home-view').then((m) => m.HomeView), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loading-spinner w-12 h-12"></div>
    </div>
  ),
})

export default function Page() {
  return <HomeView />
}

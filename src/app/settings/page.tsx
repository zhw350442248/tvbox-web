'use client'

import dynamic from 'next/dynamic'

// 设置页同样依赖本地存储与 store，改为仅客户端渲染，避免 SSR 水合报错。
const SettingsView = dynamic(
  () => import('./settings-view').then((m) => m.SettingsView),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    ),
  }
)

export default function Page() {
  return <SettingsView />
}

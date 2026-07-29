import { create } from 'zustand'
import type { SourceConfig, SiteBean, LiveGroup, HistoryItem, CollectItem, DriveConfig } from '@/types'
import { sourceStore, currentSourceStore, historyStore, collectStore, driveStore } from '@/lib/storage'

// 应用状态
interface AppState {
  // 数据源
  sources: SourceConfig[]
  currentSourceKey: string | null
  currentSite: SiteBean | null
  
  // 直播
  liveGroups: LiveGroup[]
  currentLiveChannel: string | null
  
  // 历史记录
  history: HistoryItem[]
  
  // 收藏
  collects: CollectItem[]
  
  // 网盘
  drives: DriveConfig[]
  
  // UI状态
  loading: boolean
  sidebarOpen: boolean
  playerSettings: PlayerSettings
  
  // Actions
  init: () => Promise<void>
  setSources: (sources: SourceConfig[]) => Promise<void>
  addSource: (source: SourceConfig) => Promise<void>
  removeSource: (index: number) => Promise<void>
  setCurrentSource: (key: string, site: SiteBean) => Promise<void>
  
  setLiveGroups: (groups: LiveGroup[]) => void
  setCurrentLiveChannel: (url: string | null) => void
  
  addHistory: (item: HistoryItem) => Promise<void>
  removeHistory: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
  
  addCollect: (item: CollectItem) => Promise<void>
  removeCollect: (videoId: string) => Promise<void>
  
  addDrive: (drive: DriveConfig) => Promise<void>
  removeDrive: (name: string) => Promise<void>
  
  setLoading: (loading: boolean) => void
  toggleSidebar: () => void
  setPlayerSettings: (settings: Partial<PlayerSettings>) => void
}

// 播放器设置
interface PlayerSettings {
  autoplay: boolean
  defaultQuality: string
  defaultSpeed: number
  danmakuEnabled: boolean
  danmakuOpacity: number
  danmakuSpeed: number
  danmakuFontSize: number
}

const defaultPlayerSettings: PlayerSettings = {
  autoplay: true,
  defaultQuality: 'auto',
  defaultSpeed: 1.0,
  danmakuEnabled: true,
  danmakuOpacity: 0.9,
  danmakuSpeed: 144,
  danmakuFontSize: 25,
}

export const useAppStore = create<AppState>((set, get) => ({
  // 初始状态
  sources: [],
  currentSourceKey: null,
  currentSite: null,
  liveGroups: [],
  currentLiveChannel: null,
  history: [],
  collects: [],
  drives: [],
  loading: false,
  sidebarOpen: true,
  playerSettings: defaultPlayerSettings,

  // 初始化
  init: async () => {
    const sources = await sourceStore.get()
    let currentSourceKey = await currentSourceStore.get()
    const history = await historyStore.get()
    const collects = await collectStore.get()
    const drives = await driveStore.get()

    // 如果当前选中的源在已保存的源里不存在，清空它，避免后续渲染/请求异常
    if (currentSourceKey) {
      const exists = sources.some((s) =>
        (s.sites || []).some((site) => site.key === currentSourceKey)
      )
      if (!exists) {
        currentSourceKey = null
        await currentSourceStore.set('')
      }
    }

    set({
      sources,
      currentSourceKey,
      history,
      collects,
      drives,
    })
  },

  // 数据源操作
  setSources: async (sources) => {
    // 写入前过滤一遍，保证本地缓存始终干净
    const cleanSources = sources.filter(
      (s) => s && Array.isArray(s.sites) && s.sites.length > 0
    )
    await sourceStore.set(cleanSources)
    const currentSourceKey = await currentSourceStore.get()
    let newCurrentKey = currentSourceKey
    let newCurrentSite: SiteBean | null = null

    if (cleanSources.length > 0) {
      const allSites = cleanSources.flatMap((s) => s.sites || [])
      const exists = allSites.some((s) => s.key === currentSourceKey)
      if (!exists && allSites.length > 0) {
        newCurrentKey = allSites[0].key
        newCurrentSite = allSites[0]
        await currentSourceStore.set(newCurrentKey)
      } else if (exists) {
        newCurrentSite = allSites.find((s) => s.key === currentSourceKey) || null
      }
    }

    set({ sources: cleanSources, currentSourceKey: newCurrentKey, currentSite: newCurrentSite })
  },

  addSource: async (source) => {
    if (!source || !Array.isArray(source.sites) || source.sites.length === 0) {
      throw new Error('非法数据源')
    }
    await sourceStore.add(source)
    const sources = await sourceStore.get()
    const currentSourceKey = await currentSourceStore.get()
    let newCurrentKey = currentSourceKey
    let newCurrentSite: SiteBean | null = null

    if (!currentSourceKey && sources.length > 0) {
      const allSites = sources.flatMap((s) => s.sites || [])
      if (allSites.length > 0) {
        newCurrentKey = allSites[0].key
        newCurrentSite = allSites[0]
        await currentSourceStore.set(newCurrentKey)
      }
    } else if (currentSourceKey) {
      newCurrentSite = sources.flatMap((s) => s.sites || []).find((s) => s.key === currentSourceKey) || null
    }

    set({ sources, currentSourceKey: newCurrentKey, currentSite: newCurrentSite })
  },

  removeSource: async (index) => {
    await sourceStore.remove(index)
    const sources = await sourceStore.get()
    set({ sources })
  },

  setCurrentSource: async (key, site) => {
    await currentSourceStore.set(key)
    set({ currentSourceKey: key, currentSite: site })
  },

  // 直播操作
  setLiveGroups: (groups) => set({ liveGroups: groups }),
  setCurrentLiveChannel: (url) => set({ currentLiveChannel: url }),

  // 历史记录操作
  addHistory: async (item) => {
    await historyStore.add(item)
    const history = await historyStore.get()
    set({ history })
  },

  removeHistory: async (id) => {
    await historyStore.remove(id)
    const history = await historyStore.get()
    set({ history })
  },

  clearHistory: async () => {
    await historyStore.clear()
    set({ history: [] })
  },

  // 收藏操作
  addCollect: async (item) => {
    await collectStore.add(item)
    const collects = await collectStore.get()
    set({ collects })
  },

  removeCollect: async (videoId) => {
    await collectStore.remove(videoId)
    const collects = await collectStore.get()
    set({ collects })
  },

  // 网盘操作
  addDrive: async (drive) => {
    await driveStore.add(drive)
    const drives = await driveStore.get()
    set({ drives })
  },

  removeDrive: async (name) => {
    await driveStore.remove(name)
    const drives = await driveStore.get()
    set({ drives })
  },

  // UI操作
  setLoading: (loading) => set({ loading }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setPlayerSettings: (settings) =>
    set((state) => ({
      playerSettings: { ...state.playerSettings, ...settings },
    })),
}))

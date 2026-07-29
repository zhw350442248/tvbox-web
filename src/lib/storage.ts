import localforage from 'localforage'
import type { HistoryItem, CollectItem, DriveConfig, SourceConfig } from '@/types'

// 配置 localforage
// 注意：name/storeName 变更后旧数据会被隔离，避免旧版项目（KatelyaTV）存的不兼容数据被读取。
localforage.config({
  name: 'tvbox-web-v2',
  version: 1.0,
  storeName: 'tvbox',
})

// 校验数据源配置是否合法，防止本地缓存里的旧/坏数据导致 flatMap 报错
function isValidSourceConfig(v: any): v is SourceConfig {
  return (
    v &&
    typeof v === 'object' &&
    Array.isArray(v.sites) &&
    v.sites.every(
      (s: any) =>
        s &&
        typeof s === 'object' &&
        typeof s.key === 'string' &&
        typeof s.name === 'string' &&
        typeof s.api === 'string' &&
        typeof s.type === 'number'
    )
  )
}

// 数据源存储
export const sourceStore = {
  async get(): Promise<SourceConfig[]> {
    const data = await localforage.getItem<any[]>('sources')
    if (!Array.isArray(data)) return []
    // 过滤掉不兼容/损坏的数据，避免后续 flatMap 等操作报错
    return data.filter(isValidSourceConfig)
  },

  async set(sources: SourceConfig[]): Promise<void> {
    await localforage.setItem('sources', sources)
  },

  async add(source: SourceConfig): Promise<void> {
    const sources = await this.get()
    sources.push(source)
    await this.set(sources)
  },

  async remove(index: number): Promise<void> {
    const sources = await this.get()
    sources.splice(index, 1)
    await this.set(sources)
  },
}

// 当前数据源
export const currentSourceStore = {
  async get(): Promise<string | null> {
    return await localforage.getItem<string>('currentSource')
  },

  async set(key: string): Promise<void> {
    await localforage.setItem('currentSource', key)
  },
}

// 历史记录存储
export const historyStore = {
  async get(): Promise<HistoryItem[]> {
    const data = await localforage.getItem<HistoryItem[]>('history')
    return data || []
  },

  async add(item: HistoryItem): Promise<void> {
    const history = await this.get()
    // 移除旧的记录
    const index = history.findIndex((h) => h.videoId === item.videoId)
    if (index > -1) {
      history.splice(index, 1)
    }
    // 添加到开头
    history.unshift(item)
    // 最多保留100条
    if (history.length > 100) {
      history.pop()
    }
    await localforage.setItem('history', history)
  },

  async remove(id: string): Promise<void> {
    const history = await this.get()
    const index = history.findIndex((h) => h.id === id)
    if (index > -1) {
      history.splice(index, 1)
      await localforage.setItem('history', history)
    }
  },

  async clear(): Promise<void> {
    await localforage.setItem('history', [])
  },

  async getByVideoId(videoId: string): Promise<HistoryItem | undefined> {
    const history = await this.get()
    return history.find((h) => h.videoId === videoId)
  },
}

// 收藏存储
export const collectStore = {
  async get(): Promise<CollectItem[]> {
    const data = await localforage.getItem<CollectItem[]>('collect')
    return data || []
  },

  async add(item: CollectItem): Promise<void> {
    const collect = await this.get()
    // 检查是否已收藏
    if (!collect.find((c) => c.videoId === item.videoId)) {
      collect.unshift(item)
      await localforage.setItem('collect', collect)
    }
  },

  async remove(videoId: string): Promise<void> {
    const collect = await this.get()
    const index = collect.findIndex((c) => c.videoId === videoId)
    if (index > -1) {
      collect.splice(index, 1)
      await localforage.setItem('collect', collect)
    }
  },

  async isCollected(videoId: string): Promise<boolean> {
    const collect = await this.get()
    return collect.some((c) => c.videoId === videoId)
  },

  async clear(): Promise<void> {
    await localforage.setItem('collect', [])
  },
}

// 网盘配置存储
export const driveStore = {
  async get(): Promise<DriveConfig[]> {
    const data = await localforage.getItem<DriveConfig[]>('drives')
    return data || []
  },

  async set(drives: DriveConfig[]): Promise<void> {
    await localforage.setItem('drives', drives)
  },

  async add(drive: DriveConfig): Promise<void> {
    const drives = await this.get()
    drives.push(drive)
    await this.set(drives)
  },

  async remove(name: string): Promise<void> {
    const drives = await this.get()
    const index = drives.findIndex((d) => d.name === name)
    if (index > -1) {
      drives.splice(index, 1)
      await this.set(drives)
    }
  },
}

// 搜索历史
export const searchHistoryStore = {
  async get(): Promise<string[]> {
    const data = await localforage.getItem<string[]>('searchHistory')
    return data || []
  },

  async add(keyword: string): Promise<void> {
    const history = await this.get()
    // 移除重复
    const index = history.indexOf(keyword)
    if (index > -1) {
      history.splice(index, 1)
    }
    // 添加到开头
    history.unshift(keyword)
    // 最多保留20条
    if (history.length > 20) {
      history.pop()
    }
    await localforage.setItem('searchHistory', history)
  },

  async clear(): Promise<void> {
    await localforage.setItem('searchHistory', [])
  },
}

interface CacheItem<T> {
  data: T
  timestamp: number
}

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 часа в миллисекундах

export const cacheService = {
  set<T>(key: string, data: T): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(cacheItem))
  },

  get<T>(key: string): T | null {
    const item = localStorage.getItem(key)
    if (!item) return null

    const cacheItem: CacheItem<T> = JSON.parse(item)
    const now = Date.now()

    if (now - cacheItem.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key)
      return null
    }

    return cacheItem.data
  },

  clear(key: string): void {
    localStorage.removeItem(key)
  },
}

import type {IService} from './services'
import {ServiceBase} from './services'

export interface ICacheService extends IService {
  clear: () => void
  get: <T>(key: string) => T | undefined
  remove: (key: string) => void
  set: (key: string, object: unknown, expiration?: Date) => void
}

export class CacheService extends ServiceBase implements ICacheService {
  public static override readonly serviceId = 'ICacheService'
  private cache = new Map<string, CacheItem>()

  public clear() {
    this.cache.clear()
  }

  public get<T>(key: string): T | undefined {
    const item = this.cache.get(key)
    if (item) {
      if (!item.expiration || item.expiration > new Date()) {
        return item.object as T
      }
      this.remove(key)
    }

    return undefined
  }

  public remove(key: string) {
    this.cache.delete(key)
  }

  public set(key: string, object: unknown, expiration?: Date | undefined) {
    this.cache.set(key, {object, expiration})
  }
}

interface CacheItem {
  object: unknown
  expiration?: Date
}

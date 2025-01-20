import {jsonSafeStorage} from '@github-ui/safe-storage'

export interface BundleSize {
  encoded: number
  decoded: number
}

export interface LogEntry {
  js: BundleSize
  css: BundleSize
  navType: string
  url: string
  timestamp: string
}

export class BundleSizeLog {
  #storage = jsonSafeStorage<LogEntry[]>('sessionStorage')
  #storageKey = 'bundle-size-log'
  #log: LogEntry[] = this.#storage.getItem(this.#storageKey) || []

  entries(): LogEntry[] {
    return this.#log
  }

  addEntry(entry: Omit<LogEntry, 'timestamp'>) {
    this.#log.unshift({...entry, timestamp: new Date().toISOString()})
    this.#storage.setItem(this.#storageKey, this.#log)
  }

  reset = () => {
    this.#log = []
    this.#storage.setItem(this.#storageKey, this.#log)
  }
}

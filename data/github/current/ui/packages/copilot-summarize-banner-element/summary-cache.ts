import safeStorage from '@github-ui/safe-storage'
import type {SummaryFeedbackSentiment} from './types'

const safeLocalStorage = safeStorage('localStorage')

interface SummaryCacheOptions {
  /**
   * A unique identifier for the content being summarized, such as a URL or database table name + primary key.
   */
  contentIdentifier: string
}

export default class SummaryCache {
  static readonly keyPrefix = 'copilot-summary'

  private _summaryKey: string
  private _summaryFeedbackSentimentKey: string
  private _summaryTimeKey: string

  constructor({contentIdentifier}: SummaryCacheOptions) {
    this._summaryKey = `${SummaryCache.keyPrefix}${contentIdentifier}`
    this._summaryFeedbackSentimentKey = `${SummaryCache.keyPrefix}-feedback${contentIdentifier}`
    this._summaryTimeKey = `${SummaryCache.keyPrefix}-time${contentIdentifier}`
  }

  getSummary(): string | null {
    return safeLocalStorage.getItem(this._summaryKey)
  }

  getSummaryTime(): Date | null {
    const msStr = safeLocalStorage.getItem(this._summaryTimeKey)
    if (typeof msStr !== 'string') return null
    const ms = parseInt(msStr, 10)
    const date = new Date()
    date.setTime(ms)
    return date
  }

  getSummaryFeedbackSentiment(): SummaryFeedbackSentiment | null {
    const value = safeLocalStorage.getItem(this._summaryFeedbackSentimentKey)
    if (value) return value as SummaryFeedbackSentiment
    return null
  }

  setSummary(content: string, now: Date = new Date()) {
    safeLocalStorage.setItem(this._summaryKey, content)
    this.setSummaryTime(now)
  }

  setSummaryFeedbackSentiment(sentiment: SummaryFeedbackSentiment) {
    safeLocalStorage.setItem(this._summaryFeedbackSentimentKey, sentiment)
  }

  clear() {
    safeLocalStorage.removeItem(this._summaryKey)
    safeLocalStorage.removeItem(this._summaryFeedbackSentimentKey)
    safeLocalStorage.removeItem(this._summaryTimeKey)
  }

  private setSummaryTime(date: Date) {
    const ms = date.getTime()
    safeLocalStorage.setItem(this._summaryTimeKey, ms.toString())
  }
}

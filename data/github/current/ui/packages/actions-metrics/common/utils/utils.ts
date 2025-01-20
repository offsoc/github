import {COLUMNS, TIME_IN_MS} from '../constants/constants'
import type {
  MetricsResponseItem,
  MetricsItem,
  MetricsResponse,
  MetricsView,
  Timestamp,
  CardHeading,
} from '../models/models'
import {LABELS} from '../resources/labels'
import {ScopeType} from '../models/enums'

export class Utils {
  public static objectEquals = (a?: object, b?: object, propsToBeChecked?: string[]): boolean => {
    if (!propsToBeChecked?.length) {
      // may want to use lodash deep isEqual or something similar later since stringify may be inconsistent
      return JSON.stringify(a) === JSON.stringify(b)
    }
    if (!a || !b) {
      return a === b
    }

    const aTrimmed = Utils.withOnlyRequestedKeys<object>(a, propsToBeChecked)
    const bTrimmed = Utils.withOnlyRequestedKeys<object>(b, propsToBeChecked)

    return this.objectEquals(aTrimmed, bTrimmed)
  }

  public static getCurrentPage = (offset: number, pageSize: number, totalCount?: number): number => {
    const nextItemOffset = offset
    const currentPage = Math.ceil(nextItemOffset / pageSize)
    const lastPage = totalCount ? Math.floor(totalCount / pageSize) : currentPage
    return currentPage > lastPage ? lastPage : currentPage
  }

  public static getOffsetFromPage = (pageSize: number, page: number): number => {
    return (page - 1) * pageSize + 1
  }

  public static getRealOffsetFromVirtual = (virtualOffset: number, realPageSize: number): number => {
    return Math.floor(virtualOffset / realPageSize) * realPageSize
  }

  public static convertFromResponse = <From extends MetricsResponseItem, To extends MetricsItem>(
    response: MetricsResponse<From>,
    transformer?: (from: From, uniqueId: string) => To,
  ): [MetricsView, To[]] => {
    const view = {} as MetricsView

    for (const key of Object.keys(response)) {
      if (key !== 'items') {
        Utils.convertFromResponseProperty(response, view, key)
      }
    }

    return [
      view,
      response.items.map((item, index) =>
        transformer ? transformer(item, index.toString()) : Utils.convertFromResponseItem(item, index.toString()),
      ),
    ]
  }

  public static convertFromResponseItem = <From extends MetricsResponseItem, To extends MetricsItem>(
    from: From,
    uniqueId: string,
  ): To => {
    const item = {} as To

    for (const key of Object.keys(from)) {
      Utils.convertFromResponseProperty(from, item, key)
    }

    item.id = uniqueId
    return item
  }

  public static convertFromResponseProperty = <
    From extends MetricsResponseItem | MetricsResponse<MetricsResponseItem>,
    To,
  >(
    from: From,
    to: To,
    propKey: string,
  ): void => {
    let fromProp = from[propKey as keyof From] as never | undefined | null

    if (fromProp === null) {
      fromProp = undefined
    }

    const key = Utils.snakeToCamel(propKey)

    if (key === 'startTime' || key === 'endTime') {
      const time = (fromProp as Timestamp | undefined)?.seconds
        ? (fromProp as Timestamp | undefined)!.seconds * 1000 // multiplied by 1000 so that the argument is in milliseconds, not seconds
        : Date.now() // use now as fallback in case of empty response (error)

      to[key as keyof To] = new Date(time) as never
    } else {
      to[key as keyof To] = fromProp as never
    }
  }

  public static snakeToCamel = (snake: string): string => {
    return snake
      .split('_')
      .map((part, index) => (part.length > 1 && index > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
      .join('')
  }

  public static camelToSnake = (camel: string): string => {
    let snake = ''

    for (let i = 0; i < camel.length; i++) {
      const c = camel.charAt(i)

      if (c === c.toUpperCase()) {
        snake += `_${c.toLowerCase()}`
      } else {
        snake += c
      }
    }

    return snake
  }

  public static camelToSnakeObject = (obj: object): object => {
    const result = {}

    for (const key of Object.keys(obj)) {
      result[Utils.camelToSnake(key) as keyof object] = obj[key as keyof object]
    }

    return result
  }

  public static in15Minutes = (minutesOverride: number = 15): Date => {
    return new Date(minutesOverride * 60000 + Date.now())
  }

  public static removeKeys = (obj: object, keys: string[]) => {
    for (const key of keys) {
      if (Object.hasOwn(obj, key)) {
        delete obj[key as keyof object]
      }
    }
  }

  public static withOnlyRequestedKeys = <T>(obj: object, keys: string[]): T => {
    const result: T = {} as T
    for (const key of keys) {
      if (Object.hasOwn(obj, key)) {
        result[key as keyof T] = obj[key as keyof object]
      }
    }

    return result
  }

  public static getUniqueSortedNonEmpty = (values: string[]): string[] => {
    return Array.from(new Set<string>(values.filter(v => !!v)).values()).sort()
  }

  public static isNumber = (s: unknown) => {
    return (!!s || s === 0) && !isNaN(Number(s))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static debounce<F extends (...args: any[]) => any>(fn: F, ms = 250) {
    let timer: ReturnType<typeof setTimeout> | null = null

    return function (...args: Parameters<F>): Promise<ReturnType<F>> {
      clearTimeout(timer as ReturnType<typeof setTimeout>)

      return new Promise(resolve => {
        timer = setTimeout(() => resolve(fn(...args)), ms)
      })
    }
  }

  public static downloadFileFromURL = (url: string) => {
    const anchor = document.createElement('a')
    anchor.setAttribute('target', '_blank')
    anchor.href = url
    anchor.style.display = 'none'
    // you can't click a link unless it's part of the document:
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  public static getUTCDateString = (date: Date): string => date.toLocaleDateString(undefined, {timeZone: 'UTC'})

  public static sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  public static getPercentage = (value: number): string => {
    return value > 0 && value < 1 ? '<1%' : `${Math.round(value)}%`
  }

  public static getDuration = (ms: number): string => {
    // number => xd xh xm xs

    if (ms < 1000) {
      return `<1${LABELS.time.seconds}`
    }

    let remainingTime = ms
    let days = Math.floor(remainingTime / TIME_IN_MS.day)

    remainingTime = remainingTime - days * TIME_IN_MS.day
    let hours = Math.floor(remainingTime / TIME_IN_MS.hour)

    remainingTime = remainingTime - hours * TIME_IN_MS.hour
    let minutes = Math.floor(remainingTime / TIME_IN_MS.minute)

    remainingTime = remainingTime - minutes * TIME_IN_MS.minute
    let seconds = Math.round(remainingTime / TIME_IN_MS.second)

    if (hours === 24) {
      days++
      hours = 0
    }
    if (minutes === 60) {
      hours++
      minutes = 0
    }
    if (seconds === 60) {
      minutes++
      seconds = 0
    }

    const daysStr = days > 0 ? `${days}${LABELS.time.days}` : ''
    const hoursStr = hours > 0 ? `${hours}${LABELS.time.hours}` : ''
    const minutesStr = minutes > 0 ? `${minutes}${LABELS.time.minutes}` : ''
    const secondsStr = seconds > 0 ? `${seconds}${LABELS.time.seconds}` : ''

    return [daysStr, hoursStr, minutesStr, secondsStr].filter(str => !!str).join(' ') || ''
  }

  public static getCardHeading = (
    title: string,
    description: string,
    dateRange: string,
    format?: (value: number) => string,
  ): CardHeading => {
    return {
      title,
      description: `${description} ${dateRange}`,
      format,
    }
  }

  public static columnValidForScope(id: string, scope: ScopeType) {
    if (scope === ScopeType.Org) {
      return true
    }

    if (scope === ScopeType.Repo) {
      return id !== COLUMNS.repository
    }
  }
}

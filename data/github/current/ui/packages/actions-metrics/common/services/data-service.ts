import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {IService} from './services'
import {ServiceBase, Services} from './services'
import type {ICacheService} from './cache-service'
import {Utils} from '../utils/utils'
import type {IErrorService} from './error-service'
import {LABELS} from '../resources/labels'

export interface IDataService extends IService {
  post: <T>(url: string, body: object, options?: FetchOptions) => Promise<T | undefined>
  get: <T>(url: string, options?: FetchOptions) => Promise<T | undefined>
}

export class DataService extends ServiceBase implements IDataService {
  public static override readonly serviceId = 'IDataService'
  private readonly cacheService = Services.get<ICacheService>('ICacheService')
  private readonly errorService = Services.get<IErrorService>('IErrorService')

  public post = async <T>(url: string, body: object, options?: FetchOptions): Promise<T | undefined> => {
    return this.fetchAndCache<T>(Method.Post, url, body, options)
  }

  public get = async <T>(url: string, options?: FetchOptions): Promise<T | undefined> => {
    return this.fetchAndCache<T>(Method.Get, url, undefined, options)
  }

  protected fetchAndCache = <T>(
    method: Method,
    url: string,
    body?: object,
    options?: FetchOptions,
  ): Promise<T | undefined> => {
    const cacheKey = options?.cacheKey ?? getCacheKey(url, body)
    if (options?.ignoreCache) {
      const response = this.fetch(method, url, body, options)
        // eslint-disable-next-line github/no-then
        .then(fetchResponse => {
          try {
            if (fetchResponse.ok) {
              return fetchResponse.json() as Promise<T>
            } else {
              throw new Error(fetchResponse.statusText)
            }
          } catch (e) {
            this.cacheService.remove(cacheKey)

            // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
            if (e.name !== 'AbortError') {
              // sometimes error is lacking any info, so create an error with some default values just in case
              const eAsError = e as Error
              const error = new Error(
                eAsError.message || `Unknown error when fetching data from ${url} with body: ${JSON.stringify(body)}`,
              )
              error.cause = eAsError.cause
              error.stack = eAsError.stack
              error.name = eAsError.name || 'UnknownFetchError'

              if (options?.handleErrors === undefined ?? options.handleErrors) {
                this.errorService.log(error, LABELS.fetchError)
              } else {
                throw error
              }
            }

            return undefined
          }
        })

      if (!options.skipCache) {
        const expiration = options.neverExpires ? undefined : options.customExpiration ?? Utils.in15Minutes()
        this.cacheService.set(cacheKey, response, expiration)
      }

      return response
    }

    const cachedResult = this.cacheService.get<Promise<T | undefined>>(cacheKey)

    if (cachedResult !== undefined) {
      return cachedResult
    }

    return this.fetchAndCache(method, url, body, {...(options || {}), ignoreCache: true, cacheKey})
  }

  protected fetch = async (method: string, url: string, body?: object, options?: FetchOptions): Promise<Response> => {
    let convertedBody: object | undefined = undefined

    if (body && !options?.skipSnakeConversion) {
      convertedBody = Utils.camelToSnakeObject(body)
    }

    return this.verifiedFetchJSONWrapper(method, url, convertedBody, options)
  }

  protected async verifiedFetchJSONWrapper(
    method: string,
    url: string,
    body?: object,
    options?: FetchOptions,
  ): Promise<Response> {
    return verifiedFetchJSON(url, {...(options?.requestInit || {}), method, body})
  }
}

export interface FetchOptions {
  /**
   * custom request init to pass to fetch
   */
  requestInit?: Omit<RequestInit, 'body' | 'method'>

  /**
   * custom key to use for cache, default is stringify of body
   */
  cacheKey?: string

  /**
   * add to cache with custom expiration (default is 15 minutes)
   */
  customExpiration?: Date

  /**
   * defaults to true, catches errors and logs in error service. Does nothing when false.
   */
  handleErrors?: boolean

  /**
   * skip trying to get value from cache when true
   */
  ignoreCache?: boolean

  /**
   * add to cache without expiration
   */
  neverExpires?: boolean

  /**
   * skip caching the object for future requests
   */
  skipCache?: boolean

  /**
   * skip converting body to snake case
   */
  skipSnakeConversion?: boolean
}

const getCacheKey = (url: string, obj?: object) => {
  return obj ? url + JSON.stringify(obj) : url
}

const enum Method {
  Get = 'GET',
  Post = 'POST',
}

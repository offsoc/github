import {GET_SCOPE_TYPE, type ScopeType} from '../models/enums'
import type {MetricsPayload} from '../models/models'
import type {IService} from './services'
import {ServiceBase} from './services'

export interface IPayloadService extends IService {
  getFeatureFlag: (key: string, defaultValue?: boolean) => boolean
  getPath: (key: string, defaultValue?: string) => string | undefined
  getPayload: () => Readonly<MetricsPayload>
  getScope: () => ScopeType
  init: (payload: MetricsPayload) => void
}

export class PayloadService extends ServiceBase implements IPayloadService {
  public static override readonly serviceId = 'IPayloadService'
  private readonly featureFlags = new Map<string, boolean>()
  private readonly paths = new Map<string, string>()
  private payload: MetricsPayload

  public getFeatureFlag(key: string, defaultValue = false): boolean {
    return this.featureFlags.get(key) ?? defaultValue
  }

  public getPath(key: string, defaultValue?: string): string | undefined {
    return this.paths.get(key) ?? defaultValue
  }

  public getPayload(): MetricsPayload {
    return this.payload
  }

  public getScope(): ScopeType {
    return GET_SCOPE_TYPE(this.payload.scope)
  }

  public init(payload?: MetricsPayload) {
    if (payload) {
      this.payload = payload
      const ffKeys = Object.keys(payload?.enabled_features || {})

      for (const key of ffKeys) {
        const value = !!(payload?.enabled_features && payload?.enabled_features[key])
        this.featureFlags.set(key, value)
      }

      const pathKeys = Object.keys(payload?.paths || {})

      for (const key of pathKeys) {
        const value = payload?.paths && payload?.paths[key]
        value && this.paths.set(key, value)
      }
    }
  }
}

import type {NavigateOptions, To} from 'react-router-dom'
import {ssrSafeLocation, ssrSafeWindow} from '@github-ui/ssr-utils'
import {type IService, type IMockService, MockServiceBase} from '../../../../common/services/services'

export interface IRoutingService extends IService {
  init: (navigator: (to: To, options?: NavigateOptions) => void) => void
  getFullUrl: (params: URLSearchParams) => URL
  getSearchParams: () => URLSearchParams
  setSearchParams: (searchParams: URLSearchParams) => void
  navigate: (to: To, options?: NavigateOptions) => void
}

export class MockRoutingService extends MockServiceBase implements IRoutingService, IMockService {
  public static override readonly serviceId = 'IRoutingService'
  private navigator: (to: To, options?: NavigateOptions) => void

  public init = (_navigator: (to: To, options?: NavigateOptions) => void) => {}

  public getFullUrl = (params: URLSearchParams): URL => {
    const url = new URL(ssrSafeWindow?.location.href || '', ssrSafeLocation.origin)
    url.search = params.toString()
    return url
  }

  public getSearchParams = (): URLSearchParams => {
    return new URLSearchParams()
  }

  public setSearchParams = (_params: URLSearchParams, _replace = false) => {}

  public navigate = (_to: To, _options?: NavigateOptions) => {}
}

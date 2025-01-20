import type {IService} from './services'
import {ServiceBase} from './services'
import type {NavigateOptions, To} from 'react-router-dom'
import {ssrSafeLocation, ssrSafeWindow} from '@github-ui/ssr-utils'

export interface IRoutingService extends IService {
  init: (navigator: (to: To, options?: NavigateOptions) => void) => void
  getFullUrl: (params: URLSearchParams) => URL
  getSearchParams: () => URLSearchParams
  setSearchParams: (searchParams: URLSearchParams) => void
  navigate: (to: To, options?: NavigateOptions) => void
}

export class RoutingService extends ServiceBase implements IRoutingService {
  public static override readonly serviceId = 'IRoutingService'
  private navigator: (to: To, options?: NavigateOptions) => void

  public init = (navigator: (to: To, options?: NavigateOptions) => void) => {
    this.navigator = navigator
  }

  public getFullUrl = (params: URLSearchParams): URL => {
    const url = new URL(ssrSafeWindow?.location.href || '', ssrSafeLocation.origin)
    url.search = params.toString()
    return url
  }

  public getSearchParams = (): URLSearchParams => {
    return new URLSearchParams(ssrSafeLocation.search)
  }

  public setSearchParams = (params: URLSearchParams, replace = false) => {
    if (replace || params.toString() !== this.getSearchParams().toString()) {
      // this needs to use the useNavigate hook (github-ui) and cannot use the setter on the searchParams hook from
      // react-router-dom or it will break some things with the special GH navigation handling
      this.navigate(
        {pathname: ssrSafeLocation.pathname, search: params.toString()},
        {
          replace,
        },
      )
    }
  }

  public navigate = (to: To, options?: NavigateOptions) => {
    this.navigator(to, options)
  }
}

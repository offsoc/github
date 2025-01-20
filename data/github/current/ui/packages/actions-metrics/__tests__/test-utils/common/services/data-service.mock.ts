import type {IMockService} from '../../../../common/services/services'
import {DataService, type FetchOptions, type IDataService} from '../../../../common/services/data-service'

/*
 * Provide override for the actual fetch allowing tests to provide any desired response
 */
export class MockDataService extends DataService implements IDataService, IMockService {
  public isMock = true
  public static override readonly serviceId = 'IDataService'
  public getResponse: (
    method: string,
    url: string,
    body?: object | undefined,
    options?: FetchOptions | undefined,
  ) => Response

  constructor(
    getResponse: (
      method: string,
      url: string,
      body?: object | undefined,
      options?: FetchOptions | undefined,
    ) => Response,
  ) {
    super()
    this.getResponse = getResponse
  }

  public override verifiedFetchJSONWrapper(
    method: string,
    url: string,
    body?: object | undefined,
    options?: FetchOptions | undefined,
  ): Promise<Response> {
    return new Promise(resolve => resolve(this.getResponse(method, url, body, options)))
  }
}

import type {GetAllMemexDataResponse} from '../../../client/api/memex/contracts'
import type {ProjectMigration} from '../../../client/api/project-migration/contracts'
import {DefaultMemex} from '../../../mocks/data/memexes'
import {DefaultColumns, DefaultViews} from '../../../mocks/mock-data'
import type {GetRequestType} from '../../../mocks/msw-responders'
import {get_refreshMemex} from '../../../mocks/msw-responders/memexes'
import {get_getProjectMigration} from '../../../mocks/msw-responders/migration'
import {InitialItems} from '../../../stories/data-source'
import {mswServer} from '../../msw-server'
import {asMockFunction} from '../stub-utilities'
import {stubApiMethod} from './stub-api-method'

/**
 * Stub a promise-returning API function to return a value and signal the API was called successfully.
 *
 * @param fn API function already mocked by Jest (will error if real function provided)
 * @param returnValue return value to provide when called
 *
 * @returns mock version of function to enable verification it was used in tests
 */
export function stubResolvedApiResponse<TFunction extends (...args: any) => Promise<any>>(
  fn: TFunction,
  returnValue: jest.ResolvedValue<ReturnType<TFunction>>,
): jest.Mock<ReturnType<TFunction>, Parameters<TFunction>> {
  const mockFn = asMockFunction(fn)
  mockFn.mockReset()
  mockFn.mockResolvedValue(returnValue)
  return mockFn
}

/**
 * Stub a promise-returning API function to return an error object and signal the API was not called successfully.
 *
 * @param fn API function already mocked by Jest (will error if real function provided)
 * @param returnValue error to wrap in promise and return when called
 *
 * @returns mock version of function to enable verification it was used in tests
 */
export function stubRejectedApiResponse<TFunction extends (...args: any) => Promise<any>>(
  fn: TFunction,
  returnValue: jest.RejectedValue<ReturnType<TFunction>>,
): jest.Mock<ReturnType<TFunction>, Parameters<TFunction>> {
  const mockFn = asMockFunction(fn)
  mockFn.mockReset()
  mockFn.mockRejectedValue(returnValue)
  return mockFn
}

export function stubGetAllMemexData(memex: Partial<GetAllMemexDataResponse> = {}) {
  const stub = jest.fn<GetAllMemexDataResponse, [GetRequestType]>() as jest.Mock<any> & {
    cancel: jest.Mock<any>
  }

  stub.cancel = jest.fn()
  const handler = get_refreshMemex(body => {
    stub(body)
    return Promise.resolve({
      memexAlive: {
        presenceChannel: 'foo',
        messageChannel: 'bar',
      },
      memexProject: DefaultMemex,
      memexProjectItems: InitialItems,
      memexProjectAllColumns: DefaultColumns,
      memexViews: DefaultViews,
      memexWorkflows: [],
      memexWorkflowConfigurations: [],
      ...memex,
    } as unknown as GetAllMemexDataResponse)
  })

  mswServer.use(handler)
  return stub
}

export function stubGetProjectMigration(projectMigration: ProjectMigration) {
  return stubApiMethod<GetRequestType, ProjectMigration>(get_getProjectMigration, projectMigration)
}

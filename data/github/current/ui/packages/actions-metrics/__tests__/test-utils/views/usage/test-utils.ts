import {PATHS} from '../../../../common/constants/controller_paths'
import type {MetricsRequest, Summary} from '../../../../common/models/models'
import type {FetchOptions} from '../../../../common/services/data-service'
import {Services} from '../../../../common/services/services'
import type {
  JobMetricsItem,
  RepositoryMetricsItem,
  RunnerMetricsItem,
  RuntimeMetricsItem,
  WorkflowMetricsItem,
} from '../../../../views/usage/models/models'
import {MockDataService} from '../../common/services/data-service.mock'
import {TestUtils} from '../../utils/test-utils'

export class UsageTestUtils {
  /*
   * return an "AllMetricsItem" which is a combination of all the possible interfaces for an item across all the org
   * tabs so that the same item can be used for any tab. This should make it easier to mock the fetch since we don't
   * have to parse the tab and generate a different object based on it
   */
  public static getMetricsItem = (id: number): AllMetricsItem => {
    const item: AllMetricsItem = {
      id,
      jobExecutions: TestUtils.getRandomNumber(),
      jobName: TestUtils.appendId('job', id),
      jobs: TestUtils.getRandomAproxNumber(),
      repository: {
        id,
        name: TestUtils.appendId('repository', id),
        public: TestUtils.getRandom<boolean>([true, false]),
        url: '/',
      },
      runnerRuntime: TestUtils.getRandom<string>(['linux', 'macos', 'windows']),
      runnerType: TestUtils.getRandom<string>(['hosted', 'hosted-larger', 'self-hosted']),
      totalMinutes: TestUtils.getRandomNumber(10000000),
      workflowExecutions: TestUtils.getRandomAproxNumber(),
      workflowFilePath: TestUtils.appendId('workflow', id),
      workflows: TestUtils.getRandomAproxNumber(),
    }

    return item
  }

  public static getMetricsItems = (count: number): AllMetricsItem[] => {
    const items: AllMetricsItem[] = []

    for (let i = 0; i < count; i++) {
      items.push(UsageTestUtils.getMetricsItem(i + 1))
    }

    return items
  }

  public static registerDataServiceMock = (
    getResponse?: (
      method: string,
      url: string,
      body?: object | undefined,
      options?: FetchOptions | undefined,
    ) => Response,
  ) => {
    const stub = (method: string, url: string, body?: object | undefined) => {
      if (url.includes(PATHS.summary)) {
        const response: Summary = {
          total_minutes: 42,
          job_executions: 11,
        }
        return TestUtils.getResponse(response)
      }

      if (body) {
        const count = 7777
        const items = UsageTestUtils.getMetricsItems(count)
        const response = TestUtils.getMetricsResponse(body as MetricsRequest, items, count)

        return TestUtils.getResponse(response)
      } else {
        return TestUtils.getResponse(undefined, 500, 'server error')
      }
    }
    Services.add(MockDataService.serviceId, () => new MockDataService(getResponse || stub), true)
  }
}

export interface AllMetricsItem
  extends WorkflowMetricsItem,
    JobMetricsItem,
    RepositoryMetricsItem,
    RuntimeMetricsItem,
    RunnerMetricsItem {}

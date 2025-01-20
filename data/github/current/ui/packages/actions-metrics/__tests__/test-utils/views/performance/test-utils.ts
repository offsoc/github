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
} from '../../../../views/performance/models/models'
import {MockDataService} from '../../common/services/data-service.mock'
import {TestUtils} from '../../utils/test-utils'

export class PerformanceTestUtils {
  /*
   * return an "AllMetricsItem" which is a combination of all the possible interfaces for an item across all the org
   * tabs so that the same item can be used for any tab. This should make it easier to mock the fetch since we don't
   * have to parse the tab and generate a different object based on it
   */
  public static getMetricsItem = (id: number): AllMetricsItem => {
    const item: AllMetricsItem = {
      id,
      jobName: TestUtils.appendId('job', id),
      repository: {
        id,
        name: TestUtils.appendId('repository', id),
        public: TestUtils.getRandom<boolean>([true, false]),
        url: '/',
      },
      runnerRuntime: TestUtils.getRandom<string>(['linux', 'macos', 'windows']),
      runnerType: TestUtils.getRandom<string>(['hosted', 'hosted-larger', 'self-hosted']),
      workflowFilePath: TestUtils.appendId('workflow', id),
      averageQueueTime: TestUtils.getRandomNumber(703963, 500),
      averageRunTime: TestUtils.getRandomNumber(703963, 500),
      failureRate: TestUtils.getRandomNumber(100, 0),
      jobs: TestUtils.getRandomAproxNumber(),
      workflowExecutions: TestUtils.getRandomNumber(1000, 1),
      jobExecutions: TestUtils.getRandomNumber(1000, 1),
    }

    return item
  }

  public static getMetricsItems = (count: number): AllMetricsItem[] => {
    const items: AllMetricsItem[] = []

    for (let i = 0; i < count; i++) {
      items.push(PerformanceTestUtils.getMetricsItem(i + 1))
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
        const items = PerformanceTestUtils.getMetricsItems(count)
        const response = TestUtils.getMetricsResponse(body as MetricsRequest, items, count)

        return TestUtils.getResponse(response)
      } else {
        return TestUtils.getResponse(undefined, 500, 'server error')
      }
    }
    Services.add(MockDataService.serviceId, () => new MockDataService(getResponse || stub), true)
  }

  public static getDataServiceMock = (
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
          average_job_run_time: 312345,
          average_job_queue_time: 201234,
          job_failure_rate: 11.123456789,
          total_failure_minutes: 12345678,
        }
        return TestUtils.getResponse(response)
      }

      if (body) {
        const count = 7777
        const items = PerformanceTestUtils.getMetricsItems(count)
        const response = TestUtils.getMetricsResponse(body as MetricsRequest, items, count)

        return TestUtils.getResponse(response)
      } else {
        return TestUtils.getResponse(undefined, 500, 'server error')
      }
    }
    return new MockDataService(getResponse || stub)
  }
}

export interface AllMetricsItem
  extends WorkflowMetricsItem,
    JobMetricsItem,
    RepositoryMetricsItem,
    RuntimeMetricsItem,
    RunnerMetricsItem {}

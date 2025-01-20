import type {ScopeType} from '../../../common/models/enums'
import {DateRangeType} from '../../../common/models/enums'
import type {
  ApproximateNumber,
  MetricsItem,
  MetricsPayload,
  MetricsRequest,
  MetricsResponse,
} from '../../../common/models/models'

export class TestUtils {
  public static getResponse = (body?: object, status = 200, statusText?: string): Response => {
    return {
      json: async () => body,
      ok: status >= 200 && status < 300,
      status,
      statusText,
    } as Response
  }

  public static getMetricsResponse = (
    request: MetricsRequest,
    items: MetricsItem[],
    totalItems = 7777,
  ): MetricsResponse<MetricsItem> => {
    let subset = items
    if (items.length > request.pageSize) {
      subset = items.slice(request.offset, request.offset + request.pageSize)
    }
    return {
      items: subset,
      offset: request.offset,
      page_size: request.offset,
      total_items: totalItems,
      date_range_type: request.dateRangeType || DateRangeType.CurrentMonth,
      tab: request.tab,
      start_time: {
        seconds: 0,
        nanos: 0,
      },
      end_time: {
        seconds: 0,
        nanos: 0,
      },
    }
  }

  public static getRandom = <T>(options: T[]): T => {
    return options[Math.floor(Math.random() * options.length)] as T
  }

  public static getRandomNumber = (max = 5000, min = 1): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  public static getRandomAproxNumber = (max = 10000): ApproximateNumber => {
    const count = TestUtils.getRandomNumber(max)
    return {
      count,
      approximate: count > 5000,
    }
  }

  public static appendId = (prepend: string, id: number) => {
    return `${prepend}-${id.toString()}`
  }

  public static getMockPayload = (scope?: ScopeType): MetricsPayload => {
    return {
      enabled_features: {},
      paths: {},
      org: 'test',
      scope,
    }
  }
}

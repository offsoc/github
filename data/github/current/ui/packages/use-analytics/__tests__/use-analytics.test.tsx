import {renderHook} from '@testing-library/react'
import {useAnalytics, useClickAnalytics} from '../use-analytics'
import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {sendEvent} from '@github-ui/hydro-analytics'

jest.mock('@github-ui/hydro-analytics', () => {
  return {
    sendEvent: jest.fn(),
  }
})

describe('useAnalytics', () => {
  test('should call sendEvent with default payload', async () => {
    const {result} = renderHook(() => useAnalytics(), {
      wrapper: ({children}) => (
        <AnalyticsProvider appName={'test'} category="" metadata={{}}>
          {children}
        </AnalyticsProvider>
      ),
    })
    result.current.sendAnalyticsEvent('test-event-type', 'test-target')
    expect(sendEvent).toHaveBeenCalledWith('test-event-type', {
      app_name: 'test',
      category: '',
      react: true,
      target: 'test-target',
    })
  })

  test('should call sendEvent with custom payload', async () => {
    const {result} = renderHook(() => useAnalytics(), {
      wrapper: ({children}) => (
        <AnalyticsProvider appName={'test'} category="" metadata={{}}>
          {children}
        </AnalyticsProvider>
      ),
    })
    result.current.sendAnalyticsEvent('test-event-type', 'test-target', {payload1: 'test-1'})
    expect(sendEvent).toHaveBeenCalledWith('test-event-type', {
      app_name: 'test',
      category: '',
      react: true,
      target: 'test-target',
      payload1: 'test-1',
    })
  })

  test('should call sendEvent with metadata', async () => {
    const {result} = renderHook(() => useAnalytics(), {
      wrapper: ({children}) => (
        <AnalyticsProvider appName={'test'} category="" metadata={{metadata1: 'test-metadata'}}>
          {children}
        </AnalyticsProvider>
      ),
    })
    result.current.sendAnalyticsEvent('test-event-type', 'test-target')
    expect(sendEvent).toHaveBeenCalledWith('test-event-type', {
      app_name: 'test',
      category: '',
      react: true,
      target: 'test-target',
      metadata1: 'test-metadata',
    })
  })
})

describe('useClickAnalytics', () => {
  test('should call sendEvent with default payload', async () => {
    const {result} = renderHook(() => useClickAnalytics(), {
      wrapper: ({children}) => (
        <AnalyticsProvider appName={'test'} category="" metadata={{}}>
          {children}
        </AnalyticsProvider>
      ),
    })
    result.current.sendClickAnalyticsEvent()
    expect(sendEvent).toHaveBeenCalledWith('analytics.click', {
      app_name: 'test',
      category: '',
      react: true,
      target: undefined,
    })
  })

  test('should call sendEvent with custom payload', async () => {
    const {result} = renderHook(() => useClickAnalytics(), {
      wrapper: ({children}) => (
        <AnalyticsProvider appName={'test'} category="" metadata={{}}>
          {children}
        </AnalyticsProvider>
      ),
    })
    result.current.sendClickAnalyticsEvent({category: 'test-category', action: 'test-action', label: 'test-label'})
    expect(sendEvent).toHaveBeenCalledWith('analytics.click', {
      app_name: 'test',
      react: true,
      target: undefined,
      category: 'test-category',
      action: 'test-action',
      label: 'test-label',
    })
  })

  test('should call sendEvent with metadata', async () => {
    const {result} = renderHook(() => useClickAnalytics(), {
      wrapper: ({children}) => (
        <AnalyticsProvider appName={'test'} category="" metadata={{metadata1: 'test-metadata'}}>
          {children}
        </AnalyticsProvider>
      ),
    })
    result.current.sendClickAnalyticsEvent()
    expect(sendEvent).toHaveBeenCalledWith('test-event-type', {
      app_name: 'test',
      category: '',
      react: true,
      target: 'test-target',
      metadata1: 'test-metadata',
    })
  })
})

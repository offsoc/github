import {renderHook} from '@testing-library/react'
import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {useClipboard} from '../UseClipboard'
import {sendEvent} from '@github-ui/hydro-analytics'
import {useToastContext} from '@github-ui/toast/ToastContext'
import {CheckIcon, RocketIcon} from '@primer/octicons-react'
import {setupUserEvent} from '@github-ui/react-core/test-utils'

jest.mock('@github-ui/hydro-analytics', () => {
  return {
    sendEvent: jest.fn(),
  }
})

jest.mock('@github-ui/toast/ToastContext', () => {
  const addToast = jest.fn()
  return {useToastContext: () => ({addToast})}
})

afterEach(() => {
  jest.clearAllMocks()
})

test('Copies to clipboard with toast', async () => {
  const {addToast} = useToastContext()
  /** user-event provides a stub navigator.clipboard */
  setupUserEvent()
  const {result} = renderHook(() => useClipboard(), {
    wrapper: ({children}) => (
      <AnalyticsProvider appName={'test'} category="" metadata={{}}>
        {children}
      </AnalyticsProvider>
    ),
  })
  result.current.copyToClipboard({textToCopy: 'copied text'})()

  await expect(navigator.clipboard.readText()).resolves.toEqual('copied text')

  expect(sendEvent).not.toHaveBeenCalled()

  expect(addToast).toHaveBeenCalledWith({
    icon: <CheckIcon />,
    message: 'Copied to clipboard!',
    role: 'status',
    type: 'success',
  })
})

test('Sends analytics event', async () => {
  /** user-event provides a stub navigator.clipboard */
  setupUserEvent()
  const {result} = renderHook(() => useClipboard(), {
    wrapper: ({children}) => (
      <AnalyticsProvider appName={'test'} category="" metadata={{}}>
        {children}
      </AnalyticsProvider>
    ),
  })
  result.current.copyToClipboard({
    textToCopy: 'bar',
    payload: {category: 'test-category', action: 'test-action', label: 'test-label'},
  })()

  await expect(navigator.clipboard.readText()).resolves.toEqual('bar')

  expect(sendEvent).toHaveBeenCalledWith('analytics.click', {
    app_name: 'test',
    react: true,
    target: undefined,
    category: 'test-category',
    action: 'test-action',
    label: 'test-label',
  })
})

test('Copies to clipboard with custom toast', async () => {
  const {addToast} = useToastContext()
  /** user-event provides a stub navigator.clipboard */
  setupUserEvent()
  const {result} = renderHook(() => useClipboard(), {
    wrapper: ({children}) => (
      <AnalyticsProvider appName={'test'} category="" metadata={{}}>
        {children}
      </AnalyticsProvider>
    ),
  })
  result.current.copyToClipboard({
    textToCopy: 'copied text',
    toast: {
      icon: <RocketIcon />,
      message: 'whooo',
      role: 'status',
      type: 'info',
    },
  })()

  await expect(navigator.clipboard.readText()).resolves.toEqual('copied text')

  expect(sendEvent).not.toHaveBeenCalled()

  expect(addToast).toHaveBeenCalledWith({
    icon: <RocketIcon />,
    message: 'whooo',
    role: 'status',
    type: 'info',
  })
})

import {act} from '@testing-library/react'
import {renderHookWithCalls, renderHookSSR} from '@github-ui/ssr-test-utils'
import {RenderPhaseProvider} from '@github-ui/render-phase-provider'
import {useClientValue} from '../use-client-value'

const mockIsServer = jest.fn().mockReturnValue(false)
const mockIsBrowser = jest.fn().mockReturnValue(true)
function setMockServerEnv(isServer: boolean) {
  mockIsServer.mockReturnValue(isServer)
  mockIsBrowser.mockReturnValue(!isServer)
}

jest.mock('@github-ui/ssr-utils', () => ({
  get IS_SERVER() {
    return mockIsServer()
  },
  get IS_BROWSER() {
    return mockIsBrowser()
  },
}))

type ClientResult = [string, () => void]

function expectCallValues(calls: unknown[]) {
  // eslint-disable-next-line jest/valid-expect
  return expect((calls as ClientResult[]).map(c => c[0]))
}

describe('useClientValue', () => {
  afterEach(jest.restoreAllMocks)

  describe('during CSR', () => {
    it('resolves the client value on first render in CSR', () => {
      const {result, calls} = renderHookWithCalls(() => useClientValue(() => 'client value'))

      const [value, updateValue] = result.current as ClientResult

      expect(calls).toHaveLength(1)
      expect(value).toEqual('client value')
      expect(updateValue).toBeInstanceOf(Function)
    })

    it('memoizes the clientValueCallback', () => {
      const clientValueCallback = jest.fn(() => 'client value')
      const {calls, rerender} = renderHookWithCalls(() => useClientValue(clientValueCallback))

      expect(calls).toHaveLength(1)
      expect(clientValueCallback).toHaveBeenCalledTimes(1)

      rerender()
      expect(calls).toHaveLength(2)
      expect(clientValueCallback).toHaveBeenCalledTimes(1)

      rerender()
      expect(calls).toHaveLength(3)
      expect(clientValueCallback).toHaveBeenCalledTimes(1)
    })

    it('re-evaluates the callback when passed dependencies array values change', () => {
      const globalDep = {value: 'initial'}
      const clientValueCallback = jest.fn(() => globalDep.value)
      const {calls, rerender} = renderHookWithCalls(() =>
        useClientValue(clientValueCallback, 'server value', [globalDep.value]),
      )

      expect(clientValueCallback).toHaveBeenCalledTimes(1)
      expectCallValues(calls).toEqual(['initial'])

      rerender()
      expect(clientValueCallback).toHaveBeenCalledTimes(1)
      expectCallValues(calls).toEqual(['initial', 'initial'])

      globalDep.value = 'new value'
      rerender()
      expect(clientValueCallback).toHaveBeenCalledTimes(2)
      expectCallValues(calls).toEqual(['initial', 'initial', 'initial', 'new value'])

      rerender()
      expect(clientValueCallback).toHaveBeenCalledTimes(2)
      expectCallValues(calls).toEqual([
        'initial', // initial render
        'initial', // rerender 1
        'initial', // rerender after globalDep.value change
        'new value', // rerender useLayoutEffect after globalDep.value change
        'new value', // rerender 2
      ])
    })

    it('returns an update function that re-evaluates the client value callback', () => {
      const globalDep = {value: 'initial'}
      const clientValueCallback = jest.fn(() => globalDep.value)
      const {result, calls} = renderHookWithCalls(() =>
        useClientValue(clientValueCallback, 'server value', [globalDep.value]),
      )
      function updateValue() {
        const [, currentUpdateValue] = result.current as ClientResult
        currentUpdateValue()
      }

      expect(calls).toHaveLength(1)
      expect(clientValueCallback).toHaveBeenCalledTimes(1)
      expectCallValues(calls).toEqual(['initial'])

      globalDep.value = 'new value'
      expect(clientValueCallback).toHaveBeenCalledTimes(1)
      expectCallValues(calls).toEqual(['initial'])

      act(() => updateValue())
      expect(clientValueCallback).toHaveBeenCalledTimes(3)
      expectCallValues(calls).toEqual(['initial', 'new value', 'new value'])

      act(() => updateValue())
      expect(clientValueCallback).toHaveBeenCalledTimes(4)
      expectCallValues(calls).toEqual(['initial', 'new value', 'new value']) // no change - setState didn't re-render for same value
    })
  })

  describe('during SSR hydration', () => {
    it('hydrates with server value before resolving client value', () => {
      setMockServerEnv(true)
      const clientValueCallback = jest.fn(() => 'client value')
      const {calls, hydrate} = renderHookSSR(() => useClientValue(clientValueCallback, 'server value'), {
        wrapper: ({children}) => <RenderPhaseProvider wasServerRendered={true}>{children}</RenderPhaseProvider>,
      })

      expectCallValues(calls).toEqual(['server value'])
      expect(clientValueCallback).toHaveBeenCalledTimes(0)

      setMockServerEnv(false)
      hydrate()
      expectCallValues(calls).toEqual([
        'server value', // SSR
        'server value', // hydration
        'client value', // useLayoutEffect
      ])
      expect(clientValueCallback).toHaveBeenCalledTimes(1)
    })
    it('memoizes the clientValueCallback', () => {
      setMockServerEnv(true)
      const clientValueCallback = jest.fn(() => 'client value')
      const {calls, hydrate, rerender} = renderHookSSR(() => useClientValue(clientValueCallback, 'server value'), {
        wrapper: ({children}) => <RenderPhaseProvider wasServerRendered={true}>{children}</RenderPhaseProvider>,
      })

      expectCallValues(calls).toEqual(['server value'])
      expect(clientValueCallback).toHaveBeenCalledTimes(0)

      setMockServerEnv(false)
      hydrate()
      expectCallValues(calls).toEqual(['server value', 'server value', 'client value'])
      expect(clientValueCallback).toHaveBeenCalledTimes(1)

      rerender()
      expectCallValues(calls).toEqual([
        'server value', // SSR
        'server value', // hydration
        'client value', // useLayoutEffect
        'client value', // rerender
      ])
      expect(clientValueCallback).toHaveBeenCalledTimes(1)
    })
    it('re-evaluates the callback when passed dependencies array values change', () => {
      setMockServerEnv(true)
      const globalDep = {value: 'initial client value'}
      const clientValueCallback = jest.fn(() => globalDep.value)
      const {calls, hydrate, rerender} = renderHookSSR(
        () => useClientValue(clientValueCallback, 'server value', [globalDep.value]),
        {
          wrapper: ({children}) => <RenderPhaseProvider wasServerRendered={true}>{children}</RenderPhaseProvider>,
        },
      )

      expectCallValues(calls).toEqual(['server value'])
      expect(clientValueCallback).toHaveBeenCalledTimes(0)

      setMockServerEnv(false)
      hydrate()
      expectCallValues(calls).toEqual(['server value', 'server value', 'initial client value'])
      expect(clientValueCallback).toHaveBeenCalledTimes(1)

      globalDep.value = 'new client value'
      rerender()
      expectCallValues(calls).toEqual([
        'server value',
        'server value',
        'initial client value',
        'initial client value',
        'new client value',
      ])
      expect(clientValueCallback).toHaveBeenCalledTimes(2)

      rerender()
      expectCallValues(calls).toEqual([
        'server value', // SSR
        'server value', // hydration
        'initial client value', // hydration useLayoutEffect
        'initial client value', // rerender 1
        'new client value', // rerender 1 useLayoutEffect
        'new client value', // rerender 2
      ])
      expect(clientValueCallback).toHaveBeenCalledTimes(2)
    })
  })
})

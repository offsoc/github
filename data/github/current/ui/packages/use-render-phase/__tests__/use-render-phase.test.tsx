import {renderHookWithCalls, renderHookSSR} from '@github-ui/ssr-test-utils'
import {RenderPhaseProvider} from '@github-ui/render-phase-provider'
import {useRenderPhase, RenderPhase} from '../use-render-phase'

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

describe('RenderPhase', () => {
  describe('useRenderPhase', () => {
    afterEach(jest.restoreAllMocks)
    it('returns "server-render" on the server', () => {
      setMockServerEnv(true)
      const {result, calls, hydrate, rerender} = renderHookSSR(() => useRenderPhase(), {
        wrapper: ({children}) => <RenderPhaseProvider wasServerRendered={true}>{children}</RenderPhaseProvider>,
      })
      expect(calls).toHaveLength(1)
      expect(result.current).toBe(RenderPhase.ServerRender)

      setMockServerEnv(false)
      hydrate()
      expect(calls).toHaveLength(3)
      expect(calls[1]).toBe(RenderPhase.ClientHydrate)
      expect(calls[2]).toBe(RenderPhase.ClientRender)

      rerender()
      expect(calls).toHaveLength(4)
      expect(result.current).toBe(RenderPhase.ClientRender)
    })

    it('returns "client-hydrate" then "client-render" on the client when the page was server-rendered', () => {
      const {result, calls, rerender} = renderHookWithCalls(() => useRenderPhase(), {
        wrapper: ({children}) => <RenderPhaseProvider wasServerRendered={true}>{children}</RenderPhaseProvider>,
      })
      expect(calls).toHaveLength(2)
      expect(calls[0]).toBe(RenderPhase.ClientHydrate)
      expect(calls[1]).toBe(RenderPhase.ClientRender)
      expect(result.current).toBe(RenderPhase.ClientRender)

      rerender()
      expect(calls).toHaveLength(3)
      expect(result.current).toBe(RenderPhase.ClientRender)
    })

    it('returns "client-render" on the client', () => {
      const {result, calls, rerender} = renderHookWithCalls(() => useRenderPhase(), {
        wrapper: ({children}) => <RenderPhaseProvider wasServerRendered={false}>{children}</RenderPhaseProvider>,
      })
      expect(calls).toHaveLength(1)
      expect(result.current).toBe(RenderPhase.ClientRender)

      rerender()
      expect(calls).toHaveLength(2)
      expect(result.current).toBe(RenderPhase.ClientRender)
    })
  })
})

import {act, renderHook} from '@testing-library/react'

import {apiPostStats} from '../../../client/api/stats/api-post-stats'
import {DismissedUserNotice} from '../../../client/api/stats/contracts'
import {ApiError} from '../../../client/platform/api-error'
import {
  UserNoticesStateProvider,
  useUserNotices,
} from '../../../client/state-providers/user-notices/user-notices-provider'
import {seedJSONIsland} from '../../../mocks/server/mock-server'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {stubDismissUserNotice, stubDismissUserNoticeWithError} from '../../mocks/api/user-notices'

jest.mock('../../../client/api/stats/api-post-stats')

function createUserNoticesStateProvider() {
  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => (
    <UserNoticesStateProvider>{children}</UserNoticesStateProvider>
  )

  return wrapper
}

describe('useUserNotices', () => {
  beforeEach(() => {
    // Required for stats events
    seedJSONIsland('logged-in-user', {
      id: 1,
      login: 'test-user',
      name: 'Test User',
      avatarUrl: 'https://github.com/test-user.png',
      global_relay_id: 'MDQ6VXNl',
      isSpammy: false,
    })
  })
  describe('userNotices', () => {
    it('returns userNotices as disabled when no JSON island data is provided', () => {
      const {result} = renderHook(useUserNotices, {wrapper: createUserNoticesStateProvider()})
      const {memex_placeholder_notice} = result.current.userNotices
      expect(memex_placeholder_notice).toBe(false)
    })

    it('returns true for a user notice when JSON island data is provided', () => {
      seedJSONIsland('memex-user-notices', ['memex_placeholder_notice'])

      const {result} = renderHook(useUserNotices, {wrapper: createUserNoticesStateProvider()})
      const {memex_placeholder_notice} = result.current.userNotices
      expect(memex_placeholder_notice).toBe(true)
    })
  })

  describe('dismissNotice', () => {
    it('dismisses a notice', async () => {
      seedJSONIsland('memex-user-notices', ['memex_placeholder_notice'])
      const dismissUserNoticesStub = stubDismissUserNotice()
      const {result} = renderHook(useUserNotices, {wrapper: createUserNoticesStateProvider()})
      expect(result.current.userNotices.memex_placeholder_notice).toBe(true)

      await act(async () => {
        await result.current.dismissUserNotice('memex_placeholder_notice')
      })

      expect(dismissUserNoticesStub).toHaveBeenCalled()
      expect(result.current.userNotices.memex_placeholder_notice).toBe(false)
    })

    it('still hides the notice on error', async () => {
      seedJSONIsland('memex-user-notices', ['memex_placeholder_notice'])
      const dismissUserNoticesStub = stubDismissUserNoticeWithError(new ApiError('error'))

      const {result} = renderHook(useUserNotices, {wrapper: createUserNoticesStateProvider()})
      expect(result.current.userNotices.memex_placeholder_notice).toBe(true)

      await act(async () => {
        await result.current.dismissUserNotice('memex_placeholder_notice')
      })

      expect(dismissUserNoticesStub).toHaveBeenCalled()
      expect(result.current.userNotices.memex_placeholder_notice).toBe(false)
    })

    it('resets any user notice variant', async () => {
      seedJSONIsland('memex-user-notices', ['memex_placeholder_notice'])
      const {result} = renderHook(useUserNotices, {wrapper: createUserNoticesStateProvider()})
      act(() => {
        result.current.setUserNoticeVariant('memex_placeholder_notice', 'modal')
      })

      expect(result.current.userNoticeVariants.memex_placeholder_notice).toBe('modal')

      await act(async () => {
        await result.current.dismissUserNotice('memex_placeholder_notice')
      })

      expect(result.current.userNoticeVariants.memex_placeholder_notice).toBe('unset')
    })

    describe('stats', () => {
      it('posts stats on dismissal', async () => {
        seedJSONIsland('memex-user-notices', ['memex_placeholder_notice'])

        const postStatsStub = stubResolvedApiResponse(apiPostStats, {success: true})
        stubDismissUserNotice()

        const {result} = renderHook(useUserNotices, {wrapper: createUserNoticesStateProvider()})
        expect(result.current.userNotices.memex_placeholder_notice).toBe(true)

        await act(async () => {
          await result.current.dismissUserNotice('memex_placeholder_notice')
        })

        expect(postStatsStub).toHaveBeenCalledWith({
          payload: {
            name: DismissedUserNotice,
            context: JSON.stringify({
              notice: 'memex_placeholder_notice',
              tookAction: false,
            }),
          },
        })
      })

      it('captures if action was taken in stats', async () => {
        seedJSONIsland('memex-user-notices', ['memex_placeholder_notice'])

        const postStatsStub = stubResolvedApiResponse(apiPostStats, {success: true})
        stubDismissUserNotice()

        const {result} = renderHook(useUserNotices, {wrapper: createUserNoticesStateProvider()})
        expect(result.current.userNotices.memex_placeholder_notice).toBe(true)

        await act(async () => {
          await result.current.dismissUserNotice('memex_placeholder_notice', true)
        })

        expect(postStatsStub).toHaveBeenCalledWith({
          payload: {
            name: DismissedUserNotice,
            context: JSON.stringify({
              notice: 'memex_placeholder_notice',
              tookAction: true,
            }),
          },
        })
      })
    })
  })

  describe('hideUserNotice', () => {
    it('hides a notice without dismissing it', () => {
      seedJSONIsland('memex-user-notices', ['memex_placeholder_notice'])
      const dismissUserNoticesStub = stubDismissUserNotice()

      const {result} = renderHook(useUserNotices, {wrapper: createUserNoticesStateProvider()})
      expect(result.current.userNotices.memex_placeholder_notice).toBe(true)

      act(() => {
        result.current.hideUserNotice('memex_placeholder_notice')
      })

      expect(result.current.userNotices.memex_placeholder_notice).toBe(false)
      expect(dismissUserNoticesStub).not.toHaveBeenCalled()
    })

    it('resets any user notice variant', () => {
      seedJSONIsland('memex-user-notices', ['memex_placeholder_notice'])
      const {result} = renderHook(useUserNotices, {wrapper: createUserNoticesStateProvider()})
      act(() => {
        result.current.setUserNoticeVariant('memex_placeholder_notice', 'modal')
      })

      expect(result.current.userNoticeVariants.memex_placeholder_notice).toBe('modal')

      act(() => {
        result.current.hideUserNotice('memex_placeholder_notice')
      })

      expect(result.current.userNoticeVariants.memex_placeholder_notice).toBe('unset')
    })
  })

  describe('setUserNoticeVariant', () => {
    it('sets the variant of a notice', () => {
      seedJSONIsland('memex-user-notices', ['memex_placeholder_notice'])
      const {result} = renderHook(useUserNotices, {wrapper: createUserNoticesStateProvider()})
      expect(result.current.userNoticeVariants.memex_placeholder_notice).toBe('unset')

      act(() => {
        result.current.setUserNoticeVariant('memex_placeholder_notice', 'modal')
      })

      expect(result.current.userNoticeVariants.memex_placeholder_notice).toBe('modal')
    })
  })
})

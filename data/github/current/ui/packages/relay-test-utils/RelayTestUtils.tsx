import {withUserEvent, type TestRenderOptions, type User, type UserEventOptions} from '@github-ui/react-core/test-utils'
import {render, type RenderResult as CoreRenderResult} from '@testing-library/react'
import type {ReactElement} from 'react'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'
import type {EnvironmentHistory} from './RelayMockEnvironment'
import {relayTestFactory, type Queries, type RelayMockProps, type TestComponentProps} from './RelayTestFactories'

type RenderUI = Parameters<typeof render>[0]

export type RenderResult = CoreRenderResult & {
  /**
   * `userEvent` instance for testing user interactions. Using this instance is preferable over calling methods on
   * `userEvent` directly because it will automatically advance timers when using `jest.useFakeTimers()`, and will
   * automatically mock the clipboard state across a test.
   *
   * IMPORTANT: Note that this `user` is built with `user-event@14` and behaves differently from `userEvent` imported
   * from `user-event-13`. The two should not be mixed within a test.
   */
  user: User

  relayMockEnvironment: RelayMockEnvironment
  relayMockHistory?: EnvironmentHistory
}

/**
 * Relay test renderer: allows mocking relay environment and queries. For use in  Jest / React Testing Library contexts
 * @see https://thehub.github.com/epd/engineering/dev-practicals/frontend/testing/relay-testing/#relay-test-utils
 */
export function renderRelay<TQueries extends Queries>(
  ui: (props: TestComponentProps<TQueries>) => RenderUI,
  options: TestRenderOptions & {relay: RelayMockProps<TQueries>; userEventOptions?: UserEventOptions},
): RenderResult {
  const {decorator, relayMockEnvironment, relayMockHistory} = relayTestFactory<TQueries>(options.relay)
  const view = render(
    decorator(({queryData, queryRefs}) => {
      const element = ui({
        queryData,
        queryRefs,
        relayMockEnvironment,
        relayMockHistory,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return element as ReactElement<any, any> | null
    }),
    options,
  )

  return withUserEvent(
    Object.assign(view, {
      relayMockEnvironment,
      relayMockHistory,
    }),
    options.userEventOptions,
  )
}

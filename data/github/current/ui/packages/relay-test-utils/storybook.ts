import type {JSXElementConstructor} from 'react'
import type {StoryObj, StoryFn, StoryContext} from '@storybook/react'
import {relayTestFactory, type RelayMockProps, type Queries, type TestComponentProps} from './RelayTestFactories'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JSXElementConstructorAny = JSXElementConstructor<any>

/**
 * Type for Storybook story object for use with relay decorator.
 */
export type RelayStoryObj<ComponentType extends JSXElementConstructorAny, TQueries extends Queries> = {
  [Property in keyof StoryObj<ComponentType>]: Property extends keyof RelayStoryObjParams<ComponentType, TQueries>
    ? RelayStoryObjParams<ComponentType, TQueries>['parameters'] & StoryObj<ComponentType>['parameters']
    : StoryObj<ComponentType>[Property]
}

interface RelayStoryObjParams<ComponentType extends JSXElementConstructorAny, TQueries extends Queries> {
  parameters: {
    /**
     * Config used by `relayDecorator` for mocking relay environment and queries.
     * @see https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/storybook/#mocking-relay
     */
    relay: RelayDecoratorParameters<ComponentType, TQueries>
  }
}

interface RelayStoryContext<ComponentType extends JSXElementConstructorAny, TQueries extends Queries>
  extends StoryContext {
  parameters: {
    /**
     * Config used by `relayDecorator` for mocking relay environment and queries.
     * @see https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/storybook/#mocking-relay
     */
    relay?: RelayDecoratorParameters<ComponentType, TQueries>
  }
}

interface RelayDecoratorParameters<ComponentType extends JSXElementConstructorAny, TQueries extends Queries>
  extends RelayMockProps<TQueries> {
  /**
   * Map resolved relay queries to Storybook story args.
   * @param queries Resolved relay queries.
   * @param ctx Storybook context.
   */
  mapStoryArgs?: (
    props: TestComponentProps<TQueries>,
    ctx: RelayStoryContext<ComponentType, TQueries>,
  ) => Partial<React.ComponentProps<ComponentType>>
}

function defaultMapStoryArgs<ComponentType extends JSXElementConstructorAny, TQueries extends Queries>(
  {queryRefs, relayMockEnvironment}: TestComponentProps<TQueries>,
  ctx: RelayStoryContext<ComponentType, TQueries>,
) {
  return {...ctx.args, queries: queryRefs, environment: relayMockEnvironment}
}

/**
 * Storybook decorator for mocking relay environment and queries.
 * @see https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/storybook/#mocking-relay
 */
export function relayDecorator<ComponentType extends JSXElementConstructorAny, TQueries extends Queries>(
  story: StoryFn,
  ctx: RelayStoryContext<ComponentType, TQueries>,
) {
  const {queries, mapStoryArgs} = ctx.parameters?.relay ?? {}
  if (!queries) throw new Error('missing required parameter `relay.queries`')

  return relayTestFactory<TQueries>({
    environment: ctx.parameters?.relay?.environment,
    queries,
    mockResolvers: ctx.parameters?.relay?.mockResolvers,
  }).decorator(({queryRefs, queryData, relayMockEnvironment}) => {
    const mapArgs = typeof mapStoryArgs === 'function' ? mapStoryArgs : defaultMapStoryArgs<ComponentType, TQueries>
    const args = {...mapArgs({queryRefs, queryData, relayMockEnvironment}, ctx), ...ctx.args}
    return story({args}, ctx)
  })
}

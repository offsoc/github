import {renderRelay} from '@github-ui/relay-test-utils'
import {makeIssueBaseFields} from './Mocks'
import type {Queries} from '@github-ui/relay-test-utils/RelayTestFactories'
import {MockPayloadGenerator} from 'relay-test-utils'

export function renderRelayWithDefaults<TQueries extends Queries>(...args: Parameters<typeof renderRelay<TQueries>>) {
  args[1].relay.mockResolvers = {
    ...makeIssueBaseFields(),
    ...args[1].relay.mockResolvers,
  }
  return renderRelay(...args)
}

export function generateMockPayloadWithDefaults(...args: Parameters<typeof MockPayloadGenerator.generate>) {
  args[1] = {
    ...makeIssueBaseFields(),
    ...args[1],
  }
  return MockPayloadGenerator.generate(...args)
}

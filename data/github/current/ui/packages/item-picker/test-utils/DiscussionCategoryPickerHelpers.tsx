import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'

export function buildDiscussionCategory({name}: {name: string}) {
  return {
    id: mockRelayId(),
    name,
  }
}

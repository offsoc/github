import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'

export function buildAssignee({login, name}: {login: string; name: string}) {
  return {
    id: mockRelayId(),
    login,
    name,
    avatarUrl: '',
  }
}

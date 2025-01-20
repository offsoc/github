import type {StatusCheck, StatusCheckState} from '../../page-data/payloads/status-checks'

export function StatusCheckGenerator({
  state,
  displayName = 'test-status-check',
}: {
  state: StatusCheckState
  displayName?: string
}): StatusCheck {
  return {
    state,
    avatarUrl: 'https://github.com/primer/design/assets/7265547/24ed9399-ec5a-4160-8f4f-1f11dc560b15',
    displayName,
    additionalContext: '',
    description: 'test description',
    durationInSeconds: 1000,
    isRequired: true,
    stateChangedAt: '2023-01-01T00:00:00Z',
    targetUrl: 'https://example.com/target',
  }
}

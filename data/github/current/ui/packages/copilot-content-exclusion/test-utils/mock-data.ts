import type {OrgSettingsPayload, RepoSettingsPayload} from '../types'

export function makeContentExclusionOrgSettingsRoutePayload(): OrgSettingsPayload {
  return {
    organization: 'test-org',
    lastEdited: {
      login: 'test-user',
      time: '2021-01-01T00:00:00Z',
      link: '/organizations/test-org/settings/audit-log?q=action:copilot.content_exclusion_changed',
    },
    document: 'test',
  }
}

export function makeContentExclusionRepoSettingsRoutePayload(): RepoSettingsPayload {
  return {
    organization: 'test-org',
    repo: 'test-repo',
    lastEdited: {
      login: 'test-user',
      time: '2021-01-01T00:00:00Z',
      link: undefined,
    },
    orgLevelRules: [],
    repoDocument: null,
  }
}

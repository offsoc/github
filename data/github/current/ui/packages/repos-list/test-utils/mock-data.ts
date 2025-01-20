import type {UserInfo} from '@github-ui/repos-list-shared'
import type {SafeHTMLString} from '@github-ui/safe-html'

import type {RepositoriesPayload, TypeFilter} from '../types/repos-list-types'

export const typeFilters: TypeFilter[] = [
  {id: 'all', text: 'All'},
  {id: 'public', text: 'Public'},
  {id: 'private', text: 'Private'},
  {id: 'internal', text: 'Internal'},
  {id: 'source', text: 'Sources'},
  {id: 'fork', text: 'Forks'},
  {id: 'archived', text: 'Archived'},
  {id: 'template', text: 'Templates'},
]

export const userInfo: UserInfo = {
  canCreateRepository: true,
  admin: false,
  directOrTeamMember: false,
}

export function getRepositoriesRoutePayload(): RepositoriesPayload {
  return {
    userInfo,
    searchable: true,
    pageCount: 1,
    definitions: [
      {
        propertyName: 'version',
        valueType: 'string',
      },
    ],
    typeFilters,
    compactMode: false,
    repositories: [
      {
        name: 'test-repo',
        type: 'Private',
        owner: 'monalisa',
        isFork: false,
        description: '' as SafeHTMLString,
        allTopics: ['planes', 'trains', 'automobiles'],
        primaryLanguage: {name: 'Ruby', color: '#701516'},
        pullRequestCount: 1000,
        issueCount: 20,
        forksCount: 3,
        starsCount: 39,
        license: 'MIT License',
        lastUpdated: {hasBeenPushedTo: true, timestamp: '2020-01-01T00:00:00.000Z'},
        participation: [],
      },
      {
        name: 'smile',
        type: 'Public',
        owner: 'monalisa',
        isFork: true,
        description: 'Any slightly larger description than the other one' as SafeHTMLString,
        allTopics: ['one'],
        primaryLanguage: null,
        pullRequestCount: 3,
        issueCount: 0,
        forksCount: 0,
        starsCount: 0,
        license: '',
        lastUpdated: {hasBeenPushedTo: true, timestamp: '2024-02-01T00:00:00.000Z'},
        participation: [2, 40, 2, 40, 2, 40, 2],
      },
    ],
    repositoryCount: 2,
  }
}

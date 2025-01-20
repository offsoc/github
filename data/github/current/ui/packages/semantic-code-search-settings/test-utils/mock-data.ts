import {act} from '@testing-library/react'
import type {SemanticCodeSearchSettingsPayload} from '../routes/SemanticCodeSearchSettings'
import type {IndexedRepo} from '../types/indexed-repo'
import type {MockEnvironment} from 'relay-test-utils'
import {MockPayloadGenerator} from 'relay-test-utils'

export function getSemanticCodeSearchSettingsRoutePayload(): SemanticCodeSearchSettingsPayload {
  return {
    canIndexRepos: true,
    initialIndexedRepos: getInitialIndexedRepos(),
    quota: 10,
    orgName: 'mona',
  }
}

export function getInitialIndexedRepos(): IndexedRepo[] {
  return [
    {id: 'repo1', name: 'repo1', owner: 'mona', description: 'test repo1'},
    {id: 'repo2', name: 'repo2', owner: 'mona', description: 'test repo2'},
  ]
}

const orgRepositories = [
  {
    databaseId: 1,
    id: 'unindexed-repo1',
    name: 'unindexed repo1',
    nameWithOwner: 'mona/unindexed repo1',
    owner: {
      login: 'mona',
    },
    isPrivate: false,
    isArchived: false,
    shortDescriptionHTML: 'unindexed test repo1',
  },
  {
    databaseId: 2,
    id: 'unindexed-repo2',
    name: 'unindexed repo2',
    nameWithOwner: 'mona/unindexed repo2',
    owner: {
      login: 'mona',
    },
    isPrivate: false,
    isArchived: false,
    shortDescriptionHTML: 'unindexed test repo2',
  },
]

export function resolveRepoSearch(environment: MockEnvironment) {
  act(() =>
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        SearchResultItemConnection: () => ({
          nodes: orgRepositories,
        }),
      }),
    ),
  )
}

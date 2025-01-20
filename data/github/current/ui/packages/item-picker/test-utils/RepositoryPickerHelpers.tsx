import {ComponentWithPreloadedQueryRef, mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'
import {type PreloadedQuery, RelayEnvironmentProvider} from 'react-relay'
import React from 'react'
import {RepositoryPicker, TopRepositories, type Repository} from '../components/RepositoryPicker'
import type {RepositoryPickerTopRepositoriesQuery} from '../components/__generated__/RepositoryPickerTopRepositoriesQuery.graphql'
import type {createMockEnvironment} from 'relay-test-utils'

export type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
  initialRepository?: Repository
  organization?: string
  ignoredRepositories?: string[]
  repositoryFilter?: (repo: Repository) => boolean
  customNoResultsItem?: JSX.Element
}

type WrappedRepositoryPickerProps = {
  queryRef: PreloadedQuery<RepositoryPickerTopRepositoriesQuery>
  initialRepository?: Repository | undefined
  organization?: string
  ignoredRepositories?: string[]
  repositoryFilter?: (repo: Repository) => boolean
  customNoResultsItem?: JSX.Element
}

export function WrappedRepositoryPicker({
  queryRef,
  initialRepository,
  organization,
  ignoredRepositories,
  repositoryFilter,
  customNoResultsItem,
}: WrappedRepositoryPickerProps) {
  const [repository, setRepository] = React.useState<Repository | undefined>(initialRepository)

  return (
    <RepositoryPicker
      onSelect={repo => setRepository(repo)}
      topReposQueryRef={queryRef}
      initialRepository={repository}
      organization={organization}
      ignoredRepositories={ignoredRepositories}
      repositoryFilter={repositoryFilter}
      customNoResultsItem={customNoResultsItem}
    />
  )
}

export function TestRepositoryPickerComponent({
  environment,
  initialRepository,
  organization,
  ignoredRepositories,
  repositoryFilter,
  customNoResultsItem,
}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="...Loading">
        <ComponentWithPreloadedQueryRef
          component={WrappedRepositoryPicker}
          componentProps={{
            initialRepository,
            organization,
            ignoredRepositories,
            repositoryFilter,
            customNoResultsItem,
          }}
          query={TopRepositories}
          queryVariables={{topRepositoriesFirst: 10, hasIssuesEnabled: true, owner: null}}
        />
      </React.Suspense>
    </RelayEnvironmentProvider>
  )
}

export function buildRepository({name, owner}: {name: string; owner: string}) {
  return {
    id: mockRelayId(),
    name,
    owner: {
      login: owner,
    },
    isPrivate: false,
    isArchived: false,
    nameWithOwner: `${owner}/${name}`,
    __typename: 'Repository',
  }
}

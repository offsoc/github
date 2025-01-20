import type {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import type {RepositoryPickerRepository$data} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'

export type RepoQueryDatum = RepositoryPickerRepository$data

// This is what's required for RepoPicker to work
export interface BaseRepo {
  isInOrganization: RepositoryPickerRepository$data['isInOrganization']
  name: RepositoryPickerRepository$data['name']
  nameWithOwner: RepositoryPickerRepository$data['nameWithOwner']
  owner: {
    avatarUrl: RepositoryPickerRepository$data['owner']['avatarUrl']
  }
}

export type QueryFn = (query: string) => Promise<RepoQueryDatum[]>

export type RelayEnv = ReturnType<typeof relayEnvironmentWithMissingFieldHandlerForNode>

export type OnSelect = (repo: BaseRepo, isSelected: boolean) => void

import type {PropertyDefinition} from '@github-ui/repos-filter'
import type {ListResults, RepositoryItem, UserInfo} from '@github-ui/repos-list-shared'

export interface RepositoriesPayload extends ListResults<RepositoryItem> {
  userInfo?: UserInfo
  searchable: boolean
  definitions: PropertyDefinition[]
  typeFilters: TypeFilter[]
  compactMode: boolean
}

export type Visibility = 'public' | 'internal' | 'private'

export interface TypeFilter {
  id: string
  text: string
}

export interface Filters {
  q?: string
  language?: string
  type?: string
}

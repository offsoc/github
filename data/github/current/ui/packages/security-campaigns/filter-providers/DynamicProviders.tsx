import {CodescanIcon, PeopleIcon, RepoIcon, TagIcon, ToolsIcon} from '@primer/octicons-react'
import AsyncSuggestionsFilterProvider from './AsyncSuggestionsFilterProvider'
import type {FilterKey} from '@github-ui/filter'
import {ssrSafeLocation} from '@github-ui/ssr-utils'

export class RepositoryFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: string) {
    super(
      {
        displayName: 'Repository',
        key: 'repo',
        priority: 1,
        icon: RepoIcon,
        description: 'Find alerts for the selected repositories',
      } as FilterKey,
      getSuggestionsPath(paths, 'repos'),
    )
  }
}

export class TeamFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: string) {
    super(
      {
        displayName: 'Team',
        key: 'team',
        priority: 1,
        icon: PeopleIcon,
        description: 'Find alerts for repositories the selected teams can access',
      } as FilterKey,
      getSuggestionsPath(paths, 'teams'),
    )
  }
}

export class TopicFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: string) {
    super(
      {
        displayName: 'Topic',
        key: 'topic',
        priority: 1,
        icon: TagIcon,
        description: 'Find alerts for repositories with the selected topics',
      } as FilterKey,
      getSuggestionsPath(paths, 'topics'),
    )
  }
}

export class RuleFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: string) {
    super(
      {
        displayName: 'Rule',
        key: 'rule',
        priority: 1,
        icon: CodescanIcon,
        description: 'Find alerts from the selected rule',
      } as FilterKey,
      getSuggestionsPath(paths, 'code-scanning.rules'),
    )
  }
}

export class ToolFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: string) {
    super(
      {
        displayName: 'Tool',
        key: 'tool',
        priority: 1,
        icon: ToolsIcon,
        description: 'Find alerts from the selected tool',
      } as FilterKey,
      getSuggestionsPath(paths, 'code-scanning.tools'),
    )
  }
}

function getSuggestionsPath(path: string, type: string): string {
  const url = new URL(path, ssrSafeLocation.origin)
  url.searchParams.set('options-type', type)
  return url.toString()
}

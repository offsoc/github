import type {FilterKey} from '@github-ui/filter'
import {
  CodescanIcon,
  DependabotIcon,
  KeyIcon,
  NoteIcon,
  PeopleIcon,
  RepoIcon,
  TagIcon,
  ToolsIcon,
} from '@primer/octicons-react'

import type {Paths} from '../contexts/Paths'
import AsyncSuggestionsFilterProvider from './AsyncSuggestionsFilterProvider'

export class RepositoryFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: Pick<Paths, 'suggestionsPath'>) {
    super(
      {
        displayName: 'Repository',
        key: 'repo',
        priority: 1,
        icon: RepoIcon,
        description: 'Find alerts for the selected repositories',
      } as FilterKey,
      paths.suggestionsPath({type: 'repos'}),
    )
  }
}

export class TeamFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: Pick<Paths, 'suggestionsPath'>) {
    super(
      {
        displayName: 'Team',
        key: 'team',
        priority: 1,
        icon: PeopleIcon,
        description: 'Find alerts for repositories the selected teams can access',
      } as FilterKey,
      paths.suggestionsPath({type: 'teams'}),
    )
  }
}

export class ToolFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: Pick<Paths, 'suggestionsPath'>) {
    super(
      {
        displayName: 'Tool',
        key: 'tool',
        priority: 1,
        icon: ToolsIcon,
        description: 'Find alerts from the selected tools',
      } as FilterKey,
      paths.suggestionsPath({type: 'tools'}),
    )
  }
}

export class TopicFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: Pick<Paths, 'suggestionsPath'>) {
    super(
      {
        displayName: 'Topic',
        key: 'topic',
        priority: 1,
        icon: TagIcon,
        description: 'Find alerts for repositories with the selected topics',
      } as FilterKey,
      paths.suggestionsPath({type: 'topics'}),
    )
  }
}

export class DependabotEcosystemFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: Pick<Paths, 'suggestionsPath'>) {
    super(
      {
        displayName: 'Dependabot: ecosystem',
        key: 'dependabot.ecosystem',
        priority: 1,
        icon: DependabotIcon,
        description: 'Finds Dependabot alerts detected in the selected ecosystem',
      } as FilterKey,
      paths.suggestionsPath({type: 'dependabot.ecosystems'}),
    )
  }
}

export class DependabotPackageFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: Pick<Paths, 'suggestionsPath'>) {
    super(
      {
        displayName: 'Dependabot: package',
        key: 'dependabot.package',
        priority: 1,
        icon: DependabotIcon,
        description: 'Finds Dependabot alerts detected in the selected package',
      } as FilterKey,
      paths.suggestionsPath({type: 'dependabot.packages'}),
    )
  }
}

export class CodeQLRuleFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: Pick<Paths, 'suggestionsPath'>) {
    super(
      {
        displayName: 'CodeQL: rule',
        key: 'codeql.rule',
        priority: 1,
        icon: CodescanIcon,
        description: 'Find CodeQL alerts from the selected rule',
      } as FilterKey,
      paths.suggestionsPath({type: 'codeql.rules'}),
    )
  }
}

export class ThirdPartyRuleFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: Pick<Paths, 'suggestionsPath'>) {
    super(
      {
        displayName: 'Third-party: rule',
        key: 'third-party.rule',
        priority: 1,
        icon: CodescanIcon,
        description: 'Find third-party alerts from the selected rule',
      } as FilterKey,
      paths.suggestionsPath({type: 'third-party.rules'}),
    )
  }
}

export class SecretTypeFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: Pick<Paths, 'suggestionsPath'>, omitKeyPrefix: boolean = false) {
    const displayName = omitKeyPrefix ? 'Secret type' : 'Secret scanning: secret type'
    const key = omitKeyPrefix ? 'secret-type' : 'secret-scanning.secret-type'
    const aliases = omitKeyPrefix ? ['secret-scanning.secret-type'] : ['secret-type']
    super(
      {
        displayName,
        key,
        priority: 1,
        icon: KeyIcon,
        description: 'Find secret scanning alerts with the selected secret type',
        aliases,
      } as FilterKey,
      paths.suggestionsPath({type: 'secret-scanning.secret-types'}),
    )
  }
}

export class SecretProviderFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: Pick<Paths, 'suggestionsPath'>, omitKeyPrefix: boolean = false) {
    const displayName = omitKeyPrefix ? 'Provider' : 'Secret scanning: provider'
    const key = omitKeyPrefix ? 'provider' : 'secret-scanning.provider'
    const aliases = omitKeyPrefix ? ['secret-scanning.provider'] : ['provider']
    super(
      {
        displayName,
        key,
        priority: 1,
        icon: KeyIcon,
        description: 'Find secret scanning alerts with secret type from the selected provider',
        aliases,
      } as FilterKey,
      paths.suggestionsPath({type: 'secret-scanning.providers'}),
    )
  }
}

export class OwnerFilterProvider extends AsyncSuggestionsFilterProvider {
  constructor(paths: Pick<Paths, 'suggestionsPath'>) {
    super(
      {
        displayName: 'Owner',
        key: 'owner',
        priority: 1,
        icon: PeopleIcon,
        description: 'Find alerts for repositories with the selected owner',
      } as FilterKey,
      paths.suggestionsPath({type: 'owners'}),
    )
  }
}

type CustomProperty = {
  name: string
  type: string
}

export function createCustomPropertyFilterProviders(
  paths: Pick<Paths, 'suggestionsPath'>,
  customProperties: CustomProperty[],
): AsyncSuggestionsFilterProvider[] {
  return customProperties.map(customProperty => {
    return new AsyncSuggestionsFilterProvider(
      {
        displayName: `Property: ${customProperty.name}`,
        key: `props.${customProperty.name}`,
        priority: 10,
        icon: NoteIcon,
        description: `Find alerts for repositories with property "${customProperty.name}"`,
      } as FilterKey,
      paths.suggestionsPath({type: 'props', name: customProperty.name}),
    )
  })
}

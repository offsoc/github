import {FilterProviderType, type FilterSuggestion, type SuppliedFilterProviderOptions} from '@github-ui/filter'
import {StaticFilterProvider} from '@github-ui/filter/providers'
import {
  ArchiveIcon,
  CodescanIcon,
  DependabotIcon,
  KeyIcon,
  LockIcon,
  OrganizationIcon,
  PeopleIcon,
  RepoIcon,
  ShieldCheckIcon,
  ShieldIcon,
} from '@primer/octicons-react'

import {DEFAULT_FILTER_TYPE_OPTIONS} from './types'

export class StaticToolFilterProvider extends StaticFilterProvider {
  constructor(visibleSecurityFeatures: string[], options?: SuppliedFilterProviderOptions) {
    const filterKey = {
      displayName: 'Tool',
      key: 'tool',
      priority: 1,
      icon: ShieldIcon,
      description: 'Tool: secret-scanning | dependabot | codeql',
    }

    const filterValues = visibleSecurityFeatures.reduce((acc, feature, index) => {
      const newAcc = [...acc]

      switch (feature) {
        case 'codeql':
          newAcc.push({
            value: feature,
            displayName: 'CodeQL',
            priority: index + 1,
            icon: CodescanIcon,
          })
          break
        case 'dependabot':
          newAcc.push({
            value: feature,
            displayName: 'Dependabot',
            priority: index + 1,
            icon: DependabotIcon,
          })
          break
        case 'secret-scanning':
          newAcc.push({
            value: feature,
            displayName: 'Secret scanning',
            priority: index + 1,
            icon: KeyIcon,
          })
          break
      }

      return newAcc
    }, [] as FilterSuggestion[])

    super(filterKey, filterValues, options)
    this.type = FilterProviderType.Select
  }
}

export class ArchivedFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const filterKeys = {
      displayName: 'Archived',
      key: 'archived',
      priority: 1,
      icon: ArchiveIcon,
      description: 'Find alerts for archived or non-archived repositories',
    }
    const filterValues = [
      {value: 'true', displayName: 'True', priority: 1},
      {value: 'false', displayName: 'False', priority: 2},
    ]
    const opts = {
      ...options,
      filterTypes: {
        ...DEFAULT_FILTER_TYPE_OPTIONS,
        ...options?.filterTypes,
      },
    }

    super(filterKeys, filterValues, opts)
    this.type = FilterProviderType.Boolean
  }
}

export class VisibilityFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const filterKeys = {
      displayName: 'Visibility',
      key: 'visibility',
      priority: 1,
      icon: LockIcon,
      description: 'Find alerts for repositories of the selected visibilities',
    }
    const filterValues = [
      {value: 'public', displayName: 'Public', priority: 1, icon: RepoIcon},
      {value: 'internal', displayName: 'Internal', priority: 2, icon: OrganizationIcon},
      {value: 'private', displayName: 'Private', priority: 3, icon: LockIcon},
    ]
    const opts = {
      ...options,
      filterTypes: {
        ...DEFAULT_FILTER_TYPE_OPTIONS,
        ...options?.filterTypes,
      },
    }

    super(filterKeys, filterValues, opts)
    this.type = FilterProviderType.Select
  }
}

export class SeverityFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const filterKeys = {
      displayName: 'Severity',
      key: 'severity',
      priority: 1,
      icon: ShieldIcon,
      description: 'Find alerts with the selected severities',
    }
    const filterValues = [
      {value: 'critical', displayName: 'Critical', priority: 1},
      {value: 'high', displayName: 'High', priority: 2},
      {value: 'medium', displayName: 'Medium', priority: 3},
      {value: 'low', displayName: 'Low', priority: 4},
    ]
    const opts = {
      ...options,
      filterTypes: {
        ...DEFAULT_FILTER_TYPE_OPTIONS,
        ...options?.filterTypes,
      },
    }

    super(filterKeys, filterValues, opts)
    this.type = FilterProviderType.Select
  }
}

export class ResolutionFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const filterKeys = {
      displayName: 'Resolution',
      key: 'resolution',
      priority: 1,
      icon: ShieldCheckIcon,
      description: 'Find alerts closed with the selected reasons',
    }
    const filterValues = [
      {value: 'risk-accepted', displayName: 'Risk accepted', priority: 1},
      {value: 'fixed-or-revoked', displayName: 'Fixed/revoked', priority: 2},
      {value: 'false-positive', displayName: 'False positive', priority: 3},
      {value: 'auto-dismissed', displayName: 'Auto-dismissed', priority: 4},
    ]
    const opts = {
      ...options,
      filterTypes: {
        ...DEFAULT_FILTER_TYPE_OPTIONS,
        ...options?.filterTypes,
      },
    }

    super(filterKeys, filterValues, opts)
    this.type = FilterProviderType.Select
  }
}

export class DependabotScopeFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const filterKeys = {
      displayName: 'Dependabot: scope',
      key: 'dependabot.scope',
      priority: 1,
      icon: DependabotIcon,
      description: 'Finds Dependabot alerts from the selected dependency scope',
    }
    const filterValues = [
      {value: 'runtime', displayName: 'Runtime', priority: 1},
      {value: 'development', displayName: 'Development', priority: 2},
    ]
    const opts = {
      ...options,
      filterTypes: {
        ...DEFAULT_FILTER_TYPE_OPTIONS,
        ...options?.filterTypes,
      },
    }

    super(filterKeys, filterValues, opts)
    this.type = FilterProviderType.Select
  }
}

export class CodeQLAutofixStatusFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const filterKeys = {
      displayName: 'CodeQL: Autofix status',
      key: 'codeql.autofix',
      priority: 1,
      icon: CodescanIcon,
      description: 'Finds CodeQL alerts by autofix status',
    }
    const filterValues = [
      {value: 'accepted', displayName: 'Accepted', priority: 1},
      {value: 'suggested', displayName: 'Suggested', priority: 2},
      {value: 'not-suggested', displayName: 'Not suggested', priority: 3},
    ]
    const opts = {
      ...options,
      filterTypes: {
        ...DEFAULT_FILTER_TYPE_OPTIONS,
        ...options?.filterTypes,
      },
    }

    super(filterKeys, filterValues, opts)
    this.type = FilterProviderType.Select
  }
}

export class StateFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const filterKeys = {
      displayName: 'Alert state',
      key: 'state',
      priority: 1,
      icon: CodescanIcon,
      description: 'Finds alerts by state',
    }
    const filterValues = [
      {value: 'unresolved', displayName: 'Unresolved', priority: 1},
      {value: 'fixed', displayName: 'Fixed', priority: 2},
      {value: 'dismissed', displayName: 'Dismissed', priority: 3},
    ]
    const opts = {
      ...options,
      filterTypes: {
        ...DEFAULT_FILTER_TYPE_OPTIONS,
        ...options?.filterTypes,
      },
    }

    super(filterKeys, filterValues, opts)
    this.type = FilterProviderType.Select
  }
}

export class SecretValidityFilterProvider extends StaticFilterProvider {
  constructor(omitKeyPrefix: boolean = false, options?: SuppliedFilterProviderOptions) {
    const displayName = omitKeyPrefix ? 'Validity' : 'Secret scanning: validity'
    const key = omitKeyPrefix ? 'validity' : 'secret-scanning.validity'
    const aliases = omitKeyPrefix ? ['secret-scanning.validity'] : ['validity']
    const filterKeys = {
      displayName,
      key,
      priority: 1,
      icon: KeyIcon,
      description: 'Find secret scanning alerts with the selected validity',
      aliases,
    }
    const filterValues = [
      {value: 'active', displayName: 'Active', priority: 1},
      {value: 'inactive', displayName: 'Inactive', priority: 2},
      {value: 'unknown', displayName: 'Unknown', priority: 3},
    ]
    const opts = {
      ...options,
      filterTypes: {
        ...DEFAULT_FILTER_TYPE_OPTIONS,
        ...options?.filterTypes,
      },
    }

    super(filterKeys, filterValues, opts)
    this.type = FilterProviderType.Select
  }
}

export class SecretBypassedFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const filterKeys = {
      displayName: 'Secret scanning: bypassed',
      key: 'secret-scanning.bypassed',
      priority: 1,
      icon: KeyIcon,
      description: 'Find secret scanning alerts with the selected bypassed state',
    }
    const filterValues = [
      {value: 'true', displayName: 'True', priority: 1},
      {value: 'false', displayName: 'False', priority: 2},
    ]
    const opts = {
      ...options,
      filterTypes: {
        ...DEFAULT_FILTER_TYPE_OPTIONS,
        ...options?.filterTypes,
      },
    }

    super(filterKeys, filterValues, opts)
    this.type = FilterProviderType.Select
  }
}

export class OwnerTypeFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const filterKeys = {
      displayName: 'Owner Type',
      key: 'owner-type',
      priority: 1,
      icon: PeopleIcon,
      description: 'Find alerts based on if the owner is user or organization',
    }
    const opts = {
      ...options,
      filterTypes: {...options?.filterTypes, multiValue: true},
    }
    const filterValues = [
      {value: 'user', displayName: 'User', priority: 1},
      {value: 'organization', displayName: 'Organization', priority: 2},
    ]

    super(filterKeys, filterValues, opts)
    this.type = FilterProviderType.Select
  }
}

export class OpenClosedFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const filterKeys = {
      displayName: 'Alert Open/Closed',
      key: 'is',
      priority: 1,
      icon: ShieldIcon,
      description: 'Find alerts by open/closed state',
    }
    const opts = {
      ...options,
      filterTypes: {
        ...DEFAULT_FILTER_TYPE_OPTIONS,
        ...options?.filterTypes,
      },
    }
    const filterValues = [
      {value: 'open', displayName: 'Open', priority: 1},
      {value: 'closed', displayName: 'Closed', priority: 2},
    ]

    super(filterKeys, filterValues, opts)
    this.type = FilterProviderType.Select
  }
}

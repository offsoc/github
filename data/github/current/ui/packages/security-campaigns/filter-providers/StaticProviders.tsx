import {FilterProviderType, type SuppliedFilterProviderOptions} from '@github-ui/filter'
import {StaticFilterProvider} from '@github-ui/filter/providers'
import {ShieldCheckIcon, ShieldIcon, SortDescIcon} from '@primer/octicons-react'

import {DEFAULT_FILTER_TYPE_OPTIONS} from './types'

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
      {value: 'error', displayName: 'Error', priority: 1},
      {value: 'warning', displayName: 'Warning', priority: 2},
      {value: 'note', displayName: 'Note', priority: 3},
      {value: 'critical', displayName: 'Critical', priority: 4},
      {value: 'high', displayName: 'High', priority: 5},
      {value: 'medium', displayName: 'Medium', priority: 6},
      {value: 'low', displayName: 'Low', priority: 7},
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

export class SortFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const filterKeys = {
      displayName: 'Sort',
      key: 'sort',
      priority: 1,
      icon: SortDescIcon,
      description: 'Sort alerts',
    }
    const opts = {
      ...options,
      filterTypes: {
        ...DEFAULT_FILTER_TYPE_OPTIONS,
        exclusive: false,
        multiValue: false,
        ...options?.filterTypes,
      },
    }
    const filterValues = [
      {value: 'created-desc', displayName: 'Newest', priority: 1},
      {value: 'created-asc', displayName: 'Oldest', priority: 2},
      {value: 'updated-desc', displayName: 'Recently updated', priority: 3},
      {value: 'updated-asc', displayName: 'Least recently updated', priority: 4},
    ]

    super(filterKeys, filterValues, opts)
    this.type = FilterProviderType.Select
  }
}

export class StateFilterProvider extends StaticFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    const filterKeys = {
      displayName: 'Alert State',
      key: 'is',
      aliases: ['state'],
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
      {value: 'dismissed', displayName: 'All dismissed', priority: 1},
      {value: 'false-positive', displayName: 'False positive', priority: 2},
      {value: 'used-in-tests', displayName: 'Used in tests', priority: 3},
      {value: 'wont-fix', displayName: "Won't fix", priority: 4},
      {value: 'fixed', displayName: 'Fixed', priority: 5},
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

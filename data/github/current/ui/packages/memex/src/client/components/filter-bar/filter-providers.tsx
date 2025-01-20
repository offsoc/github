import {
  defaultFilterProviderOptions,
  FILTER_PRIORITY_DISPLAY_THRESHOLD,
  FilterProviderType,
  NOT_SHOWN,
  type SuppliedFilterProviderOptions,
} from '@github-ui/filter'
import {
  BaseUserFilterProvider,
  KeyOnlyFilterProvider,
  StaticFilterProvider,
  type UserFilterParams,
} from '@github-ui/filter/providers'
import {
  CalendarIcon,
  CheckCircleIcon,
  GitPullRequestIcon,
  IssueReopenedIcon,
  IssueTrackedByIcon,
  IssueTracksIcon,
  IterationsIcon,
  MentionIcon,
  NoEntryIcon,
  NumberIcon,
  PersonIcon,
  SingleSelectIcon,
  SkipIcon,
  TypographyIcon,
} from '@primer/octicons-react'

import {getGroupingMetadataFromServerGroupValue} from '../../features/grouping/get-grouping-metadata'
import type {IterationGrouping, SingleSelectGrouping} from '../../features/grouping/types'
import {intervalDatesDescription} from '../../helpers/iterations'
import type {DateColumnModel} from '../../models/column-model/custom/date'
import type {IterationColumnModel} from '../../models/column-model/custom/iteration'
import type {NumberColumnModel} from '../../models/column-model/custom/number'
import type {SingleSelectColumnModel} from '../../models/column-model/custom/single-select'
import type {TextColumnModel} from '../../models/column-model/custom/text'
import type {ParentIssueColumnModel} from '../../models/column-model/system/parent-issue'
import type {StatusColumnModel} from '../../models/column-model/system/status'
import type {SubIssuesProgressColumnModel} from '../../models/column-model/system/sub-issues-progress'
import {getFilterKeyFromColumnName} from './helpers/get-filter-key-from-column-name'

// Default priorities for all other filter providers can be found in
// @github-ui/filter/constants/filter-constants.ts
export const FILTER_PRIORITIES = {
  date: NOT_SHOWN,
  iteration: NOT_SHOWN,
  linkedPullRequests: FILTER_PRIORITY_DISPLAY_THRESHOLD,
  milestone: FILTER_PRIORITY_DISPLAY_THRESHOLD,
  type: FILTER_PRIORITY_DISPLAY_THRESHOLD,
  no: FILTER_PRIORITY_DISPLAY_THRESHOLD,
  number: NOT_SHOWN,
  reviewers: FILTER_PRIORITY_DISPLAY_THRESHOLD,
  singleSelect: FILTER_PRIORITY_DISPLAY_THRESHOLD,
  state: NOT_SHOWN,
  text: NOT_SHOWN,
  subIssuesProgress: FILTER_PRIORITY_DISPLAY_THRESHOLD,
  parentIssue: FILTER_PRIORITY_DISPLAY_THRESHOLD,
  reason: NOT_SHOWN,
  lastUpdated: NOT_SHOWN,
}

const FilterKeys = {
  date: (column: DateColumnModel) => ({
    key: getFilterKeyFromColumnName(column.name),
    displayName: column.name,
    icon: CalendarIcon,
    priority: FILTER_PRIORITIES.date,
    type: FilterProviderType.Date,
  }),
  iteration: (column: IterationColumnModel) => ({
    key: getFilterKeyFromColumnName(column.name),
    displayName: column.name,
    icon: IterationsIcon,
    priority: FILTER_PRIORITIES.iteration,
  }),
  linkedPullRequests: {
    displayName: 'Linked pull requests',
    key: 'linked-pull-requests',
    icon: GitPullRequestIcon,
    description: 'Issue items with a linked pull request',
    priority: FILTER_PRIORITIES.linkedPullRequests,
  },
  no: {
    key: 'no',
    displayName: 'No',
    description: 'Items without a value for the specified field',
    priority: FILTER_PRIORITIES.no,
    icon: NoEntryIcon,
  },
  number: (column: NumberColumnModel) => ({
    key: getFilterKeyFromColumnName(column.name),
    displayName: column.name,
    icon: NumberIcon,
    priority: FILTER_PRIORITIES.number,
    type: FilterProviderType.Number,
  }),
  reviewers: {
    displayName: 'Reviewers',
    key: 'reviewers',
    icon: PersonIcon,
    description: 'Items reviewed by the user',
    priority: FILTER_PRIORITIES.reviewers,
  },
  singleSelect: (column: SingleSelectColumnModel | StatusColumnModel) => ({
    key: getFilterKeyFromColumnName(column.name),
    displayName: column.name,
    icon: SingleSelectIcon,
    priority: FILTER_PRIORITIES.singleSelect,
  }),
  text: (column: TextColumnModel) => ({
    key: getFilterKeyFromColumnName(column.name),
    displayName: column.name,
    icon: TypographyIcon,
    priority: FILTER_PRIORITIES.text,
    type: FilterProviderType.Text,
  }),
  parentIssue: (column: ParentIssueColumnModel) => ({
    key: 'parent-issue',
    displayName: column.name,
    icon: IssueTrackedByIcon,
    priority: FILTER_PRIORITIES.parentIssue,
    type: FilterProviderType.Text,
  }),
  subIssuesProgress: (column: SubIssuesProgressColumnModel) => ({
    key: 'sub-issues-progress',
    displayName: column.name,
    icon: IssueTracksIcon,
    priority: FILTER_PRIORITIES.subIssuesProgress,
    // We are using "unknown" type here for now, as it's not clear exactly how the semantics of filtering
    // on a percentage should be treated. It's probably similar to a number, but may be slightly different.
    type: FilterProviderType.Unknown,
  }),
  reason: {
    key: 'reason',
    displayName: 'Closed reason',
    priority: FILTER_PRIORITIES.reason,
    icon: MentionIcon,
    description: 'Filter by item closed reason',
  },
  lastUpdated: {
    key: 'last-updated',
    displayName: 'Last updated',
    priority: FILTER_PRIORITIES.lastUpdated,
    icon: CalendarIcon,
    description: 'Date when the item was last updated',
  },
}

//#region System column filter providers (non-standard)

/*
 * The standard LinkedFilterProvider extends the StaticFilterProvider and accepts a boolean or yes/no value.
 * This would be non-backwards compatible with existing Memex behavior, which is to accept pull request value(s).
 * Since this filter provider needs to be custom to work with the existing `linked-pull-requests` query key anyway,
 * it can extend the KeyOnlyFilterProvider and accept a string value until we want to change the behavior.
 */
export class LinkedPullRequestsFilterProvider extends KeyOnlyFilterProvider {
  constructor(options?: SuppliedFilterProviderOptions) {
    super(FilterKeys.linkedPullRequests, {...options, filterTypes: {...options?.filterTypes, valueless: true}})
  }
}

/*
 * The standard ReviewedByFilterProvider has the query key `reviewed-by:` which does not work for Memex at present.
 */
export class ReviewersFilterProvider extends BaseUserFilterProvider {
  constructor(filterParams: UserFilterParams, options?: SuppliedFilterProviderOptions) {
    super(filterParams, FilterKeys.reviewers, options)
  }
}

//#region Custom column filter providers

export class DateFilterProvider extends KeyOnlyFilterProvider {
  constructor(columnModel: DateColumnModel) {
    const filterKey = FilterKeys.date(columnModel)
    super(filterKey, {filterTypes: {valueless: false}})
  }
}

export class IterationFilterProvider extends StaticFilterProvider {
  constructor(columnModel: IterationColumnModel) {
    const filterKey = FilterKeys.iteration(columnModel)
    const {iterations, completedIterations} = columnModel.settings.configuration
    const filterValues = [...iterations, ...completedIterations].map((iteration, idx) => {
      const serverMetadata = getGroupingMetadataFromServerGroupValue(columnModel, iteration.id) as IterationGrouping
      const groupMetadata =
        serverMetadata && serverMetadata.kind !== 'empty' ? serverMetadata.value.iteration : iteration
      const {title, titleHtml, startDate, duration} = groupMetadata

      return {
        ariaLabel: title,
        value: title,
        priority: idx,
        displayName: titleHtml,
        description: intervalDatesDescription({startDate, duration}),
        inlineDescription: false,
      }
    })
    super(filterKey, filterValues, {filterTypes: {valueless: false}})
  }
}

export class NumberFilterProvider extends KeyOnlyFilterProvider {
  constructor(columnModel: NumberColumnModel) {
    const filterKey = FilterKeys.number(columnModel)
    super(filterKey, {filterTypes: {valueless: false}})
  }
}

export class SingleSelectFilterProvider extends StaticFilterProvider {
  constructor(columnModel: StatusColumnModel | SingleSelectColumnModel) {
    const filterKey = FilterKeys.singleSelect(columnModel)
    const filterValues = (columnModel.settings.options ?? []).map((value, idx) => {
      const serverMetadata = getGroupingMetadataFromServerGroupValue(columnModel, value.name) as SingleSelectGrouping
      const groupMetadata = serverMetadata && serverMetadata.kind !== 'empty' ? serverMetadata.value.option : value
      const {descriptionHtml, name, nameHtml, color} = groupMetadata

      return {
        ariaLabel: name,
        value: name,
        priority: idx,
        displayName: nameHtml,
        description: descriptionHtml,
        inlineDescription: false,
        iconColor: color,
      }
    })

    super(filterKey, filterValues)
  }
}

export class TextFilterProvider extends KeyOnlyFilterProvider {
  constructor(columnModel: TextColumnModel) {
    const filterKey = FilterKeys.text(columnModel)
    super(filterKey, {filterTypes: {valueless: false}})
  }
}

export class SubIssuesProgressFilterProvider extends StaticFilterProvider {
  constructor(columnModel: SubIssuesProgressColumnModel) {
    const filterKey = FilterKeys.subIssuesProgress(columnModel)
    super(filterKey, [], {})
  }
}

// NOTE: In the future, this will not be a "key-only" filter provider, as we will
// want to add asynchronously-fetched suggestions from the server to get the available
// parent issues. (See https://github.com/github/projects-platform/issues/1519)
export class ParentIssueFilterProvider extends KeyOnlyFilterProvider {
  constructor(columnModel: ParentIssueColumnModel) {
    const filterKey = FilterKeys.parentIssue(columnModel)
    super(filterKey, {
      // We are overriding the given `filterTypes` from `KeyOnlyFilterProvider` to be
      // back to the defaults
      filterTypes: defaultFilterProviderOptions?.filterTypes,
    })
  }
}

export class ReasonFilterProvider extends StaticFilterProvider {
  constructor() {
    const filterValues = [
      {
        value: 'completed',
        displayName: 'Completed',
        priority: 1,
        icon: CheckCircleIcon,
        iconColor: 'var(--fgColor-done, var(--color-done-fg))',
      },
      {
        value: 'not-planned',
        displayName: 'Not planned',
        priority: 2,
        icon: SkipIcon,
        iconColor: 'var(--fgColor-muted, var(--color-neutral-emphasis))',
      },
      {
        value: 'reopened',
        displayName: 'Reopened',
        priority: 3,
        icon: IssueReopenedIcon,
        iconColor: 'var(--fgColor-open, var(--color-open-fg))',
      },
    ]

    super(FilterKeys.reason, filterValues, {filterTypes: {valueless: false}})
  }
}

export class LastUpdatedFilterProvider extends StaticFilterProvider {
  constructor() {
    const filterValues = [
      {
        ariaLabel: '7 days',
        value: '7days',
        priority: 1,
        displayName: '7 or more days ago',
      },
      {
        ariaLabel: '14 days',
        value: '14days',
        priority: 2,
        displayName: '14 or more days ago',
      },
      {
        ariaLabel: '21 days',
        value: '21days',
        priority: 3,
        displayName: '21 or more days ago',
      },
    ]

    super(FilterKeys.lastUpdated, filterValues, {filterTypes: {valueless: false}})
  }
}

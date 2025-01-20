import {
  CalendarIcon,
  GitPullRequestIcon,
  type Icon,
  type IconProps,
  IssueOpenedIcon,
  IssueTrackedByIcon,
  IssueTracksIcon,
  IterationsIcon,
  ListUnorderedIcon,
  MilestoneIcon,
  NumberIcon,
  PeopleIcon,
  RepoIcon,
  SingleSelectIcon,
  TagIcon,
  TypographyIcon,
} from '@primer/octicons-react'

import {MemexColumnDataType} from '../api/columns/contracts/memex-column'
import {Resources} from '../strings'

const columnDetails: {
  [key in MemexColumnDataType]: {
    /**
     * The icon to use for the column.
     */
    icon: Icon
    /**
     * The text to display for the column dataType
     */
    text: string
    /**
     * A description to use when sorting by this column, ascending.
     */
    sortedAscendingDescription?: string
    /**
     * A description to use when sorting by this column, descending.
     */
    sortedDescendingDescription?: string
  }
} = {
  [MemexColumnDataType.Assignees]: {
    icon: PeopleIcon,
    text: 'Assignees',
  },

  [MemexColumnDataType.SingleSelect]: {
    icon: SingleSelectIcon,
    text: 'Single select',
    sortedAscendingDescription: Resources.sortSingleSelectAscending,
    sortedDescendingDescription: Resources.sortSingleSelectDescending,
  },
  [MemexColumnDataType.Title]: {
    icon: ListUnorderedIcon,
    text: 'Title',
  },
  [MemexColumnDataType.Number]: {
    icon: NumberIcon,
    text: 'Number',
    sortedAscendingDescription: Resources.sortNumbersAscending,
    sortedDescendingDescription: Resources.sortNumbersDescending,
  },
  [MemexColumnDataType.Labels]: {
    icon: TagIcon,
    text: 'Labels',
  },
  [MemexColumnDataType.Repository]: {
    icon: RepoIcon,
    text: 'Repository',
  },
  [MemexColumnDataType.Iteration]: {
    icon: IterationsIcon,
    text: 'Iteration',
  },
  [MemexColumnDataType.Milestone]: {
    icon: MilestoneIcon,
    text: 'Milestone',
  },
  [MemexColumnDataType.Date]: {
    icon: CalendarIcon,
    text: 'Date',
    sortedAscendingDescription: Resources.sortDatesAscending,
    sortedDescendingDescription: Resources.sortDatesDescending,
  },
  [MemexColumnDataType.LinkedPullRequests]: {
    icon: GitPullRequestIcon,
    text: 'Linked pull requests',
  },
  [MemexColumnDataType.Reviewers]: {
    icon: PeopleIcon,
    text: 'Reviewers',
  },
  [MemexColumnDataType.Text]: {
    icon: TypographyIcon,
    text: 'Text',
  },
  [MemexColumnDataType.Tracks]: {
    icon: IssueTracksIcon,
    text: 'Tracks',
  },
  [MemexColumnDataType.TrackedBy]: {
    icon: IssueTrackedByIcon,
    text: 'Tracked by',
  },
  [MemexColumnDataType.IssueType]: {
    icon: IssueOpenedIcon,
    text: 'Type',
  },
  [MemexColumnDataType.ParentIssue]: {
    icon: IssueTrackedByIcon,
    text: 'Parent issue',
  },
  [MemexColumnDataType.SubIssuesProgress]: {
    icon: IssueTracksIcon,
    text: 'Sub-issues progress',
  },
}

export const getColumnIcon = (dataType: MemexColumnDataType): React.FC<IconProps & {children?: React.ReactNode}> => {
  return columnDetails[dataType].icon
}

export const getColumnText = (dataType: MemexColumnDataType): string => {
  return columnDetails[dataType].text
}

export const getColumnSortedAscendingDescription = (dataType: MemexColumnDataType): string => {
  return columnDetails[dataType].sortedAscendingDescription ?? Resources.sortStringsAscending
}

export const getColumnSortedDescendingDescription = (dataType: MemexColumnDataType): string => {
  return columnDetails[dataType].sortedDescendingDescription ?? Resources.sortStringsDescending
}

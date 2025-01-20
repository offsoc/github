import type {Meta} from '@storybook/react'

import {NoResults, type NoResultsProps} from './NoResults'

const meta = {
  title: 'ListViewItemsIssuesPrs',
  component: NoResults,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof NoResults>

export default meta

const defaultArgs: Partial<NoResultsProps> = {}

export const NoResultsExample = {
  args: {
    ...defaultArgs,
  },
}

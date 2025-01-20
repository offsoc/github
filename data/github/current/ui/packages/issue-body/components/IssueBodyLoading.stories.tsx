import type {Meta} from '@storybook/react'

import {IssueBodyLoading} from './IssueBodyLoading'

const meta = {
  title: 'IssueBodyLoading',
  component: IssueBodyLoading,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof IssueBodyLoading>

export default meta

export const IssueBodyLoadingExample = {
  args: {},
  render: () => <IssueBodyLoading />,
}

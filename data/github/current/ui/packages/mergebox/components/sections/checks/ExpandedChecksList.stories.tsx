import type {Meta, StoryObj} from '@storybook/react'

import {ExpandedChecksList} from './ExpandedChecksList'
import type {ComponentProps} from 'react'
import {StatusCheckGenerator} from '../../../test-utils/object-generators/status-check'

const meta: Meta<typeof ExpandedChecksList> = {
  title: 'Pull Requests/mergebox/ExpandedChecksList',
  component: ExpandedChecksList,
}
export default meta

const props: ComponentProps<typeof ExpandedChecksList> = {
  statusRollupSummary: [
    {count: 1, state: 'FAILURE'},
    {count: 1, state: 'PENDING'},
    {count: 1, state: 'IN_PROGRESS'},
    {count: 1, state: 'SUCCESS'},
  ],
  statusChecks: [
    StatusCheckGenerator({state: 'FAILURE'}),
    StatusCheckGenerator({state: 'PENDING'}),
    StatusCheckGenerator({state: 'IN_PROGRESS'}),
    StatusCheckGenerator({state: 'SUCCESS'}),
  ],
}

export const List: StoryObj<{name: string}> = {
  render: () => <ExpandedChecksList {...props} />,
}

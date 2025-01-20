import type {Meta, StoryObj} from '@storybook/react'

import {StatusCheckRow} from './StatusCheckRow'
import {ActionList} from '@primer/react'
import {STATUS_CHECK_CONFIGS, timeToComplete} from '../../../helpers/status-check-helpers'
import type {StatusCheckState} from '../../../page-data/payloads/status-checks'

const meta: Meta<typeof StatusCheckRow> = {
  title: 'Pull Requests/mergebox/StatusCheckRow',
  component: StatusCheckRow,
}
export default meta

// filter out any keys named displayName or __docgenInfo
// https://github.com/storybookjs/storybook/issues/9832
const states = Object.keys(STATUS_CHECK_CONFIGS).filter(
  key => !key.match(/^(displayName|__docgenInfo)$/),
) as StatusCheckState[]
type Story = StoryObj<{states: typeof states; name: string}>

export const List: Story = {
  render: args => (
    <ActionList>
      {args.states.map((s, i) => (
        <StatusCheckRow
          key={i}
          avatarUrl="https://github.com/github.png"
          description={timeToComplete(s, Math.floor(Math.random() * 600))}
          isRequired={true}
          displayName={args.name || 'My job name'}
          state={s}
          targetUrl="http://example.com/target"
        />
      ))}
    </ActionList>
  ),

  args: {
    states,
  },
}

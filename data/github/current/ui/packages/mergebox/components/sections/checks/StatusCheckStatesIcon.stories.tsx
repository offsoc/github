import type {Meta, StoryObj} from '@storybook/react'
import {useArgs} from '@storybook/preview-api'
import {MemoryRouter} from 'react-router-dom'

import type {CheckStateRollup} from '../../../page-data/payloads/status-checks'
import {StatusCheckStatesIcon} from './StatusCheckStatesIcon'

const meta: Meta<typeof StatusCheckStatesIcon> = {
  title: 'Pull Requests/mergebox/StatusCheckStatesIcon',
  component: StatusCheckStatesIcon,
  decorators: [
    Story => (
      <MemoryRouter>
        <div style={{maxWidth: '600px'}}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
}

type Story = StoryObj<typeof StatusCheckStatesIcon>

export const dynamicStates: Story = (function () {
  return {
    argTypes: {
      statusRollupSummary: {
        table: {disable: true},
      },
      failure: {control: {type: 'range', min: 0, max: 25, step: 1}},
      pending: {control: {type: 'range', min: 0, max: 25, step: 1}},
      success: {control: {type: 'range', min: 0, max: 25, step: 1}},
      skipped: {control: {type: 'range', min: 0, max: 25, step: 1}},
    },
    render: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [{pending, success, failure, skipped}] = useArgs()
      const statusRollupSummary: CheckStateRollup[] = []
      if (pending) statusRollupSummary.push({count: pending, state: 'PENDING'})
      if (success) statusRollupSummary.push({count: success, state: 'SUCCESS'})
      if (failure) statusRollupSummary.push({count: failure, state: 'FAILURE'})
      if (skipped) statusRollupSummary.push({count: skipped, state: 'SKIPPED'})

      if (statusRollupSummary.length === 0) statusRollupSummary.push({count: 1, state: 'SUCCESS'})

      return <StatusCheckStatesIcon statusRollupSummary={statusRollupSummary} />
    },
  }
})()

export const fourEqualStates: Story = (function () {
  return {
    argTypes: {
      statusRollupSummary: {
        table: {
          disable: true,
        },
      },
    },
    args: {
      statusRollupSummary: [
        // Total of 7 counts per group
        // Failure Group
        {count: 3, state: 'FAILURE'},
        {count: 1, state: 'CANCELLED'},
        {count: 1, state: 'STALE'},
        {count: 1, state: 'STARTUP_FAILURE'},
        {count: 1, state: 'TIMED_OUT'},
        // Pending Group
        {count: 1, state: 'PENDING'},
        {count: 1, state: 'EXPECTED'},
        {count: 1, state: 'QUEUED'},
        {count: 1, state: 'WAITING'},
        {count: 1, state: '_UNKNOWN_VALUE'},
        {count: 1, state: 'ACTION_REQUIRED'},
        {count: 1, state: 'IN_PROGRESS'},
        // Skipped Group
        {count: 7, state: 'SKIPPED'},
        // Success Group
        {count: 3, state: 'SUCCESS'},
        {count: 2, state: 'COMPLETED'},
        {count: 2, state: 'NEUTRAL'},
      ],
    },
    render: args => <StatusCheckStatesIcon {...args} />,
  }
})()

export const threeEqualStates: Story = (function () {
  return {
    argTypes: {
      statusRollupSummary: {
        table: {
          disable: true,
        },
      },
    },
    args: {
      statusRollupSummary: [
        // Total of 1 count per group
        // Failure Group
        {count: 1, state: 'FAILURE'},
        // Pending Group
        {count: 1, state: 'PENDING'},
        // Success Group
        {count: 1, state: 'SUCCESS'},
      ],
    },
    render: args => <StatusCheckStatesIcon {...args} />,
  }
})()

export const twoEqualStates: Story = (function () {
  return {
    argTypes: {
      statusRollupSummary: {
        table: {
          disable: true,
        },
      },
    },
    args: {
      statusRollupSummary: [
        {count: 1, state: 'SUCCESS'},
        {count: 1, state: 'FAILURE'},
      ],
    },
    render: args => <StatusCheckStatesIcon {...args} />,
  }
})()

export const oneState: Story = (function () {
  return {
    argTypes: {
      statusRollupSummary: {
        table: {
          disable: true,
        },
      },
    },
    args: {
      statusRollupSummary: [{count: 1, state: 'SUCCESS'}],
    },
    render: args => <StatusCheckStatesIcon {...args} />,
  }
})()

export const fourSectionsThreeWithOneCheck: Story = (function () {
  return {
    argTypes: {
      statusRollupSummary: {
        table: {
          disable: true,
        },
      },
    },
    args: {
      statusRollupSummary: [
        {count: 1, state: 'FAILURE'},
        {count: 1, state: 'PENDING'},
        {count: 1, state: 'SKIPPED'},
        {count: 250, state: 'SUCCESS'},
      ],
    },
    render: args => <StatusCheckStatesIcon {...args} />,
  }
})()

export const threeSectionsTwoWithOneCheck: Story = (function () {
  return {
    argTypes: {
      statusRollupSummary: {
        table: {
          disable: true,
        },
      },
    },
    args: {
      statusRollupSummary: [
        {count: 1, state: 'FAILURE'},
        {count: 1, state: 'PENDING'},
        {count: 250, state: 'SUCCESS'},
      ],
    },
    render: args => <StatusCheckStatesIcon {...args} />,
  }
})()

export const twoSectionsOneWithOneCheck: Story = (function () {
  return {
    argTypes: {
      statusRollupSummary: {
        table: {
          disable: true,
        },
      },
    },
    args: {
      statusRollupSummary: [
        {count: 1, state: 'FAILURE'},
        {count: 250, state: 'SUCCESS'},
      ],
    },
    render: args => <StatusCheckStatesIcon {...args} />,
  }
})()

export default meta

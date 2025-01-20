import type {Meta, StoryObj} from '@storybook/react'
import AheadBehindCount from './AheadBehindCount'

const meta: Meta<typeof AheadBehindCount> = {
  title: 'Repo Branches/Components/AheadBehindCount',
  component: AheadBehindCount,
  args: {
    aheadCount: 2,
    behindCount: 1,
    maxDiverged: 0,
  },
}

export const Default: StoryObj<typeof AheadBehindCount> = {
  render: args => {
    return <AheadBehindCount {...args} sx={{mt: 4}} />
  },
}

export default meta

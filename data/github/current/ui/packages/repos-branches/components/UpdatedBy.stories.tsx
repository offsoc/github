import type {Meta, StoryObj} from '@storybook/react'
import {UpdatedBy} from './UpdatedBy'
import {getUser} from '../test-utils/mock-data'

const meta: Meta<typeof UpdatedBy> = {
  title: 'Repo Branches/Components/UpdatedBy',
  component: UpdatedBy,
  args: {
    user: getUser(),
    updatedAt: new Date().toISOString(),
  },
}

export const Default: StoryObj<typeof UpdatedBy> = {
  render: args => {
    return <UpdatedBy {...args} />
  },
}

export default meta

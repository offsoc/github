import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta, StoryObj} from '@storybook/react'
import {RenameBranchDialog} from './RenameBranchDialog'
import {getBranches, getOverviewRoutePayload, getRepository} from '../test-utils/mock-data'
const repo = getRepository()
const branch = getBranches()[0]!

const meta: Meta<typeof RenameBranchDialog> = {
  title: 'Repo Branches/Components/RenameBranchDialog',
  component: RenameBranchDialog,
  args: {
    repo,
    branch,
    onDismiss: () => {},
  },
}

export const Default: StoryObj<typeof RenameBranchDialog> = {
  render: args => {
    const routePayload = getOverviewRoutePayload()
    return (
      <Wrapper routePayload={routePayload}>
        <RenameBranchDialog {...args} />
      </Wrapper>
    )
  },
}

export const RenameDefaultBranch: StoryObj<typeof RenameBranchDialog> = {
  render: args => {
    args.branch.isDefault = true
    const routePayload = getOverviewRoutePayload()
    return (
      <Wrapper routePayload={routePayload}>
        <RenameBranchDialog {...args} />
      </Wrapper>
    )
  },
}

export default meta

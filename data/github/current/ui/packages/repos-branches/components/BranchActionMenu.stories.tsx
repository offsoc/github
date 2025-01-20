import type {Meta, StoryObj} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {BranchActionMenu} from './BranchActionMenu'
import {getBranches, getOverviewRoutePayload, getPullRequest, getRepository} from '../test-utils/mock-data'

const repo = getRepository()
const branch = getBranches()[0]!
const pullRequest = getPullRequest()

const meta: Meta<typeof BranchActionMenu> = {
  title: 'Repo Branches/Components/BranchActionMenu',
  component: BranchActionMenu,
  args: {
    repo,
    branch,
    pullRequest,
    oid: '12345',
  },
}

export const Default: StoryObj<typeof BranchActionMenu> = {
  render: args => {
    const routePayload = getOverviewRoutePayload()

    return (
      <Wrapper routePayload={routePayload}>
        <BranchActionMenu {...args} deletedBranches={[]} onDeletedBranchesChange={() => {}} />
      </Wrapper>
    )
  },
}

export const Deleted: StoryObj<typeof BranchActionMenu> = {
  render: args => {
    const routePayload = getOverviewRoutePayload()

    return (
      <Wrapper routePayload={routePayload}>
        <BranchActionMenu {...args} deletedBranches={[branch.name]} onDeletedBranchesChange={() => {}} />
      </Wrapper>
    )
  },
}

export default meta

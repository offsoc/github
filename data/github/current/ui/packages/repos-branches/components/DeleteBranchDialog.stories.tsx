import type {Meta, StoryObj} from '@storybook/react'
import {getBranches, getPullRequest} from '../test-utils/mock-data'
import {DeleteBranchDialog} from './DeleteBranchDialog'

const pullRequest = getPullRequest()

const meta: Meta<typeof DeleteBranchDialog> = {
  title: 'Repo Branches/Components/DeleteBranchDialog',
  component: DeleteBranchDialog,
  argTypes: {
    setShowModal: () => {},
    setDeleting: () => {},
    deletedBranches: [],
    onDeletedBranchesChange: () => {},
  },
  args: {
    branchName: getBranches()[0]!.name,
    pullRequest,
  },
}

export const Default: StoryObj<typeof DeleteBranchDialog> = {
  render: args => {
    return <DeleteBranchDialog {...args} showModal />
  },
}

export default meta

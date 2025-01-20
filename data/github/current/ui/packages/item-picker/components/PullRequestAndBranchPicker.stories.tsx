import type {Meta} from '@storybook/react'
import {noop} from '@github-ui/noop'
import type {PullRequestPickerBaseProps} from './PullRequestAndBranchPicker'
import {PullRequestAndBranchPickerBase} from './PullRequestAndBranchPicker'
import {buildPullRequest} from '../test-utils/PullRequestPickerHelpers'
import {buildBranch} from '../test-utils/BranchPickerHelpers'

const pullRequests = [
  buildPullRequest({id: 'PR_id1', number: 13371, state: 'OPEN', title: 'Example Pull Request'}),
  buildPullRequest({id: 'PR_id2', number: 13372, state: 'CLOSED', title: 'Example Pull Request'}),
  buildPullRequest({id: 'PR_id3', number: 13373, state: 'MERGED', title: 'Example Pull Request'}),
  buildPullRequest({id: 'PR_id4', number: 13374, state: 'OPEN', title: 'Queued Pull Request', isInMergeQueue: true}),
  buildPullRequest({id: 'PR_id5', number: 13375, state: 'OPEN', title: 'Draft Pull Request', isDraft: true}),
  buildPullRequest({id: 'CLASSIC_id1', number: 13375, state: 'OPEN', title: 'Classic Pull Request'}),
]

const branches = [buildBranch({id: 'REF_id1', name: 'branch1'})]

const meta = {
  title: 'ItemPicker/PullRequestAndBranchPicker',
  component: PullRequestAndBranchPickerBase,
} satisfies Meta<PullRequestPickerBaseProps>

export default meta

const args = {
  pullRequestItems: pullRequests,
  branchItems: branches,
  onFilter: noop,
  onSelectionChange: noop,
  shortcutsEnabled: true,
} satisfies PullRequestPickerBaseProps

export const Example = {args}

export const WithSelection = {
  args: {...args, initialSelectedItems: [pullRequests[1]]},
}

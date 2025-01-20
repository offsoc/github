import type {Meta} from '@storybook/react'
import {noop} from '@github-ui/noop'
import {PullRequestPickerBase} from './PullRequestPicker'
import {buildPullRequest} from '../test-utils/PullRequestPickerHelpers'

type PullRequestPickerBaseProps = React.ComponentProps<typeof PullRequestPickerBase>

const pullRequests = [
  buildPullRequest({id: 'id1', number: 13371, state: 'OPEN', title: 'Example Pull Request'}),
  buildPullRequest({id: 'id2', number: 13372, state: 'CLOSED', title: 'Example Pull Request'}),
  buildPullRequest({id: 'id3', number: 13373, state: 'MERGED', title: 'Example Pull Request'}),
  buildPullRequest({id: 'PR_id4', number: 13374, state: 'OPEN', title: 'Queued Pull Request', isInMergeQueue: true}),
  buildPullRequest({id: 'PR_id5', number: 13375, state: 'OPEN', title: 'Draft Pull Request', isDraft: true}),
]

const meta = {
  title: 'ItemPicker/PullRequestPicker',
  component: PullRequestPickerBase,
} satisfies Meta<PullRequestPickerBaseProps>

export default meta

const args = {
  items: pullRequests,
  onFilter: noop,
  onSelectionChange: noop,
} satisfies PullRequestPickerBaseProps

export const Example = {args}

export const WithSelection = {
  args: {...args, initialSelectedItems: [pullRequests[1]]},
}

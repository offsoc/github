import {signChannel} from '@github-ui/use-alive/test-utils'

export const unsignedCommitHeadShaChannel = 'fake-commit-head-sha-channel'
export const unsignedStateChannel = 'fake-state-channel'

export const baseRefChannel = signChannel('fake-base-ref-channel')
export const commitHeadShaChannel = signChannel(unsignedCommitHeadShaChannel)
export const deployedChannel = signChannel('fake-deployed-channel')
export const gitMergeStateChannel = signChannel('fake-git-merge-state-channel')
export const headRefChannel = signChannel('fake-head-ref-channel')
export const mergeQueueChannel = signChannel('fake-merge-queue-channel')
export const reviewStateChannel = signChannel('fake-review-state-channel')
export const stateChannel = signChannel(unsignedStateChannel)
export const workflowsChannel = signChannel('fake-workflows-channel')

export const aliveChannels = {
  baseRefChannel,
  commitHeadShaChannel,
  deployedChannel,
  mergeQueueChannel,
  gitMergeStateChannel,
  headRefChannel,
  reviewStateChannel,
  stateChannel,
  workflowsChannel,
}

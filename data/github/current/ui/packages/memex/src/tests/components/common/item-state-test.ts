import {
  GitMergeIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  SkipIcon,
} from '@primer/octicons-react'

import {getStateProps} from '../../../../src/client/components/item-state'
import {IssueState, IssueStateReason, PullRequestState} from '../../../client/api/common-contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'

describe('ItemState', () => {
  describe('getStateProps', () => {
    it('returns the correct props for an open issue', () => {
      expect(getStateProps({type: ItemType.Issue, state: IssueState.Open, isDraft: false})).toEqual({
        'aria-label': 'Open issue',
        icon: IssueOpenedIcon,
        color: 'open.fg',
      })
    })

    it('returns the correct props for an closed resolved issue', () => {
      expect(
        getStateProps({
          type: ItemType.Issue,
          state: IssueState.Closed,
          isDraft: false,
        }),
      ).toEqual({
        'aria-label': 'Closed as completed issue',
        icon: IssueClosedIcon,
        color: 'done.fg',
      })
    })

    it('returns the correct props for an closed as not planned issue', () => {
      expect(
        getStateProps({
          type: ItemType.Issue,
          state: IssueState.Closed,
          stateReason: IssueStateReason.NotPlanned,
          isDraft: false,
        }),
      ).toEqual({
        'aria-label': 'Closed as not planned issue',
        icon: SkipIcon,
        color: 'fg.muted',
      })
    })

    it('returns the correct props for an open, non-draft pull', () => {
      expect(
        getStateProps({
          type: ItemType.PullRequest,
          state: PullRequestState.Open,
          isDraft: false,
        }),
      ).toEqual({
        'aria-label': 'Open pull request',
        icon: GitPullRequestIcon,
        color: 'open.fg',
      })
    })

    it('returns the correct props for an open, draft pull', () => {
      expect(
        getStateProps({
          type: ItemType.PullRequest,
          state: PullRequestState.Open,
          isDraft: true,
        }),
      ).toEqual({
        'aria-label': 'Draft pull request',
        icon: GitPullRequestDraftIcon,
        color: 'fg.muted',
      })
    })

    it('returns the correct props for a closed, non-draft pull', () => {
      expect(
        getStateProps({
          type: ItemType.PullRequest,
          state: PullRequestState.Closed,
          isDraft: false,
        }),
      ).toEqual({
        'aria-label': 'Closed pull request',
        icon: GitPullRequestClosedIcon,
        color: 'closed.fg',
      })
    })

    it('returns the correct props for a closed, draft pull', () => {
      // Closed state takes precedence over draft state, which is why the props below are identical
      // to those for a closed, non-draft pull.
      expect(
        getStateProps({
          type: ItemType.PullRequest,
          state: PullRequestState.Closed,
          isDraft: true,
        }),
      ).toEqual({
        'aria-label': 'Closed pull request',
        icon: GitPullRequestClosedIcon,
        color: 'closed.fg',
      })
    })

    it('returns the correct props for a merged, non-draft pull', () => {
      expect(
        getStateProps({
          type: ItemType.PullRequest,
          state: PullRequestState.Merged,
          isDraft: false,
        }),
      ).toEqual({
        'aria-label': 'Merged pull request',
        icon: GitMergeIcon,
        color: 'done.fg',
      })
    })

    it('returns the correct props for a merged, draft pull', () => {
      // Merged state takes precedence over draft state, which is why the props below are identical
      // to those for a merged, non-draft pull.
      expect(
        getStateProps({
          type: ItemType.PullRequest,
          state: PullRequestState.Merged,
          isDraft: true,
        }),
      ).toEqual({
        'aria-label': 'Merged pull request',
        icon: GitMergeIcon,
        color: 'done.fg',
      })
    })
  })
})

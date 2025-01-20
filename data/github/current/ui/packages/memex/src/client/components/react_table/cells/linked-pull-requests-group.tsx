import type {LinkedPullRequest} from '../../../api/common-contracts'
import {LinkedPullRequestToken} from '../../fields/linked-pr-token'
import {BaseCell} from './base-cell'

interface LinkedPullRequestGroupProps {
  linkedPullRequests: Array<LinkedPullRequest> | undefined
}

export const LinkedPullRequestGroup: React.FC<LinkedPullRequestGroupProps> = ({linkedPullRequests}) => {
  return (
    <BaseCell sx={{overflow: 'hidden', display: 'flex', gap: 1}}>
      {linkedPullRequests?.map(linkedPullRequest => (
        <LinkedPullRequestToken linkedPullRequest={linkedPullRequest} tabIndex={-1} key={linkedPullRequest.id} />
      ))}
    </BaseCell>
  )
}

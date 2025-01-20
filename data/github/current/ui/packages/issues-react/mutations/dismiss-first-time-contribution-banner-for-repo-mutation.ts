import {commitMutation, graphql, type Environment} from 'react-relay'
import type {
  dismissFirstTimeContributionBannerForRepoMutation,
  dismissFirstTimeContributionBannerForRepoMutation$data,
} from './__generated__/dismissFirstTimeContributionBannerForRepoMutation.graphql'

type DismissFirstTimeContributionBannerForRepoMutationProps = {
  environment: Environment
  onError?: (error: Error) => void
  onCompleted?: (response: dismissFirstTimeContributionBannerForRepoMutation$data) => void
  repositoryId: string
}

const notice = 'first_time_contributor_issues_banner'

export function dismissRepoFirstTimeContributionBannerMutation({
  environment,
  onError,
  onCompleted,
  repositoryId,
}: DismissFirstTimeContributionBannerForRepoMutationProps) {
  return commitMutation<dismissFirstTimeContributionBannerForRepoMutation>(environment, {
    mutation: graphql`
      mutation dismissFirstTimeContributionBannerForRepoMutation($input: DismissRepositoryNoticeInput!) {
        dismissRepositoryNotice(input: $input) {
          clientMutationId
        }
      }
    `,
    variables: {
      input: {notice, repositoryId},
    },
    onError: error => onError && onError(error),
    onCompleted: (response: dismissFirstTimeContributionBannerForRepoMutation$data) => {
      onCompleted && onCompleted(response)
    },
  })
}

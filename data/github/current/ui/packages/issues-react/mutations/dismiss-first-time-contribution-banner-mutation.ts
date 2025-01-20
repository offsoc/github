import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'
import type {
  dismissFirstTimeContributionBannerMutation,
  dismissFirstTimeContributionBannerMutation$data,
} from './__generated__/dismissFirstTimeContributionBannerMutation.graphql'

export type DismissFirstTimeContributionBannerMutationProps = {
  environment: Environment
  onError?: (error: Error) => void
  onCompleted?: (response: dismissFirstTimeContributionBannerMutation$data) => void
}

const notice = 'first_time_contributor_issues_banner'

export function dismissFirstTimeContributionBannerMutation({
  environment,
  onError,
  onCompleted,
}: DismissFirstTimeContributionBannerMutationProps) {
  return commitMutation<dismissFirstTimeContributionBannerMutation>(environment, {
    mutation: graphql`
      mutation dismissFirstTimeContributionBannerMutation($input: DismissNoticeInput!) {
        dismissNotice(input: $input) {
          clientMutationId
        }
      }
    `,
    variables: {
      input: {notice},
    },
    onError: error => onError && onError(error),
    onCompleted: (response: dismissFirstTimeContributionBannerMutation$data) => {
      onCompleted && onCompleted(response)
    },
  })
}

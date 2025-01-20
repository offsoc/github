import type {ItemIdentifier} from '@github-ui/issue-viewer/Types'
import {IssueViewer} from '@github-ui/issue-viewer/IssueViewer'
import type {CommentBoxConfig} from '@github-ui/comment-box/CommentBox'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import {Box} from '@primer/react'
import {Suspense, useCallback} from 'react'
import {graphql, useFragment} from 'react-relay'

import {LABELS} from '../notifications/constants/labels'
import InboxDefaultViewLoading from '../components/default-view/InboxDefaultViewLoading'
import {InboxDefaultView} from '../components/InboxDefaultView'
import InboxHeader from '../components/InboxHeader'
import {useAppNavigate} from '../hooks'
import type {AppPayload} from '../types/app-payload'
import type {InboxDetail_details$key} from './__generated__/InboxDetail_details.graphql'

type InboxDetailProps = {
  queryReference: InboxDetail_details$key
}
const InboxDetail = ({queryReference}: InboxDetailProps) => {
  const {onIssueHrefLinkClick, navigateToUrl} = useAppNavigate()
  const routePayload = useAppPayload<AppPayload>()
  const {graphql_subscriptions} = useFeatureFlags()

  const pasteUrlsAsPlainText = routePayload?.paste_url_link_as_plain_text || false
  const useMonospaceFont = routePayload?.use_monospace_font || false
  const withLiveUpdates = graphql_subscriptions || false

  const commentBoxConfig: CommentBoxConfig = {
    pasteUrlsAsPlainText,
    useMonospaceFont,
  }

  const data = useFragment<InboxDetail_details$key>(
    graphql`
      fragment InboxDetail_details on NotificationThread {
        ...InboxHeader_notification
        id
        subject {
          __typename
          ... on Issue {
            # eslint-disable-next-line relay/unused-fields
            id
            number
            repository {
              name
              owner {
                login
              }
            }
          }
        }
      }
    `,
    queryReference,
  )

  const navigateBack = useCallback(() => {
    navigateToUrl(LABELS.inboxPath)
  }, [navigateToUrl])

  // Build item identifier here for the <IssueViewer /> component
  const itemIdentifier: ItemIdentifier | null =
    data?.subject?.__typename === 'Issue'
      ? {
          number: data.subject.number,
          repo: data.subject.repository.name,
          owner: data.subject.repository.owner.login,
          type: data.subject?.__typename,
        }
      : null

  return (
    <>
      <Suspense fallback={<span>Loading Notification Header...</span>}>
        <Box
          sx={{
            borderBottom: '1px solid',
            borderColor: 'border.default',
            position: 'sticky',
            top: 0,
            background: 'var(--bgColor-default, var(--color-canvas-default))',
            py: 2,
            px: 4,
            zIndex: '2',
          }}
        >
          <Box sx={{margin: '0 auto', maxWidth: '1012px'}}>
            <InboxHeader queryReference={data} />
          </Box>
        </Box>
      </Suspense>
      <Box sx={{p: 4}}>
        <Box sx={{margin: '0 auto', maxWidth: '1012px'}}>
          <Suspense fallback={<InboxDefaultViewLoading />}>
            {itemIdentifier && (
              <IssueViewer
                itemIdentifier={itemIdentifier}
                optionConfig={{
                  navigate: navigateToUrl,
                  navigateBack,
                  onLinkClick: onIssueHrefLinkClick,
                  withLiveUpdates,
                  commentBoxConfig,
                }}
              />
            )}
            {!itemIdentifier && data && <InboxDefaultView notificationId={data.id} />}
          </Suspense>
        </Box>
      </Box>
    </>
  )
}

export default InboxDetail

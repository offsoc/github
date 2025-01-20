import type {FC} from 'react'
import {Text, Truncate} from '@primer/react'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'

import type {
  InboxRowContent_fragment$key,
  InboxRowContent_fragment$data,
} from './__generated__/InboxRowContent_fragment.graphql'
import Avatar from './InboxAvatar'
import {graphql, useFragment} from 'react-relay'

const inboxRowContentFragment = graphql`
  fragment InboxRowContent_fragment on NotificationThread {
    isUnread
    summaryItemAuthor {
      avatarUrl
    }
    summaryItemBody
  }
`

type InboxRowContentProps = InboxRowContent_fragment$key

type InboxRowBodyProps = {
  body: string
  truncationWidth: string
}

const InboxRowContentWrapper: FC<InboxRowContentProps> = ref => {
  const data = useFragment(inboxRowContentFragment, ref)
  if (!data) return null

  return <InboxRowContent {...data} />
}

const MUTED_FILTER = 'grayscale(50%)'
const MUTED_OPACITY = 0.6

const InboxRowBody: FC<InboxRowBodyProps> = ({body, truncationWidth}) => (
  <Truncate inline title={body || ''} sx={{maxWidth: '100%'}}>
    <Text
      sx={{
        width: truncationWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'block',
      }}
    >
      {body}
    </Text>
  </Truncate>
)

/// Render the row subtitle: avatar of the user who triggered the notification and the notification body truncated
const InboxRowContent: FC<InboxRowContent_fragment$data> = ({isUnread, summaryItemAuthor, summaryItemBody}) => (
  <ListItemDescription>
    {summaryItemAuthor?.avatarUrl && (
      <Avatar
        key={summaryItemAuthor.avatarUrl}
        src={summaryItemAuthor.avatarUrl}
        sx={{
          opacity: isUnread ? undefined : MUTED_OPACITY,
          filter: isUnread ? undefined : MUTED_FILTER,
        }}
      />
    )}
    <InboxRowBody body={summaryItemBody || ''} truncationWidth="700px" />
  </ListItemDescription>
)

const InboxRowCompactContent: FC<InboxRowContentProps> = ref => {
  const data = useFragment(inboxRowContentFragment, ref)
  if (!data) return null

  return (
    <ListItemDescription>
      {data.summaryItemAuthor?.avatarUrl && (
        <Avatar
          key={data.summaryItemAuthor.avatarUrl}
          src={data.summaryItemAuthor.avatarUrl}
          sx={{
            opacity: data.isUnread ? undefined : MUTED_OPACITY,
            filter: data.isUnread ? undefined : MUTED_FILTER,
          }}
        />
      )}
      <InboxRowBody body={data.summaryItemBody || ''} truncationWidth="170px" />
    </ListItemDescription>
  )
}

export default InboxRowContentWrapper
export {InboxRowContent, InboxRowCompactContent}

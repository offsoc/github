/* eslint eslint-comments/no-use: off */
import {Box, Text} from '@primer/react'
import type {FC} from 'react'

import type {InboxListRow_v1_fragment$data} from './__generated__/InboxListRow_v1_fragment.graphql'
import Avatar from './InboxAvatar'

type InboxContentProps = {
  thread: InboxListRow_v1_fragment$data
  isMuted?: boolean
}

const MUTED_OPACITY = 0.6

// Render the row subtitle: avatar of the user who triggered the notification and the notification body truncated
const InboxContent: FC<InboxContentProps> = ({thread, isMuted}) => {
  const {summaryItemAuthor, summaryItemBody} = thread
  return (
    <Box sx={{display: 'flex', flexDirection: 'row'}}>
      {summaryItemAuthor?.avatarUrl && (
        <Avatar
          key={summaryItemAuthor.avatarUrl}
          src={summaryItemAuthor.avatarUrl}
          sx={{
            opacity: isMuted ? MUTED_OPACITY : undefined,
            filter: isMuted ? 'grayscale(50%)' : undefined,
          }}
        />
      )}
      <Text
        sx={{
          fontWeight: 'normal',
          color: 'fg.muted',
          fontSize: '12px',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          mr: 4,
        }}
      >
        {summaryItemBody}
      </Text>
    </Box>
  )
}

const InboxRowCompactContent: FC<InboxContentProps> = ({thread, isMuted}) => {
  const {summaryItemAuthor, summaryItemBody} = thread
  const itemBody = summaryItemBody || ''

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
      {summaryItemAuthor?.avatarUrl && (
        <Avatar
          key={summaryItemAuthor.avatarUrl}
          src={summaryItemAuthor.avatarUrl}
          sx={{
            opacity: isMuted ? MUTED_OPACITY : undefined,
            filter: isMuted ? 'grayscale(100%)' : undefined,
          }}
        />
      )}
      <Text
        sx={{
          fontWeight: 'normal',
          color: 'fg.muted',
          fontSize: '12px',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {itemBody}
      </Text>
    </Box>
  )
}

export default InboxContent
export {InboxRowCompactContent}

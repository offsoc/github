/* eslint eslint-comments/no-use: off */
import {Box, Text} from '@primer/react'
import {type FC, memo} from 'react'

import {DateFormatter} from '../../../../utils/DateFormatter'
import type {InboxListRow_v1_fragment$data} from './__generated__/InboxListRow_v1_fragment.graphql'
import InboxRowHierarchy from './InboxRowHierarchy'
import InboxRowOptions from './InboxRowOptions'
import UnreadCounter from './UnreadCount'

/// Right-hand side of the notification row without options
const InboxAside: FC<InboxListRow_v1_fragment$data> = memo(function InboxAside(thread) {
  const {unreadItemsCount, lastUpdatedAt} = thread

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        my: 'auto',
        justifyContent: 'end',
        flexGrow: 1,
        alignItems: 'center',
      }}
    >
      {/* Notification org/repo, only render on large viewports */}
      <Box sx={{display: ['none', 'none', 'none', 'none', 'block'], width: 180}}>
        <InboxRowHierarchy {...thread} />
      </Box>
      <Box
        sx={{
          display: 'flex',
          minWidth: ['100%', '100%', '100%', '100%', 120],
          // On smaller viewports, we want to render the "Unread" and "Time" stack vertically,
          // while keeping the time on top as it is a mandatory field
          // On larger viewports, render them side-by-side horizontally with larger gaps
          alignItems: ['flex-end', 'flex-end', 'flex-end', 'flex-end', 'center'],
          justifyContent: ['flex-start', 'flex-start', 'flex-start', 'flex-start', 'flex-end'],
          gap: ['1', '1', '1', '1', '4'],
          flexDirection: ['column-reverse', 'column-reverse', 'column-reverse', 'column-reverse', 'row'],
          pr: 2,
        }}
      >
        {/* Unread notifications badge count */}
        <UnreadCounter unreadItemsCount={unreadItemsCount} />
        {/* Notification last updated time */}
        <Box sx={{minWidth: 40}}>
          <Text
            sx={{
              color: 'fg.muted',
              display: 'flex',
              justifyContent: 'flex-end',
              fontWeight: 'normal',
              fontSize: '12px',
            }}
          >
            <DateFormatter timestamp={new Date(lastUpdatedAt)} />
          </Text>
        </Box>
      </Box>
    </Box>
  )
})

/// Right-hand side of the notification row with options
const InboxAsideOptions: FC<InboxListRow_v1_fragment$data> = memo(function InboxAsideOptions(thread) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 3,
        my: 'auto',
        justifyContent: 'end',
        flexGrow: 1,
        alignItems: 'center',
      }}
    >
      {/* Notification org/repo (only render on large viewport) */}
      <Box sx={{display: ['none', 'none', 'none', 'none', 'block'], width: 180}}>
        <InboxRowHierarchy {...thread} />
      </Box>
      {/* Mark as read/unread, done and unsubscribe buttons */}
      <Box sx={{display: 'flex', justifyContent: 'flex-end', minWidth: 120}}>
        <InboxRowOptions {...thread} />
      </Box>
    </Box>
  )
})

const InboxRowCompactAside: FC<InboxListRow_v1_fragment$data> = memo(function InboxCompactAside(thread) {
  const {unreadItemsCount} = thread

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <UnreadCounter unreadItemsCount={unreadItemsCount} />
    </Box>
  )
})

export default InboxAside
export {InboxAsideOptions, InboxRowCompactAside}

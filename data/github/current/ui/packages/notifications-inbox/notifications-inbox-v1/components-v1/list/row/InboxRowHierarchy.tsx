/* eslint eslint-comments/no-use: off */
import {Text, Truncate} from '@primer/react'
import {type FC, memo} from 'react'

import type {InboxListRow_v1_fragment$data} from './__generated__/InboxListRow_v1_fragment.graphql'

function getNotificationContent(thread: InboxListRow_v1_fragment$data) {
  const {list} = thread
  const {__typename} = list
  switch (__typename) {
    case 'Repository':
      return `${list.owner.login}/${list.name}`
    case 'Team':
      return `${list.organization.login}/${list.slug}`
    case 'User':
      return list.login
    case 'Organization':
      return list.login
    case 'Enterprise':
      return list.slug
    default:
      return null
  }
}

/// Render the notification thread "list", i.e. the repository that the notification is for
const InboxRowHierarchy: FC<InboxListRow_v1_fragment$data> = memo(function InboxHierarchy(thread) {
  const {list} = thread
  const {__typename} = list
  const title = getNotificationContent(thread)
  if (!title) return <span>Unknown notification list type: {__typename}</span>

  return (
    <Truncate title={title} sx={{maxWidth: 180}}>
      <Text sx={{color: 'fg.muted', fontSize: '12px', fontWeight: 'normal'}}>{title}</Text>
    </Truncate>
  )
})

const InboxRowCompactHierarchy: FC<InboxListRow_v1_fragment$data> = memo(function InboxRowCompactHierarchy(thread) {
  const {list} = thread
  const {__typename} = list
  // Relay will always include a '%other' type for the union,
  // so we can safely ignore it
  switch (__typename) {
    case 'Repository':
      return (
        <Text sx={{fontSize: '12px', color: 'fg.muted', fontWeight: 'normal'}}>
          <span>{list.name}</span>
        </Text>
      )
    case 'Team':
      return (
        <Text sx={{color: 'fg.muted', fontWeight: 'normal'}}>
          <span>{list.slug}</span>
        </Text>
      )
    case 'User':
      return <Text sx={{color: 'fg.muted', fontWeight: 'normal'}}>{list.login}</Text>
    case 'Organization':
      return <Text sx={{color: 'fg.muted', fontWeight: 'normal'}}>{list.login}</Text>
    case 'Enterprise':
      return <Text sx={{color: 'fg.muted', fontWeight: 'normal'}}>{list.slug}</Text>
    default:
      return <span>Unknown notification list type: {__typename}</span>
  }
})

export default InboxRowHierarchy
export {InboxRowCompactHierarchy}

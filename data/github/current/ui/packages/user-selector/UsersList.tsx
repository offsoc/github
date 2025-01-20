import {FixedSizeVirtualList} from '@github-ui/ref-selector/fixed-size-virtual-list'
import {Box, type BoxProps} from '@primer/react'

import type {User} from './user-types'
import {UserItem} from './UserItem'

interface UsersListProps {
  users: User[]
  currentUser?: User
  onSelect?: (user: User) => void
  sx?: BoxProps['sx']
}

/**
 * The virtualized list has a fixed height. If we don't have very many users,
 * don't virtualize the list so that the container can shrink.
 */
const virtualizationThreshold = 20
const maxHeight = 330

export function UsersList(props: UsersListProps) {
  return props.users.length > virtualizationThreshold ? <VirtualUsersList {...props} /> : <FullUsersList {...props} />
}

/**
 * Non-virtual implementation
 */
function FullUsersList({users, currentUser, onSelect, sx = {}}: UsersListProps) {
  return (
    <Box sx={{maxHeight, overflowY: 'auto', ...sx}}>
      {users.map(user => (
        <UserItem key={user.login} user={user} isCurrent={user.login === currentUser?.login} onSelect={onSelect} />
      ))}
    </Box>
  )
}

function VirtualUsersList({users, currentUser, onSelect, sx = {}}: UsersListProps) {
  return (
    <FixedSizeVirtualList
      items={users}
      itemHeight={33}
      sx={{maxHeight, overflowY: 'auto', ...sx}}
      makeKey={user => user.login}
      renderItem={user => (
        <UserItem key={user.login} user={user} isCurrent={user.login === currentUser?.login} onSelect={onSelect} />
      )}
    />
  )
}

import {GitHubAvatar} from '@github-ui/github-avatar'
import {AvatarStack, Box} from '@primer/react'

import type {IAssignee, Review} from '../../../api/common-contracts'
import {joinOxford} from '../../../helpers/join-oxford'
import {TextCell} from './text-cell'

export function itemFromReview(review: Review): UserGroupItem {
  return {
    ...review.reviewer,
    hovercardUrl:
      review.reviewer.type === 'User'
        ? `/hovercards?user_id=${review.reviewer.id}`
        : `${review.reviewer.url}/hovercard`,
  }
}

export function itemFromAssignee(assignee: IAssignee): UserGroupItem {
  return {...assignee, name: assignee.login}
}

export type UserGroupItem = {
  id: number
  avatarUrl: string
  name: string
  hovercardUrl?: string
}

interface AvatarWithLoginProps {
  user: UserGroupItem
  isDisabled?: boolean
}

const AvatarWithLogin: React.FC<AvatarWithLoginProps> = ({user, isDisabled}) => {
  return (
    <Box sx={{mr: 2, alignItems: 'center', overflow: 'hidden', display: 'flex'}}>
      <GitHubAvatar
        loading="lazy"
        alt={user.name}
        src={user.avatarUrl}
        sx={{minWidth: '20px', mr: 1}}
        data-hovercard-url={user.hovercardUrl}
      />
      <TextCell sx={{fontSize: 1}} isDisabled={isDisabled}>
        {user.name}
      </TextCell>
    </Box>
  )
}

interface UserGroupProps {
  users: Array<UserGroupItem> | undefined
  isDisabled?: boolean
}

export const UserGroup: React.FC<UserGroupProps> = ({users, isDisabled}) => {
  if (!users) {
    return null
  }

  if (users.length > 1) {
    return (
      <>
        <AvatarStack sx={{zIndex: 0, mr: 1}}>
          {users.map(user => (
            <GitHubAvatar
              loading="lazy"
              key={user.id}
              alt={user.name}
              src={user.avatarUrl}
              data-hovercard-url={user.hovercardUrl}
            />
          ))}
        </AvatarStack>
        <TextCell sx={{fontSize: 1, textOverflow: 'ellipsis'}} isDisabled={isDisabled}>
          {joinOxford(users.map(user => user.name))}
        </TextCell>
      </>
    )
  }

  return (
    <>
      {users.map(user => (
        <AvatarWithLogin key={user.id} user={user} isDisabled={isDisabled} />
      ))}
    </>
  )
}

import {
  type Collaborator,
  CollaboratorRole,
  type IAssignee,
  type Owner,
  type ReviewerUser,
  type User,
} from '../../client/api/common-contracts'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {org, users} from './users-list'

const mockUserList = users
const defaultUser: User = not_typesafe_nonNullAssertion(mockUserList[0])
export const mockUsers: Array<User> = [
  // we add the default user at the end historically, so keeping that
  ...mockUserList.slice(1),
  defaultUser,
]

export const getMemexOwner = (ownerType: string): Owner => {
  if (ownerType === 'orgs') {
    return org
  } else {
    return {
      id: 9959680,
      login: 'traumverloren',
      name: 'Stephanie Nemeth',
      type: 'user',
      avatarUrl: '/assets/avatars/u/9959680.png',
    }
  }
}

export const getReviewerUser = (login: string): ReviewerUser => {
  const user = mockUsers.find(u => u.login === login)
  if (!user) {
    throw Error(`Unable to find user with login ${login} - please check the mock data`)
  }
  return {...user, type: 'User', name: user.login, url: `user-url/${user.id}`}
}

export const getUser = (login: string): User => {
  const user = mockUsers.find(u => u.login === login)
  if (!user) {
    throw Error(`Unable to find user with login ${login} - please check the mock data`)
  }
  return user
}

export const DefaultSuggestedAssignees = new Array<IAssignee>(...mockUsers)

export const DefaultCollaborator: Collaborator = {
  ...defaultUser,
  actor_type: 'user',
  role: CollaboratorRole.Reader,
}

export const mockSuggestedAssignees = mockUsers.map(user => ({...user, selected: false}))

export const getSuggestedAssigneesWithSelection = (selectedIndices: Array<number>) => {
  return mockSuggestedAssignees.map((user, index) => {
    if (selectedIndices.includes(index)) return {...user, selected: true}
    else return user
  })
}

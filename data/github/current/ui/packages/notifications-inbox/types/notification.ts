import type {NotificationViewPreferenceEnum} from '../notifications/constants/settings'

type RepositoryListType = {
  __typename: 'Repository'
  owner: {
    login: string
  }
  name: string
}

type TeamListType = {
  __typename: 'Team'
  organization: {
    login: string
  }
  name: string
  slug: string
}

type UserListType = {
  __typename: 'User'
  login: string
  name: string
}

type OrganizationListType = {
  __typename: 'Organization'
  login: string
  name: string
}

type EnterpriseListType = {
  __typename: 'Business'
  id: string
  slug: string
  name: string
}

export type subjectType = {
  __typename: 'Discussion' | 'Issue' | 'PullRequest'
  number: number
}

export type NotificationProps = {
  id: string
  isUnread: boolean
  url: string
  list: RepositoryListType | TeamListType | UserListType | OrganizationListType | EnterpriseListType
  subject: subjectType
}

export type NotificationPosition = {
  isFirst: boolean
  isLast: boolean
  next: NotificationProps | null
  previous: NotificationProps | null
}

export type NotificationPositionMap = {[id: string]: NotificationPosition}

export type NotificationViewPreference =
  | NotificationViewPreferenceEnum.DATE
  | NotificationViewPreferenceEnum.GROUP_BY_REPO

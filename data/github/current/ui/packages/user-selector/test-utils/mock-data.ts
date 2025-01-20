import type {User, UsersState} from '../user-types'

export const monalisa: User = {
  name: 'Mona Lisa',
  login: 'monalisa',
  primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/2?s=80',
  path: '/monalisa',
}

export const octocat: User = {
  name: 'Octo Cat',
  login: 'octocat',
  primaryAvatarUrl: 'http://alambic.github.localhost/avatars/u/3?s=80',
  path: '/octocat',
}

export const defaultUsersState: UsersState = {
  users: [monalisa, octocat],
  error: false,
  loading: false,
}

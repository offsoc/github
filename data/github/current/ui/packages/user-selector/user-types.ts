export interface User {
  login: string
  name: string | null
  path: string
  primaryAvatarUrl: string
}

export interface UsersState {
  users: User[]
  error: boolean
  loading: boolean
}

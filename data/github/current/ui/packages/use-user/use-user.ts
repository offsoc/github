import {useAppPayload} from '@github-ui/react-core/use-app-payload'

export type UserHookPayload = {
  current_user: {
    avatarUrl: string
    id: string
    login: string
    name: string
    is_emu: boolean
  }
}

export const useUser = () => {
  const payload = useAppPayload<UserHookPayload>()
  const currentUser = payload?.current_user ?? null

  return {currentUser}
}

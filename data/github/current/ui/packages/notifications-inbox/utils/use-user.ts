import {useAppPayload} from '@github-ui/react-core/use-app-payload'

type UserHookPayload = {
  current_user: {
    avatarUrl: string
    id: string
    login: string
    name: string
  }
}

const useUser = () => {
  const payload = useAppPayload<UserHookPayload>()
  const currentUser = payload?.current_user ?? null

  return {currentUser}
}

export default useUser
export type {UserHookPayload}
